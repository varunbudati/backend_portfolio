"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function LegacyView() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="page" style={{ minHeight: "100vh", background: "#0a0d1a" }}>
      <main className="shell" style={{ paddingTop: 28, maxWidth: "1200px" }}>
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="section__header" style={{ alignItems: "center" }}>
            <h1 className="section__title">Legacy Portfolio (v1)</h1>
            <div className="section__hint">Static HTML snapshot from the original site</div>
          </div>
          <div className="contact-actions" style={{ marginTop: 10 }}>
            <Link className="btn secondary" href="/">
              ← Back to v2 (Next.js)
            </Link>
            <a className="btn secondary" href="/legacy/index.html" target="_blank" rel="noreferrer">
              Open v1 in new tab
            </a>
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {!loaded && (
            <div style={{ padding: "14px", color: "#9fb0c6" }}>Loading legacy site…</div>
          )}
          <iframe
            title="Legacy portfolio v1"
            src="/legacy/index.html"
            style={{ width: "100%", minHeight: "80vh", border: "0", background: "#0a0d1a" }}
            onLoad={() => setLoaded(true)}
          />
        </div>
      </main>
    </div>
  );
}
