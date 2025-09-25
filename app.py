from datetime import datetime, timedelta

import numpy as np
import yfinance as yf
from flask import Flask, jsonify, render_template


app = Flask(__name__)


FALLBACK_DATA = [
    {"symbol": "BTC-USD", "name": "Bitcoin", "price": 68421.24, "change": "+2.5%", "isPositive": True},
    {"symbol": "ETH-USD", "name": "Ethereum", "price": 3421.70, "change": "-1.2%", "isPositive": False},
    {"symbol": "AAPL", "name": "Apple", "price": 182.52, "change": "+0.8%", "isPositive": True},
    {"symbol": "MSFT", "name": "Microsoft", "price": 428.80, "change": "+1.3%", "isPositive": True},
    {"symbol": "GOOGL", "name": "Google", "price": 175.38, "change": "-0.5%", "isPositive": False},
    {"symbol": "AMZN", "name": "Amazon", "price": 182.81, "change": "+1.7%", "isPositive": True},
    {"symbol": "TSLA", "name": "Tesla", "price": 175.21, "change": "-2.1%", "isPositive": False},
    {"symbol": "NVDA", "name": "NVIDIA", "price": 108.12, "change": "+3.2%", "isPositive": True},
    {"symbol": "JPM", "name": "JPMorgan", "price": 198.75, "change": "+0.4%", "isPositive": True},
    {"symbol": "V", "name": "Visa", "price": 276.42, "change": "+0.2%", "isPositive": True},
]

TICKER_SYMBOLS = ["BTC-USD", "ETH-USD", "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "JPM", "V"]

TICKER_NAMES = {
    "BTC-USD": "Bitcoin",
    "ETH-USD": "Ethereum",
    "AAPL": "Apple",
    "MSFT": "Microsoft",
    "GOOGL": "Google",
    "AMZN": "Amazon",
    "TSLA": "Tesla",
    "NVDA": "NVIDIA",
    "JPM": "JPMorgan",
    "V": "Visa",
}


@app.route("/")
def home() -> str:
    return render_template("index.html")


@app.route("/ticker", methods=["GET"])
def get_ticker_data():
    try:
        now = datetime.now()
        start_date = (now - timedelta(days=1)).strftime("%Y-%m-%d")
        end_date = now.strftime("%Y-%m-%d")

        data = yf.download(TICKER_SYMBOLS, start=start_date, end=end_date, progress=False, threads=False)

        response = []
        for symbol in TICKER_SYMBOLS:
            try:
                close_series = data["Close"][symbol]
                latest_price = float(close_series.iloc[-1])
                previous_price = float(close_series.iloc[0])

                percent_change = ((latest_price - previous_price) / previous_price) * 100
                change_str = f"{'+' if percent_change >= 0 else ''}{percent_change:.2f}%"

                response.append(
                    {
                        "symbol": symbol,
                        "name": TICKER_NAMES.get(symbol, symbol),
                        "price": round(latest_price, 2),
                        "change": change_str,
                        "isPositive": percent_change >= 0,
                    }
                )
            except (KeyError, IndexError, ValueError):
                fallback = next((item for item in FALLBACK_DATA if item["symbol"] == symbol), None)
                if fallback:
                    response.append(fallback)

        return jsonify(response)

    except Exception as exc:  # pragma: no cover - defensive fallback
        app.logger.warning("Ticker fetch failed: %s", exc)
        return jsonify(FALLBACK_DATA)


@app.route("/market-indices", methods=["GET"])
def get_market_indices():
    indices = ["^GSPC", "^IXIC", "^VIX", "^TNX"]
    names = ["S&P 500", "NASDAQ", "VIX", "10Y Treasury"]

    try:
        now = datetime.now()
        start_date = (now - timedelta(days=1)).strftime("%Y-%m-%d")
        end_date = now.strftime("%Y-%m-%d")

        data = yf.download(indices, start=start_date, end=end_date, progress=False, threads=False)

        response = []
        for idx, symbol in enumerate(indices):
            try:
                close_series = data["Close"][symbol]
                latest_price = float(close_series.iloc[-1])
                previous_price = float(close_series.iloc[0])

                percent_change = ((latest_price - previous_price) / previous_price) * 100
                change_str = f"{'+' if percent_change >= 0 else ''}{percent_change:.2f}%"

                if symbol == "^TNX":
                    value_str = f"{latest_price:.2f}%"
                    change_value = latest_price - previous_price
                    change_str = f"{'+' if change_value >= 0 else ''}{change_value:.2f}"
                else:
                    value_str = f"{latest_price:.2f}"

                response.append(
                    {
                        "name": names[idx],
                        "value": value_str,
                        "change": change_str,
                        "isPositive": (percent_change >= 0) if symbol != "^VIX" else (percent_change < 0),
                    }
                )
            except (KeyError, IndexError, ValueError):
                response.append(_index_fallback(symbol))

        return jsonify(response)

    except Exception as exc:  # pragma: no cover - defensive fallback
        app.logger.warning("Market index fetch failed: %s", exc)
        return jsonify([_index_fallback(symbol) for symbol in indices])


def _index_fallback(symbol: str) -> dict:
    if symbol == "^GSPC":
        return {"name": "S&P 500", "value": "5,203.58", "change": "+0.74%", "isPositive": True}
    if symbol == "^IXIC":
        return {"name": "NASDAQ", "value": "16,428.82", "change": "+1.25%", "isPositive": True}
    if symbol == "^VIX":
        return {"name": "VIX", "value": "16.72", "change": "-4.67%", "isPositive": True}
    if symbol == "^TNX":
        return {"name": "10Y Treasury", "value": "4.32%", "change": "-0.02", "isPositive": True}
    return {"name": symbol, "value": "N/A", "change": "0.00%", "isPositive": True}


@app.route("/historical-data", methods=["GET"])
def get_historical_data():
    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=180)

        symbols = ["^GSPC", "^IXIC", "BTC-USD"]
        data = yf.download(symbols, start=start_date, end=end_date, progress=False, threads=False)

        dates = data.index.strftime("%b %d").tolist()
        sp500_data = data["Close"]["^GSPC"].tolist()
        nasdaq_data = data["Close"]["^IXIC"].tolist()
        btc_data = data["Close"]["BTC-USD"].tolist()

        return jsonify({
            "dates": dates,
            "sp500": sp500_data,
            "nasdaq": nasdaq_data,
            "bitcoin": btc_data,
        })

    except Exception as exc:  # pragma: no cover - defensive fallback
        app.logger.warning("Historical data fetch failed: %s", exc)
        return jsonify(_generate_historical_fallback())


def _generate_historical_fallback() -> dict:
    days = 180
    dates = [(datetime.now() - timedelta(days=i)).strftime("%b %d") for i in range(days, -1, -1)]

    def generate_series(start: float, end: float, volatility: float) -> list[float]:
        base = np.linspace(start, end, days + 1)
        noise = np.random.normal(0, 1, days + 1) * start * volatility
        result = base + noise
        for i in range(0, days + 1, 30):
            if i > 0:
                result[i:] = result[i:] * (1 - np.random.random() * 0.05)
        return result.tolist()

    return {
        "dates": dates,
        "sp500": generate_series(3500, 5200, 0.02),
        "nasdaq": generate_series(11000, 16500, 0.025),
        "bitcoin": generate_series(35000, 68000, 0.05),
    }


if __name__ == "__main__":  # pragma: no cover
    app.run(debug=True, host="0.0.0.0", port=5000)