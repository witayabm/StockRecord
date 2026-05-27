const fs = require("fs/promises");
const path = require("path");

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "transactions.json");

async function ensureDataStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]\n", "utf8");
  }
}

async function readTransactions() {
  await ensureDataStore();

  const raw = await fs.readFile(DATA_FILE, "utf8");

  if (!raw.trim()) {
    return [];
  }

  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error("Transaction storage must contain a JSON array");
  }

  return parsed;
}

async function writeTransactions(transactions) {
  await ensureDataStore();

  const tempFile = `${DATA_FILE}.${process.pid}.${Date.now()}.tmp`;
  const payload = `${JSON.stringify(transactions, null, 2)}\n`;

  await fs.writeFile(tempFile, payload, "utf8");
  await fs.rename(tempFile, DATA_FILE);
}

module.exports = {
  DATA_FILE,
  ensureDataStore,
  readTransactions,
  writeTransactions
};
