from datetime import datetime, timedelta, timezone
from typing import Dict, Iterable, Tuple
import os

import numpy as np
import requests
from flask import Flask, jsonify, render_template


app = Flask(__name__)

# API Configuration
FINNHUB_API_KEY = os.environ.get("FINNHUB_API_KEY", "")
COINGECKO_API = "https://api.coingecko.com/api/v3"
FINNHUB_API = "https://finnhub.io/api/v1"

# Cache configuration
_PRICE_CACHE: Dict[str, Tuple[datetime, Tuple[float | None, float | None]]] = {}
_CACHE_TTL = timedelta(seconds=30)  # Reduced from 2 minutes for real-time updates


INDEX_FALLBACKS: Dict[str, dict] = {
    "^GSPC": {
        "symbol": "^GSPC",
        "name": "S&P 500",
        "rawValue": 5927.00,
        "rawPrevious": 5900.25,
        "rawChange": 0.45,
        "changeType": "percent",
        "isPositive": True,
    },
    "^IXIC": {
        "symbol": "^IXIC",
        "name": "NASDAQ",
        "rawValue": 19428.00,
        "rawPrevious": 19350.75,
        "rawChange": 0.40,
        "changeType": "percent",
        "isPositive": True,
    },
    "^VIX": {
        "symbol": "^VIX",
        "name": "VIX",
        "rawValue": 13.45,
        "rawPrevious": 14.20,
        "rawChange": -5.28,
        "changeType": "percent",
        "isPositive": True,
    },
    "^TNX": {
        "symbol": "^TNX",
        "name": "10Y Treasury",
        "rawValue": 4.251,
        "rawPrevious": 4.235,
        "rawChange": 0.016,
        "changeType": "absolute",
        "isPositive": True,
    },
}


def _format_index_value(symbol: str, raw_value: float | None) -> str:
    if raw_value is None:
        return "--"
    if symbol == "^TNX":
        return f"{raw_value:.3f}%"
    return f"{raw_value:,.2f}"


def _format_index_change(symbol: str, raw_change: float | None, *, change_type: str) -> str:
    if raw_change is None:
        return "0.00%" if change_type == "percent" else "0.00"
    sign = "+" if raw_change >= 0 else ""
    if change_type == "absolute":
        return f"{sign}{raw_change:.3f}"
    return f"{sign}{raw_change:.2f}%"


