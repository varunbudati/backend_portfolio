# Personal Website (Render Edition)

A full-stack Flask application that powers Varun Budati's quantitative engineering portfolio. The app serves the production-ready UI from the previous static site and augments it with live market telemetry backed by `yfinance`.

## Features

- 🎨 Modern responsive interface with dark/light theming, swipeable gallery, and animated terminal-style skills readout.
- 📈 Financial dashboard featuring real-time market ticker, macro indices, and historical performance charts (falls back gracefully when APIs are unreachable).
- 🧠 All interactive behaviours (theme toggle, slider autoplay, lightbox, filtering, Chart.js visualizations) carried over intact from the original `varunbudati.github.io` project.
- ☁️ Flask backend exposes `/ticker`, `/market-indices`, and `/historical-data` endpoints for live data; ready to deploy on Render with Gunicorn.

## Project Structure

```
personal website/
├── app.py                # Flask application with HTML route + data APIs
├── requirements.txt      # Production dependencies (Flask, gunicorn, yfinance, pandas, numpy)
├── templates/
│   └── index.html        # Main portfolio page (Jinja2 template)
└── static/
    ├── css/              # Extracted style bundles (`style.css`, `quant.css`)
    ├── js/               # Front-end behaviour (`script.js`, `quant.js`)
    └── images/           # Favicons, portraits, GIFs, PDFs, and other assets
```

## Local Development

```powershell
cd "c:\Users\varun\OneDrive\Desktop\GitHub Projects\personal website"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Visit <http://127.0.0.1:5000> to explore the site locally. The Flask dev server proxies the front-end and serves market data APIs. Logs will show any `yfinance` fallbacks triggered when offline.

## Deploying to Render

1. Push this folder to a Git repo (or keep it inside an existing monorepo).
2. Create a new **Web Service** in Render pointing to the repo path.
3. Set the start command to `gunicorn app:app` (Render detects `requirements.txt` automatically).
4. Optional: enable auto-deploy from your main branch for CI/CD.

> **Note:** `yfinance` calls Yahoo Finance directly. Render's free tier allows outbound HTTPS requests, but rate limits apply. The app gracefully serves cached fallback data whenever requests fail.

## API Endpoints

- `GET /` – Portfolio page (renders `templates/index.html`).
- `GET /ticker` – Latest quotes for the configured ticker basket.
- `GET /market-indices` – Macro index snapshot (S&P 500, NASDAQ, VIX, 10Y Treasury).
- `GET /historical-data` – Six-month rolling window for Chart.js visualizations.

Each endpoint returns JSON and automatically switches to deterministic synthetic data when Yahoo Finance is unavailable.

## Next Steps

- Add a contact form backend (e.g., use SendGrid, Formspree, or a simple email webhook).
- Cache finance responses with Redis or simple in-memory storage to reduce API pressure.
- Extend the dashboard with portfolio analytics backed by your trading datasets.

Enjoy the upgraded home for your quant adventures! 🚀
