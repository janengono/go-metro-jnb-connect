import React, { useRef, useEffect, useState } from "react";
import mapboxgl, { Map } from "mapbox-gl";
import { FeatureCollection, Geometry } from "geojson";
import { normalizeRoute } from "@/utils/mapUtils";
import {
  addRouteLayers,
  addStartEndMarkers,
  addUserLayer,
  addDirectionLineLayer,
  addTrailLine,
} from "@/utils/mapLayer.js";
import { trackUserPosition } from "@/utils/geoLocation";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZS0wMDEiLCJhIjoiY21ldTA1MjNvMDF2azJscjA3a293dHJoNyJ9.CJN52YWxqsYFjz2K9sy3Zw";

type RouteTrackerProps = {
  routeGeoJSON?: FeatureCollection<Geometry>;
  className?: string;
};

const RouteTracker: React.FC<RouteTrackerProps> = ({
  routeGeoJSON,
  className = "w-full h-full",
}) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const trailCoordsRef = useRef<[number, number][]>([]);
  const [toast, setToast] = useState<string | null>(null);

  // Buses with numeric positions for easy movement
  const [busPositions, setBusPositions] = useState<
    { top: number; left: number }[]
  >([]);

  // Generate random starting positions
  useEffect(() => {
    const positions = Array.from({ length: 5 }, () => ({
      top: Math.random() * 80 + 5, // between 10% - 90%
      left: Math.random() * 80 + 5,
    }));
    setBusPositions(positions);
  }, []);

  // Function to slightly adjust position but stay within bounds
  const getNextPosition = (value: number) => {
    const offset = (Math.random() - 0.5) * 10; // -5% to +5%
    const next = value + offset;
    return Math.max(10, Math.min(90, next)); // keep inside bounds
  };

  // Animate buses every 2s
  useEffect(() => {
    const interval = setInterval(() => {
      setBusPositions((prev) =>
        prev.map((bus) => ({
          top: getNextPosition(bus.top),
          left: getNextPosition(bus.left),
        }))
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string, duration = 3000) => {
    setToast(msg);
    setTimeout(() => setToast(null), duration);
  };

  useEffect(() => {
    if (mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current as HTMLDivElement,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [0, 0],
      zoom: 13,
      attributionControl: true,
    });

    mapRef.current = map;

    map.on("load", () => {
      if (routeGeoJSON?.features?.length) {
        const routeLine = normalizeRoute(routeGeoJSON);
        const coords = routeLine.geometry.coordinates as [number, number][];
        addRouteLayers(map, routeGeoJSON);
        addStartEndMarkers(map, coords);
        addDirectionLineLayer(map);
      }

      addUserLayer(map);
      addTrailLine(map);

      if (navigator.geolocation) {
        const cleanup = trackUserPosition(
          trailCoordsRef,
          map,
          routeGeoJSON,
          () => showToast("⚠️ You are leaving the route!")
        );
        return cleanup;
      }
    });
  }, [routeGeoJSON]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full" />

      {/* Moving buses */}
      {busPositions.map((bus, idx) => (
        <div
          key={idx}
          style={{
            position: "absolute",
            top: `${bus.top}%`,
            left: `${bus.left}%`,
            width: "30px",
            height: "30px",
            backgroundColor: "red",
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            fontWeight: "bold",
            zIndex: 10,
            transition: "top 2.5s ease, left 2.5s ease", // smooth movement
          }}
        >
          🚌
        </div>
      ))}

      {toast && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
};

export default RouteTracker;
