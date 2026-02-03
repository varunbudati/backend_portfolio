# Varun Budati Portfolio

Full-stack personal portfolio with Next.js frontend and Flask backend for live market data.

## Architecture

```
backend_portfolio/
├── app.py                # Flask backend API (Python)
├── requirements.txt      # Python dependencies
├── frontend/             # Next.js React frontend
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   └── public/           # Static assets
└── static/               # Legacy Flask static files
```

## Features

### Frontend (Next.js)
- 🎨 Modern responsive interface with dark theme
- 📈 Trading Simulator with live price chart
- 🧠 Quant Interview Quiz
- 🎰 Kelly Criterion Calculator
- 🎲 Monte Carlo Simulator
- ✨ Floating dock navigation
- 🖱️ Custom cursor with spotlight effects

### Backend (Flask API)
- `/ticker` — Real-time stock/crypto quotes (Finnhub, CoinGecko)
- `/market-indices` — S&P 500, NASDAQ, VIX, 10Y Treasury
- `/historical-data` — 6-month historical charts

## Local Development

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

### Backend (Flask)
```bash
python -m venv .venv
source .venv/bin/activate  # or .\.venv\Scripts\Activate.ps1 on Windows
pip install -r requirements.txt
python app.py
# Runs on http://localhost:5000
```

## Deployment (Hetzner VPS)

### Using Docker Compose (Recommended)
```bash
docker-compose up -d
```

### Manual Deployment
1. Build the Next.js frontend:
   ```bash
   cd frontend && npm run build
   ```

2. Run Flask with Gunicorn:
   ```bash
   gunicorn app:app --bind 0.0.0.0:5000
   ```

3. Configure nginx as reverse proxy (see nginx.conf)

## Environment Variables

```env
FINNHUB_API_KEY=your_finnhub_api_key
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Serves the portfolio homepage |
| `/ticker` | GET | Live stock/crypto ticker data |
| `/market-indices` | GET | Major market indices |
| `/historical-data` | GET | 6-month historical chart data |

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Framer Motion
- **Backend**: Flask, Gunicorn, Python 3.11+
- **APIs**: Finnhub, CoinGecko, yfinance
- **Deployment**: Docker, nginx, Hetzner VPS

---
Built by Varun Budati 🚀
