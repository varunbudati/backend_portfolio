"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaChartLine, FaCalculator, FaDice, FaBrain } from "react-icons/fa";

// Trading game types
type Trade = {
    type: "BUY" | "SELL";
    price: number;
    shares: number;
    time: number;
};

// Quiz questions
const quizQuestions = [
    {
        question: "You flip a fair coin 100 times. What's the expected number of heads?",
        options: ["25", "50", "75", "100"],
        correct: 1,
        explanation: "E[X] = n × p = 100 × 0.5 = 50"
    },
    {
        question: "What's the probability of getting at least one 6 when rolling a die 4 times?",
        options: ["1/6", "4/6", "1 - (5/6)⁴ ≈ 0.52", "1/1296"],
        correct: 2,
        explanation: "P(at least one 6) = 1 - P(no 6s) = 1 - (5/6)⁴ ≈ 0.518"
    },
    {
        question: "A stock has 50% chance to double and 50% chance to halve. What's the expected value of $100?",
        options: ["$100", "$125", "$75", "$150"],
        correct: 1,
        explanation: "E[X] = 0.5 × $200 + 0.5 × $50 = $125"
    },
    {
        question: "What's the variance of a fair 6-sided die roll?",
        options: ["2.5", "2.92", "3.5", "1.71"],
        correct: 1,
        explanation: "Var(X) = E[X²] - E[X]² = 91/6 - (7/2)² = 35/12 ≈ 2.92"
    },
    {
        question: "Two people pick random numbers 0-1. What's P(sum > 1)?",
        options: ["1/4", "1/3", "1/2", "2/3"],
        correct: 2,
        explanation: "The sample space is a unit square. P(X+Y > 1) = area of triangle = 1/2"
    },
    {
        question: "You have 3 doors: 1 prize, 2 goats. You pick door 1, host opens door 3 (goat). Should you switch?",
        options: ["Doesn't matter", "Stay - 1/2 chance", "Switch - 2/3 chance", "Stay - 2/3 chance"],
        correct: 2,
        explanation: "Monty Hall: Switching wins 2/3 of the time. Your initial pick was 1/3."
    },
    {
        question: "What's the expected number of coin flips to get heads?",
        options: ["1", "2", "1.5", "∞"],
        correct: 1,
        explanation: "Geometric distribution: E[X] = 1/p = 1/0.5 = 2"
    },
    {
        question: "If X ~ N(0,1), what's P(X > 0)?",
        options: ["0.34", "0.5", "0.68", "0.95"],
        correct: 1,
        explanation: "Standard normal is symmetric around 0, so P(X > 0) = 0.5"
    },
];

const labItems = [
    { id: "trading", label: "Trading Sim", icon: FaChartLine },
    { id: "kelly", label: "Kelly Criterion", icon: FaCalculator },
    { id: "monte", label: "Monte Carlo", icon: FaDice },
    { id: "quiz", label: "Quant Quiz", icon: FaBrain },
];

