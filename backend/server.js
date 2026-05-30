const crypto = require("crypto");
const http = require("http");

const { loadEnv } = require("../src/env");

loadEnv();

const {
  ensureDataStore,
  deleteTransactionById,
  insertTransaction,
  readTransactions,
} = require("../src/storage");
const {
  calculatePortfolio,
  clampNumber,
  ensureCanApplyTransaction,
  sortTransactionsAscending,
  toPositiveNumber
} = require("../src/portfolio");
const {
  resolveHistoricalPrices,
  resolveLatestPrices,
  resolveMarketSnapshot,
  toNumberOrNull
} = require("../src/market");

const FRONTEND_PORT = Number(process.env.FRONTEND_PORT || process.env.PORT || 3000);
const BACKEND_PORT = Number(process.env.BACKEND_PORT || 3001);
const FRONTEND_BASE_URL =
  process.env.FRONTEND_BASE_URL || `http://localhost:${FRONTEND_PORT}`;
const CORS_ORIGINS = String(
  process.env.CORS_ORIGIN || `http://localhost:${FRONTEND_PORT}`
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function getLocalYmd(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getFmpPriceDate() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return getLocalYmd(date);
}

function getCorsHeaders(requestOrigin) {
  const allowedOrigin = CORS_ORIGINS.includes("*")
    ? "*"
    : requestOrigin && CORS_ORIGINS.includes(requestOrigin)
      ? requestOrigin
      : "";

  if (!allowedOrigin) {
    return {};
  }

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin"
  };
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...getCorsHeaders(res._requestOrigin)
  });
  res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, text, contentType = "text/plain; charset=utf-8") {
  res.writeHead(statusCode, {
    "Content-Type": contentType,
    "Cache-Control": "no-store"
  });
  res.end(text);
}

function getSingleQueryParam(parsedUrl, key) {
  const value = parsedUrl.searchParams.get(key);
  return value ? value.trim() : "";
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";

    req.on("data", (chunk) => {
      raw += chunk;

      if (raw.length > 1_000_000) {
        reject(new Error("Request body is too large"));
        req.destroy();
      }
    });

    req.on("end", () => {
      if (!raw.trim()) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });

    req.on("error", reject);
  });
}

function hasAtMostDecimalPlaces(value, digits) {
  const factor = 10 ** digits;
  const scaled = value * factor;
  return Math.abs(scaled - Math.round(scaled)) < 1e-9;
}

async function getLatestTransactions() {
  const transactions = await readTransactions();
  return sortTransactionsAscending(transactions).reverse();
}

