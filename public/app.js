const appConfig = window.__APP_CONFIG__ || {};
const apiBaseUrl = String(appConfig.apiBaseUrl || "").replace(/\/$/, "");

const summaryGrid = document.getElementById("summaryGrid");
const allocationChart = document.getElementById("allocationChart");
const holdingsBody = document.getElementById("holdingsBody");
const transactionList = document.getElementById("transactionList");
const warningBanner = document.getElementById("warningBanner");
const lastUpdated = document.getElementById("lastUpdated");
const priceCoverageHint = document.getElementById("priceCoverageHint");
const summarySubtitle = document.getElementById("summarySubtitle");
const buySellSubtitle = document.getElementById("buySellSubtitle");
const buySellChartNote = document.getElementById("buySellChartNote");
const buySellStats = document.getElementById("buySellStats");
const realizedChart = document.getElementById("realizedChart");
const buySellSidecards = document.getElementById("buySellSidecards");
const toastStack = document.getElementById("toastStack");
const refreshButton = document.getElementById("refreshButton");
const transactionForm = document.getElementById("transactionForm");
const assetInput = document.getElementById("assetInput");
const typeInput = document.getElementById("typeInput");
const sharesInput = document.getElementById("sharesInput");
const totalAmountInput = document.getElementById("totalAmountInput");
const dateInput = document.getElementById("dateInput");
const noteInput = document.getElementById("noteInput");
const tickerSuggestionList = document.getElementById("tickerSuggestions");
const tickerSuggestionSource = `
A, AAL, AAP, AAPL, ABBV, ABT, ACGL, ACN, ADBE, ADI, ADM, ADP, ADSK, AEE, AEP, AES, AFG, AFL, AIG, AIZ, AJG, AKAM, ALB, ALGN, ALL, ALLE, AMAT, AMCR, AMD, AME, AMGN, AMP, AMT, AMZN, ANET, ANSS, AON, AOS, APA, APD, APH, APLS, APTV, ARE, ATO, ATR, ATVI, AVB, AVGO, AVY, AWK, AXON, AXP, AZO, BA, BAC, BALL, BAX, BBWI, BBY, BDX, BEN, BF.B, BG, BIIB, BIO, BK, BKNG, BKR, BLK, BMO, BMY, BR, BRK.B, BRO, BSX, BWA, BX, BXP, BYON, C, CAG, CAH, CARR, CAT, CB, CBOE, CBRE, CCI, CCK, CCL, CDAY, CDNS, CDW, CE, CEG, CF, CFG, CHD, CHRW, CHTR, CI, CINF, CINT, CL, CLX, CMA, CMG, CMI, CMS, CNC, CNP, COF, COG, COO, COP, COR, COST, CPB, CPRT, CPRI, CPT, CPU, CRWD, CSCO, CSGP, CSX, CTAS, CTLT, CTRA, CTSH, CTVA, CZR, D, DAL, DD, DE, DECK, DFS, DG, DGX, DHI, DHR, DIS, DISH, DLR, DLTR, DOC, DOCU, DOV, DOW, DPZ, DRI, DTE, DUK, DVA, DVN, DXCM, EA, EBAY, ECL, ED, EFX, EG, EGOV, EIC, EIX, EL, ELV, EMN, EMR, ENPH, EOG, EPAM, EQIX, EQR, EQT, ERG, ES, ESS, ETN, ETR, ETSY, EVRG, EW, EXC, EXPD, EXPE, EXR, F, FANG, FAST, FI, FIBK, FICO, FIS, FISV, FITB, FLT, FMC, FND, FOX, FOXA, FSLR, FTNT, FTV, GD, GE, GEHC, GEN, GEV, GILD, GIS, GL, GLW, GM, GNRC, GOOG, GOOGL, GPC, GPN, GRMN, GS, GWRE, HAL, HAS, HBAN, HCA, HD, HES, HIG, HII, HLT, HOLX, HON, HPE, HPQ, HRL, HSIC, HST, HSY, HUBB, HUM, HWM, HYATT, IBM, ICE, IDXX, IEX, IFF, ILMN, INCY, INDV, INTC, INTU, INVH, IP, IPG, IQV, IR, IRM, ISRG, IT, ITW, IVZ, J, JBHT, JBL, JCI, JKHY, JNJ, JNPR, JPM, JRE, JWN, K, KDP, KEY, KEYS, KHC, KIM, KLAC, KMB, KMI, KMX, KNX, KO, KR, KSS, KTB, KVUE, L, LAD, LAMR, LBRDA, LBRDK, LDOS, LEN, LH, LHX, LIN, LKQ, LLY, LMT, LNC, LNT, LOW, LRCX, LULU, LUV, LVS, LW, LYB, LYV, M, MA, MAA, MAR, MAS, MCD, MCHP, MCK, MCO, MDLZ, MDT, MET, META, MGE, MGM, MHK, MKC, MKTX, MLM, MMC, MMM, MNST, MO, MOH, MOS, MPC, MPWR, MRK, MRO, MS, MSCI, MSFT, MSI, MTB, MTCH, MTD, MU, MUV, NCLH, NDAQ, NDSN, NEE, NEM, NFLX, NI, NKE, NIO, NKLA, NLY, NOC, NOW, NRG, NSC, NTAP, NTRS, NUE, NVDA, NVR, NWS, NWSA, NXPI, O, ODFL, ODFP, OGE, OGN, OI, ODF, OKE, OMC, ON, ONON, ODFL, ORLY, ORCL, OTIS, OXY, PANW, PARA, PAYX, PAYC, PBI, PCAR, PCG, PDCO, PDD, PEAK, PEG, PEP, PFE, PFG, PG, PGR, PH, PHM, PKG, PKI, PLD, PLTR, PM, PNC, PNR, PNW, PODD, POOL, PPG, PPL, PRU, PSA, PTC, PVH, PWR, PXD, PYPL, QCOM, QRVO, QS, RCL, RE, REG, REGN, RF, RHI, RHM, RIG, RJF, RL, RMD, ROK, ROL, ROP, ROST, RPRX, RPM, RRC, RSG, RTX, RVMD, RYA, SBAC, SBUX, SCG, SCHW, SHW, SIRI, SITM, SJM, SKM, SLB, SMCI, SMG, SNA, SNPS, SO, SPG, SPGI, SPLK, SPT, SRC, SRE, STE, STLD, STT, STX, STZ, SUN, SWK, SWKS, SWM, SYF, SYK, SYY, T, TAP, TDG, TDY, TECH, TEL, TER, TFT, TFX, TGT, TJX, TFC, TMO, TMUS, TPR, TRGP, TRMB, TROW, TRV, TSCO, TSLA, TSN, TT, TTWO, TXN, TXT, TYL, UA, UAA, UAL, UBER, UDR, UHS, ULTA, UNH, UNP, UPS, URI, USB, V, VAL, VEEV, VFC, VICI, VLO, VMC, VMT, VNO, VNT, VRSK, VRSN, VRTX, VTR, VTRS, VZ, WAB, WAL, WAT, WBA, WBD, WEC, WEG, WELL, WFC, WFR, WHR, WIX, WM, WMB, WMT, WRB, WRK, WST, WTW, WY, WYNN, XCEL, XOM, XRAY, XYL, YUM, ZBH, ZBRA, ZIL, ZION, ZTS
`;
const tickerSuggestions = Array.from(
  new Set(
    tickerSuggestionSource
      .split(",")
      .map((ticker) => ticker.trim().toUpperCase())
      .filter(Boolean)
  )
);
const tabButtons = Array.from(document.querySelectorAll("[data-tab-target]"));
const tabPanels = {
  overview: document.getElementById("overviewTab"),
  buySell: document.getElementById("buySellTab"),
  input: document.getElementById("inputTab")
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2
});
const compactCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 4
});
const sharesFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 4
});
const percentFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 2
});
const allocationPercentFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1
});
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium"
});
const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short"
});

