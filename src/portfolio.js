function toPositiveNumber(value) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function clampNumber(value, digits = 10) {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function compareTransactionsAscending(left, right) {
  const leftDate = new Date(left.date || left.createdAt || 0).getTime();
  const rightDate = new Date(right.date || right.createdAt || 0).getTime();

  if (leftDate !== rightDate) {
    return leftDate - rightDate;
  }

  const leftCreated = new Date(left.createdAt || 0).getTime();
  const rightCreated = new Date(right.createdAt || 0).getTime();

  if (leftCreated !== rightCreated) {
    return leftCreated - rightCreated;
  }

  return String(left.id || "").localeCompare(String(right.id || ""));
}

function sortTransactionsAscending(transactions) {
  return [...transactions].sort(compareTransactionsAscending);
}

function ensureCanApplyTransaction(transactions, candidate) {
  if (candidate.type !== "sell") {
    return;
  }

  const relevant = [...transactions, candidate]
    .filter((transaction) => transaction.symbol === candidate.symbol)
    .sort(compareTransactionsAscending);

  let shares = 0;

  for (const transaction of relevant) {
    if (transaction.type === "buy") {
      shares += transaction.shares;
    } else if (transaction.type === "sell") {
      shares -= transaction.shares;
    }

    if (shares < -1e-9) {
      throw new Error(
        `Cannot sell more shares than currently held for ${candidate.symbol}`
      );
    }
  }
}

function calculatePortfolio(transactions) {
  const sortedTransactions = sortTransactionsAscending(transactions);
  const states = new Map();
  let grossBuyAmount = 0;
  let grossSellProceeds = 0;

  for (const transaction of sortedTransactions) {
    const symbol = String(transaction.symbol || "").toUpperCase().trim();

    if (!symbol) {
      continue;
    }

    const shares = toPositiveNumber(transaction.shares);
    const totalAmount = toPositiveNumber(transaction.totalAmount);

    if (shares === null || totalAmount === null) {
      throw new Error(`Invalid transaction numeric values for ${symbol}`);
    }

    const current = states.get(symbol) || {
      symbol,
      companyName: transaction.companyName || symbol,
      currency: transaction.currency || "USD",
      shares: 0,
      costBasis: 0,
      realizedPnl: 0,
      totalBought: 0,
      totalSold: 0,
      transactionCount: 0,
      lastTransactionDate: transaction.date || transaction.createdAt || ""
    };

    current.companyName = transaction.companyName || current.companyName || symbol;
    current.currency = transaction.currency || current.currency || "USD";
    current.transactionCount += 1;
    current.lastTransactionDate = transaction.date || current.lastTransactionDate;

    if (transaction.type === "buy") {
      current.shares += shares;
      current.costBasis += totalAmount;
      current.totalBought += totalAmount;
      grossBuyAmount += totalAmount;
    } else if (transaction.type === "sell") {
      if (current.shares <= 0) {
        throw new Error(`Cannot sell ${symbol} because no shares are currently held`);
      }

      const averageCostBeforeSell = current.costBasis / current.shares;
      const costRemoved = averageCostBeforeSell * shares;

      current.shares -= shares;
      current.costBasis -= costRemoved;
      current.realizedPnl += totalAmount - costRemoved;
      current.totalSold += totalAmount;
      grossSellProceeds += totalAmount;
    } else {
      throw new Error(`Unsupported transaction type: ${transaction.type}`);
    }

    if (current.shares < -1e-9) {
      throw new Error(`Transaction history makes ${symbol} holdings negative`);
    }

    current.shares = clampNumber(Math.max(current.shares, 0), 8);
    current.costBasis = clampNumber(Math.max(current.costBasis, 0), 2);
    current.realizedPnl = clampNumber(current.realizedPnl, 2);
    current.totalBought = clampNumber(current.totalBought, 2);
    current.totalSold = clampNumber(current.totalSold, 2);

    states.set(symbol, current);
  }

  const positions = [];
  let currentCostBasis = 0;
  let currentShares = 0;
  let realizedPnl = 0;

  for (const state of states.values()) {
    realizedPnl += state.realizedPnl;

    if (state.shares > 0) {
      positions.push({
        symbol: state.symbol,
        companyName: state.companyName,
        currency: state.currency,
        shares: state.shares,
        costBasis: state.costBasis,
        avgCost: state.shares > 0 ? state.costBasis / state.shares : 0,
        realizedPnl: state.realizedPnl,
        totalBought: state.totalBought,
        totalSold: state.totalSold,
        transactionCount: state.transactionCount,
        lastTransactionDate: state.lastTransactionDate
      });

      currentCostBasis += state.costBasis;
      currentShares += state.shares;
    }
  }

  positions.sort((left, right) => {
    const rightValue = right.costBasis - left.costBasis;

    if (rightValue !== 0) {
      return rightValue;
    }

    return left.symbol.localeCompare(right.symbol);
  });

  return {
    positions,
    realizedPnl: clampNumber(realizedPnl, 2),
    currentCostBasis: clampNumber(currentCostBasis, 2),
    currentShares: clampNumber(currentShares, 8),
    grossBuyAmount: clampNumber(grossBuyAmount, 2),
    grossSellProceeds: clampNumber(grossSellProceeds, 2),
    totalTransactions: sortedTransactions.length,
    distinctSymbols: states.size,
    sortedTransactions
  };
}

module.exports = {
  calculatePortfolio,
  clampNumber,
  compareTransactionsAscending,
  ensureCanApplyTransaction,
  sortTransactionsAscending,
  toPositiveNumber
};
