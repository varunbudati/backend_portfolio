"use client";

import { useEffect, useRef } from "react";

export default function SpotlightCards() {
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleMouseMove = (e: MouseEvent) => {
            const cards = container.querySelectorAll<HTMLElement>(".card");

            cards.forEach((card) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                card.style.setProperty("--spotlight-x", `${x}px`);
                card.style.setProperty("--spotlight-y", `${y}px`);
            });
        };

        container.addEventListener("mousemove", handleMouseMove);
        return () => container.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return <div ref={containerRef} className="spotlight-container" />;
}

// Hook version for use in components
export function useSpotlight() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            element.style.setProperty("--spotlight-x", `${x}px`);
            element.style.setProperty("--spotlight-y", `${y}px`);
        };

        element.addEventListener("mousemove", handleMouseMove);
        return () => element.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return ref;
}
