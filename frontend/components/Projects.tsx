"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

type Project = {
    title: string;
    description: string;
    image: string;
    tags: string[];
    href: string;
    showcase?: boolean;
    embedUrl?: string;
};

const projects: Project[] = [
    {
        title: "ShadeFinder (Urban Shadow Mapper)",
        description:
            "Streamlit geospatial app that projects building shadows in real time, blending solar physics, OSM data, and live climate feeds to surface cooler walking corridors in Kuwait.",
        image: "/images/ShadeFinder.png",
        tags: ["Python", "Streamlit", "Geospatial", "Mapbox"],
        href: "https://github.com/varunbudati/ShadeFinder",
        showcase: true,
        embedUrl: "/shadefinder",
    },
    {
        title: "Sports Betting Algorithm & Analytics",
        description:
            "Analytics system to surface profitable betting opportunities with statistical edges and ML models.",
        image: "/images/sports_betting.gif",
        tags: ["Python", "Data Analysis", "Streamlit"],
        href: "https://www.linkedin.com/in/varun-budati/details/projects/",
    },
    {
        title: "Optimal Trading Execution (RL + Almgren-Chriss)",
        description:
            "Implements Almgren-Chriss with a reinforcement learning agent to minimize market impact.",
        image: "/images/Almgren_Chriss_Model.gif",
        tags: ["Python", "Reinforcement Learning", "Quant"],
        href: "https://github.com/varunbudati/Almgren-Chriss-model",
    },
    {
        title: "MACD Strategy Visualizer",
        description:
            "Interactive MACD visualizer and backtester for exploring technical strategy performance.",
        image: "/images/MACD.gif",
        tags: ["Python", "Streamlit", "Technical Analysis"],
        href: "https://github.com/varunbudati/MACD-Trading-Strategy-Visualizer",
    },
    {
        title: "Video Poker",
        description:
            "Classic video poker with a clean interface, probability focus, and quick iteration loops.",
        image: "/images/VideoPoker.gif",
        tags: ["Python", "Pygame", "Game"],
        href: "https://github.com/varunbudati/Video-Poker",
    },
    {
        title: "Black-Scholes (BSM) Options Explorer",
        description: "Black-Scholes option pricing explorer with interactive inputs and deltas",
        image: "/images/BSM_options.gif",
        tags: ["Python", "Quant", "Streamlit"],
        href: "https://github.com/varunbudati/Black-Sholes-Model",
    },
];

const motionEase = [0.16, 1, 0.3, 1] as const;

export default function Projects({ fadeUp }: { fadeUp?: any }) {
    const [showcaseOpen, setShowcaseOpen] = useState(false);
    const [showcaseUrl, setShowcaseUrl] = useState("");

    return (
        <>
            <motion.section id="projects" className="section" {...fadeUp}>
                <div className="section__header">
                    <h2 className="section__title">Projects</h2>
                    <span className="section__hint">Interactive, data-driven builds</span>
                </div>
                <div className="card-grid">
                    {projects.map((project) => (
                        <motion.article
                            key={project.title}
                            className="card project-card"
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: motionEase } }}
                            viewport={{ once: true, amount: 0.2 }}
                        >
                            {project.showcase ? (
                                <div style={{ cursor: "pointer", display: "flex", flexDirection: "column", height: "100%" }}>
                                    <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", marginBottom: "12px" }}>
                                        <Image
                                            src={project.image}
                                            alt={project.title}
                                            fill
                                            style={{ borderRadius: "14px", border: "1px solid var(--stroke)", objectFit: "cover" }}
                                        />
                                    </div>
                                    <h3>{project.title}</h3>
                                    <p style={{ flexGrow: 1 }}>{project.description}</p>
                                    <div className="tags">
                                        {project.tags.map((tag) => (
                                            <span key={tag} className="tag">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                                        <button
                                            className="btn"
                                            type="button"
                                            onClick={() => {
                                                setShowcaseUrl(project.embedUrl || project.href);
                                                setShowcaseOpen(true);
                                            }}
                                        >
                                            Open Live
                                        </button>
                                        <a href={project.href} target="_blank" rel="noreferrer" className="btn secondary">
                                            GitHub
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <a
                                    href={project.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="project-card-link"
                                    style={{ display: "flex", flexDirection: "column", height: "100%" }}
                                >
                                    <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", marginBottom: "12px" }}>
                                        <Image
                                            src={project.image}
                                            alt={project.title}
                                            fill
                                            style={{ borderRadius: "14px", border: "1px solid var(--stroke)", objectFit: "cover" }}
                                        />
                                    </div>
                                    <h3>{project.title}</h3>
                                    <p style={{ flexGrow: 1 }}>{project.description}</p>
                                    <div className="tags">
                                        {project.tags.map((tag) => (
                                            <span key={tag} className="tag">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="link-row">
                                        <span>View project</span>
                                        <span aria-hidden>↗</span>
                                    </div>
                                </a>
                            )}
                        </motion.article>
                    ))}
                </div>
            </motion.section>

            {showcaseOpen && showcaseUrl && (
                <div className="modal" role="dialog" aria-modal="true" aria-label="Project showcase">
                    <div className="modal__content" style={{ maxWidth: "95vw", maxHeight: "95vh", padding: 0 }}>
                        <div className="modal__header">
                            <h3>Live Demo</h3>
                            <button className="btn secondary" onClick={() => setShowcaseOpen(false)}>
                                Close
                            </button>
                        </div>
                        <div style={{ width: "100%", height: "calc(95vh - 140px)", borderTop: "1px solid var(--stroke)" }}>
                            <iframe
                                title="Project Demo"
                                src={showcaseUrl}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    border: "none",
                                    borderRadius: "0 0 14px 14px",
                                }}
                                allow="microphone; camera; geolocation"
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