FALLBACK_DATA = [
    {"symbol": "BTC-USD", "name": "Bitcoin", "price": 97500.00, "change": "--", "isPositive": False},
    {"symbol": "ETH-USD", "name": "Ethereum", "price": 3400.00, "change": "--", "isPositive": False},
    {"symbol": "AAPL", "name": "Apple", "price": 250.00, "change": "--", "isPositive": False},
    {"symbol": "MSFT", "name": "Microsoft", "price": 445.00, "change": "--", "isPositive": True},
    {"symbol": "GOOGL", "name": "Google", "price": 215.00, "change": "--", "isPositive": True},
    {"symbol": "AMZN", "name": "Amazon", "price": 210.00, "change": "--", "isPositive": True},
    {"symbol": "TSLA", "name": "Tesla", "price": 410.00, "change": "--", "isPositive": True},
    {"symbol": "NVDA", "name": "NVIDIA", "price": 145.00, "change": "--", "isPositive": True},
    {"symbol": "JPM", "name": "JPMorgan", "price": 220.00, "change": "--", "isPositive": True},
    {"symbol": "V", "name": "Visa", "price": 310.00, "change": "--", "isPositive": True},
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


# Crypto mapping for CoinGecko API
CRYPTO_TO_COINGECKO = {
    "BTC-USD": "bitcoin",
    "ETH-USD": "ethereum",
}


def _fetch_crypto_data(symbol: str) -> Tuple[float | None, float | None]:
    """Fetch crypto price from CoinGecko (free, no API key needed)."""
    try:
        crypto_id = CRYPTO_TO_COINGECKO.get(symbol)
        if not crypto_id:
            return None, None

        response = requests.get(
            f"{COINGECKO_API}/simple/price",
            params={
                "ids": crypto_id,
                "vs_currencies": "usd",
                "include_market_cap": "false",
                "include_24hr_change": "true",
            },
            timeout=5,
        )
        response.raise_for_status()
        data = response.json()

        if crypto_id in data and "usd" in data[crypto_id]:
            latest_price = float(data[crypto_id]["usd"])
            change_24h = data[crypto_id].get("usd_24h_change", 0)
            if change_24h is not None:
                previous_price = latest_price / (1 + (change_24h / 100))
            else:
                previous_price = latest_price
            return latest_price, previous_price

    except Exception as exc:
        app.logger.warning("CoinGecko fetch failed for %s: %s", symbol, exc)

    return None, None


def _fetch_stock_data(symbol: str) -> Tuple[float | None, float | None]:
    """Fetch stock quote from Finnhub (free tier available)."""
    if not FINNHUB_API_KEY:
        app.logger.warning("FINNHUB_API_KEY not set, using fallback for %s", symbol)
        return None, None

    try:
        response = requests.get(
            f"{FINNHUB_API}/quote",
            params={"symbol": symbol, "token": FINNHUB_API_KEY},
            timeout=5,
        )
        response.raise_for_status()
        data = response.json()

        if "c" in data and data["c"] > 0:  # c = current price
            latest_price = float(data["c"])
            previous_price = float(data["pc"]) if data.get("pc", 0) > 0 else latest_price
            return latest_price, previous_price

    except Exception as exc:
        app.logger.warning("Finnhub fetch failed for %s: %s", symbol, exc)

    return None, None


@app.route("/")
def home() -> str:
    return render_template("index.html")


@app.route("/poker")
def poker() -> str:
    return render_template("poker.html")


@app.route("/ticker", methods=["GET"])
def get_ticker_data():
    price_map = _fetch_recent_closes(TICKER_SYMBOLS, period_days=5)

    response = []
    for symbol in TICKER_SYMBOLS:
        latest_price, previous_price = price_map.get(symbol, (None, None))

        if latest_price is not None and previous_price is not None and previous_price != 0:
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
        else:
            fallback = next((item for item in FALLBACK_DATA if item["symbol"] == symbol), None)
            if fallback:
                response.append(fallback)

    return jsonify(response)


@app.route("/market-indices", methods=["GET"])
def get_market_indices():
    indices = ["^GSPC", "^IXIC", "^VIX", "^TNX"]
    names = ["S&P 500", "NASDAQ", "VIX", "10Y Treasury"]

    price_map = _fetch_recent_closes(indices, period_days=5)
    app.logger.debug("Market indices raw prices: %s", price_map)

    response = []
    for idx, symbol in enumerate(indices):
        latest_price, previous_price = price_map.get(symbol, (None, None))

        if latest_price is None or previous_price is None:
            app.logger.debug("Falling back for %s due to missing data %s", symbol, (latest_price, previous_price))
            response.append(_index_fallback(symbol))
            continue

        try:
            percent_change = ((latest_price - previous_price) / previous_price) * 100 if previous_price else 0.0
            change_str = f"{'+' if percent_change >= 0 else ''}{percent_change:.2f}%"

            if symbol == "^TNX":
                value_str = f"{latest_price:.2f}%"
                change_value = latest_price - previous_price
                change_str = f"{'+' if change_value >= 0 else ''}{change_value:.2f}"
            else:
                value_str = f"{latest_price:.2f}"

            change_type = "absolute" if symbol == "^TNX" else "percent"
            raw_change = (latest_price - previous_price) if change_type == "absolute" else percent_change
            response.append(
                {
                    "symbol": symbol,
                    "name": names[idx],
                    "value": value_str,
                    "change": _format_index_change(symbol, raw_change, change_type=change_type),
                    "isPositive": (percent_change >= 0) if symbol != "^VIX" else (percent_change < 0),
                    "rawValue": latest_price,
                    "rawPrevious": previous_price,
                    "rawChange": raw_change,
                    "changeType": change_type,
                }
            )
        except Exception:  # pragma: no cover - fallback to static data on unexpected edge cases
            app.logger.exception("Failed to process index %s", symbol)
            response.append(_index_fallback(symbol))

    payload = {
        "indices": response,
        "asOf": datetime.now(timezone.utc).isoformat(),
    }
    app.logger.debug("Market indices response payload: %s", payload)
    return jsonify(payload)


def _index_fallback(symbol: str) -> dict:
    fallback = INDEX_FALLBACKS.get(symbol)
    if fallback is None:
        return {
            "symbol": symbol,
            "name": symbol,
            "value": "N/A",
            "change": "0.00%",
            "isPositive": True,
            "rawValue": None,
            "rawPrevious": None,
            "rawChange": None,
            "changeType": "percent",
        }

    raw_value = fallback["rawValue"]
    raw_change = fallback["rawChange"]
    change_type = fallback["changeType"]

    return {
        "symbol": fallback["symbol"],
        "name": fallback["name"],
        "value": _format_index_value(symbol, raw_value),
        "change": _format_index_change(symbol, raw_change, change_type=change_type),
        "isPositive": fallback["isPositive"],
        "rawValue": raw_value,
        "rawPrevious": fallback["rawPrevious"],
        "rawChange": raw_change,
        "changeType": change_type,
    }


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


def _fetch_recent_closes(symbols: Iterable[str], *, period_days: int) -> Dict[str, Tuple[float | None, float | None]]:
    """Fetch the most recent and previous close for each symbol.
    Uses CoinGecko for crypto and Finnhub for stocks.
    """
    results: Dict[str, Tuple[float | None, float | None]] = {}
    now = datetime.now(timezone.utc)

    for symbol in symbols:
        cached = _PRICE_CACHE.get(symbol)
        if cached and now - cached[0] < _CACHE_TTL:
            results[symbol] = cached[1]
            continue

        # Fetch from appropriate API
        if symbol in CRYPTO_TO_COINGECKO:
            latest_close, previous_close = _fetch_crypto_data(symbol)
        else:
            latest_close, previous_close = _fetch_stock_data(symbol)

        results[symbol] = (latest_close, previous_close)

        if latest_close is not None and previous_close is not None:
            _PRICE_CACHE[symbol] = (now, (latest_close, previous_close))

    return results




if __name__ == "__main__":  # pragma: no cover
    app.run(debug=True, host="0.0.0.0", port=5000)