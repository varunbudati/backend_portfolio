"use client";

import { useEffect, useState } from "react";
import About from "../components/About";
import BackToTop from "../components/BackToTop";
import Experience from "../components/Experience";
import FloatingDock from "../components/FloatingDock";
import Footer from "../components/Footer";
import Gallery from "../components/Gallery";
import Hero from "../components/Hero";
import Lab from "../components/Lab";
import MarketTicker from "../components/MarketTicker";
import Projects from "../components/Projects";
import ScrollProgress from "../components/ScrollProgress";

const motionEase = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0, transition: { duration: 0.4, ease: motionEase } },
  viewport: { once: true, amount: 0.2 },
};

const sectionIds = ["hero", "about", "projects", "experience", "gallery", "lab"];

export default function Home() {



  const [activeSection, setActiveSection] = useState("hero");















  const handleNavClick = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    setActiveSection(id);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: 0.25 }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Spotlight effect for cards
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll<HTMLElement>(".card");
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--spotlight-x", `${x}px`);
        card.style.setProperty("--spotlight-y", `${y}px`);
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="page">
      <ScrollProgress />
      <BackToTop />
      <FloatingDock activeSection={activeSection} onNavClick={handleNavClick} />

      <main className="shell">
        <Hero />

        <MarketTicker fadeUp={fadeUp} />

        <About fadeUp={fadeUp} />

        <Projects fadeUp={fadeUp} />

        <Experience fadeUp={fadeUp} />

        <Gallery fadeUp={fadeUp} />

        <Lab fadeUp={fadeUp} />

        <Footer />
      </main>
    </div>
  );
}
