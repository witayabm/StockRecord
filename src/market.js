const { URL } = require("url");

const FMP_BASE_URL = "https://financialmodelingprep.com/stable";
const FMP_API_KEY = (process.env.FMP_API_KEY || "").trim();
const CACHE_TTL_MS = 5 * 60 * 1000;
const FMP_PROFILE_PRICE_SOURCE = "Financial Modeling Prep profile";
const FMP_API_WARNING = "FMP API not working";

const snapshotCache = new Map();

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toDateStringOrNull(value) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

function getFmpResults(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.value)) {
    return data.value;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.historical)) {
    return data.historical;
  }

  return [];
}

function normalizeHistoricalPrices(results) {
  return results.map((item) => ({
    ...item,
    open: toNumberOrNull(item.open),
    high: toNumberOrNull(item.high),
    low: toNumberOrNull(item.low),
    close: toNumberOrNull(item.close),
    adjClose: toNumberOrNull(item.adjClose),
    volume: toNumberOrNull(item.volume),
    change: toNumberOrNull(item.change),
    changePercent: toNumberOrNull(item.changePercent)
  }));
}

async function fetchFmpJson(fmpUrl) {
  const response = await fetch(fmpUrl, {
    headers: {
      Accept: "application/json",
      "User-Agent": "stock-record/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`FMP request failed with ${response.status}`);
  }

  return response.json();
}

async function fetchFmpSearchResults(query, endpoint = "search-symbol") {
  if (!FMP_API_KEY) {
    throw new Error("FMP_API_KEY is not configured");
  }

  const fmpUrl = new URL(`${FMP_BASE_URL}/${endpoint}`);
  fmpUrl.searchParams.set("query", query);
  fmpUrl.searchParams.set("apikey", FMP_API_KEY);

  const data = await fetchFmpJson(fmpUrl);
  return getFmpResults(data);
}

async function findFirstFmpSymbol(query) {
  let results = [];

  try {
    results = await fetchFmpSearchResults(query, "search-symbol");
  } catch {
    results = [];
  }

  if (!results.length) {
    try {
      results = await fetchFmpSearchResults(query, "search-name");
    } catch {
      results = [];
    }
  }

  return results[0]?.symbol || "";
}

async function fetchFmpProfileResults(symbol) {
  if (!FMP_API_KEY) {
    throw new Error("FMP_API_KEY is not configured");
  }

  const fmpUrl = new URL(`${FMP_BASE_URL}/profile`);
  fmpUrl.searchParams.set("symbol", symbol);
  fmpUrl.searchParams.set("apikey", FMP_API_KEY);

  const data = await fetchFmpJson(fmpUrl);
  return getFmpResults(data);
}

function getFmpProfilePrice(profile) {
  return toNumberOrNull(profile?.price ?? profile?.lastPrice ?? profile?.close);
}

async function fetchFmpHistoricalResults(symbol) {
  if (!FMP_API_KEY) {
    throw new Error("FMP_API_KEY is not configured");
  }

  const fmpUrl = new URL(`${FMP_BASE_URL}/historical-price-eod/full`);
  fmpUrl.searchParams.set("symbol", symbol);
  fmpUrl.searchParams.set("apikey", FMP_API_KEY);

  const data = await fetchFmpJson(fmpUrl);
  return getFmpResults(data);
}

async function fetchFmpBatchQuoteResults(symbols) {
  if (!FMP_API_KEY) {
    throw new Error("FMP_API_KEY is not configured");
  }

  const normalizedSymbols = Array.from(
    new Set(
      (Array.isArray(symbols) ? symbols : [symbols])
        .map((symbol) => String(symbol || "").trim().toUpperCase())
        .filter(Boolean)
    )
  );

  if (!normalizedSymbols.length) {
    return [];
  }

  const fmpUrl = new URL(`${FMP_BASE_URL}/batch-quote-short`);
  fmpUrl.searchParams.set("symbols", normalizedSymbols.join(","));
  fmpUrl.searchParams.set("apikey", FMP_API_KEY);

  const data = await fetchFmpJson(fmpUrl);
  return getFmpResults(data);
}

async function resolveFmpSymbol(query) {
  const rawQuery = String(query || "").trim();

  if (!rawQuery) {
    return "";
  }

  const resolved = await findFirstFmpSymbol(rawQuery);
  return (resolved || rawQuery).toUpperCase();
}

async function resolveLatestPrice(symbol) {
  const normalizedSymbol = String(symbol || "").trim().toUpperCase();

  if (!normalizedSymbol) {
    return {
      price: null,
      source: "Unavailable"
    };
  }

  try {
    const results = await fetchFmpProfileResults(normalizedSymbol);
    const profile =
      results.find(
        (item) => String(item.symbol || "").trim().toUpperCase() === normalizedSymbol
      ) || results[0] || null;
    const latest = getFmpProfilePrice(profile);

    if (latest !== null) {
      return {
        price: latest,
        source: FMP_PROFILE_PRICE_SOURCE
      };
    }
  } catch {
    return {
      price: null,
      source: FMP_API_WARNING
    };
  }

  return {
    price: null,
    source: "Unavailable"
  };
}

async function resolveLatestPrices(symbols) {
  const normalizedSymbols = Array.from(
    new Set(
      (Array.isArray(symbols) ? symbols : [symbols])
        .map((symbol) => String(symbol || "").trim().toUpperCase())
        .filter(Boolean)
    )
  );

  const priceMap = new Map();

  if (!normalizedSymbols.length) {
    return priceMap;
  }

  await Promise.all(
    normalizedSymbols.map(async (symbol) => {
      try {
        const results = await fetchFmpProfileResults(symbol);
        const profile =
          results.find(
            (item) => String(item.symbol || "").trim().toUpperCase() === symbol
          ) || results[0] || null;
        const price = getFmpProfilePrice(profile);

        priceMap.set(symbol, {
          price,
          source: price !== null ? FMP_PROFILE_PRICE_SOURCE : "Unavailable"
        });
      } catch {
        priceMap.set(symbol, {
          price: null,
          source: FMP_API_WARNING
        });
      }
    })
  );

  return priceMap;
}

function getLatestHistoricalDate(results) {
  let latestDate = null;
  let latestTime = -Infinity;

  for (const item of results) {
    const date = toDateStringOrNull(item?.date || item?.label || item?.datetime);

    if (!date) {
      continue;
    }

    const time = new Date(`${date}T00:00:00Z`).getTime();

    if (time > latestTime) {
      latestTime = time;
      latestDate = date;
    }
  }

  return latestDate;
}

async function resolveLatestPriceDates(symbols) {
  const normalizedSymbols = Array.from(
    new Set(
      (Array.isArray(symbols) ? symbols : [symbols])
        .map((symbol) => String(symbol || "").trim().toUpperCase())
        .filter(Boolean)
    )
  );

  const dateMap = new Map();

  if (!normalizedSymbols.length) {
    return dateMap;
  }

  await Promise.all(
    normalizedSymbols.map(async (symbol) => {
      try {
        const results = await fetchFmpHistoricalResults(symbol);
        const latestDate = getLatestHistoricalDate(results);

        dateMap.set(symbol, {
          date: latestDate,
          source: latestDate ? "Financial Modeling Prep historical-price-eod full" : "Unavailable"
        });
      } catch {
        dateMap.set(symbol, {
          date: null,
          source: FMP_API_WARNING
        });
      }
    })
  );

  return dateMap;
}

async function resolveMarketSnapshot(query) {
  const rawQuery = String(query || "").trim();

  if (!rawQuery) {
    throw new Error("Missing query");
  }

  const cacheKey = rawQuery.toUpperCase();
  const cached = snapshotCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const resolvedSymbol = await resolveFmpSymbol(rawQuery);
  let profile = null;
  let source = FMP_API_WARNING;
  const latestPriceData = await resolveLatestPrice(resolvedSymbol);

  try {
    const results = await fetchFmpProfileResults(resolvedSymbol);
    profile = results[0] || null;
  } catch {
    profile = null;
  }

  if (profile) {
    source = "Financial Modeling Prep profile";
  }

  const value = {
    query: rawQuery,
    symbol: (profile?.symbol || resolvedSymbol).toUpperCase(),
    resolvedSymbol: (profile?.symbol || resolvedSymbol).toUpperCase(),
    companyName: profile?.companyName || profile?.name || resolvedSymbol,
    currency: profile?.currency || "USD",
    latestPrice: latestPriceData.price,
    latestPriceSource: latestPriceData.source,
    source,
    warning:
      latestPriceData.source === FMP_API_WARNING || !profile
        ? FMP_API_WARNING
        : null,
    profile
  };

  snapshotCache.set(cacheKey, {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS
  });

  return value;
}

async function resolveHistoricalPrices(query, limit = 20) {
  const rawQuery = String(query || "").trim();

  if (!rawQuery) {
    throw new Error("Missing query");
  }

  const safeLimit =
    Number.isFinite(Number(limit)) && Number(limit) > 0
      ? Math.min(Number(limit), 100)
      : 20;
  const resolvedSymbol = await resolveFmpSymbol(rawQuery);

  try {
    const results = await fetchFmpHistoricalResults(resolvedSymbol);

    const prices = normalizeHistoricalPrices(results).slice(0, safeLimit);

    if (prices.length) {
      return {
        symbol: resolvedSymbol,
        query: rawQuery,
        resolvedSymbol,
        count: results.length,
        limit: safeLimit,
        prices,
        results: prices,
        source: "Financial Modeling Prep historical-price-eod full"
      };
    }
    throw new Error(FMP_API_WARNING);
  } catch (error) {
    throw new Error(error.message || FMP_API_WARNING);
  }
}

module.exports = {
  fetchFmpHistoricalResults,
  fetchFmpBatchQuoteResults,
  fetchFmpProfileResults,
  fetchFmpSearchResults,
  findFirstFmpSymbol,
  getFmpResults,
  normalizeHistoricalPrices,
  resolveFmpSymbol,
  resolveHistoricalPrices,
  resolveLatestPriceDates,
  resolveLatestPrice,
  resolveLatestPrices,
  resolveMarketSnapshot,
  toNumberOrNull
};
