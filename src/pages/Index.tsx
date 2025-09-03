import React, { useState } from 'react';
import { PhoneVerification } from '@/components/PhoneVerification';
import { RoleSelection } from '@/components/RoleSelection';
import { SignupForm } from '@/components/SignupForm';
import { Dashboard } from '@/components/Dashboard';
import {BusTracker}   from '@/components/BusTracker';
import { WalletCard } from '@/components/WalletCard';
import { NewsCard } from '@/components/NewsCard';
import { Button } from '@/components/ui/button';
import {ProfileDropdown}   from '@/components/ui/profile-dropdown';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MapPin, CreditCard, Newspaper, Bus, Settings } from 'lucide-react';

type UserMode = 'commuter' | 'driver';
type ActiveTab = 'dashboard' | 'map' | 'wallet' | 'news';
type AppFlow = 'phone-verification' | 'role-selection' | 'signup' | 'dashboard';

interface UserData {
  fullName: string;
  phoneNumber: string;
  role: UserMode;
  cardNumber?: string;
  employeeNumber?: string;
  isNewUser: boolean;
}

const Index = () => {
  const [currentFlow, setCurrentFlow] = useState<AppFlow>('phone-verification');
  const [verifiedPhone, setVerifiedPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserMode>('commuter');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Handlers stay the same...
  const handlePhoneVerification = (phoneNumber: string) => {
    setVerifiedPhone(phoneNumber);
    setCurrentFlow('role-selection');
  };

  const handleRoleSelection = (role: UserMode) => {
    setSelectedRole(role);
    setCurrentFlow('signup');
  };

  const handleSignupComplete = (newUserData: UserData) => {
    setUserData(newUserData);
    setCurrentFlow('dashboard');
  };

  const handleBackToRoleSelection = () => setCurrentFlow('role-selection');

  const handleLogout = () => {
    setCurrentFlow('phone-verification');
    setVerifiedPhone('');
    setSelectedRole('commuter');
    setUserData(null);
    setActiveTab('dashboard');
  };

  // --- FLOW HANDLING ---
  if (currentFlow === 'phone-verification') {
    return <PhoneVerification onVerificationComplete={handlePhoneVerification} />;
  }

  if (currentFlow === 'role-selection') {
    return (
      <RoleSelection
        phoneNumber={verifiedPhone}
        onRoleSelect={handleRoleSelection}
      />
    );
  }

  if (currentFlow === 'signup') {
    return (
      <SignupForm
        role={selectedRole}
        phoneNumber={verifiedPhone}
        onSignupComplete={handleSignupComplete}
        onBackToRoleSelection={handleBackToRoleSelection}
      />
    );
  }

  // --- DASHBOARD (commuter vs driver) ---
  if (currentFlow === 'dashboard' && userData) {
    const commuterTabs = [
      { id: 'dashboard' as ActiveTab, label: 'Home', icon: Bus },
      { id: 'map' as ActiveTab, label: 'Track', icon: MapPin },
      { id: 'wallet' as ActiveTab, label: 'Wallet', icon: CreditCard },
      { id: 'news' as ActiveTab, label: 'News', icon: Newspaper },
    ];

    const driverTabs = [
      { id: 'dashboard' as ActiveTab, label: 'Home', icon: Bus },
      { id: 'news' as ActiveTab, label: 'News', icon: Newspaper },
    ];

    const tabs = userData.role === 'commuter' ? commuterTabs : driverTabs;

    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bus className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-foreground">GoMetro</h1>
                <p className="text-sm text-muted-foreground capitalize">
                  {userData.role} Mode • {userData.fullName}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 pb-20">
          {activeTab === 'dashboard' && <Dashboard userMode={userData.role} />}
          {userData.role === 'commuter' && activeTab === 'map' && <BusTracker />}
          {userData.role === 'commuter' && activeTab === 'wallet' && <WalletCard />}
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
  }

  // Fallback if something unexpected
  return <div className="flex items-center justify-center h-screen">Loading...</div>;
};

export default Index;
