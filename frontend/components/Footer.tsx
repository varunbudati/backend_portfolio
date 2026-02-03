"use client";

import { FaEnvelope, FaGithub, FaLinkedin } from "react-icons/fa";
import { SiNextdotjs, SiFramer } from "react-icons/si";

const socialLinks = [
    {
        icon: FaEnvelope,
        href: "mailto:varunsbudati@gmail.com",
        label: "Email",
    },
    {
        icon: FaLinkedin,
        href: "https://linkedin.com/in/varun-budati",
        label: "LinkedIn",
    },
    {
        icon: FaGithub,
        href: "https://github.com/varunbudati",
        label: "GitHub",
    },
];

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer__icons">
                {socialLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                        <a
                            key={link.label}
                            href={link.href}
                            target={link.href.startsWith("http") ? "_blank" : undefined}
                            rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                            className="footer__icon"
                            aria-label={link.label}
                            title={link.label}
                        >
                            <Icon />
                        </a>
                    );
                })}
            </div>
            <p className="footer__text" suppressHydrationWarning>
                © 2025 Varun Budati. All rights reserved.
            </p>
            <div className="footer__badge">
                <span>Built with</span>
                <SiNextdotjs />
                <span>&</span>
                <SiFramer />
            </div>
        </footer>
    );
}
