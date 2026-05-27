const crypto = require("crypto");
const fs = require("fs/promises");
const http = require("http");
const path = require("path");

const { loadEnv } = require("./env");
loadEnv();

const {
  ensureDataStore,
  readTransactions,
  writeTransactions
} = require("./storage");
const {
  calculatePortfolio,
  ensureCanApplyTransaction,
  sortTransactionsAscending,
  toPositiveNumber
} = require("./portfolio");
const {
  resolveHistoricalPrices,
  resolveLatestPrices,
  resolveMarketSnapshot,
  toNumberOrNull
} = require("./market");

const ROOT_DIR = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT_DIR, "public");

const FRONTEND_PORT = Number(process.env.PORT || 3000);
const BACKEND_PORT = Number(process.env.BACKEND_PORT || 3001);
const API_BASE_URL =
  process.env.API_BASE_URL || `http://localhost:${BACKEND_PORT}`;
const CORS_ORIGIN = process.env.CORS_ORIGIN || `http://localhost:${FRONTEND_PORT}`;

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8"
};

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

function getCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": CORS_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...getCorsHeaders()
  });
  res.end(JSON.stringify(payload));
}

function sendJavaScript(res, statusCode, script) {
  res.writeHead(statusCode, {
    "Content-Type": "application/javascript; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(script);
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
      } catch (error) {
        reject(new Error("Invalid JSON body"));
      }
    });

    req.on("error", reject);
  });
}

async function serveStaticAsset(req, res, pathname) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(PUBLIC_DIR, safePath));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  try {
    const stat = await fs.stat(filePath);

    if (!stat.isFile()) {
      throw new Error("Not a file");
    }

    const extension = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[extension] || "application/octet-stream";
    const buffer = await fs.readFile(filePath);

    res.writeHead(200, {
      "Content-Type": contentType,
      "Content-Length": buffer.length,
      "Cache-Control": "no-store"
    });

    if (req.method === "HEAD") {
      res.end();
      return;
    }

    res.end(buffer);
  } catch {
    if (pathname !== "/index.html") {
      await serveStaticAsset(req, res, "/index.html");
      return;
    }

    sendText(res, 404, "Frontend asset not found");
  }
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

  const sortedTransactions = portfolio.sortedTransactions
    .slice()
    .sort((left, right) => {
      const leftDate = new Date(left.createdAt || left.date || 0).getTime();
      const rightDate = new Date(right.createdAt || right.date || 0).getTime();

      if (leftDate !== rightDate) {
        return rightDate - leftDate;
      }

      return String(right.id || "").localeCompare(String(left.id || ""));
    });

  return {
    generatedAt: new Date().toISOString(),
    transactions: sortedTransactions,
    holdings,
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
    shares: payload.shares,
    totalAmount: payload.totalAmount,
    unitPrice: payload.totalAmount / payload.shares,
    date: payload.date,
    note: payload.note,
    currency: snapshot.currency || "USD",
    priceSource: snapshot.latestPriceSource || snapshot.source,
    createdAt: new Date().toISOString()
  };

  ensureCanApplyTransaction(transactions, transaction);

  const updatedTransactions = [...transactions, transaction];
  await writeTransactions(updatedTransactions);

  sendJson(res, 201, {
    message: "Transaction saved",
    transaction
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

  await writeTransactions(updatedTransactions);

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

  res.on("finish", () => {
    console.log(
      `[backend] ${req.method} ${parsedUrl.pathname}${parsedUrl.search} -> ${res.statusCode} (${Date.now() - startedAt}ms)`
    );
  });

  if (req.method === "OPTIONS") {
    res.writeHead(204, getCorsHeaders());
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
    handleGetTransactions(res);
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
    handleDeleteTransaction(res, transactionId);
    return;
  }

  if (req.method === "GET" && parsedUrl.pathname === "/api/dashboard") {
    handleDashboard(res);
    return;
  }

  if (!parsedUrl.pathname.startsWith("/api/")) {
    sendJson(res, 404, {
      error: "Backend server only handles API routes",
      frontend: `http://localhost:${FRONTEND_PORT}`
    });
    return;
  }

  sendJson(res, 404, { error: "API route not found" });
}

async function handleFrontendRequest(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = parsedUrl.pathname;

  if (req.method !== "GET" && req.method !== "HEAD") {
    sendText(res, 405, "Method Not Allowed");
    return;
  }

  if (pathname === "/config.js") {
    sendJavaScript(
      res,
      200,
      `window.__APP_CONFIG__ = ${JSON.stringify({
        apiBaseUrl: API_BASE_URL,
        frontendBaseUrl: `http://localhost:${FRONTEND_PORT}`
      })};`
    );
    return;
  }

  await serveStaticAsset(req, res, pathname);
}

async function start() {
  await ensureDataStore();

  const backendServer = http.createServer(handleBackendRequest);
  const frontendServer = http.createServer((req, res) => {
    handleFrontendRequest(req, res).catch((error) => {
      sendText(res, 500, `Frontend error: ${error.message}`);
    });
  });

  backendServer.listen(BACKEND_PORT, () => {
    console.log(`Backend API running at http://localhost:${BACKEND_PORT}`);
  });

  frontendServer.listen(FRONTEND_PORT, () => {
    console.log(`Frontend running at http://localhost:${FRONTEND_PORT}`);
  });
}

start().catch((error) => {
  console.error("Failed to start Stock Record servers:", error);
  process.exit(1);
});
