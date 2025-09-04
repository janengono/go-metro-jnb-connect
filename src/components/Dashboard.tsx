import React, {useState} from 'react';
import { Card, CardContent, CardHeader, CardTitle  } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusIndicator } from '@/components/StatusIndicator';
import { Input } from '@/components/ui/input';
import {TopUp} from '@/components/TopUp';
import QuickReport from "@/components/QuickReport";
import { 
  Bus, 
  Clock, 
  MapPin,
  Plus, 
  Users, 
  AlertTriangle,
  CreditCard,
  TrendingUp,
  Navigation
} from 'lucide-react';
import { VirtualCard } from '@/components/VirtualCard';

type UserMode = 'commuter' | 'driver';

interface UserData {
  fullName: string;
  phoneNumber: string;
  role: UserMode;
  cardNumber?: string;
  employeeNumber?: string;
  isNewUser: boolean;
}

interface DashboardProps {
  userMode: UserMode;
  userData: UserData;
}

export const Dashboard: React.FC<DashboardProps> = ({ userMode, userData }) => {
  const [topUpAmount, setTopUpAmount] = useState<number>();
  const quickAmounts = [ 50, 100, 200, 300];
  const [showTopUp, setShowTopUp] = useState(false);
  const handleTopUp = (amount: number) => {
    // Handle top-up logic
    console.log(`Topping up R${amount}`);
    setShowTopUp(false);
   // setTopUpAmount(0);
  };
  const nearbyBuses = [
    { 
      number: '243', 
      route: 'Sandton → Soweto', 
      eta: '3 min', 
      capacity: 85,
      status: 'online' as const
    },
    { 
      number: '156', 
      route: 'Rosebank → Alexandra', 
      eta: '7 min', 
      capacity: 45,
      status: 'online' as const
    },
    { 
      number: '089', 
      route: 'CBD → Midrand', 
      eta: '12 min', 
      capacity: 95,
      status: 'warning' as const
    },
  ];

  const driverStats = {
    routesCompleted: 8,
    passengersServed: 247,
    currentCapacity: 68,
    nextStop: 'Park Station'
  };

  if (userMode === 'driver') {
    return (
      <div className="p-4 space-y-6">
        {/* Driver Status Card */}
        <Card className="metro-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="metro-subheading">Driver Dashboard</h2>
            <StatusIndicator status="online" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{driverStats.routesCompleted}</p>
              <p className="text-sm text-muted-foreground">Routes Today</p>
            </div>
            
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <Users className="w-6 h-6 text-secondary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{driverStats.passengersServed}</p>
              <p className="text-sm text-muted-foreground">Passengers</p>
            </div>
          </div>
        </Card>

        {/* Current Capacity */}
        <Card className="metro-card">
          <h3 className="metro-subheading mb-4">Current Bus Status</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="metro-body">Capacity</span>
              <span className="text-lg font-semibold">{driverStats.currentCapacity}%</span>
            </div>
            
            <div className="w-full bg-muted rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  driverStats.currentCapacity > 80 
                    ? 'bg-alert' 
                    : driverStats.currentCapacity > 60 
                    ? 'bg-status-warning' 
                    : 'bg-primary'
                }`}
                style={{ width: `${driverStats.currentCapacity}%` }}
              />
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <Navigation className="w-4 h-4" />
              <span>Next: {driverStats.nextStop}</span>
            </div>
          </div>

          <Button className="metro-button-primary w-full mt-4">
            Update Capacity
          </Button>
        </Card>

        {/* Quick Actions */}
            <Card className="card-elevated animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <QuickReport userMode={userMode} />
            </CardContent>
          </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Virtual Card */}
      <div className="flex justify-center">
        <VirtualCard
          cardNumber={userData.cardNumber || "0000000000000000"}
          balance={87.50}
          holderName={userData.fullName}
          className="mb-2"
        />
      </div>
      
      {/* Balance Actions */}
      <Card className="metro-card">
        <div className="flex justify-center">
          <Button 
            className="w-full max-w-sm"
            onClick={() => setShowTopUp(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Top Up
          </Button>
        </div>

      </Card>

                 {/* Top-Up Modal */}
          {showTopUp && (
            <Card className="metro-card border-primary/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="metro-subheading">Top Up Wallet</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowTopUp(false)}
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Please enter a minimum of R50
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(Number(e.target.value))}
                    className="text-lg"
                  />
                </div>
                
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Quick Amounts</p>
                  <div className="grid grid-cols-4 gap-2">
                    {quickAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        onClick={() => setTopUpAmount(amount)}
                        className="text-sm"
                      >
                        R{amount}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Google Pay button container */}
                <div className="flex justify-center mt-4">
                  {topUpAmount >= 50 ? (
                    <TopUp topUpAmount={topUpAmount} 
                     onClose={() => setShowTopUp(false)} />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Enter R50 or more to enable Google Pay
                    </p>
                  )}
                </div>
              </div>
            </Card>
              )}

      {/* Nearby Buses */}
      <Card className="metro-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="metro-subheading">Nearby Buses</h2>
          <Button variant="ghost" size="sm" className="text-primary">
            Refresh
          </Button>
        </div>
        
        <div className="space-y-3">
          {nearbyBuses.map((bus, index) => (
            <div 
              key={bus.number}
              className="flex items-center justify-between p-4 bg-muted/30 rounded-xl metro-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Bus className="w-5 h-5 text-primary" />
                </div>
                
                <div>
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
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
          <Card className="card-elevated animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <QuickReport userMode={userMode} />
            </CardContent>
          </Card>
    </div>
  );
};