const state = {
  dashboard: null,
  loading: true,
  error: null,
  activeTab: "overview"
};

const allocationColors = [
  "#0f172a",
  "#2563eb",
  "#0f9d58",
  "#f97316",
  "#8b5cf6",
  "#14b8a6",
  "#e11d48",
  "#f59e0b",
  "#64748b"
];

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function apiUrl(path) {
  return `${apiBaseUrl}${path}`;
}

async function fetchJson(path, options = {}) {
  const response = await fetch(apiUrl(path), {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const text = await response.text();
  let data = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }

  if (!response.ok) {
    const messageParts = [];

    if (data.error) {
      messageParts.push(data.error);
    }

    if (data.details && data.details !== data.error) {
      messageParts.push(data.details);
    }

    const message = messageParts.length
      ? messageParts.join(": ")
      : `Request failed with ${response.status}`;
    throw new Error(message);
  }

  return data;
}

function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "N/A";
  }

  return currencyFormatter.format(value);
}

function formatSignedCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "N/A";
  }

  const numericValue = Number(value);
  const sign = numericValue > 0 ? "+" : numericValue < 0 ? "-" : "";

  return `${sign}${currencyFormatter.format(Math.abs(numericValue))}`;
}

function formatCompactCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "N/A";
  }

  return compactCurrencyFormatter.format(value);
}

function formatShares(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "N/A";
  }

  return sharesFormatter.format(value);
}

function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "N/A";
  }

  return `${value >= 0 ? "+" : ""}${percentFormatter.format(value / 100)}`;
}

function populateTickerSuggestions() {
  if (!tickerSuggestionList) {
    return;
  }

  tickerSuggestionList.innerHTML = tickerSuggestions
    .map((ticker) => `<option value="${escapeHtml(ticker)}"></option>`)
    .join("");
}

function calculateProfitLossPercent(latestPrice, avgCost) {
  const latest = Number(latestPrice);
  const cost = Number(avgCost);

  if (!Number.isFinite(latest) || !Number.isFinite(cost) || cost === 0) {
    return null;
  }

  return ((latest - cost) / cost) * 100;
}

function formatAllocationPercent(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "N/A";
  }

  return allocationPercentFormatter.format(value / 100);
}

