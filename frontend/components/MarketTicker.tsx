"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

const tickerData = [
    { symbol: "^GSPC", name: "S&P 500", price: "5,200", change: "+0.42%", positive: true },
    { symbol: "^IXIC", name: "NASDAQ", price: "17,200", change: "+0.58%", positive: true },
    { symbol: "^VIX", name: "VIX", price: "13.2", change: "-3.1%", positive: true },
    { symbol: "^TNX", name: "10Y", price: "4.12%", change: "-5.4bps", positive: true },
    { symbol: "BTC", name: "Bitcoin", price: "$97,500", change: "+1.2%", positive: true },
    { symbol: "ETH", name: "Ethereum", price: "$3,400", change: "+0.7%", positive: true },
];

export default function MarketTicker({ fadeUp }: { fadeUp?: any }) {
    const [liveTickerData, setLiveTickerData] = useState(tickerData);

    const tickerLoop = useMemo(() => [...liveTickerData, ...liveTickerData], [liveTickerData]);

    useEffect(() => {
        const fetchTickerData = async () => {
            try {
                // Fetch from backend API which uses yfinance for real market data
                const res = await fetch("/api/shadefinder/stocks");
                const stocksData = await res.json();

                if (stocksData.success && stocksData.data) {
                    setLiveTickerData(
                        stocksData.data.map((item: any) => ({
                            symbol: item.symbol,
                            name: item.name,
                            price: item.price,
                            change: item.change,
                            positive: item.positive,
                        }))
                    );
                } else {
                    // Fallback to default data if API fails
                    console.error("Failed to fetch stocks:", stocksData.error);
                    setLiveTickerData(tickerData);
                }
            } catch (error) {
                console.error("Failed to fetch ticker data:", error);
                // Fallback to default data on network error
                setLiveTickerData(tickerData);
            }
        };

        fetchTickerData();
        const interval = setInterval(fetchTickerData, 60000); // Update every 60 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.section className="section" {...fadeUp}>
            <div className="ticker" role="status" aria-live="polite">
                <div className="ticker__inner">
                    {tickerLoop.map((item, idx) => (
                        <div key={`${item.symbol}-${idx}`} className="ticker__item">
                            <span className="ticker__symbol">{item.symbol}</span>
                            <span className="ticker__price">{item.price}</span>
                            <span className={`ticker__change ${item.positive ? "pos" : "neg"}`}>
                                {item.change}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.section>
    );
}