async function buildDashboard() {
  const transactions = await readTransactions();
  const portfolio = calculatePortfolio(transactions);
  const warnings = [];
  let fmpWarningAdded = false;
  const latestPriceDate = getFmpPriceDate();
  const symbols = Array.from(
    new Set(portfolio.positions.map((position) => position.symbol).filter(Boolean))
  );
  const latestPriceMap = await resolveLatestPrices(symbols);

  const holdings = portfolio.positions.map((position) => {
    const latestPriceData =
      latestPriceMap.get(position.symbol) || latestPriceMap.get(position.symbol.toUpperCase()) || {
        price: null,
        source: "Unavailable"
      };
    const latestPrice = toNumberOrNull(latestPriceData.price);
    const marketValue = latestPrice === null ? null : latestPrice * position.shares;
    const unrealizedPnl =
      latestPrice === null ? null : (latestPrice - position.avgCost) * position.shares;
    const totalPnl =
      unrealizedPnl === null ? position.realizedPnl : position.realizedPnl + unrealizedPnl;

    if (latestPriceData.source === "FMP API not working") {
      if (!fmpWarningAdded) {
        warnings.push("FMP API not working");
        fmpWarningAdded = true;
      }
    } else if (latestPrice === null) {
      warnings.push(`Latest price unavailable for ${position.symbol}`);
    }

    return {
      ...position,
      latestPrice,
      latestPriceSource: latestPriceData.source,
      latestPriceDate,
      latestPriceDateSource: "FMP API call date - 1 day",
      marketValue,
      unrealizedPnl,
      totalPnl,
      priceStatus: latestPrice === null ? "missing" : "live"
    };
  });

  const realizedPositions = portfolio.realizedPositions.map((position) => {
    const realizedPct =
      position.totalSold > 0 ? (position.realizedPnl / position.totalSold) * 100 : 0;

    return {
      ...position,
      realizedPct
    };
  });

  holdings.sort((left, right) => {
    const leftValue = left.marketValue === null ? -1 : left.marketValue;
    const rightValue = right.marketValue === null ? -1 : right.marketValue;

    if (leftValue !== rightValue) {
      return rightValue - leftValue;
    }

    return left.symbol.localeCompare(right.symbol);
  });

  const totalMarketValue = holdings.reduce(
    (sum, holding) => sum + (holding.marketValue || 0),
    0
  );
  const unrealizedPnl = holdings.reduce(
    (sum, holding) => sum + (holding.unrealizedPnl || 0),
    0
  );
  const totalPnl = portfolio.realizedPnl + unrealizedPnl;
  const openPositions = holdings.length;
  const pricedPositions = holdings.filter((holding) => holding.latestPrice !== null).length;
  const lastTransactionDate = portfolio.sortedTransactions.length
    ? portfolio.sortedTransactions[portfolio.sortedTransactions.length - 1].date ||
      portfolio.sortedTransactions[portfolio.sortedTransactions.length - 1].createdAt ||
      ""
    : "";

  const summary = {
    transactionCount: portfolio.totalTransactions,
    distinctSymbols: portfolio.distinctSymbols,
    openPositions,
    currentShares: portfolio.currentShares,
    costBasis: portfolio.currentCostBasis,
    averageCostPerShare:
      portfolio.currentShares > 0
        ? portfolio.currentCostBasis / portfolio.currentShares
        : 0,
    marketValue: totalMarketValue,
    realizedPnl: portfolio.realizedPnl,
    unrealizedPnl,
    totalPnl,
    grossBuyAmount: portfolio.grossBuyAmount,
    grossSellProceeds: portfolio.grossSellProceeds,
    totalReturnPct:
      portfolio.grossBuyAmount > 0
        ? (totalPnl / portfolio.grossBuyAmount) * 100
        : 0,
    priceCoveragePct:
      openPositions > 0 ? (pricedPositions / openPositions) * 100 : 100,
    lastTransactionDate
  };

  const realizedPositionsWithActivity = realizedPositions.filter(
    (position) => position.totalSold > 0 || position.realizedPnl !== 0
  );
  const realizedWinners = realizedPositionsWithActivity.filter(
    (position) => position.realizedPnl > 0
  ).length;
  const realizedLosers = realizedPositionsWithActivity.filter(
    (position) => position.realizedPnl < 0
  ).length;
  const realizedFlat = realizedPositionsWithActivity.filter(
    (position) => position.realizedPnl === 0
  ).length;
  const bestRealized = realizedPositionsWithActivity[0] || null;
  const worstRealized =
    realizedPositionsWithActivity[realizedPositionsWithActivity.length - 1] || null;
  const buySellSummary = {
    totalRealizedPnl: portfolio.realizedPnl,
    totalBoughtCapital: portfolio.grossBuyAmount,
    totalSellProceeds: portfolio.grossSellProceeds,
    realizedSymbols: realizedPositionsWithActivity.length,
    winningSymbols: realizedWinners,
    losingSymbols: realizedLosers,
    flatSymbols: realizedFlat,
    bestRealized,
    worstRealized
  };

  const sortedTransactions = sortTransactionsAscending(transactions).reverse();

  return {
    generatedAt: new Date().toISOString(),
    transactions: sortedTransactions,
    holdings,
    realizedPositions,
    buySellSummary,
    summary,
    warnings: [...new Set(warnings)]
  };
}

async function handleProfileRoute(req, res, parsedUrl) {
  const rawSymbol = getSingleQueryParam(parsedUrl, "symbol");

  if (!rawSymbol) {
    sendJson(res, 400, { error: "Missing required query parameter: symbol" });
    return;
  }

  try {
    const snapshot = await resolveMarketSnapshot(rawSymbol);

    sendJson(res, 200, {
      symbol: snapshot.symbol,
      query: rawSymbol,
      resolvedSymbol: snapshot.resolvedSymbol,
      count: 1,
      profile: snapshot.profile,
      results: snapshot.profile ? [snapshot.profile] : [],
      source: snapshot.source,
      latestPrice: snapshot.latestPrice,
      latestPriceSource: snapshot.latestPriceSource,
      fetchedAt: new Date().toISOString()
    });
  } catch (error) {
    sendJson(res, 502, {
      error: "Could not fetch company profile data",
      details: error.message
    });
  }
}