function formatDate(value) {
  if (!value) {
    return "N/A";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return dateFormatter.format(parsed);
}

function formatDateTime(value) {
  if (!value) {
    return "N/A";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return dateTimeFormatter.format(parsed);
}

function buildAllocationData(holdings) {
  const normalizedHoldings = Array.isArray(holdings) ? holdings : [];
  const pricedHoldings = normalizedHoldings
    .map((holding) => ({
      ...holding,
      marketValue: Number(holding?.marketValue) || 0
    }))
    .filter((holding) => holding.marketValue > 0)
    .sort((left, right) => right.marketValue - left.marketValue);

  const totalMarketValue = pricedHoldings.reduce((sum, holding) => sum + holding.marketValue, 0);
  const excludedCount = normalizedHoldings.filter(
    (holding) => !(Number(holding?.marketValue) > 0)
  ).length;

  let cursor = -90;

  const slices =
    totalMarketValue > 0
      ? pricedHoldings.map((holding, index) => {
          const percent = (holding.marketValue / totalMarketValue) * 100;
          const startAngle = cursor;
          const endAngle = cursor + 360 * (percent / 100);
          cursor = endAngle;
          const midAngle = startAngle + (endAngle - startAngle) / 2;

          return {
            ...holding,
            index,
            color: allocationColors[index % allocationColors.length],
            percent,
            startAngle,
            endAngle,
            midAngle,
            tooltipAnchor: polarToCartesian(100, 100, 72, midAngle)
          };
        })
      : [];

  return {
    slices,
    totalMarketValue,
    excludedCount
  };
}

function buildAllocationGradient(slices) {
  if (!slices.length) {
    return "conic-gradient(#e2e8f0 0deg 360deg)";
  }

  let cursor = -90;
  const stops = slices.map((slice) => {
    const start = cursor;
    cursor += 360 * (slice.percent / 100);
    return `${slice.color} ${start}deg ${cursor}deg`;
  });

  return `conic-gradient(${stops.join(", ")})`;
}

function polarToCartesian(cx, cy, radius, angleDegrees) {
  const angle = ((angleDegrees - 90) * Math.PI) / 180;

  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle)
  };
}

function buildDonutSlicePath(cx, cy, outerRadius, innerRadius, startAngle, endAngle) {
  if (endAngle - startAngle >= 359.999) {
    const outerStart = polarToCartesian(cx, cy, outerRadius, startAngle);
    const outerMid = polarToCartesian(cx, cy, outerRadius, startAngle + 180);
    const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);
    const innerMid = polarToCartesian(cx, cy, innerRadius, startAngle + 180);

    return [
      `M ${outerStart.x.toFixed(3)} ${outerStart.y.toFixed(3)}`,
      `A ${outerRadius} ${outerRadius} 0 1 1 ${outerMid.x.toFixed(3)} ${outerMid.y.toFixed(3)}`,
      `A ${outerRadius} ${outerRadius} 0 1 1 ${outerStart.x.toFixed(3)} ${outerStart.y.toFixed(3)}`,
      `L ${innerStart.x.toFixed(3)} ${innerStart.y.toFixed(3)}`,
      `A ${innerRadius} ${innerRadius} 0 1 0 ${innerMid.x.toFixed(3)} ${innerMid.y.toFixed(3)}`,
      `A ${innerRadius} ${innerRadius} 0 1 0 ${innerStart.x.toFixed(3)} ${innerStart.y.toFixed(3)}`,
      "Z"
    ].join(" ");
  }

  const outerStart = polarToCartesian(cx, cy, outerRadius, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerRadius, endAngle);
  const innerStart = polarToCartesian(cx, cy, innerRadius, endAngle);
  const innerEnd = polarToCartesian(cx, cy, innerRadius, startAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${outerStart.x.toFixed(3)} ${outerStart.y.toFixed(3)}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x.toFixed(3)} ${outerEnd.y.toFixed(3)}`,
    `L ${innerStart.x.toFixed(3)} ${innerStart.y.toFixed(3)}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerEnd.x.toFixed(3)} ${innerEnd.y.toFixed(3)}`,
    "Z"
  ].join(" ");
}

function formatAllocationTooltip(slice) {
  const companyName = escapeHtml(slice.companyName || slice.symbol || "Holding");
  const symbol = escapeHtml(slice.symbol || "-");
  const transactionCount = Number.isFinite(Number(slice.transactionCount))
    ? `${slice.transactionCount} trade(s)`
    : "-";

  return `
    <div class="allocation-tooltip__title">
      <strong>${companyName}</strong>
      <span>${symbol}</span>
    </div>
    <div class="allocation-tooltip__grid">
      <div class="allocation-tooltip__item">
        <span class="allocation-tooltip__label">Shares</span>
        <strong class="allocation-tooltip__value">${formatShares(slice.shares)}</strong>
      </div>
      <div class="allocation-tooltip__item">
        <span class="allocation-tooltip__label">Market Value</span>
        <strong class="allocation-tooltip__value">${formatCurrency(slice.marketValue)}</strong>
      </div>
      <div class="allocation-tooltip__item">
        <span class="allocation-tooltip__label">Allocation</span>
        <strong class="allocation-tooltip__value">${formatAllocationPercent(slice.percent)}</strong>
      </div>
      <div class="allocation-tooltip__item">
        <span class="allocation-tooltip__label">Avg Cost</span>
        <strong class="allocation-tooltip__value">${formatCompactCurrency(slice.avgCost)}</strong>
      </div>
      <div class="allocation-tooltip__item">
        <span class="allocation-tooltip__label">Latest Price</span>
        <strong class="allocation-tooltip__value">${formatCurrency(slice.latestPrice)}</strong>
      </div>
      <div class="allocation-tooltip__item">
        <span class="allocation-tooltip__label">Trades</span>
        <strong class="allocation-tooltip__value">${escapeHtml(transactionCount)}</strong>
      </div>
    </div>
  `;
}

function positionAllocationTooltip(tooltip, chartElement, point) {
  const chartRect = chartElement.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  const padding = 12;
  const x = Math.min(
    Math.max(point.x, tooltipRect.width / 2 + padding),
    chartRect.width - tooltipRect.width / 2 - padding
  );
  const y = Math.min(
    Math.max(point.y, tooltipRect.height + padding),
    chartRect.height - padding
  );

  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
}

function getSliceAnchorPoint(slice, chartElement) {
  const chartRect = chartElement.getBoundingClientRect();
  const scaleX = chartRect.width / 200;
  const scaleY = chartRect.height / 200;

  return {
    x: slice.tooltipAnchor.x * scaleX,
    y: slice.tooltipAnchor.y * scaleY
  };
}

function setActiveAllocationSlice(chartElement, activeIndex) {
  chartElement.querySelectorAll("[data-allocation-slice]").forEach((sliceNode) => {
    sliceNode.classList.toggle(
      "is-active",
      Number(sliceNode.getAttribute("data-allocation-index")) === activeIndex
    );
  });
}

function bindAllocationInteractions(chartElement, slices) {
  const tooltip = chartElement.querySelector("[data-allocation-tooltip]");
  const svg = chartElement.querySelector("[data-allocation-svg]");

  if (!tooltip || !svg) {
    return;
  }

  let activeIndex = -1;

  const hideTooltip = () => {
    activeIndex = -1;
    tooltip.classList.remove("is-visible");
    tooltip.setAttribute("aria-hidden", "true");
    setActiveAllocationSlice(chartElement, -1);
  };

  const showTooltip = (slice, point) => {
    activeIndex = slice.index;
    tooltip.innerHTML = formatAllocationTooltip(slice);
    tooltip.setAttribute("aria-hidden", "false");
    tooltip.classList.add("is-visible");
    setActiveAllocationSlice(chartElement, slice.index);
    positionAllocationTooltip(tooltip, chartElement, point);
  };

  svg.addEventListener("pointermove", (event) => {
    const sliceNode = event.target.closest("[data-allocation-slice]");

    if (!sliceNode) {
      if (activeIndex !== -1) {
        hideTooltip();
      }

      return;
    }

    const sliceIndex = Number(sliceNode.getAttribute("data-allocation-index"));
    const slice = slices[sliceIndex];

    if (!slice) {
      return;
    }

    if (activeIndex !== sliceIndex) {
      showTooltip(slice, getSliceAnchorPoint(slice, chartElement));
    }
  });

  svg.addEventListener("pointerleave", hideTooltip);

  svg.addEventListener("focusin", (event) => {
    const sliceNode = event.target.closest("[data-allocation-slice]");

    if (!sliceNode) {
      return;
    }

    const sliceIndex = Number(sliceNode.getAttribute("data-allocation-index"));
    const slice = slices[sliceIndex];

    if (!slice) {
      return;
    }

    showTooltip(slice, getSliceAnchorPoint(slice, chartElement));
  });

  svg.addEventListener("focusout", (event) => {
    if (!svg.contains(event.relatedTarget)) {
      hideTooltip();
    }
  });

  svg.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      hideTooltip();
    }
  });
}

function moneyClass(value) {
  if (value === null || value === undefined || Number.isNaN(value) || value === 0) {
    return "neutral";
  }

  return value > 0 ? "positive" : "negative";
}

function getRealizedPositions(realizedPositions) {
  return (Array.isArray(realizedPositions) ? realizedPositions : [])
    .filter((position) => Number(position.totalSold) > 0 || Number(position.realizedPnl) !== 0)
    .sort((left, right) => {
      const difference = Number(right.realizedPnl) - Number(left.realizedPnl);

      if (difference !== 0) {
        return difference;
      }

      return String(left.symbol || "").localeCompare(String(right.symbol || ""));
    });
}

function badgeClass(type) {
  return type === "buy" ? "positive" : "negative";
}

function showToast(title, message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <strong>${escapeHtml(title)}</strong>
    <div>${escapeHtml(message)}</div>
  `;
  toastStack.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 3200);
}

