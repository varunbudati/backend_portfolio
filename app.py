from datetime import datetime, timedelta, timezone
from typing import Dict, Iterable, Tuple

import numpy as np
import yfinance as yf
from flask import Flask, jsonify, render_template


app = Flask(__name__)


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


@app.route("/")
def home() -> str:
    return render_template("index.html")


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
    """Fetch the most recent and previous close for each symbol using yfinance.

    Returns a mapping of symbol -> (latest_close, previous_close). If insufficient
    data is available, the tuple values will be ``(None, None)``.
    """

    results: Dict[str, Tuple[float | None, float | None]] = {}
    period = max(period_days, 2)
    now = datetime.now(timezone.utc)

    for symbol in symbols:
        cached = _PRICE_CACHE.get(symbol)
        if cached and now - cached[0] < _CACHE_TTL:
            results[symbol] = cached[1]
            continue

        latest_close, previous_close = _fetch_symbol_closes(symbol, period)
        results[symbol] = (latest_close, previous_close)

        if latest_close is not None and previous_close is not None:
            _PRICE_CACHE[symbol] = (now, (latest_close, previous_close))

    return results


def _fetch_symbol_closes(symbol: str, period: int) -> Tuple[float | None, float | None]:
    try:
        history = yf.Ticker(symbol).history(
            period=f"{period}d",
            interval="1d",
            auto_adjust=False,
            actions=False,
        )

        closes = history.get("Close")
        if closes is not None and not closes.dropna().empty:
            closes = closes.dropna()
            latest_close = float(closes.iloc[-1])
            previous_close = float(closes.iloc[-2]) if len(closes) >= 2 else latest_close
            return latest_close, previous_close
    except Exception as exc:
        app.logger.debug("Ticker.history failed for %s: %s", symbol, exc)

    try:
        frame = yf.download(
            symbol,
            period=f"{period}d",
            interval="1d",
            progress=False,
            threads=False,
            auto_adjust=False,
        )

        if not frame.empty:
            closes = frame["Close"] if "Close" in frame else frame.iloc[:, 3]
            closes = closes.dropna()
            if not closes.empty:
                latest_close = float(closes.iloc[-1])
                previous_close = float(closes.iloc[-2]) if len(closes) >= 2 else latest_close
                return latest_close, previous_close
    except Exception as exc:
        app.logger.debug("yf.download failed for %s: %s", symbol, exc)

    return None, None


if __name__ == "__main__":  # pragma: no cover
    app.run(debug=True, host="0.0.0.0", port=5000)