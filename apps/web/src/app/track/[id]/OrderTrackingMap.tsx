"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface OrderTrackingMapProps {
  pickupLat?: number;
  pickupLng?: number;
  dropoffLat?: number;
  dropoffLng?: number;
  driverLat?: number;
  driverLng?: number;
  status?: string;
}

export default function OrderTrackingMap({
  pickupLat,
  pickupLng,
  dropoffLat,
  dropoffLng,
  driverLat,
  driverLng,
  status,
}: OrderTrackingMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const pickupMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const dropoffMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const driverMarkerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    console.log('Initializing map...');
    console.log('Mapbox token:', mapboxgl.accessToken ? 'Present' : 'MISSING');

    const defaultCenter: [number, number] = [36.8219, -1.2921];

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: defaultCenter,
        zoom: 12,
        attributionControl: false,
      });

      console.log('Map instance created');

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
      map.current.addControl(
        new mapboxgl.AttributionControl({ compact: true }),
        "bottom-right"
      );

      map.current.on("load", () => {
        console.log('Map loaded successfully!');
        setMapLoaded(true);
      });

      map.current.on("error", (e) => {
        console.error('Map error:', e);
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    pickupMarkerRef.current?.remove();
    dropoffMarkerRef.current?.remove();
    driverMarkerRef.current?.remove();

    const bounds = new mapboxgl.LngLatBounds();
    let hasValidCoordinates = false;

    if (pickupLat && pickupLng) {
      const pickupEl = document.createElement("div");
      pickupEl.className = "pickup-marker";
      pickupEl.innerHTML = `
        <div style="
          width: 40px;
          height: 40px;
          background-color: #10b981;
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
          cursor: pointer;
        ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      `;

      pickupMarkerRef.current = new mapboxgl.Marker({ element: pickupEl })
        .setLngLat([pickupLng, pickupLat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div style="padding: 8px;">
              <strong style="color: #10b981;">Pickup Location</strong>
            </div>`
          )
        )
        .addTo(map.current);

      bounds.extend([pickupLng, pickupLat]);
      hasValidCoordinates = true;
    }

    if (dropoffLat && dropoffLng) {
      const dropoffEl = document.createElement("div");
      dropoffEl.className = "dropoff-marker";
      dropoffEl.innerHTML = `
        <div style="
          width: 40px;
          height: 40px;
          background-color: #ef4444;
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
          cursor: pointer;
        ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      `;

      dropoffMarkerRef.current = new mapboxgl.Marker({ element: dropoffEl })
        .setLngLat([dropoffLng, dropoffLat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div style="padding: 8px;">
              <strong style="color: #ef4444;">Delivery Location</strong>
            </div>`
          )
        )
        .addTo(map.current);

      bounds.extend([dropoffLng, dropoffLat]);
      hasValidCoordinates = true;
    }

    if (driverLat && driverLng) {
      const driverEl = document.createElement("div");
      driverEl.className = "driver-marker";
      driverEl.innerHTML = `
        <div style="
          width: 50px;
          height: 50px;
          background-color: #3b82f6;
          border: 4px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(59,130,246,0.4);
          cursor: pointer;
          animation: pulse 2s infinite;
        ">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M23.5 7c.276 0 .5.224.5.5v.511c0 .793-.926.989-1.616.989l-1.086-2h2.202zm-1.441 3.506c.639 1.186.946 2.252.946 3.666 0 1.882-.792 3.839-2.046 5.828h-1.959v-4.5c0-.276-.224-.5-.5-.5h-12c-.276 0-.5.224-.5.5v4.5h-2v-7.5c0-.276.224-.5.5-.5h.506c.276 0 .5-.224.5-.5 0-.276-.224-.5-.5-.5h-1.006c-.276 0-.5.224-.5.5v8.5c0 1.104.896 2 2 2h18c1.104 0 2-.896 2-2v-7c0-2.238-.511-4.195-1.441-6.494z"/>
          </svg>
        </div>
        <style>
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        </style>
      `;

      driverMarkerRef.current = new mapboxgl.Marker({ element: driverEl })
        .setLngLat([driverLng, driverLat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div style="padding: 8px;">
              <strong style="color: #3b82f6;">Driver Location</strong>
              <p style="margin: 4px 0 0; font-size: 12px; color: #666;">Last updated: ${new Date().toLocaleTimeString()}</p>
            </div>`
          )
        )
        .addTo(map.current);

      bounds.extend([driverLng, driverLat]);
      hasValidCoordinates = true;
    }

    if (pickupLat && pickupLng && dropoffLat && dropoffLng) {
      fetchRoute([pickupLng, pickupLat], [dropoffLng, dropoffLat]);
    }

    if (hasValidCoordinates) {
      map.current.fitBounds(bounds, {
        padding: { top: 80, bottom: 80, left: 80, right: 80 },
        maxZoom: 15,
      });
    }
  }, [mapLoaded, pickupLat, pickupLng, dropoffLat, dropoffLng, driverLat, driverLng]);

  const fetchRoute = async (start: [number, number], end: [number, number]) => {
    if (!map.current) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0].geometry;

        if (map.current.getLayer("route")) {
          map.current.removeLayer("route");
        }
        if (map.current.getSource("route")) {
          map.current.removeSource("route");
        }

        map.current.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: route,
          },
        });

        map.current.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": status === "delivered" ? "#10b981" : "#3b82f6",
            "line-width": 4,
            "line-opacity": 0.8,
          },
        });

        map.current.addLayer({
          id: "route-outline",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#ffffff",
            "line-width": 6,
            "line-opacity": 0.4,
          },
        });

        map.current.moveLayer("route-outline");
        map.current.moveLayer("route");
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  return (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" style={{ width: '100%', height: '100%' }} />

      {status && (
        <div className="absolute top-4 left-4 z-10">
          <div className={`px-4 py-2 rounded-full shadow-lg text-white font-semibold text-sm backdrop-blur-sm ${
            status === "delivered" ? "bg-green-500/90" :
            status === "in_transit" ? "bg-blue-500/90" :
            status === "picked_up" ? "bg-purple-500/90" :
            "bg-gray-500/90"
          }`}>
            {status.replace(/_/g, " ").toUpperCase()}
          </div>
        </div>
      )}

      <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 text-xs space-y-2 z-10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Pickup</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>Dropoff</span>
        </div>
        {driverLat && driverLng && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Driver</span>
          </div>
        )}
      </div>
    </div>
  );
}
