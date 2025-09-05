import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import RouterTracker from '@/components/map';
import { StatusIndicator } from '@/components/StatusIndicator';
import { Search, Filter, LocateFixed, Bus, Clock, MapPin, Navigation } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, DocumentData } from 'firebase/firestore';

type BusStatus = 'online' | 'warning' | 'offline'|'full';

interface BusLocation {
  id: string;
  number: string;
  route: string;
  lat: number;
  lng: number;
  capacity: number;
  current_capacity: number;
  eta: string;
   status: BusStatus;
}



export const BusTracker: React.FC = () => {
  const [searchRoute, setSearchRoute] = useState('');
  const [buses, setBuses] = useState<BusLocation[]>([]);
  const [selectedBus, setSelectedBus] = useState<BusLocation | null>(null);
   const [activeBuses, setActiveBuses] = useState<BusLocation[]>([]);

  // Fetch buses from Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'buses'), (snapshot) => {
      const buses: BusLocation[] = snapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData;
        const capacityRatio = data.current_capacity / data.capacity;


        let status: BusStatus;

        if (data.status === 'offline') {
          status = 'offline';
        } else if (capacityRatio > 1.2) {
          status = 'warning';   // Overcapacity (more than 80%)
        } else if (capacityRatio >= 1) {
          status = 'full';      // Full (60% to 80%)
        } else {
          status = 'online';    // Available (less than 60%)
        }

        return {
          id: doc.id,
          number: data.bus_number,
          route: data.route_name || data.route || 'N/A',
          lat: data.lat ?? -26.2041,
          lng: data.lng ?? 28.0473,
          capacity: data.capacity ?? 100,
          current_capacity: data.current_capacity,
          eta: data.eta || 'unknown',
          status,
        };
      });
      setActiveBuses(buses);
      //setBuses(fetchedBuses);
      //if (!selectedBus && fetchedBuses.length > 0) setSelectedBus(fetchedBuses[0]);
    });

    return () => unsub();
  }, [selectedBus]);

  // Filter buses based on search input
  const filteredBuses = buses.filter(bus =>
    bus.number.includes(searchRoute) || bus.route.toLowerCase().includes(searchRoute.toLowerCase())
  );

  return (
    <div className="p-4 space-y-6">
      {/* Search Header */}
      <Card className="metro-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search bus number or route..."
              value={searchRoute}
              onChange={(e) => setSearchRoute(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon"><Filter className="w-4 h-4" /></Button>
          <Button variant="outline" size="icon"><LocateFixed className="w-4 h-4" /></Button>
        </div>
      </Card>

      {/* Map */}
      <Card className="metro-card">
        <div className="h-64 bg-muted/30 rounded-xl flex items-center justify-center relative overflow-hidden">
          <RouterTracker buses={buses} selectedBus={selectedBus} onBusSelect={setSelectedBus} />
        </div>
      </Card>

      {/* Active Buses */}
      <Card className="metro-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="metro-subheading">Active Buses</h2>
          <span className="text-sm text-muted-foreground">{filteredBuses.length} buses</span>
        </div>
        <div className="space-y-3">
          {filteredBuses.map((bus, index) => (
            <button
              key={bus.id}
              onClick={() => setSelectedBus(bus)}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-200 metro-fade-in ${
                selectedBus?.id === bus.id
                  ? 'border-primary bg-primary/5'
                  : 'border-muted bg-muted/30 hover:border-primary/50'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Bus className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">Bus {bus.number}</p>
                    <p className="text-sm text-muted-foreground">{bus.route}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">{bus.eta}</span>
                  </div>
                  <StatusIndicator status={bus.status} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Selected Bus Details */}
      {selectedBus && (
        <Card className="metro-card border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="metro-subheading">Bus {selectedBus.number} Details</h3>
            <StatusIndicator status={selectedBus.status} />
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-muted-foreground" />
              <span className="metro-body">{selectedBus.route}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="metro-body">Arriving in {selectedBus.eta}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="metro-body">
                {selectedBus.lat.toFixed(4)}, {selectedBus.lng.toFixed(4)}
              </span>
            </div>
          </div>
          <Button className="metro-button-primary w-full mt-4">Get Directions</Button>
        </Card>
      )}
    </div>
  );
};
