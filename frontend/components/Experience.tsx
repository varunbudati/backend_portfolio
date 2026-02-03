"use client";

import { motion } from "framer-motion";

export default function Experience({ fadeUp }: { fadeUp?: any }) {
    return (
        <motion.section id="experience" className="section" {...fadeUp}>
            <div className="section__header">
                <h2 className="section__title">Experience</h2>
                <span className="section__hint">Research, quant finance, and leadership across institutions</span>
            </div>
            <div className="card-grid">
                <div className="card timeline-card">
                    <div className="timeline-row">
                        <div>
                            <h3>Treasurer & Market Research Analyst — FinTech Club</h3>
                            <p className="muted">Aug 2024 — Present</p>
                            <p className="muted" style={{ fontSize: "0.9rem", marginTop: 4 }}>
                                Promoted to Treasurer (Jun 2025)
                            </p>
                        </div>
                        <ul className="bullet-list">
                            <li>
                                Manage the club's budget and all financial operations to fund initiatives and workshops for a community of 100+ members.
                            </li>
                            <li>
                                Organize and host speaker events with industry professionals from leading finance and technology firms to create
                                career development and networking opportunities.
                            </li>
                            <li>
                                Led a project under Dr. Daniel Rodriguez replicating Evans &amp; Archer (1968) via Python simulation, analyzing portfolio
                                diversification and risk reduction.
                            </li>
                            <li>
                                Utilized Pandas, NumPy, and SciPy on historical stock data to model risk (std dev log returns) vs. portfolio size,
                                quantifying diversification benefits.
                            </li>
                            <li>
                                Demonstrated and presented findings confirming that most unsystematic risk is mitigated with 10-20 assets, aligning
                                with the foundational study.
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="card timeline-card">
                    <div className="timeline-row">
                        <div>
                            <h3>Quantitative Researcher</h3>
                            <p className="muted">Dataism Laboratory for Quantitative Finance (DLQF) · Oct 2024 — Present</p>
                        </div>
                        <ul className="bullet-list">
                            <li>
                                Researching optimal order execution by analyzing the market microstructure of Bitcoin trade data to develop and
                                implement advanced trading strategies.
                            </li>
                            <li>
                                Constructed benchmark execution algorithms in Python, including VWAP and TWAP, to analyze the market impact and
                                transaction costs of trading Bitcoin.
                            </li>
                            <li>
                                Engineered a reinforcement learning and neural network architecture (PPO, DDQN) to create an adaptive agent that
                                optimizes trade execution strategies in real-time.
                            </li>
                            <li>
                                Modeling quantitative performance using statistical methods and Python (NumPy, Pandas, SciPy) to analyze trade
                                execution efficiency and market dynamics.
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="card timeline-card">
                    <div className="timeline-row">
                        <div>
                            <h3>Summer Researcher, Virginia Tech MAOP Program</h3>
                            <p className="muted">May 2025 — Jul 2025</p>
                        </div>
                        <ul className="bullet-list">
                            <li>
                                Conducted a mixed-methods research study on pedagogical patterns in introductory Computer Science (CS1) to identify
                                opportunities for improving student retention and engagement.
                            </li>
                            <li>
                                Analyzed a corpus of examples from CS1 textbooks of top-tier universities (MIT, UC Berkeley, CalTech) to understand
                                current teaching paradigms.
                            </li>
                            <li>
                                Developed a quantitative framework with eight distinct categories through an open coding process to classify the
                                thematic focus of programming examples.
                            </li>
                            <li>
                                Utilized computational text analysis software (LIWC-22) and large language models to quantitatively assess the
                                linguistic and contextual nature of course materials.
                            </li>
                            <li>
                                Synthesized findings to reveal a high prevalence (57%) of abstract mathematical examples, providing data-driven
                                recommendations for incorporating more culturally relevant and real-world applications in curricula.
                            </li>
                            <li>
                                Co-authored and designed a formal research poster, effectively communicating the project's methodology, results, and
                                implications to an academic audience.
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="card timeline-card">
                    <div className="timeline-row">
                        <div>
                            <h3>Research Mentor — REACH Lab</h3>
                            <p className="muted">Jan 2025 — Jun 2025</p>
                        </div>
                        <ul className="bullet-list">
                            <li>
                                Guided undergraduate researchers within the Reimagining Equity and Accessibility in Computing for Humanity (REACH)
                                Lab at Virginia Tech.
                            </li>
                            <li>
                                Mentored peers on literature review best practices, database search strategies, and synthesizing findings for
                                equitable computing research.
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="card timeline-card">
                    <div className="timeline-row">
                        <div>
                            <h3>Undergraduate Research Assistant — REACH Lab</h3>
                            <p className="muted">Mar 2024 — Jun 2025 · Blacksburg, Virginia · Hybrid</p>
                        </div>
                        <ul className="bullet-list">
                            <li>
                                Conducted an extensive literature review under the leadership of Dr. Ihudiya Finda Williams on Rural Computer Science
                                Education.
                            </li>
                            <li>Synthesized over 80 articles to support a $500,000 National Science Foundation grant proposal.</li>
                            <li>Trained six research assistants on database search methodologies, prompt design for scholarly queries, and rigorous literature review techniques.</li>
                        </ul>
                    </div>
                </div>

                <div className="card timeline-card">
                    <div className="timeline-row">
                        <div>
                            <h3>IMC Trading Competition — Top 15 US (0.005%)</h3>
                            <p className="muted">Apr 2025</p>
                        </div>
                        <ul className="bullet-list">
                            <li>
                                Placed 15th in the US out of 12,600 teams in IMC's Prosperity 3 trading competition, designing strategies for multi-asset
                                markets.
                            </li>
                            <li>
                                Optimized trade execution under latency constraints by engineering fair value estimators (VWAP, EMA, stochastic modeling)
                                and implementing dynamic bid shading.
                            </li>
                            <li>
                                Designed signal-driven market-making strategies by analyzing mean-reversion patterns and synthetic mispricing via exploratory
                                data analysis (rolling z-scores, spread compression, correlation clustering).
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </motion.section>
    );
}
