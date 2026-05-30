const SUPABASE_URL = String(process.env.SUPABASE_URL || "")
  .trim()
  .replace(/\/+$/, "");
const SUPABASE_SERVICE_ROLE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const SUPABASE_TABLE = String(process.env.SUPABASE_TABLE || "transactions").trim() || "transactions";
const SUPABASE_API_URL = SUPABASE_URL ? `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}` : "";

function ensureSupabaseConfig() {
  if (!SUPABASE_URL) {
    throw new Error("Missing SUPABASE_URL");
  }

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }
}

function getSupabaseHeaders(extraHeaders = {}) {
  ensureSupabaseConfig();

  return {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    Accept: "application/json",
    "Content-Type": "application/json",
    ...extraHeaders
  };
}

async function supabaseRequest(query, options = {}) {
  ensureSupabaseConfig();

  const response = await fetch(`${SUPABASE_API_URL}${query}`, {
    ...options,
    headers: {
      ...getSupabaseHeaders(),
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      `Supabase request failed (${response.status} ${response.statusText}): ${details}`
    );
  }

  return response;
}

function toFiniteNumber(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function mapDbRowToTransaction(row) {
  return {
    id: String(row.id || ""),
    type: String(row.type || ""),
    assetQuery: String(row.assetQuery ?? row.asset_query ?? ""),
    symbol: String(row.symbol || "").toUpperCase(),
    companyName: String(row.companyName ?? row.company_name ?? ""),
    shares: toFiniteNumber(row.shares) ?? 0,
    totalAmount: toFiniteNumber(row.totalAmount ?? row.total_amount) ?? 0,
    unitPrice: toFiniteNumber(row.unitPrice ?? row.unit_price) ?? 0,
    date: String(row.date || ""),
    note: row.note ?? "",
    currency: String(row.currency || "USD"),
    priceSource: String(row.priceSource ?? row.price_source ?? ""),
    createdAt: String(row.createdAt ?? row.created_at ?? "")
  };
}

function mapTransactionToDbRow(transaction) {
  return {
    id: transaction.id,
    type: transaction.type,
    assetQuery: transaction.assetQuery,
    symbol: transaction.symbol,
    companyName: transaction.companyName,
    shares: transaction.shares,
    totalAmount: transaction.totalAmount,
    unitPrice: transaction.unitPrice,
    date: transaction.date,
    note: transaction.note || null,
    currency: transaction.currency || "USD",
    priceSource: transaction.priceSource || null,
    createdAt: transaction.createdAt
  };
}

async function ensureDataStore() {
  ensureSupabaseConfig();
}

async function readTransactions() {
  const response = await supabaseRequest(
    "?select=*&order=date.asc&order=createdAt.asc&order=id.asc",
    {
      method: "GET"
    }
  );

  const parsed = await response.json();

  if (!Array.isArray(parsed)) {
    throw new Error("Transaction storage must contain an array response");
  }

  return parsed.map(mapDbRowToTransaction);
}

async function insertTransaction(transaction) {
  const response = await supabaseRequest("", {
    method: "POST",
    headers: {
      Prefer: "return=representation"
    },
    body: JSON.stringify(mapTransactionToDbRow(transaction))
  });

  const parsed = await response.json();
  const insertedRow = Array.isArray(parsed) ? parsed[0] : parsed;

  if (!insertedRow) {
    throw new Error("Supabase did not return the inserted transaction");
  }

  return mapDbRowToTransaction(insertedRow);
}

async function deleteTransactionById(transactionId) {
  const response = await supabaseRequest(`?id=eq.${encodeURIComponent(transactionId)}`, {
    method: "DELETE",
    headers: {
      Prefer: "return=minimal"
    }
  });

  if (response.status === 204) {
    return [];
  }

  const raw = await response.text();

  if (!raw.trim()) {
    return [];
  }

  const parsed = JSON.parse(raw);
  const deletedRows = Array.isArray(parsed) ? parsed : [parsed].filter(Boolean);

  return deletedRows.map(mapDbRowToTransaction);
}

module.exports = {
  ensureDataStore,
  readTransactions,
  insertTransaction,
  deleteTransactionById
};
