// app.js
const SETTINGS = {
  TICK_MS: 2000,
  VOLATILITY: 0.012, // random-walk step
  HISTORY_POINTS: 40,
  COLORS: ["#2dd4bf", "#7c4dff", "#ef4444", "#22c55e", "#f59e0b", "#38bdf8", "#d946ef"],
};

const STORE_KEYS = {
  THEME: "cd_theme",
  HOLDINGS: "cd_holdings",
  WATCH: "cd_watch",
  CURRENCY: "cd_currency",
  ACTIVITY: "cd_activity",
};

const CURRENCIES = {
  USD: { sym: "$", rate: 1 },
  EUR: { sym: "€", rate: 0.92 },
  INR: { sym: "₹", rate: 83 },
};

let state = {
  currency: localStorage.getItem(STORE_KEYS.CURRENCY) || "USD",
  theme: localStorage.getItem(STORE_KEYS.THEME) || "dark",
  watch: JSON.parse(localStorage.getItem(STORE_KEYS.WATCH) || "[]"),
  holdings: JSON.parse(localStorage.getItem(STORE_KEYS.HOLDINGS) || "{}"),
  activity: JSON.parse(localStorage.getItem(STORE_KEYS.ACTIVITY) || "[]"),
  sort: { key: "value", dir: "desc" },
  filter: "",
};

const COINS = [
  coin("BTC", "Bitcoin", 67000),
  coin("ETH", "Ethereum", 3400),
  coin("SOL", "Solana", 180),
  coin("BNB", "BNB", 560),
  coin("XRP", "XRP", 0.58),
  coin("DOGE", "Dogecoin", 0.12),
  coin("ADA", "Cardano", 0.42),
];

function coin(symbol, name, price) {
  const history = Array.from({ length: SETTINGS.HISTORY_POINTS }, () =>
    price * (1 + (Math.random() - 0.5) * 0.02)
  );
  return { id: symbol.toLowerCase(), symbol, name, price, change: 0, history };
}

const qs = (sel) => document.querySelector(sel);
const qsa = (sel) => Array.from(document.querySelectorAll(sel));
const fmtMoney = (v) => {
  const c = CURRENCIES[state.currency];
  return c.sym + formatNumber(v * c.rate);
};
const fmtPct = (v) => `${(v * 100).toFixed(2)}%`;
function formatNumber(n) {
  const abs = Math.abs(n);
  const fixed = abs >= 1000 ? abs.toLocaleString(undefined, { maximumFractionDigits: 0 }) : abs.toFixed(2);
  return (n < 0 ? "-" : "") + fixed;
}

function setTheme(theme) {
  document.body.classList.toggle("theme-light", theme === "light");
  document.body.classList.toggle("theme-dark", theme === "dark");
  localStorage.setItem(STORE_KEYS.THEME, theme);
  state.theme = theme;
}

function setCurrency(cur) {
  state.currency = cur;
  localStorage.setItem(STORE_KEYS.CURRENCY, cur);
  renderAll();
}

function saveHoldings() {
  localStorage.setItem(STORE_KEYS.HOLDINGS, JSON.stringify(state.holdings));
}
function saveWatch() {
  localStorage.setItem(STORE_KEYS.WATCH, JSON.stringify(state.watch));
}
function saveActivity() {
  localStorage.setItem(STORE_KEYS.ACTIVITY, JSON.stringify(state.activity));
}

function getHoldingValue(coin) {
  const qty = Number(state.holdings[coin.id] || 0);
  return qty * coin.price;
}
function portfolioTotals() {
  let total = 0;
  let delta = 0;
  for (const c of COINS) {
    const qty = Number(state.holdings[c.id] || 0);
    const start = c.history.at(-2) ?? c.price;
    total += qty * c.price;
    delta += qty * (c.price - start);
  }
  const changePct = total ? delta / (total - delta) : 0;
  return { total, delta, changePct, deltaPct: total ? delta / total : 0 };
}