function setActiveTab(tabName) {
  state.activeTab = tabName;

  tabButtons.forEach((button) => {
    const active = button.dataset.tabTarget === tabName;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });

  Object.entries(tabPanels).forEach(([name, panel]) => {
    if (!panel) {
      return;
    }

    panel.hidden = name !== tabName;
  });
}

function renderLoadingState() {
  summaryGrid.innerHTML = Array.from({ length: 6 })
    .map(() => '<div class="summary-skeleton"></div>')
    .join("");

  if (allocationChart) {
    allocationChart.innerHTML = `
      <div class="allocation-chart__skeleton">
        <div class="allocation-chart__skeleton-visual">
          <div class="allocation-chart__skeleton-pie"></div>
          <div class="skeleton-cell" style="height: 18px; width: 72%;"></div>
        </div>
        <div class="allocation-chart__skeleton-legend">
          <div class="skeleton-cell" style="height: 58px;"></div>
          <div class="skeleton-cell" style="height: 58px;"></div>
          <div class="skeleton-cell" style="height: 58px;"></div>
        </div>
      </div>
    `;
  }

  holdingsBody.innerHTML = `
    <tr>
      <td colspan="5">
        <div class="skeleton-cell" style="height: 18px; margin-bottom: 10px;"></div>
        <div class="skeleton-cell" style="height: 18px; width: 70%;"></div>
      </td>
    </tr>
  `;

  transactionList.innerHTML = `
    <div class="empty-state">
      <h3>Loading data...</h3>
      <p>The backend is fetching the latest dashboard snapshot.</p>
    </div>
  `;

  if (buySellStats) {
    buySellStats.innerHTML = Array.from({ length: 4 })
      .map(() => '<div class="buy-sell-skeleton"></div>')
      .join("");
  }

  if (realizedChart) {
    realizedChart.innerHTML = `
      <div class="realized-chart__skeleton">
        <div class="realized-chart__skeleton-row"></div>
        <div class="realized-chart__skeleton-row"></div>
        <div class="realized-chart__skeleton-row"></div>
        <div class="realized-chart__skeleton-row"></div>
      </div>
    `;
  }

  if (buySellSidecards) {
    buySellSidecards.innerHTML = `
      <div class="buy-sell-skeleton buy-sell-skeleton--tall"></div>
      <div class="buy-sell-skeleton buy-sell-skeleton--tall"></div>
    `;
  }

  if (buySellChartNote) {
    buySellChartNote.textContent = "Loading realized profit breakdown...";
  }

  warningBanner.hidden = true;
  summarySubtitle.textContent = "Fetching portfolio values and latest prices...";
}