async function handleHistoricalRoute(req, res, parsedUrl) {
  const rawSymbol = getSingleQueryParam(parsedUrl, "symbol");
  const rawLimit = getSingleQueryParam(parsedUrl, "limit");

  if (!rawSymbol) {
    sendJson(res, 400, { error: "Missing required query parameter: symbol" });
    return;
  }

  try {
    const result = await resolveHistoricalPrices(rawSymbol, rawLimit);

    sendJson(res, 200, {
      ...result,
      fetchedAt: new Date().toISOString()
    });
  } catch (error) {
    sendJson(res, 502, {
      error: "Could not fetch historical price data",
      details: error.message
    });
  }
}

async function handleLookupRoute(req, res, parsedUrl) {
  const rawQuery = getSingleQueryParam(parsedUrl, "query");

  if (!rawQuery) {
    sendJson(res, 400, { error: "Missing required query parameter: query" });
    return;
  }

  try {
    const snapshot = await resolveMarketSnapshot(rawQuery);

    sendJson(res, 200, {
      ...snapshot,
      fetchedAt: new Date().toISOString()
    });
  } catch (error) {
    sendJson(res, 502, {
      error: "Could not resolve asset lookup",
      details: error.message
    });
  }
}

async function handleGetTransactions(res) {
  const transactions = await getLatestTransactions();

  sendJson(res, 200, {
    count: transactions.length,
    transactions
  });
}

function normalizeTransactionPayload(body) {
  const type = String(body.type || "").toLowerCase().trim();
  const asset = String(body.asset || body.symbol || body.query || body.name || "")
    .trim();
  const shares = toPositiveNumber(body.shares);
  const totalAmount = toPositiveNumber(body.totalAmount);
  const date = String(body.date || "").trim();
  const note = String(body.note || "").trim();

  if (!asset) {
    throw new Error("Asset name or symbol is required");
  }

  if (!["buy", "sell"].includes(type)) {
    throw new Error("Transaction type must be buy or sell");
  }

  if (shares === null) {
    throw new Error("Shares must be a positive number");
  }

  if (!hasAtMostDecimalPlaces(shares, 3)) {
    throw new Error("Shares can have at most 3 decimal places");
  }

  if (totalAmount === null) {
    throw new Error("Total amount must be a positive number");
  }

  if (!date || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) {
    throw new Error("Transaction date must be a valid YYYY-MM-DD date");
  }

  return {
    asset,
    type,
    shares,
    totalAmount,
    date,
    note
  };
}

async function handleCreateTransaction(res, body) {
  const payload = normalizeTransactionPayload(body);
  const transactions = await readTransactions();
  const snapshot = await resolveMarketSnapshot(payload.asset);
  const normalizedSymbol = snapshot.symbol.toUpperCase();

  const transaction = {
    id: crypto.randomUUID(),
    type: payload.type,
    assetQuery: payload.asset,
    symbol: normalizedSymbol,
    companyName: snapshot.companyName || normalizedSymbol,
    shares: clampNumber(payload.shares, 3),
    totalAmount: payload.totalAmount,
    unitPrice: clampNumber(payload.totalAmount / payload.shares, 2),
    date: payload.date,
    note: payload.note,
    currency: snapshot.currency || "USD",
    priceSource: snapshot.latestPriceSource || snapshot.source,
    createdAt: new Date().toISOString()
  };

  ensureCanApplyTransaction(transactions, transaction);

  const savedTransaction = await insertTransaction(transaction);

  sendJson(res, 201, {
    message: "Transaction saved",
    transaction: savedTransaction
  });
}

