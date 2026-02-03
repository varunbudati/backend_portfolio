"use client";

import { motion } from "framer-motion";
import { FaFlask, FaImages, FaBriefcase, FaCode, FaUser, FaHome } from "react-icons/fa";

type NavItem = {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
    { id: "hero", label: "Home", icon: FaHome },
    { id: "about", label: "About", icon: FaUser },
    { id: "projects", label: "Projects", icon: FaCode },
    { id: "experience", label: "Work", icon: FaBriefcase },
    { id: "gallery", label: "Gallery", icon: FaImages },
    { id: "lab", label: "Lab", icon: FaFlask },
];

type FloatingDockProps = {
    activeSection: string;
    onNavClick: (id: string) => void;
};

export default function FloatingDock({ activeSection, onNavClick }: FloatingDockProps) {
    return (
        <motion.nav
            className="floating-dock"
            initial={{ y: 100, opacity: 0, x: "-50%" }}
            animate={{ y: 0, opacity: 1, x: "-50%" }}
            transition={{ delay: 0.5, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            aria-label="Quick navigation"
        >
            <div className="floating-dock__inner">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;

                    return (
                        <button
                            key={item.id}
                            className={`floating-dock__item ${isActive ? "active" : ""}`}
                            onClick={() => onNavClick(item.id)}
                            aria-label={item.label}
                            aria-current={isActive ? "true" : undefined}
                            title={item.label}
                        >
                            <Icon className="floating-dock__icon" />
                            <span className="floating-dock__label">{item.label}</span>
                            {isActive && (
                                <motion.div
                                    className="floating-dock__indicator"
                                    layoutId="dock-indicator"
                                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </motion.nav>
    );
}
