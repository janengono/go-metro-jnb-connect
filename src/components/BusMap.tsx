import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface BusLocation {
  id: string;
  number: string;
  route_id: string;       // add this property here
  route_name: string;
  lat: number;
  lng: number;
  capacity: number;
  current_capacity: number;
  eta: string;
  status: 'online' | 'warning' | 'offline'|'full';
}

interface BusMapProps {
  buses: BusLocation[];
  selectedBus: BusLocation | null;
  onBusSelect: (bus: BusLocation) => void;
}

export const BusMap: React.FC<BusMapProps> = ({ buses, onBusSelect, selectedBus }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  // Store marker references and animation states
  const markers = useRef<{[key: string]: { marker: mapboxgl.Marker, animationFrameId?: number, start?: number, from?: number[], to?: number[] }}>({});
  
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(true);

  // Initialize map once and set up navigation controls
  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;
    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [28.0473, -26.2041], // Johannesburg center
      zoom: 11,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
  };

  // Animate marker movement smoothly between coordinates
  const animateMarkerMovement = (id: string) => (timestamp: number) => {
    const markerObj = markers.current[id];
    if (!markerObj || !markerObj.start || !markerObj.from || !markerObj.to) return;

    const duration = 1000; // animation duration in ms
    const elapsed = timestamp - markerObj.start;
    const progress = Math.min(elapsed / duration, 1);

    // Linear interpolation function
    const interpolate = (start: number, end: number) => start + (end - start) * progress;
    const lng = interpolate(markerObj.from[0], markerObj.to[0]);
    const lat = interpolate(markerObj.from[1], markerObj.to[1]);

    markerObj.marker.setLngLat([lng, lat]);

    if (progress < 1) {
      markerObj.animationFrameId = requestAnimationFrame(animateMarkerMovement(id));
    } else {
      // Animation complete, clean up
      markerObj.start = undefined;
      markerObj.from = undefined;
      markerObj.to = undefined;
      markerObj.animationFrameId = undefined;
    }
  };

  // Update existing markers or create new ones, animate movement if bus location changed
  const updateBusMarkers = () => {
    if (!map.current) return;

    const busesById = buses.reduce((acc, bus) => {
      acc[bus.id] = bus;
      return acc;
    }, {} as {[key: string]: BusLocation});

    // Remove markers for buses no longer present
    Object.keys(markers.current).forEach(id => {
      if (!busesById[id]) {
        if (markers.current[id].animationFrameId) {
          cancelAnimationFrame(markers.current[id].animationFrameId);
        }
        markers.current[id].marker.remove();
        delete markers.current[id];
      }
    });

    // Update or add markers
    buses.forEach(bus => {
      const color = bus.status === 'online' ? '#22c55e' :
                    bus.status === 'warning' ? '#f59e0b' :
                    '#ef4444';

      if (markers.current[bus.id]) {
        // Animate marker movement if location changed
        const markerObj = markers.current[bus.id];
        const currentLngLat = markerObj.marker.getLngLat();
        if (currentLngLat.lng !== bus.lng || currentLngLat.lat !== bus.lat) {
          // Setup animation variables
          if (markerObj.animationFrameId) cancelAnimationFrame(markerObj.animationFrameId);
          markerObj.start = performance.now();
          markerObj.from = [currentLngLat.lng, currentLngLat.lat];
          markerObj.to = [bus.lng, bus.lat];
          markerObj.animationFrameId = requestAnimationFrame(animateMarkerMovement(bus.id));
        }
        // Update marker color (in case status changed)
        const el = markerObj.marker.getElement();
        el.style.backgroundColor = color;
        if (el.textContent !== bus.number) el.textContent = bus.number;

      } else {
        // Create new marker
        const el = document.createElement('div');
        el.className = 'bus-marker';
        el.style.cssText = `
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          color: white;
          background-color: ${color};
        `;
        el.textContent = bus.number;
        el.addEventListener('click', () => onBusSelect(bus));

        const marker = new mapboxgl.Marker(el)
          .setLngLat([bus.lng, bus.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div style="padding: 8px;">
                  <h3 style="margin: 0 0 4px 0; font-weight: bold;">Bus ${bus.number}</h3>
                  <p style="margin: 0 0 4px 0; font-size: 12px;">${bus.route_name}</p>
                  <p style="margin: 0; font-size: 12px;">ETA: ${bus.eta}</p>
                </div>
              `)
          )
          .addTo(map.current!);

        markers.current[bus.id] = { marker };
      }
    });
  };

  useEffect(() => {
    if (!showTokenInput && mapboxToken) {
      initializeMap();
    }
    return () => {
      // Clean up map and cancel animations
      if (map.current) {
        Object.values(markers.current).forEach(({ animationFrameId }) => {
          if (animationFrameId) cancelAnimationFrame(animationFrameId);
        });
        map.current.remove();
        map.current = null;
        markers.current = {};
      }
    };
  }, [mapboxToken, showTokenInput]);

  useEffect(() => {
    if (map.current) {
      updateBusMarkers();
    }
  }, [buses]);

  useEffect(() => {
    if (map.current && selectedBus) {
      map.current.flyTo({
        center: [selectedBus.lng, selectedBus.lat],
        zoom: 14,
        duration: 1000,
      });
    }
  }, [selectedBus]);

  if (showTokenInput) {
    return (
      <div className="h-64 bg-muted/30 rounded-xl flex flex-col items-center justify-center p-6 space-y-4">
        <div className="text-center">
          <h3 className="font-semibold mb-2">Enter Mapbox Token</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get your free token from{' '}
            <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              mapbox.com
            </a>
          </p>
        </div>
        <div className="w-full max-w-sm space-y-2">
          <Input
            type="text"
            placeholder="pk.eyJ1..."
            value={mapboxToken}
            onChange={(e) => setMapboxToken(e.target.value)}
            className="text-sm"
          />
          <Button 
            onClick={() => setShowTokenInput(false)}
            disabled={!mapboxToken}
            className="w-full"
          >
            Load Map
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 rounded-xl overflow-hidden shadow-lg">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};