async function handleDeleteTransaction(res, transactionId) {
  if (!transactionId) {
    sendJson(res, 400, { error: "Missing transaction id" });
    return;
  }

  const transactions = await readTransactions();
  const index = transactions.findIndex((transaction) => transaction.id === transactionId);

  if (index === -1) {
    sendJson(res, 404, { error: "Transaction not found" });
    return;
  }

  const updatedTransactions = transactions.filter(
    (transaction) => transaction.id !== transactionId
  );

  try {
    calculatePortfolio(updatedTransactions);
  } catch (error) {
    sendJson(res, 400, {
      error:
        "Deleting this transaction would make the portfolio invalid because later sells would exceed remaining shares",
      details: error.message
    });
    return;
  }

  await deleteTransactionById(transactionId);

  sendJson(res, 200, {
    message: "Transaction deleted",
    deletedId: transactionId
  });
}

async function handleDashboard(res) {
  try {
    const dashboard = await buildDashboard();
    sendJson(res, 200, dashboard);
  } catch (error) {
    sendJson(res, 500, {
      error: "Could not build dashboard",
      details: error.message
    });
  }
}

function handleBackendRequest(req, res) {
  const startedAt = Date.now();
  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  res._requestOrigin = req.headers.origin || "";

  res.on("finish", () => {
    console.log(
      `[backend] ${req.method} ${parsedUrl.pathname}${parsedUrl.search} -> ${res.statusCode} (${Date.now() - startedAt}ms)`
    );
  });

  if (req.method === "OPTIONS") {
    const corsHeaders = getCorsHeaders(req.headers.origin || "");
    if (!corsHeaders["Access-Control-Allow-Origin"] && req.headers.origin) {
      sendText(res, 403, "Origin not allowed");
      return;
    }

    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  if (req.method === "GET" && parsedUrl.pathname === "/health") {
    sendJson(res, 200, {
      status: "ok",
      service: "stock-record-backend",
      timestamp: new Date().toISOString()
    });
    return;
  }

  if (req.method === "GET" && parsedUrl.pathname === "/api/fmp/profile") {
    handleProfileRoute(req, res, parsedUrl);
    return;
  }

  if (
    req.method === "GET" &&
    parsedUrl.pathname === "/api/fmp/historical-price-eod"
  ) {
    handleHistoricalRoute(req, res, parsedUrl);
    return;
  }

  if (req.method === "GET" && parsedUrl.pathname === "/api/stocks/lookup") {
    handleLookupRoute(req, res, parsedUrl);
    return;
  }

  if (req.method === "GET" && parsedUrl.pathname === "/api/transactions") {
    handleGetTransactions(res).catch((error) => {
      sendJson(res, 500, {
        error: "Could not load transactions",
        details: error.message
      });
    });
    return;
  }

  if (req.method === "POST" && parsedUrl.pathname === "/api/transactions") {
    parseJsonBody(req)
      .then((body) => handleCreateTransaction(res, body))
      .catch((error) => {
        sendJson(res, 400, { error: error.message });
      });
    return;
  }

  if (req.method === "DELETE" && parsedUrl.pathname.startsWith("/api/transactions/")) {
    const transactionId = parsedUrl.pathname.split("/").pop();
    handleDeleteTransaction(res, transactionId).catch((error) => {
      sendJson(res, 500, {
        error: "Could not delete transaction",
        details: error.message
      });
    });
    return;
  }

  if (req.method === "GET" && parsedUrl.pathname === "/api/dashboard") {
    handleDashboard(res);
    return;
  }

  if (!parsedUrl.pathname.startsWith("/api/")) {
    sendJson(res, 404, {
      error: "Backend server only handles API routes",
      frontend: FRONTEND_BASE_URL
    });
    return;
  }

  sendJson(res, 404, { error: "API route not found" });
}

function startBackend() {
  return ensureDataStore().then(
    () =>
      new Promise((resolve, reject) => {
        const backendServer = http.createServer(handleBackendRequest);

        backendServer.once("error", reject);
        backendServer.listen(BACKEND_PORT, () => {
          backendServer.off("error", reject);
          console.log(`Backend API running at http://localhost:${BACKEND_PORT}`);
          resolve(backendServer);
        });
      })
  );
}

if (require.main === module) {
  startBackend().catch((error) => {
    console.error("Failed to start Stock Record backend:", error);
    process.exit(1);
  });
}

module.exports = {
  handleBackendRequest,
  startBackend
};
