Pro Crypto Desk 🪙
A modern, framework‑free crypto trading dashboard with real‑time simulated ticks, canvas candlesticks, indicators, order book + depth, portfolio KPIs, watchlist, and local persistence.

✨ Features
Realtime price engine with random‑walk ticks and multi‑timeframe bars (1m/5m/1h) for a responsive, realistic feel.

Candlestick chart on canvas with drag‑to‑pan and wheel zoom, plus SMA, EMA, RSI, and MACD overlays toggled live.

Level‑2 order book with bids/asks tables and cumulative depth area chart for quick liquidity reading.

Trade panel for market and limit orders with instant updates to cash, positions, PnL, and activity feed stored locally.

Portfolio allocation donut, KPIs, searchable/sortable market table with sparklines, and a persistent watchlist.

Dark‑first, minimal glass UI with subtle micro‑interactions and an optional welcome screen to match product aesthetics.

🧱 Tech Stack
HTML, CSS, and vanilla JavaScript with a Web Worker for indicators to keep UI rendering smooth.

Canvas for high‑performance candlesticks and depth chart rendering without external chart libraries.

LocalStorage for theme, symbol/timeframe, holdings, cash, watchlist, and activity persistence across reloads.

📦 Project Structure
index.html — App shell, layout, and controls including KPIs, chart, book, trade, market, watchlist, and news.

styles.css — Dark/light theme, glass panels, grid layout, responsive rules, and micro‑interaction styling.

app.js — State management, tick engine, book generation, trading, rendering, and canvas drawing logic.

worker.indicators.js — SMA, EMA, MACD, RSI computations off the main thread for fluid interaction.

🚀 Quick Start
Clone or download the folder with index.html, styles.css, app.js, and worker.indicators.js placed at the project root.

Open index.html in a modern browser, click Enter, and start exploring the live session with the default seed data.

Use the theme toggle, symbol and timeframe select, search, and watchlist to tailor the dashboard to your workflow.

🕹️ Usage Tips
Drag on the chart to pan history; use the mouse wheel to zoom in and out across more or fewer bars.

Toggle SMA, EMA, RSI, and MACD to analyze structure; HUD displays OHLC of the latest bar for quick reference.

Place market or limit orders in the trade panel; portfolio KPIs, allocation, and table values update instantly.

💾 Persistence
Theme, symbol, timeframe, cash, holdings, watchlist, and activity are stored in LocalStorage to survive reloads.

A rebalance action evenly redistributes value across assets and logs the event in the activity feed for traceability.

📊 Indicators
SMA(20) for trend smoothing, EMA(12/26) for responsive trend tracking, MACD(12/26/9) for momentum, and RSI(14) for oscillator signals.

Indicators recompute on each tick for the selected symbol and timeframe via a dedicated Web Worker channel.

🧮 Trading Model
Market orders cross the top of book with modest simulated slippage for realistic fills.

Limit orders must meet the best side thresholds to fill, otherwise they are rejected to mimic exchange behavior.

Cash and position changes flow into KPIs, allocation donut, and activity log for an integrated portfolio view.

🧭 Navigation
Topbar: Search, symbol select, timeframe select, and theme toggle for quick context switching.

Grid layout: Cards for KPIs, Chart, Order Book, Trade, Market table, Allocation, Watchlist, and News panels.

Responsive behavior collapses to two or one column layouts on smaller screens while preserving core workflows.

🎨 Design
Dark‑first palette with subtle gradients, frosted panels, and soft shadows for a modern, minimal aesthetic.

Micro‑interactions for hover and value bumps to reflect live updates without distracting from analysis.

Welcome screen preserves brand moment then fades into the live desk to set context and mood.

🧩 Customization
Replace the random‑walk engine with your preferred price API; map ticks into the latest candle and call indicator updates.

Extend the Market table with pagination and debounced searching for larger universes or server‑side filtering.

Port modules into a React/Vite setup and optionally layer timeline‑based animations if deeper motion control is desired.

🛠️ Scripts
No build step required; open index.html directly for rapid iteration and immediate feedback in the browser.

Modern browsers recommended to ensure smooth canvas rendering and worker messaging for indicators.

🧪 Test Data
Seed holdings and cash are included for demo purposes so you can observe portfolio PnL and allocation out of the box.

Mock news headlines provide ambient context without external requests to keep the demo self‑contained.

🧯 Troubleshooting
If the chart is blank, ensure worker.indicators.js is in the same directory and same origin as index.html.

If mouse wheel zoom doesn’t respond, check system scroll settings and verify focus is on the chart canvas.

Clear LocalStorage keys starting with pro_ to reset preferences, holdings, and activity for a clean slate.

🗺️ Roadmap
Historical backfill API adapter for real OHLCV data while keeping the UI and indicator pipeline intact.

Alerts system for price/indicator thresholds with local notifications or simple email/webhook hooks.

Per‑asset detail pages with expanded analytics and saved chart layouts for power users.

🤝 Contributing
Use concise commit messages with emoji for context, such as :sparkles: features, :bug: fixes, and :memo: docs for clarity.​

Keep PRs small and focused; include before/after screenshots or a brief clip for UI changes when possible.​

Add notes for performance‑sensitive sections like canvas rendering or worker computations to aid review.​

🔐 License
Open source for learning and customization; attribution appreciated when forking or reusing components.​

No warranty or liability; use at your own risk given the simulated nature of pricing and execution.​

❤️ Acknowledgments
README layout inspired by common community templates and best practices for clarity and maintainability.​

Emoji codes align with GitHub flavored markdown for consistent cross‑platform rendering in your repository.​
