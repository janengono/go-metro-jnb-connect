import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusIndicator } from '@/components/StatusIndicator';
import { 
  MapPin, 
  Navigation, 
  Search, 
  Bus, 
  Clock,
  LocateFixed,
  Filter
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

      {/* Map Placeholder */}
      <Card className="metro-card">
        <div className="h-64 bg-muted/30 rounded-xl flex items-center justify-center relative overflow-hidden">
          {/* Simulated Map Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-primary/20" />
          
          <div className="relative z-10 text-center">
            <MapPin className="w-12 h-12 text-primary mx-auto mb-3" />
            <p className="metro-subheading mb-2">Live Bus Tracking</p>
            <p className="metro-body">Interactive map will load here</p>
          </div>

          {/* Simulated Bus Markers */}
          <div className="absolute top-4 left-8 w-3 h-3 bg-primary rounded-full metro-pulse" />
          <div className="absolute top-12 right-16 w-3 h-3 bg-secondary rounded-full metro-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-8 left-1/3 w-3 h-3 bg-status-warning rounded-full metro-pulse" style={{ animationDelay: '1s' }} />
        </div>
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
          
          <Button className="metro-button-primary w-full mt-4">
            Get Directions
          </Button>
        </Card>
      )}
    </div>
  );
};