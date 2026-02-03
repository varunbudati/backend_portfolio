"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// @ts-ignore
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export default function ShadeFinder() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng] = useState(48.0791);
  const [lat] = useState(29.3375);
  const [zoom] = useState(15.5);
  const [hour, setHour] = useState(12);
  const [climate, setClimate] = useState<any>(null);

  useEffect(() => {
    const fetchClimate = async () => {
      try {
        const res = await fetch(`/api/shadefinder/climate?lat=${lat}&lon=${lng}`);
        const data = await res.json();
        setClimate(data);
      } catch (e) {
        setClimate(null);
      }
    };
    fetchClimate();
  }, [lat, lng]);

  const updateShadows = async (newHour: number) => {
    try {
      if (!map.current || !map.current.isStyleLoaded()) return;
      
      const response = await fetch(`/api/shadefinder/shadows?lat=${lat}&lon=${lng}&hour=${newHour}`);
      const data = await response.json();
      
      const source = map.current.getSource("shadows") as mapboxgl.GeoJSONSource;
      if (source && data.shadows) {
        source.setData(data.shadows);
      }
    } catch (e) {
      console.error("Shadow update failed", e);
    }
  };

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    console.log("Initializing map...");
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: zoom,
      pitch: 60,
    });

    map.current.on("style.load", () => {
      console.log("Map style loaded");
    });

    map.current.on("error", (e) => {
      console.error("Map error:", e);
    });

    map.current.on("load", async () => {
      console.log("Map loaded");
      if (!map.current) return;

      try {
        map.current.addLayer({
          id: "3d-buildings",
          source: "composite",
          "source-layer": "building",
          type: "fill-extrusion",
          paint: {
            "fill-extrusion-color": "#ddd",
            "fill-extrusion-height": ["get", "height"],
            "fill-extrusion-opacity": 0.8,
          },
        });
        console.log("Buildings layer added");
      } catch (e) {
        console.error("Error adding buildings layer:", e);
      }

      try {
        const response = await fetch(`/api/shadefinder/shadows?lat=${lat}&lon=${lng}&hour=${hour}`);
        const data = await response.json();
        
        if (data.shadows && map.current) {
          const sourceExists = map.current.getSource("shadows");
          
          if (!sourceExists) {
            map.current.addSource("shadows", {
              type: "geojson",
              data: data.shadows,
            });
            map.current.addLayer({
              id: "shadow-layer",
              type: "fill",
              source: "shadows",
              paint: {
                "fill-color": "#1E40AF",
                "fill-opacity": 0.5,
              },
            });
            console.log("Shadows layer added");
          } else {
            // Update existing source
            const source = map.current.getSource("shadows") as mapboxgl.GeoJSONSource;
            source.setData(data.shadows);
            console.log("Shadows layer updated");
          }
        }
      } catch (error) {
        console.error("Error fetching shadows:", error);
      }
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [lat, lng, zoom, hour]);

  return (
    <div style={{ height: "100vh", position: "relative", width: "100%", overflow: "hidden" }}>
      <div ref={mapContainer} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }} />
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          background: "#1F2937",
          padding: "12px",
          borderRadius: "6px",
          zIndex: 20,
          border: "1px solid #374151",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "18px", color: "#FFFFFF", fontWeight: "600" }}>ShadeFinder: Kuwait City</h1>
        <p style={{ margin: "4px 0 0 0", color: "#D1D5DB", fontSize: "14px" }}>Showing real-time building shadows</p>
      </div>
      {climate && (
        <div
          style={{
            position: "absolute",
            top: 100,
            left: 10,
            background: "#1F2937",
            padding: "12px",
            borderRadius: "8px",
            zIndex: 20,
            border: "1px solid #374151",
          }}
        >
          <h4 style={{ margin: "0 0 10px 0", color: "#FFFFFF", fontWeight: "600" }}>Climate Metrics</h4>
          <div style={{ fontSize: "14px", color: "#D1D5DB" }}>
            <p>
              🌡️ <b style={{ color: "#FFFFFF" }}>Temp:</b> {climate.temp}°C
            </p>
            <p>
              💧 <b style={{ color: "#FFFFFF" }}>Humidity:</b> {climate.humidity}%
            </p>
            <p>
              🌬️ <b style={{ color: "#FFFFFF" }}>Wind:</b> {climate.wind} m/s
            </p>
            <p>
              ☀️ <b style={{ color: "#FFFFFF" }}>Status:</b> {climate.condition}
            </p>
          </div>
        </div>
      )}
      <div
        style={{
          position: "absolute",
          bottom: 30,
          left: "50%",
          transform: "translateX(-50%)",
          background: "#1F2937",
          padding: "16px",
          borderRadius: "10px",
          zIndex: 20,
          border: "1px solid #374151",
        }}
      >
        <label style={{ color: "#D1D5DB", display: "block", marginBottom: "8px", fontSize: "14px" }}>
          Time of Day (Kuwait): <span style={{ color: "#FFFFFF", fontWeight: "600" }}>{hour}:00</span>
        </label>
        <input
          type="range"
          min="6"
          max="18"
          value={hour}
          onChange={(e) => {
            const newHour = parseInt(e.target.value);
            setHour(newHour);
            updateShadows(newHour);
          }}
          style={{ width: "300px", display: "block" }}
        />
      </div>
    </div>
  );
}
