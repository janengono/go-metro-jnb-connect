import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface BusLocation {
  id: string;
  number: string;
  route: string;
  lat: number;
  lng: number;
  capacity: number;
  eta: string;
  status: 'online' | 'warning' | 'offline';
}

interface BusMapProps {
  buses: BusLocation[];
  onBusSelect: (bus: BusLocation) => void;
  selectedBus: BusLocation | null;
}

export const BusMap: React.FC<BusMapProps> = ({ buses, onBusSelect, selectedBus }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(true);

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [28.0473, -26.2041], // Johannesburg center
      zoom: 11,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Add bus markers
    updateBusMarkers();
  };

  const updateBusMarkers = () => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add new markers for each bus
    buses.forEach(bus => {
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
        background-color: ${bus.status === 'online' ? '#22c55e' : bus.status === 'warning' ? '#f59e0b' : '#ef4444'};
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
                <p style="margin: 0 0 4px 0; font-size: 12px;">${bus.route}</p>
                <p style="margin: 0; font-size: 12px;">ETA: ${bus.eta}</p>
              </div>
            `)
        )
        .addTo(map.current!);

      markers.current.push(marker);
    });
  };

  useEffect(() => {
    if (!showTokenInput && mapboxToken) {
      initializeMap();
    }

    return () => {
      map.current?.remove();
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
        duration: 1000
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