function sparkPath(history, width, height) {
  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = Math.max(max - min, 1e-6);

  const stepX = width / (history.length - 1);
  return history
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * height;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

function renderCards() {
  const { total, delta, changePct } = portfolioTotals();
  const tv = qs("#totalValue");
  tv.textContent = fmtMoney(total);
  tv.classList.add("bump");
  setTimeout(() => tv.classList.remove("bump"), 180);

  const pnl = qs("#pnlValue");
  pnl.textContent = `${delta >= 0 ? "+" : ""}${fmtMoney(delta)}`;
  const tc = qs("#totalChange");
  tc.textContent = `${(changePct * 100).toFixed(2)}% 24h`;

  // Best/Worst
  const sorted = [...COINS].sort((a,b)=>b.change - a.change);
  const best = sorted[0], worst = sorted.at(-1);
  qs("#bestName").textContent = `${best.symbol}`;
  qs("#bestChange").textContent = `${best.change >= 0 ? "+" : ""}${fmtPct(best.change)}`;
  qs("#worstName").textContent = `${worst.symbol}`;
  qs("#worstChange").textContent = `${worst.change >= 0 ? "+" : ""}${fmtPct(worst.change)}`;
}

function renderAllocation() {
  const vals = COINS.map(c => getHoldingValue(c));
  const sum = vals.reduce((a,b)=>a+b,0);
  const angles = vals.map(v => sum ? (v/sum) * 360 : 0);

  // Build conic-gradient
  let acc = 0;
  const stops = [];
  angles.forEach((ang, i) => {
    const color = SETTINGS.COLORS[i % SETTINGS.COLORS.length];
    const start = acc;
    const end = acc + ang;
    stops.push(`${color} ${start.toFixed(2)}deg ${end.toFixed(2)}deg`);
    acc = end;
  });
  qs("#donut").style.background = `conic-gradient(${stops.join(",")})`;

  // Legend
  const legend = qs("#legend");
  legend.innerHTML = "";
  COINS.forEach((c, i) => {
    const color = SETTINGS.COLORS[i % SETTINGS.COLORS.length];
    const v = vals[i];
    const pct = sum ? (v / sum) : 0;
    const li = document.createElement("li");
    li.innerHTML = `<i style="background:${color}"></i><span>${c.name} (${c.symbol})</span><span>${fmtPct(pct)} • ${fmtMoney(v)}</span>`;
    legend.appendChild(li);
  });
}

function renderMarket() {
  const body = qs("#marketBody");
  const term = state.filter.toLowerCase();

  let rows = COINS
    .filter(c => c.name.toLowerCase().includes(term) || c.symbol.toLowerCase().includes(term))
    .map(c => {
      const qty = Number(state.holdings[c.id] || 0);
      const val = qty * c.price;
      const color = c.change >= 0 ? "#22c55e" : "#ef4444";
      const watchActive = state.watch.includes(c.id) ? "active" : "";
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${c.name} <span class="soft">(${c.symbol})</span></td>
        <td class="right">${fmtMoney(c.price)}</td>
        <td class="right"><span class="badge ${c.change>=0?'up':'down'}">${c.change>=0?'+':''}${fmtPct(c.change)}</span></td>
        <td class="right">
          <svg class="spark" viewBox="0 0 100 28" preserveAspectRatio="none">
            <path d="${sparkPath(c.history, 100, 24)}" stroke="${color}"/>
          </svg>
        </td>
        <td class="right">${qty.toFixed(4)}</td>
        <td class="right">${fmtMoney(val)}</td>
        <td class="center">
          <button class="btn-watch ${watchActive}" data-id="${c.id}">★</button>
        </td>
      `;
      return row;
    });

  const { key, dir } = state.sort;
  const sign = dir === "asc" ? 1 : -1;
  rows.sort((ra, rb) => {
    const aTds = ra.querySelectorAll("td");
    const bTds = rb.querySelectorAll("td");
    const map = {
      name: () => aTds[0].textContent.localeCompare(bTds[0].textContent) * sign,
      price: () => (parseFloat(aTds[1].textContent.replace(/[^\d.-]/g,'')) - parseFloat(bTds[1].textContent.replace(/[^\d.-]/g,''))) * sign,
      change: () => (parseFloat(aTds[2].textContent) - parseFloat(bTds[2].textContent)) * sign,
      holding: () => (parseFloat(aTds[4].textContent) - parseFloat(bTds[4].textContent)) * sign,
      value: () => (parseFloat(aTds[5].textContent.replace(/[^\d.-]/g,'')) - parseFloat(bTds[5].textContent.replace(/[^\d.-]/g,''))) * sign
    };
    return (map[key] ? map[key]() : 0);
  });

  body.innerHTML = "";
  rows.forEach(r => body.appendChild(r));

  // Bind watch buttons
  qsa(".btn-watch").forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const idx = state.watch.indexOf(id);
      if (idx === -1) state.watch.push(id); else state.watch.splice(idx, 1);
      saveWatch();
      renderWatchlist();
      renderMarket();
    };
  });
}

function renderWatchlist() {
  const list = qs("#watchlist");
  list.innerHTML = "";
  const items = state.watch.map(id => COINS.find(c => c.id === id)).filter(Boolean);
  if (!items.length) {
    const li = document.createElement("li");
    li.className = "soft";
    li.textContent = "No coins in watchlist yet.";
    list.appendChild(li);
    return;
  }
  items.forEach(c => {
    const li = document.createElement("li");
    li.className = "watch-item";
    li.innerHTML = `
      <div class="name">${c.name} (${c.symbol})</div>
      <div class="delta ${c.change>=0?'up':'down'}">${c.change>=0?'+':''}${fmtPct(c.change)}</div>
      <button class="tiny ghost remove" data-id="${c.id}">Remove</button>
    `;
    list.appendChild(li);
  });

  qsa(".watch-item .remove").forEach(b => {
    b.onclick = () => {
      const id = b.dataset.id;
      state.watch = state.watch.filter(x => x !== id);
      saveWatch();
      renderWatchlist();
      renderMarket();
    };
  });
}

function renderTxOptions() {
  const sel = qs("#txCoin");
  sel.innerHTML = COINS.map(c => `<option value="${c.id}">${c.name} (${c.symbol})</option>`).join("");
}

function renderActivity() {
  const list = qs("#activity");
  list.innerHTML = "";
  state.activity.slice(-10).reverse().forEach(a => {
    const li = document.createElement("li");
    const money = a.price != null ? `${fmtMoney(a.price)} • ` : "";
    li.innerHTML = `<span>${a.type.toUpperCase()} ${a.symbol} • ${a.qty > 0 ? "+" : ""}${a.qty}</span><span>${money}${new Date(a.ts).toLocaleTimeString()}</span>`;
    list.appendChild(li);
  });
}

function renderAll() {
  renderCards();
  renderAllocation();
  renderMarket();
  renderWatchlist();
  renderActivity();
}

function tickPrices() {
  for (const c of COINS) {
    const prev = c.price;
    const drift = (Math.random() - 0.5) * SETTINGS.VOLATILITY * c.price;
    c.price = Math.max(0.0001, c.price + drift);
    c.history.push(c.price);
    if (c.history.length > SETTINGS.HISTORY_POINTS) c.history.shift();
    const base = c.history.at(0);
    c.change = base ? (c.price - base) / base : 0;
    if (Math.abs(c.price - prev) / prev > 0.001) {
      // minor repaint bump
      qs("#totalValue").classList.add("bump");
      setTimeout(()=>qs("#totalValue").classList.remove("bump"), 180);
    }
  }
  renderCards();
  renderAllocation();
  renderMarket();
  renderWatchlist();
}

// Handlers
function bindUI() {
  const theme = state.theme;
  setTheme(theme);

  qs("#themeToggle").onclick = () => {
    setTheme(document.body.classList.contains("theme-dark") ? "light" : "dark");
  };

  const currencySelect = qs("#currencySelect");
  currencySelect.value = state.currency;
  currencySelect.onchange = (e) => setCurrency(e.target.value);

  qs("#searchInput").oninput = (e) => {
    state.filter = e.target.value;
    renderMarket();
  };

  qsa("th[data-sort]").forEach(th => {
    th.onclick = () => {
      const key = th.getAttribute("data-sort");
      if (state.sort.key === key) {
        state.sort.dir = state.sort.dir === "asc" ? "desc" : "asc";
      } else {
        state.sort.key = key;
        state.sort.dir = "desc";
      }
      renderMarket();
    };
  });

  qs("#rebalanceBtn").onclick = () => {
    // mock: rebalance equally across coins based on total value
    const { total } = portfolioTotals();
    const equal = total / COINS.length;
    COINS.forEach(c => {
      const qty = c.price ? equal / c.price : 0;
      state.holdings[c.id] = Number(qty.toFixed(6));
    });
    saveHoldings();
    state.activity.push({ type: "rebalance", symbol: "ALL", qty: 0, price: null, ts: Date.now() });
    saveActivity();
    renderAll();
  };

  qs("#txForm").onsubmit = (e) => {
    e.preventDefault();
    const id = qs("#txCoin").value;
    const qty = Number(qs("#txQty").value);
    const priceInput = qs("#txPrice").value;
    const coin = COINS.find(c => c.id === id);
    const price = priceInput ? Number(priceInput) : coin.price;

    state.holdings[id] = Number((Number(state.holdings[id] || 0) + qty).toFixed(6));
    saveHoldings();

    state.activity.push({ type: qty >= 0 ? "buy" : "sell", symbol: coin.symbol, qty, price, ts: Date.now() });
    if (state.activity.length > 100) state.activity.shift();
    saveActivity();

    qs("#txQty").value = "";
    qs("#txPrice").value = "";
    renderAll();
  };
}

function init() {
  // Initial holdings for demo
  if (!Object.keys(state.holdings).length) {
    state.holdings = { btc: 0.12, eth: 2.5, sol: 10, bnb: 1, xrp: 500, doge: 1000 };
    saveHoldings();
  }
  renderTxOptions();
  bindUI();
  renderAll();
  setInterval(tickPrices, SETTINGS.TICK_MS);
}

init();

// Note: To connect a real API, fetch prices in tickPrices() instead of random-walk,
// normalize to COINS by id/symbol, then update price and history before renderAll().