function renderErrorState(message) {
  warningBanner.hidden = false;
  warningBanner.textContent = message;

  if (!state.dashboard) {
    summaryGrid.innerHTML = `
      <div class="summary-card">
        <p class="summary-label">Status</p>
        <div class="summary-value negative">Error</div>
        <div class="summary-meta">${escapeHtml(message)}</div>
      </div>
      <div class="summary-skeleton"></div>
      <div class="summary-skeleton"></div>
      <div class="summary-skeleton"></div>
      <div class="summary-skeleton"></div>
      <div class="summary-skeleton"></div>
    `;

    holdingsBody.innerHTML = `
      <tr class="placeholder-row">
        <td colspan="5">Unable to load data.</td>
      </tr>
    `;

    transactionList.innerHTML = `
      <div class="empty-state error-state">
        <h3>Dashboard failed to load</h3>
        <p>${escapeHtml(message)}</p>
      </div>
    `;

    if (allocationChart) {
      allocationChart.innerHTML = `
        <div class="empty-state allocation-empty">
          <h3>Unable to display the chart</h3>
          <p>${escapeHtml(message)}</p>
        </div>
      `;
    }

    if (buySellStats) {
      buySellStats.innerHTML = `
        <div class="summary-card">
          <p class="summary-label">Status</p>
          <div class="summary-value negative">Error</div>
          <div class="summary-meta">${escapeHtml(message)}</div>
        </div>
        <div class="summary-skeleton"></div>
        <div class="summary-skeleton"></div>
        <div class="summary-skeleton"></div>
      `;
    }

    if (realizedChart) {
      realizedChart.innerHTML = `
        <div class="empty-state realized-empty">
          <h3>Unable to display realized profit</h3>
          <p>${escapeHtml(message)}</p>
        </div>
      `;
    }

    if (buySellSidecards) {
      buySellSidecards.innerHTML = `
        <div class="buy-sell-skeleton buy-sell-skeleton--tall"></div>
        <div class="buy-sell-skeleton buy-sell-skeleton--tall"></div>
      `;
    }
  }
}

function summaryCard(label, value, meta, tone = "neutral") {
  return `
    <article class="summary-card">
      <p class="summary-label">${escapeHtml(label)}</p>
      <div class="summary-value ${tone}">${escapeHtml(value)}</div>
      <div class="summary-meta">${meta}</div>
    </article>
  `;
}

function renderSummary(summary) {
  summaryGrid.innerHTML = [
    summaryCard(
      "Market Value",
      formatCurrency(summary.marketValue),
      "Current market value of the holdings you still own"
    ),
    summaryCard(
      "Cost Basis",
      formatCurrency(summary.costBasis),
      "Current cost basis of your open positions"
    ),
    summaryCard(
      "Total P/L",
      formatCurrency(summary.totalPnl),
      `${formatPercent(summary.totalReturnPct)} from total invested capital`,
      moneyClass(summary.totalPnl)
    ),
    summaryCard(
      "Unrealized P/L",
      formatCurrency(summary.unrealizedPnl),
      "Open gain or loss on positions you still hold",
      moneyClass(summary.unrealizedPnl)
    ),
    summaryCard(
      "Open Positions",
      `${summary.openPositions}`,
      "Number of positions currently open"
    ),
    summaryCard(
      "Realized P/L",
      formatCurrency(summary.realizedPnl),
      "Closed gain or loss already locked in",
      moneyClass(summary.realizedPnl)
    )
  ].join("");

  const openPositions = Number(summary.openPositions) || 0;
  const currentShares = Number(summary.currentShares) || 0;
  const transactionCount = Number(summary.transactionCount) || 0;

  summarySubtitle.textContent = `Holding ${openPositions} open position(s), ${formatShares(
    currentShares
  )} shares, ${transactionCount} total transaction(s)`;
}

