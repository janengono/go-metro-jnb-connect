import React from 'react';
import { Card } from '@/components/ui/card';
import { Users, UserCheck } from 'lucide-react';

type UserMode = 'commuter' | 'driver';

interface ModeSelectorProps {
  selectedMode: UserMode;
  onModeChange: (mode: UserMode) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ selectedMode, onModeChange }) => {
  const modes = [
    {
      id: 'commuter' as UserMode,
      title: 'Commuter',
      description: 'Track buses, pay fares, get updates',
      icon: Users,
    },
    {
      id: 'driver' as UserMode,
      title: 'Driver',
      description: 'Update capacity, report status',
      icon: UserCheck,
    },
  ];

  return (
    <div className="space-y-4 w-full max-w-md">
      <h2 className="text-2xl font-semibold text-white text-center mb-6">Choose Your Mode</h2>
      
      <div className="grid gap-4">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.id;
          
          return (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              className={`w-full p-6 rounded-2xl border-2 transition-all duration-200 ${
                isSelected
                  ? 'bg-white text-foreground border-white shadow-[var(--shadow-float)]'
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${
                  isSelected ? 'bg-primary text-white' : 'bg-white/20'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <div className="text-left">
                  <h3 className="text-lg font-semibold">{mode.title}</h3>
                  <p className={`text-sm ${
                    isSelected ? 'text-muted-foreground' : 'text-white/70'
                  }`}>
                    {mode.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};