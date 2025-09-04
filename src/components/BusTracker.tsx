import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusIndicator } from '@/components/StatusIndicator';
import { BusMap } from '@/components/BusMap';
import { 
  MapPin, 
  Navigation, 
  Search, 
  Bus, 
  Clock,
  LocateFixed,
  Filter,
  Route
} from 'lucide-react';

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

export const BusTracker: React.FC = () => {
  const [searchRoute, setSearchRoute] = useState('');
  const [selectedBus, setSelectedBus] = useState<BusLocation | null>(null);

  const activeBuses: BusLocation[] = [
    {
      id: '1',
      number: '243',
      route: 'Sandton → Soweto',
      lat: -26.1076,
      lng: 28.0567,
      capacity: 85,
      eta: '3 min',
      status: 'online'
    },
    {
      id: '2',
      number: '156',
      route: 'Rosebank → Alexandra',
      lat: -26.1465,
      lng: 28.0436,
      capacity: 45,
      eta: '7 min',
      status: 'online'
    },
    {
      id: '3',
      number: '089',
      route: 'CBD → Midrand',
      lat: -26.2041,
      lng: 28.0473,
      capacity: 95,
      eta: '12 min',
      status: 'warning'
    }
  ];

  const filteredBuses = activeBuses.filter(bus =>
    bus.number.includes(searchRoute) || 
    bus.route.toLowerCase().includes(searchRoute.toLowerCase())
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
          
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
          
          <Button variant="outline" size="icon">
            <LocateFixed className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Real-time Bus Map */}
      <Card className="metro-card">
        <div className="mb-4">
          <h2 className="metro-subheading">Live Bus Tracking</h2>
          <p className="text-sm text-muted-foreground">Tap any bus to see its full route</p>
        </div>
        <BusMap 
          buses={filteredBuses}
          onBusSelect={setSelectedBus}
          selectedBus={selectedBus}
        />
      </Card>

      {/* Active Buses List */}
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
                  
                  <StatusIndicator 
                    status={bus.status} 
                    capacity={bus.capacity}
                  />
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
            <StatusIndicator 
              status={selectedBus.status} 
              capacity={selectedBus.capacity}
            />
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
          
          <div className="flex gap-2 mt-4">
            <Button className="metro-button-primary flex-1">
              <Route className="w-4 h-4 mr-2" />
              View Full Route
            </Button>
            <Button variant="outline" className="flex-1">
              <Navigation className="w-4 h-4 mr-2" />
              Directions
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};