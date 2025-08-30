import React, { useState } from 'react';
import { ModeSelector } from '@/components/ModeSelector';
import { Dashboard } from '@/components/Dashboard';
import { BusTracker } from '@/components/BusTracker';
import { WalletCard } from '@/components/WalletCard';
import { NewsCard } from '@/components/NewsCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, CreditCard, Newspaper, Bus, Users, Settings } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';

type UserMode = 'commuter' | 'driver';
type ActiveTab = 'dashboard' | 'map' | 'wallet' | 'news';

const Index = () => {
  const [userMode, setUserMode] = useState<UserMode>('commuter');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isWelcomeScreen, setIsWelcomeScreen] = useState(true);

  if (isWelcomeScreen) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 metro-gradient-hero opacity-90" />
        
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6 text-center">
          <div className="metro-fade-in">
            <div className="mb-8">
              <Bus className="w-20 h-20 text-white mx-auto mb-4" />
              <h1 className="text-5xl font-bold text-white mb-4">GoMetro</h1>
              <p className="text-xl text-white/90 mb-8 max-w-md">
                Your smart companion for Johannesburg Metro Bus travel
              </p>
            </div>
            
            <ModeSelector 
              selectedMode={userMode}
              onModeChange={setUserMode}
            />
            
            <Button 
              className="metro-button-primary text-lg px-12 py-4 mt-8"
              onClick={() => setIsWelcomeScreen(false)}
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard' as ActiveTab, label: 'Home', icon: Bus },
    { id: 'map' as ActiveTab, label: 'Track', icon: MapPin },
    { id: 'wallet' as ActiveTab, label: 'Wallet', icon: CreditCard },
    { id: 'news' as ActiveTab, label: 'News', icon: Newspaper },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bus className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">GoMetro</h1>
              <p className="text-sm text-muted-foreground capitalize">{userMode} Mode</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsWelcomeScreen(true)}
            className="text-muted-foreground"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20">
        {activeTab === 'dashboard' && <Dashboard userMode={userMode} />}
        {activeTab === 'map' && <BusTracker />}
        {activeTab === 'wallet' && <WalletCard />}
        {activeTab === 'news' && <NewsCard />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Index;