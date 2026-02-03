"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FaEnvelope, FaGithub, FaLinkedin, FaMapMarkerAlt } from "react-icons/fa";

const contactLinks = [
    {
        icon: FaEnvelope,
        label: "Email",
        value: "varunsb@vt.edu",
        href: "mailto:varunsb@vt.edu",
        color: "#EA4335",
    },
    {
        icon: FaLinkedin,
        label: "LinkedIn",
        value: "in/varun-budati",
        href: "https://linkedin.com/in/varun-budati",
        color: "#0A66C2",
    },
    {
        icon: FaGithub,
        label: "GitHub",
        value: "varunbudati",
        href: "https://github.com/varunbudati",
        color: "#24292E",
    },
    {
        icon: FaMapMarkerAlt,
        label: "Blacksburg, VA",
        value: "Virginia Tech",
        href: "#",
        color: "#FF6B35",
    },
];

const motionEase = [0.16, 1, 0.3, 1] as const;

export default function Hero() {
    const [contactOpen, setContactOpen] = useState(false);
    const [emailRevealed, setEmailRevealed] = useState(false);
    const [emailCopied, setEmailCopied] = useState(false);

    const handleEmailClick = () => {
        setEmailRevealed(true);
        setTimeout(() => {
            window.location.href = "mailto:varunsbudati@gmail.com?subject=Hello%20Varun";
        }, 50);
    };

    const handleCopyEmail = async () => {
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText("varunsbudati@gmail.com");
            } else {
                const textarea = document.createElement("textarea");
                textarea.value = "varunsbudati@gmail.com";
                textarea.style.position = "fixed";
                textarea.style.opacity = "0";
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
            }
            setEmailCopied(true);
            setTimeout(() => setEmailCopied(false), 1500);
        } catch (err) {
            console.error("Failed to copy email", err);
        }
    };

    return (
        <>
            <motion.section
                id="hero"
                className="hero"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease: motionEase } }}
            >
                <div>
                    <span className="eyebrow">Quant • CS • Research</span>
                    <h1>Varun Budati</h1>
                    <p>
                        I like the idea of building things that blend computer science, math, and finance.
                    </p>
                    <div className="hero__actions">
                        <a className="btn" href="/images/Varun_Budati_Resume.pdf" target="_blank" rel="noreferrer">
                            View Resume
                        </a>
                        <button className="btn secondary" type="button" onClick={() => setContactOpen(true)}>
                            Contact
                        </button>
                        <Link className="btn secondary" href="/v1">
                            View Legacy v1
                        </Link>
                    </div>
                    <div className="contact-icons" style={{ marginTop: 24 }}>
                        {contactLinks.map((contact) => {
                            const Icon = contact.icon;
                            return (
                                <a
                                    key={contact.label}
                                    href={contact.href}
                                    target={contact.href.startsWith("http") ? "_blank" : undefined}
                                    rel={contact.href.startsWith("http") ? "noreferrer" : undefined}
                                    className="contact-icon-link"
                                    aria-label={contact.label}
                                    title={`${contact.label}: ${contact.value}`}
                                    style={{ "--icon-color": contact.color } as React.CSSProperties}
                                >
                                    <Icon className="contact-icon" />
                                    <span className="contact-label">{contact.label}</span>
                                </a>
                            );
                        })}
                    </div>
                </div>
                <div className="hero__media">
                    <div className="avatar">
                        <Image src="/images/varun-budati.jpeg" alt="Varun Budati" width={640} height={640} priority />
                    </div>
                </div>
            </motion.section>

            {contactOpen && (
                <div className="modal" role="dialog" aria-modal="true" aria-label="Contact options">
                    <div className="modal__content">
                        <div className="modal__header">
                            <h3>Contact</h3>
                            <button className="btn secondary" onClick={() => setContactOpen(false)}>
                                Close
                            </button>
                        </div>
                        <div className="modal__body" style={{ display: "grid", gap: 12 }}>
                            <p className="muted">Shoot me an email and let's connect. I'm based in Blacksburg, Virginia.</p>
                            <div className="contact-actions" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                                <button className="btn" type="button" onClick={handleEmailClick}>
                                    Email Me
                                </button>
                                <a className="btn secondary" href="https://www.linkedin.com/in/varun-budati/" target="_blank" rel="noreferrer">
                                    LinkedIn
                                </a>
                            </div>
                            {emailRevealed ? (
                                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                                    <div className="pill" style={{ width: "fit-content" }}>
                                        varunsbudati@gmail.com
                                    </div>
                                    <button className="btn secondary" type="button" onClick={handleCopyEmail}>
                                        Copy email
                                    </button>
                                    {emailCopied ? <span className="muted">Copied!</span> : null}
                                </div>
                            ) : null}
                            <div className="map-embed" style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--stroke)" }}>
                                <iframe
                                    title="Blacksburg, Virginia"
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d50530.56008316302!2d-80.47057884765625!3d37.2303119461009!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x884d956f3c741d8d%3A0xd827fc3c8e5fb50!2sBlacksburg%2C%20VA!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    style={{ width: "100%", height: 280, border: 0 }}
                                />
                            </div>
                        </div>
                        <div className="modal__footer">
                            <button className="btn secondary" onClick={() => setContactOpen(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
