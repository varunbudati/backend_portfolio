"use client";

import dynamic from "next/dynamic";

const ShadeFinder = dynamic(() => import("./ShadeFinder"), {
  ssr: false,
  loading: () => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      Loading ShadeFinder...
    </div>
  ),
});

export default function ShadeFinderPage() {
  return <ShadeFinder />;
}