function renderAllocationChart(holdings, summary = {}) {
  if (!allocationChart) {
    return;
  }

  const { slices, totalMarketValue, excludedCount } = buildAllocationData(holdings);

  if (!slices.length) {
    allocationChart.innerHTML = `
      <div class="empty-state allocation-empty">
        <h3>No allocation data available</h3>
        <p>The chart appears when holdings have a latest price and market value.</p>
      </div>
    `;
    return;
  }

  const chartTotal = Number(summary.marketValue) || totalMarketValue;
  const outerRadius = 90;
  const innerRadius = 54;
  const center = 100;

  allocationChart.innerHTML = `
    <div class="allocation-chart__body">
      <div class="allocation-chart__visual">
        <div class="allocation-chart__chart">
          <svg
            class="allocation-chart__pie"
            viewBox="0 0 200 200"
            role="img"
            aria-label="Market value allocation pie chart"
            data-allocation-svg
          >
            <circle class="allocation-chart__track" cx="${center}" cy="${center}" r="${outerRadius}" />
            ${slices
              .map(
                (slice) => `
                  <path
                    class="allocation-chart__slice"
                    d="${buildDonutSlicePath(
                      center,
                      center,
                      outerRadius,
                      innerRadius,
                      slice.startAngle,
                      slice.endAngle
                    )}"
                    fill="${slice.color}"
                    stroke="rgba(255, 255, 255, 0.9)"
                    stroke-width="1"
                    data-allocation-slice
                    data-allocation-index="${slice.index}"
                    tabindex="0"
                    aria-label="${escapeHtml(
                      `${slice.companyName || slice.symbol || "Holding"}, ${formatShares(
                        slice.shares
                      )} shares, ${formatCurrency(slice.marketValue)}, ${formatAllocationPercent(
                        slice.percent
                      )}`
                    )}"
                  ></path>
                `
              )
              .join("")}
          </svg>
          <div class="allocation-chart__center">
            <span class="allocation-chart__center-label">Total Market Value</span>
            <strong>${formatCurrency(chartTotal)}</strong>
            <span>${slices.length} holding(s)</span>
          </div>
          <div class="allocation-chart__tooltip" data-allocation-tooltip aria-hidden="true"></div>
        </div>
        <p class="allocation-chart__caption">
          Allocation is based on the current market value of open holdings.
        </p>
      </div>

      <div class="allocation-chart__legend" aria-label="Market value allocation legend">
        ${slices
          .map(
            (slice) => `
              <div class="allocation-legend__item">
                <span class="allocation-legend__swatch" style="background: ${slice.color};"></span>
                <div class="allocation-legend__text">
                  <strong>${escapeHtml(slice.companyName || slice.symbol || "Holding")}</strong>
                  <span>${formatCurrency(slice.marketValue)} · ${formatAllocationPercent(slice.percent)}</span>
                </div>
              </div>
            `
          )
          .join("")}
      </div>
    </div>
    ${
      excludedCount > 0
        ? `<div class="allocation-chart__footnote">${excludedCount} holding(s) excluded because market value is unavailable.</div>`
        : ""
    }
  `;

  bindAllocationInteractions(allocationChart, slices);
}