export default function Lab({ fadeUp }: { fadeUp?: any }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    // Quiz State
    const [quizState, setQuizState] = useState({
        currentQuestion: 0,
        score: 0,
        answered: false,
        selectedAnswer: -1,
        showExplanation: false,
        completed: false,
    });

    // Kelly State
    const [kellyInputs, setKellyInputs] = useState({ prob: 0.55, odds: 2, bankroll: 1000 });

    // Monte Carlo State
    const [monteCarloState, setMonteCarloState] = useState({
        running: false,
        trials: 0,
        successes: 0,
        targetProb: 0.5,
        speed: 50,
    });

    // Trading Game State
    const [tradingState, setTradingState] = useState({
        running: false,
        cash: 10000,
        shares: 0,
        prices: [100] as number[],
        trades: [] as Trade[],
        tick: 0,
    });

    const chartRef = useRef<HTMLCanvasElement>(null);

    // Navigation
    const navigate = (dir: number) => {
        setDirection(dir);
        setActiveIndex((prev) => {
            const next = prev + dir;
            if (next < 0) return labItems.length - 1;
            if (next >= labItems.length) return 0;
            return next;
        });
    };

    const goToItem = (index: number) => {
        setDirection(index > activeIndex ? 1 : -1);
        setActiveIndex(index);
    };

    // Quiz Functions
    const handleQuizAnswer = (answerIndex: number) => {
        if (quizState.answered) return;

        const isCorrect = answerIndex === quizQuestions[quizState.currentQuestion].correct;
        setQuizState((s) => ({
            ...s,
            answered: true,
            selectedAnswer: answerIndex,
            score: isCorrect ? s.score + 1 : s.score,
            showExplanation: true,
        }));
    };

    const nextQuestion = () => {
        if (quizState.currentQuestion >= quizQuestions.length - 1) {
            setQuizState((s) => ({ ...s, completed: true }));
        } else {
            setQuizState((s) => ({
                ...s,
                currentQuestion: s.currentQuestion + 1,
                answered: false,
                selectedAnswer: -1,
                showExplanation: false,
            }));
        }
    };

    const resetQuiz = () => {
        setQuizState({
            currentQuestion: 0,
            score: 0,
            answered: false,
            selectedAnswer: -1,
            showExplanation: false,
            completed: false,
        });
    };

    // Kelly Calculator
    const kellyStats = useMemo(() => {
        const p = Math.min(Math.max(kellyInputs.prob, 0), 1);
        const odds = Math.max(kellyInputs.odds, 1.01);
        const bankroll = Math.max(kellyInputs.bankroll, 0);
        const b = odds - 1;
        const q = 1 - p;
        const rawFraction = (b * p - q) / b;
        const fraction = Number.isFinite(rawFraction) ? Math.min(Math.max(rawFraction, 0), 1) : 0;
        const edge = p * odds - 1;
        const bet = fraction * bankroll;
        return { fraction, edge, bet, bankroll, odds, p };
    }, [kellyInputs]);

    // Trading game calculations
    const currentPrice = tradingState.prices[tradingState.prices.length - 1];
    const portfolioValue = tradingState.cash + tradingState.shares * currentPrice;
    const initialValue = 10000;
    const pnl = portfolioValue - initialValue;
    const pnlPercent = ((pnl / initialValue) * 100).toFixed(2);

    const avgBuyPrice = useMemo(() => {
        const buys = tradingState.trades.filter((t) => t.type === "BUY");
        if (buys.length === 0) return 0;
        const totalCost = buys.reduce((sum, t) => sum + t.price * t.shares, 0);
        const totalShares = buys.reduce((sum, t) => sum + t.shares, 0);
        return totalShares > 0 ? totalCost / totalShares : 0;
    }, [tradingState.trades]);

    const generateNextPrice = useCallback((price: number) => {
        const drift = 0.0001;
        const volatility = 0.015;
        const randomShock = (Math.random() - 0.5) * 2;
        const change = drift + volatility * randomShock;
        return Math.max(1, price * (1 + change));
    }, []);

    const toggleTrading = () => setTradingState((s) => ({ ...s, running: !s.running }));

    const resetTrading = () => {
        setTradingState({
            running: false,
            cash: 10000,
            shares: 0,
            prices: [100],
            trades: [],
            tick: 0,
        });
    };

    const buyShares = (amount: number) => {
        const cost = currentPrice * amount;
        if (tradingState.cash >= cost) {
            setTradingState((s) => ({
                ...s,
                cash: s.cash - cost,
                shares: s.shares + amount,
                trades: [...s.trades, { type: "BUY", price: currentPrice, shares: amount, time: s.tick }],
            }));
        }
    };

    const sellShares = (amount: number) => {
        const toSell = Math.min(amount, tradingState.shares);
        if (toSell > 0) {
            setTradingState((s) => ({
                ...s,
                cash: s.cash + currentPrice * toSell,
                shares: s.shares - toSell,
                trades: [...s.trades, { type: "SELL", price: currentPrice, shares: toSell, time: s.tick }],
            }));
        }
    };

    // Price update effect
    useEffect(() => {
        if (!tradingState.running) return;
        const interval = setInterval(() => {
            setTradingState((s) => {
                const newPrice = generateNextPrice(s.prices[s.prices.length - 1]);
                const newPrices = [...s.prices.slice(-99), newPrice];
                return { ...s, prices: newPrices, tick: s.tick + 1 };
            });
        }, 100);
        return () => clearInterval(interval);
    }, [tradingState.running, generateNextPrice]);

    // Chart rendering
    useEffect(() => {
        const canvas = chartRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const { width, height } = canvas;
        const prices = tradingState.prices;
        const padding = 10;

        ctx.fillStyle = "#0a1224";
        ctx.fillRect(0, 0, width, height);

        if (prices.length < 2) return;

        const min = Math.min(...prices) * 0.995;
        const max = Math.max(...prices) * 1.005;
        const range = max - min || 1;

        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            const y = padding + ((height - 2 * padding) * i) / 4;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, "#38bdf8");
        gradient.addColorStop(1, "#4fd1c5");
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();

        prices.forEach((price, i) => {
            const x = (i / (prices.length - 1)) * (width - 2 * padding) + padding;
            const y = height - padding - ((price - min) / range) * (height - 2 * padding);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });

        ctx.stroke();

        const lastX = width - padding;
        const lastY = height - padding - ((prices[prices.length - 1] - min) / range) * (height - 2 * padding);
        ctx.beginPath();
        ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#4fd1c5";
        ctx.fill();
    }, [tradingState.prices]);

    // Monte Carlo
    const runMonteCarlo = () => {
        if (monteCarloState.running) {
            setMonteCarloState((s) => ({ ...s, running: false }));
            return;
        }
        setMonteCarloState((s) => ({ ...s, running: true, trials: 0, successes: 0 }));
    };

    const resetMonteCarlo = () => {
        setMonteCarloState((s) => ({ ...s, running: false, trials: 0, successes: 0 }));
    };

    useEffect(() => {
        if (!monteCarloState.running) return;
        const interval = setInterval(() => {
            setMonteCarloState((s) => {
                if (s.trials >= 1000) return { ...s, running: false };
                const success = Math.random() < s.targetProb;
                return { ...s, trials: s.trials + 1, successes: s.successes + (success ? 1 : 0) };
            });
        }, monteCarloState.speed);
        return () => clearInterval(interval);
    }, [monteCarloState.running, monteCarloState.speed]);

    const monteCarloPercent = monteCarloState.trials > 0
        ? ((monteCarloState.successes / monteCarloState.trials) * 100).toFixed(1)
        : "0.0";

    // Slide animation variants
    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 300 : -300,
            opacity: 0,
        }),
    };

    const currentQ = quizQuestions[quizState.currentQuestion];

    return (
        <motion.section id="lab" className="section" {...fadeUp}>
            <div className="section__header">
                <h2 className="section__title">Interactive Lab</h2>
                <span className="section__hint">Explore quantitative tools & games</span>
            </div>

            {/* Gallery Navigation */}
            <div className="lab-gallery">
                <div className="lab-gallery__nav">
                    {labItems.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                className={`lab-gallery__tab ${activeIndex === idx ? "active" : ""}`}
                                onClick={() => goToItem(idx)}
                            >
                                <Icon />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="lab-gallery__container">
                    <button className="lab-gallery__arrow left" onClick={() => navigate(-1)}>
                        <FaChevronLeft />
                    </button>

                    <div className="lab-gallery__content">
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={activeIndex}
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                className="lab-gallery__slide"
                            >
                                {/* Trading Simulator */}
                                {activeIndex === 0 && (
                                    <div className="card lab-card">
                                        <div className="trading-header">
                                            <h3>📈 Trading Simulator</h3>
                                            <p className="muted">Buy low, sell high. Beat the market!</p>
                                        </div>
                                        <div className="trading-body">
                                            <div className="trading-chart">
                                                <canvas ref={chartRef} width={320} height={120} />
                                                <div className="trading-price">
                                                    <span className="trading-price__label">QNTY</span>
                                                    <span className="trading-price__value">${currentPrice.toFixed(2)}</span>
                                                </div>
                                            </div>
                                            <div className="trading-stats">
                                                <div className="trading-stat"><span>Cash</span><span>${tradingState.cash.toFixed(2)}</span></div>
                                                <div className="trading-stat"><span>Shares</span><span>{tradingState.shares}</span></div>
                                                <div className="trading-stat"><span>Portfolio</span><span>${portfolioValue.toFixed(2)}</span></div>
                                                <div className={`trading-stat pnl ${pnl >= 0 ? "positive" : "negative"}`}>
                                                    <span>P&L</span><span>{pnl >= 0 ? "+" : ""}{pnlPercent}%</span>
                                                </div>
                                            </div>
                                            <div className="trading-actions">
                                                <button className="btn buy" onClick={() => buyShares(10)} disabled={tradingState.cash < currentPrice * 10}>Buy 10</button>
                                                <button className="btn sell" onClick={() => sellShares(10)} disabled={tradingState.shares < 10}>Sell 10</button>
                                            </div>
                                            <div className="trading-controls">
                                                <button className="btn" onClick={toggleTrading}>{tradingState.running ? "⏸ Pause" : "▶ Start"}</button>
                                                <button className="btn secondary" onClick={resetTrading}>Reset</button>
                                            </div>
                                            {avgBuyPrice > 0 && (
                                                <p className="muted" style={{ fontSize: "12px", marginTop: "8px", textAlign: "center" }}>
                                                    Avg. buy: ${avgBuyPrice.toFixed(2)} | Trades: {tradingState.trades.length}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Kelly Criterion */}
                                {activeIndex === 1 && (
                                    <div className="card lab-card">
                                        <div className="section__header" style={{ marginBottom: 8 }}>
                                            <h3 className="section__title">🎯 Kelly Criterion Calculator</h3>
                                            <span className="section__hint">f* = (bp - q) / b</span>
                                        </div>
                                        <p className="muted" style={{ fontSize: "13px", marginBottom: "16px" }}>
                                            The Kelly Criterion determines the optimal bet size to maximize long-term growth.
                                        </p>
                                        <div className="kelly-form">
                                            <label className="field">
                                                <span>Win Probability (p)</span>
                                                <input type="number" step="0.01" min="0" max="1" value={kellyInputs.prob}
                                                    onChange={(e) => setKellyInputs((s) => ({ ...s, prob: parseFloat(e.target.value) || 0 }))} />
                                            </label>
                                            <label className="field">
                                                <span>Decimal Odds (e.g., 2.0 = even money)</span>
                                                <input type="number" step="0.1" min="1.01" value={kellyInputs.odds}
                                                    onChange={(e) => setKellyInputs((s) => ({ ...s, odds: parseFloat(e.target.value) || 1.01 }))} />
                                            </label>
                                            <label className="field">
                                                <span>Bankroll ($)</span>
                                                <input type="number" step="100" min="0" value={kellyInputs.bankroll}
                                                    onChange={(e) => setKellyInputs((s) => ({ ...s, bankroll: parseFloat(e.target.value) || 0 }))} />
                                            </label>
                                        </div>
                                        <div className="kelly-stats">
                                            <div className="kelly-stat-row">
                                                <span>Kelly Fraction (f*)</span>
                                                <span>{(kellyStats.fraction * 100).toFixed(1)}%</span>
                                            </div>
                                            <div className={`kelly-stat-row ${kellyStats.edge < 0 ? "negative" : kellyStats.edge > 0 ? "positive" : ""}`}>
                                                <span>Edge (EV)</span>
                                                <span style={{ color: kellyStats.edge < 0 ? "#ef4444" : kellyStats.edge > 0 ? "#22c55e" : "inherit" }}>
                                                    {kellyStats.edge >= 0 ? "+" : ""}{(kellyStats.edge * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="kelly-stat-row">
                                                <span>Optimal Bet</span>
                                                <span>${kellyStats.bet.toFixed(2)}</span>
                                            </div>
                                        </div>
                                        {kellyStats.edge < 0 && (
                                            <div className="kelly-warning" style={{
                                                marginTop: "12px",
                                                padding: "12px",
                                                background: "rgba(239, 68, 68, 0.1)",
                                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                                borderRadius: "8px",
                                                fontSize: "13px",
                                                color: "#ef4444"
                                            }}>
                                                ⚠️ Negative edge! Don't bet — the odds are against you.
                                            </div>
                                        )}
                                        {kellyStats.fraction > 0 && kellyStats.edge > 0 && (
                                            <p className="muted" style={{ fontSize: "12px", marginTop: "12px", textAlign: "center" }}>
                                                Bet {(kellyStats.fraction * 100).toFixed(1)}% of ${kellyInputs.bankroll} = ${kellyStats.bet.toFixed(2)}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Monte Carlo */}
                                {activeIndex === 2 && (
                                    <div className="card lab-card">
                                        <div className="monte-header">
                                            <h3>Monte Carlo Simulator</h3>
                                            <p className="muted">Run 1,000 trials to estimate probability convergence.</p>
                                        </div>
                                        <div className="monte-controls">
                                            <label className="field">
                                                <span>Target Probability</span>
                                                <input type="number" step="0.05" min="0" max="1" value={monteCarloState.targetProb}
                                                    onChange={(e) => setMonteCarloState((s) => ({ ...s, targetProb: parseFloat(e.target.value) || 0.5 }))} />
                                            </label>
                                            <div style={{ display: "flex", gap: 12 }}>
                                                <button className="btn" onClick={runMonteCarlo}>{monteCarloState.running ? "Pause" : "Run"}</button>
                                                <button className="btn secondary" onClick={resetMonteCarlo}>Reset</button>
                                            </div>
                                        </div>
                                        <div className="monte-results">
                                            <div className="kelly-stat-row"><span>Trials</span><span>{monteCarloState.trials} / 1000</span></div>
                                            <div className="kelly-stat-row"><span>Successes</span><span>{monteCarloState.successes}</span></div>
                                            <div className="kelly-stat-row"><span>Observed Rate</span><span>{monteCarloPercent}%</span></div>
                                            <div className="monte-bar">
                                                <div className="monte-bar-fill" style={{ width: `${(monteCarloState.trials / 1000) * 100}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Quant Quiz */}
                                {activeIndex === 3 && (
                                    <div className="card lab-card quiz-card">
                                        <div className="quiz-header">
                                            <h3>🧠 Quant Interview Quiz</h3>
                                            <p className="muted">Test your probability & statistics knowledge</p>
                                        </div>

                                        {!quizState.completed ? (
                                            <div className="quiz-body">
                                                <div className="quiz-progress">
                                                    <span>Question {quizState.currentQuestion + 1} of {quizQuestions.length}</span>
                                                    <span>Score: {quizState.score}/{quizState.currentQuestion + (quizState.answered ? 1 : 0)}</span>
                                                </div>

                                                <div className="quiz-question">
                                                    <p>{currentQ.question}</p>
                                                </div>

                                                <div className="quiz-options">
                                                    {currentQ.options.map((option, idx) => {
                                                        let className = "quiz-option";
                                                        if (quizState.answered) {
                                                            if (idx === currentQ.correct) className += " correct";
                                                            else if (idx === quizState.selectedAnswer) className += " wrong";
                                                        }
                                                        return (
                                                            <button
                                                                key={idx}
                                                                className={className}
                                                                onClick={() => handleQuizAnswer(idx)}
                                                                disabled={quizState.answered}
                                                            >
                                                                {option}
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                {quizState.showExplanation && (
                                                    <motion.div
                                                        className="quiz-explanation"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                    >
                                                        <p><strong>Explanation:</strong> {currentQ.explanation}</p>
                                                        <button className="btn" onClick={nextQuestion}>
                                                            {quizState.currentQuestion >= quizQuestions.length - 1 ? "See Results" : "Next Question"}
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="quiz-results">
                                                <div className="quiz-score">
                                                    <span className="quiz-score__value">{quizState.score}/{quizQuestions.length}</span>
                                                    <span className="quiz-score__label">
                                                        {quizState.score >= 7 ? "🎉 Excellent!" :
                                                            quizState.score >= 5 ? "👍 Good job!" :
                                                                quizState.score >= 3 ? "📚 Keep studying!" : "💪 Practice more!"}
                                                    </span>
                                                </div>
                                                <p className="muted">
                                                    {Math.round((quizState.score / quizQuestions.length) * 100)}% correct
                                                </p>
                                                <button className="btn" onClick={resetQuiz}>Try Again</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <button className="lab-gallery__arrow right" onClick={() => navigate(1)}>
                        <FaChevronRight />
                    </button>
                </div>

                {/* Dots indicator */}
                <div className="lab-gallery__dots">
                    {labItems.map((_, idx) => (
                        <button
                            key={idx}
                            className={`lab-gallery__dot ${activeIndex === idx ? "active" : ""}`}
                            onClick={() => goToItem(idx)}
                        />
                    ))}
                </div>
            </div>
        </motion.section>
    );
}
