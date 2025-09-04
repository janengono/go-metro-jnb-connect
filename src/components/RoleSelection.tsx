import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Car, CheckCircle } from 'lucide-react';
import cityBackground from '@/assets/city-background.jpg';

type UserRole = 'commuter' | 'driver';

interface RoleSelectionProps {
  phoneNumber: string;
  onRoleSelect: (role: UserRole) => void;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({ phoneNumber, onRoleSelect }) => {
  const roles = [
    {
      id: 'commuter' as UserRole,
      title: 'I\'m a Commuter',
      description: 'I use Metro Bus services to travel around Johannesburg',
      icon: User,
      features: ['Track buses in real-time', 'Digital wallet for payments', 'Report issues', 'Get service updates']
    },
    {
      id: 'driver' as UserRole,
      title: 'I\'m a Driver',
      description: 'I drive Metro Bus vehicles and serve commuters',
      icon: Car,
      features: ['Update bus capacity', 'Report route status', 'Communicate with control', 'Share live location']
    }
  ];

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${cityBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <span className="text-lg font-medium text-green-600">Phone Verified</span>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-white">Choose Your Role</h1>
          <p className="text-white/90">
            How will you be using GoMetro?
          </p>
          <p className="text-sm text-white/70 mt-1">
            Verified: {phoneNumber}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            
            return (
              <Card key={role.id} className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] backdrop-blur-sm bg-card/95">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{role.title}</CardTitle>
                  <CardDescription className="text-center">
                    {role.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">Features:</h4>
                    <ul className="space-y-1">
                      {role.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    onClick={() => onRoleSelect(role.id)}
                    className="w-full mt-6"
                    size="lg"
                  >
                    Continue as {role.id === 'commuter' ? 'Commuter' : 'Driver'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};