function renderHoldings(holdings) {
  if (!holdings.length) {
    holdingsBody.innerHTML = `
      <tr class="placeholder-row">
        <td colspan="5">
          <div class="empty-state">
            <h3>No holdings yet</h3>
            <p>Add your first buy transaction to start building a portfolio.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  holdingsBody.innerHTML = holdings
    .map((holding) => {
      const priceTone =
        holding.latestPrice === null || holding.latestPrice === undefined
          ? "neutral"
          : moneyClass(holding.latestPrice - holding.avgCost);
      const profitLossPercent = calculateProfitLossPercent(holding.latestPrice, holding.avgCost);
      const profitLossTone = moneyClass(profitLossPercent);
      const profitLossLabel =
        profitLossPercent === null ? "N/A" : `P/L ${formatPercent(profitLossPercent)}`;

      return `
        <tr>
          <td class="asset-cell" data-label="Holding">
            <span class="asset-name">${escapeHtml(holding.companyName)}</span>
            <span class="asset-symbol">${escapeHtml(holding.symbol)}</span>
          </td>
          <td data-label="Shares">
            <strong class="shares">${formatShares(holding.shares)}</strong>
            <span class="cell-subtext">${holding.transactionCount} trade(s)</span>
          </td>
          <td data-label="Avg Cost">
            <strong class="money">${formatCompactCurrency(holding.avgCost)}</strong>
            <span class="cell-subtext">Average cost per share</span>
          </td>
          <td data-label="Latest Price">
            <strong class="money ${priceTone}">${formatCurrency(holding.latestPrice)}</strong>
            <span class="cell-subtext ${profitLossTone}">${profitLossLabel}</span>
          </td>
          <td data-label="Market Value">
            <strong class="money">${formatCurrency(holding.marketValue)}</strong>
            <span class="cell-subtext">Current market value</span>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderTransactions(transactions) {
  const sortedTransactions = [...(Array.isArray(transactions) ? transactions : [])].sort(
    (left, right) => {
      const leftDate = new Date(left?.date || left?.createdAt || 0).getTime();
      const rightDate = new Date(right?.date || right?.createdAt || 0).getTime();

      if (leftDate !== rightDate) {
        return rightDate - leftDate;
      }

      const leftCreatedAt = new Date(left?.createdAt || 0).getTime();
      const rightCreatedAt = new Date(right?.createdAt || 0).getTime();

      if (leftCreatedAt !== rightCreatedAt) {
        return rightCreatedAt - leftCreatedAt;
      }

      return String(right?.id || "").localeCompare(String(left?.id || ""));
    }
  );

  if (!sortedTransactions.length) {
    transactionList.innerHTML = `
      <div class="empty-state">
        <h3>No transactions yet</h3>
        <p>Add a transaction in the input tab to see the history here.</p>
      </div>
    `;
    return;
  }

  transactionList.innerHTML = sortedTransactions
    .map((transaction) => {
      const badgeTone = badgeClass(transaction.type);
      return `
        <article class="transaction-item" data-transaction-id="${escapeHtml(
          transaction.id
        )}">
          <div class="transaction-item__main">
            <div class="transaction-item__header">
              <div class="transaction-item__ident">
                <div class="transaction-item__title">
                  <strong>${escapeHtml(transaction.symbol)}</strong>
                  <span class="transaction-badge ${badgeTone}">${escapeHtml(
                    transaction.type.toUpperCase()
                  )}</span>
                </div>
                <div class="transaction-item__company">
                  ${escapeHtml(transaction.companyName || transaction.assetQuery || "-")}
                </div>
              </div>
              <div class="transaction-item__value">
                <strong class="money">${formatCurrency(transaction.totalAmount)}</strong>
              </div>
            </div>
            <div class="transaction-item__meta">
              <span>${formatDate(transaction.date)}</span>
              <span>${formatShares(transaction.shares)} shares</span>
              <span>${formatCurrency(transaction.unitPrice)} / share</span>
            </div>
            ${
              transaction.note
                ? `<p class="transaction-item__note">${escapeHtml(transaction.note)}</p>`
                : ""
            }
          </div>
          <div class="transaction-actions">
            <button
              class="ghost-button danger"
              type="button"
              data-delete-transaction="${escapeHtml(transaction.id)}"
              data-transaction-label="${escapeHtml(
                `${transaction.companyName || transaction.symbol || transaction.assetQuery || "Transaction"} - ${formatDate(
                  transaction.date
                )}`
              )}"
            >
              Delete
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderBuySellStats(summary, realizedPositions) {
  if (!buySellStats) {
    return;
  }

  const activeRealizedCount = realizedPositions.length;
  const positiveCount = realizedPositions.filter((position) => Number(position.realizedPnl) > 0).length;
  const negativeCount = realizedPositions.filter((position) => Number(position.realizedPnl) < 0).length;
  const flatCount = realizedPositions.filter((position) => Number(position.realizedPnl) === 0).length;

  buySellStats.innerHTML = [
    summaryCard(
      "Realized P/L",
      formatSignedCurrency(summary.totalRealizedPnl),
      "Locked-in gain or loss across all symbols",
      moneyClass(summary.totalRealizedPnl)
    ),
    summaryCard(
      "Winning / Losing",
      `${positiveCount} / ${negativeCount}`,
      `${flatCount} symbol(s) are flat after sells`
    ),
    summaryCard(
      "Sell Proceeds",
      formatCurrency(summary.totalSellProceeds),
      "Total cash pulled out from sold shares"
    ),
    summaryCard(
      "Tracked Symbols",
      `${activeRealizedCount}`,
      "Symbols with sell activity or realized P/L"
    )
  ].join("");

  if (buySellSubtitle) {
    buySellSubtitle.textContent = `${activeRealizedCount} symbol(s) have sell activity, with ${positiveCount} winners and ${negativeCount} losers.`;
  }
}

function renderBuySellSidecards(summary, realizedPositions) {
  if (!buySellSidecards) {
    return;
  }

  const best = summary.bestRealized || realizedPositions[0] || null;
  const worst = summary.worstRealized || realizedPositions[realizedPositions.length - 1] || null;

  const renderSidecard = (title, position, tone, caption) => {
    if (!position) {
      return `
        <article class="buy-sell-sidecard empty-state">
          <h3>${escapeHtml(title)}</h3>
          <p>${escapeHtml(caption)}</p>
        </article>
      `;
    }

    return `
      <article class="buy-sell-sidecard ${tone}">
        <div class="buy-sell-sidecard__eyebrow">${escapeHtml(title)}</div>
        <strong class="buy-sell-sidecard__symbol">${escapeHtml(position.symbol)}</strong>
        <span class="buy-sell-sidecard__company">${escapeHtml(position.companyName || position.symbol)}</span>
        <div class="buy-sell-sidecard__value ${moneyClass(position.realizedPnl)}">
          ${formatSignedCurrency(position.realizedPnl)}
        </div>
        <div class="buy-sell-sidecard__meta">
          <span>${formatCurrency(position.totalBought)} bought</span>
          <span>${formatCurrency(position.totalSold)} sold</span>
          <span>${formatShares(position.shares)} open shares</span>
        </div>
      </article>
    `;
  };

  buySellSidecards.innerHTML = [
    renderSidecard("Best realized trade", best, "positive", "No winning realized trade yet."),
    renderSidecard("Worst realized trade", worst, "negative", "No losing realized trade yet.")
  ].join("");
}

function renderRealizedChart(realizedPositions, dashboard) {
  if (!realizedChart) {
    return;
  }

  const positions = getRealizedPositions(realizedPositions);

  if (!positions.length) {
    realizedChart.innerHTML = `
      <div class="empty-state realized-empty">
        <h3>No realized trades yet</h3>
        <p>The chart will appear once you sell shares and close part of a position.</p>
      </div>
    `;
    if (buySellChartNote) {
      buySellChartNote.textContent = "No sell activity yet.";
    }
    return;
  }

  const maxAbsolute = Math.max(...positions.map((position) => Math.abs(Number(position.realizedPnl) || 0)), 1);
  const hiddenOpenCount = Array.isArray(dashboard?.holdings)
    ? dashboard.holdings.filter(
        (holding) => Number(holding.totalSold) === 0 && Number(holding.realizedPnl) === 0
      ).length
    : 0;

  realizedChart.innerHTML = `
    <div class="realized-chart__header">
      <span>Symbol</span>
      <span class="realized-chart__barlabel">Relative realized P/L</span>
      <span>Result</span>
    </div>
    <div class="realized-chart__list">
      ${positions
        .map((position) => {
          const value = Number(position.realizedPnl) || 0;
          const width = Math.max(6, (Math.abs(value) / maxAbsolute) * 50);
          const tone = value >= 0 ? "positive" : "negative";

          return `
            <article class="realized-row">
              <div class="realized-row__ident">
                <strong>${escapeHtml(position.symbol)}</strong>
                <span>${escapeHtml(position.companyName || position.symbol)}</span>
              </div>
              <div class="realized-row__bar" style="--bar-size: ${width}%">
                <span class="realized-row__axis"></span>
                <span class="realized-row__fill ${tone}"></span>
              </div>
              <div class="realized-row__value ${tone}">
                ${formatSignedCurrency(value)}
                <small>${formatCurrency(position.totalSold)} sold</small>
              </div>
            </article>
          `;
        })
        .join("")}
    </div>
  `;

  if (buySellChartNote) {
    buySellChartNote.textContent = `${positions.length} symbol(s) with sell activity. ${hiddenOpenCount} open holding(s) have no sell history yet.`;
  }
}

function renderWarnings(warnings) {
  if (!warnings || warnings.length === 0) {
    warningBanner.hidden = true;
    warningBanner.textContent = "";
    return;
  }

  warningBanner.hidden = false;
  warningBanner.textContent = warnings.join(" · ");
}

function updateAuxiliaryMeta(summary, generatedAt) {
  const priceCoveragePct = Number(summary.priceCoveragePct) || 0;

  lastUpdated.textContent = `Updated ${formatDateTime(generatedAt)}`;
  priceCoverageHint.textContent =
    priceCoveragePct >= 100
      ? "All latest prices are available"
      : `Fetched prices for ${priceCoveragePct.toFixed(0)}% of holdings`;
}

async function loadDashboard({ silent = false } = {}) {
  if (!silent) {
    state.loading = true;
    renderLoadingState();
    refreshButton.disabled = true;
  }

  try {
    const dashboard = await fetchJson("/api/dashboard");
    state.dashboard = dashboard;
    state.error = null;

    renderWarnings(dashboard.warnings || []);
    renderSummary(dashboard.summary || {});
    renderHoldings(dashboard.holdings || []);
    renderAllocationChart(dashboard.holdings || [], dashboard.summary || {});
    renderTransactions(dashboard.transactions || []);
    renderBuySellStats(dashboard.buySellSummary || {}, dashboard.realizedPositions || []);
    renderRealizedChart(dashboard.realizedPositions || [], dashboard);
    renderBuySellSidecards(dashboard.buySellSummary || {}, dashboard.realizedPositions || []);
    updateAuxiliaryMeta(dashboard.summary || {}, dashboard.generatedAt);

    if (!silent) {
      showToast("Dashboard refreshed", "The latest portfolio data has been loaded.", "success");
    }
  } catch (error) {
    state.error = error;
    renderErrorState(error.message);

    if (!state.dashboard) {
      summaryGrid.innerHTML = `
        <div class="summary-card">
          <p class="summary-label">Status</p>
          <div class="summary-value negative">Offline</div>
          <div class="summary-meta">The backend is not responding.</div>
        </div>
        <div class="summary-skeleton"></div>
        <div class="summary-skeleton"></div>
        <div class="summary-skeleton"></div>
        <div class="summary-skeleton"></div>
        <div class="summary-skeleton"></div>
        <div class="summary-skeleton"></div>
      `;
    }

    showToast("Load failed", error.message, "error");
  } finally {
    state.loading = false;
    refreshButton.disabled = false;
  }
}

function setDefaultDate() {
  const today = new Date();
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
  dateInput.value = localDate;
}

async function handleFormSubmit(event) {
  event.preventDefault();

  const asset = assetInput.value.trim();
  const type = typeInput.value;
  const shares = Number(sharesInput.value);
  const totalAmount = Number(totalAmountInput.value);
  const date = dateInput.value;
  const note = noteInput.value.trim();

  if (!asset || !type || !Number.isFinite(shares) || !Number.isFinite(totalAmount) || !date) {
    showToast("Validation", "Please fill out all required fields before saving.", "error");
    return;
  }

  refreshButton.disabled = true;

  try {
    await fetchJson("/api/transactions", {
      method: "POST",
      body: JSON.stringify({
        asset,
        type,
        shares,
        totalAmount,
        date,
        note
      })
    });

    transactionForm.reset();
    setDefaultDate();
    typeInput.value = "buy";
    setActiveTab("input");
    showToast("Saved", "The transaction has been saved.", "success");
    await loadDashboard({ silent: true });
    assetInput.focus();
  } catch (error) {
    showToast("Save failed", error.message, "error");
  } finally {
    refreshButton.disabled = false;
  }
}

async function handleTransactionActions(event) {
  const button = event.target.closest("[data-delete-transaction]");

  if (!button) {
    return;
  }

  const transactionId = button.getAttribute("data-delete-transaction");
  const transactionLabel = button.getAttribute("data-transaction-label") || "this transaction";

  if (!transactionId) {
    return;
  }

  const ok = window.confirm(`Delete ${transactionLabel}?`);

  if (!ok) {
    return;
  }

  button.disabled = true;

  try {
    await fetchJson(`/api/transactions/${transactionId}`, {
      method: "DELETE"
    });

    showToast("Deleted", "The transaction has been removed.", "success");
    await loadDashboard({ silent: true });
  } catch (error) {
    showToast("Delete failed", error.message, "error");
  } finally {
    button.disabled = false;
  }
}

function bindTabs() {
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setActiveTab(button.dataset.tabTarget);
    });
  });
}

function init() {
  setDefaultDate();
  populateTickerSuggestions();
  bindTabs();
  refreshButton.addEventListener("click", () => loadDashboard());
  transactionForm.addEventListener("submit", handleFormSubmit);
  transactionList.addEventListener("click", handleTransactionActions);
  setActiveTab("overview");
  loadDashboard();
}

document.addEventListener("DOMContentLoaded", init);

