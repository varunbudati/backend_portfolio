"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const aboutContent = {
    intro:
        "I study Computer Science at Virginia Tech, with minors in Math and Finance. Originally from Kuwait, I'm interested in using algorithms to solve real-world problems. My goal is to build systems that rely on quantitative data while remaining easy for people to use.",
    sections: [
        {
            title: "Technical & Quantitative Work",
            intro:
                "I enjoy using math and data to make better decisions. This interest led me to Quantitative Finance and Operations Research.",
            items: [
                {
                    label: "Quant Research",
                    text: "I've worked on projects involving Order Execution and Optimization. I'm also building a Python library for non-linearity testing.",
                },
            ],
        },
        {
            title: "HCI & Research",
            intro:
                "Research has been a big part of my college experience. I started as a mentee and now mentor other students.",
            items: [
                {
                    label: "Education Research",
                    text: "At the REACH Lab, I worked on an NSF-funded review of rural CS education. During my MAOP internship, I used LLMs to analyze CS curricula from schools like MIT and Berkeley.",
                },
                {
                    label: "Presentations",
                    text: "I researched how to make CS education more relevant to different cultures. I'll be presenting a poster on this work at SIGCSE 2026.",
                },
            ],
        },
    ],
    future:
        "I plan to pursue a Ph.D. combining quantitative modeling and human-machine interaction. I want to make complex technology more transparent and useful for everyone.",
};

const motionEase = [0.16, 1, 0.3, 1] as const;

export default function About({ fadeUp }: { fadeUp?: any }) {
    const [typedText, setTypedText] = useState("");
    const [isTypingComplete, setIsTypingComplete] = useState(false);

    useEffect(() => {
        if (isTypingComplete) return;

        const fullText = aboutContent.intro;
        let currentIndex = 0;

        const typingInterval = setInterval(() => {
            if (currentIndex <= fullText.length) {
                setTypedText(fullText.slice(0, currentIndex));
                currentIndex++;
            } else {
                setIsTypingComplete(true);
                clearInterval(typingInterval);
            }
        }, 20);

        return () => clearInterval(typingInterval);
    }, [isTypingComplete]);

    return (
        <motion.section id="about" className="section" {...fadeUp}>
            <div className="section__header">
                <h2 className="section__title">About</h2>
                <span className="section__hint">The intersection of algorithms and humanity</span>
            </div>
            <div className="card about-card">
                <div className="about-intro">
                    <p className="typing-text">
                        {typedText}
                        {!isTypingComplete && <span className="cursor-blink">|</span>}
                    </p>
                </div>

                <div className="divider" style={{ margin: "12px 0" }} />

                {aboutContent.sections.map((section, idx) => (
                    <motion.div
                        key={section.title}
                        className="about-section"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: idx * 0.1, ease: motionEase }}
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        <h3 className="about-section__title">{section.title}</h3>
                        <p className="muted" style={{ marginBottom: 16 }}>
                            {section.intro}
                        </p>
                        <div className="about-items">
                            {section.items.map((item) => (
                                <motion.div
                                    key={item.label}
                                    className="about-item"
                                    whileHover={{
                                        scale: 1.02,
                                        backgroundColor: "rgba(56, 189, 248, 0.08)",
                                        transition: { duration: 0.2 },
                                    }}
                                >
                                    <div className="about-item__label">{item.label}</div>
                                    <p className="about-item__text muted">{item.text}</p>
                                </motion.div>
                            ))}
                        </div>
                        {idx < aboutContent.sections.length - 1 && <div className="divider" style={{ margin: "12px 0" }} />}
                    </motion.div>
                ))}

                <div className="divider" style={{ margin: "12px 0" }} />

                <motion.div
                    className="about-future"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6, ease: motionEase }}
                    viewport={{ once: true, amount: 0.5 }}
                >
                    <h3 className="about-section__title">Future Horizons</h3>
                    <p className="muted">{aboutContent.future}</p>
                </motion.div>
            </div>
        </motion.section>
    );
}
