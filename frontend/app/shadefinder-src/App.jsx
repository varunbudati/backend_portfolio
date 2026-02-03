import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import axios from 'axios';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1IjoidmFyMSIsImEiOiJjbTEzcDJ6MGIxZnkwMm5xMjdoOGtlMTc4In0.5_JIdmbNPnfHT0tjIW2_bg';

function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng] = useState(48.0791);
  const [lat] = useState(29.3375);
  const [zoom] = useState(15.5);
  const [hour, setHour] = useState(12); // Default to Noon
  const [climate, setClimate] = useState(null);
  // Fetch climate info on mount
  useEffect(() => {
    const fetchClimate = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/climate?lat=${lat}&lon=${lng}`);
        setClimate(res.data);
      } catch (e) {
        setClimate(null);
      }
    };
    fetchClimate();
  }, [lat, lng]);

  // Add this function to fetch shadows when the hour changes
  const updateShadows = async (newHour) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/shadows?lat=${lat}&lon=${lng}&hour=${newHour}`);
      if (map.current.getSource('shadows')) {
        map.current.getSource('shadows').setData(response.data.shadows);
      }
    } catch (e) {
      console.error("Shadow update failed", e);
    }
  };

  useEffect(() => {
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [lng, lat],
      zoom: zoom,
      pitch: 45,
    });

    map.current.on('load', async () => {
      // 1. Add 3D Buildings
      map.current.addLayer({
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'type': 'fill-extrusion',
        'paint': {
          'fill-extrusion-color': '#aaa',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-opacity': 0.6
        }
      });

      // 2. Fetch Shadows from your Python Backend (initial load)
      try {
        const response = await axios.get(`http://127.0.0.1:8000/shadows?lat=${lat}&lon=${lng}&hour=${hour}`);
        map.current.addSource('shadows', {
          type: 'geojson',
          data: response.data.shadows
        });
        map.current.addLayer({
          id: 'shadow-layer',
          type: 'fill',
          source: 'shadows',
          paint: {
            'fill-color': '#FF0000', // Bright Red for testing
            'fill-opacity': 0.8
            }
        });
      } catch (error) {
        console.error("Error fetching shadows:", error);
      }
    });
  }, []);

  return (
    <div style={{ height: '100vh' }}>
      <div ref={mapContainer} style={{ height: '100%' }} />
      <div style={{ position: 'absolute', top: 10, left: 10, background: 'white', padding: '10px', borderRadius: '4px' }}>
        <h1 style={{ margin: 0, fontSize: '18px' }}>ShadeFinder: Kuwait City</h1>
        <p style={{ margin: 0 }}>Showing real-time building shadows</p>
      </div>
      {climate && (
        <div style={{ position: 'absolute', top: 100, left: 10, background: 'rgba(255,255,255,0.9)', padding: '15px', borderRadius: '8px', zIndex: 10 }}>
          <h4 style={{ margin: '0 0 10px 0' }}>Climate Metrics</h4>
          <div style={{ fontSize: '14px' }}>
            <p>🌡️ <b>Temp:</b> {climate.temp}°C</p>
            <p>💧 <b>Humidity:</b> {climate.humidity}%</p>
            <p>🌬️ <b>Wind:</b> {climate.wind} m/s</p>
            <p>☀️ <b>Status:</b> {climate.condition}</p>
          </div>
        </div>
      )}
      <div style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', background: 'white', padding: '20px', borderRadius: '10px', zIndex: 10 }}>
        <label>Time of Day (Kuwait): {hour}:00</label>
        <input 
          type="range" min="6" max="18" value={hour} 
          onChange={(e) => {
            setHour(e.target.value);
            updateShadows(e.target.value);
          }}
          style={{ width: '300px', display: 'block' }}
        />
      </div>
    </div>
  );
}

export default App;