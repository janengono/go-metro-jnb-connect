import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, CreditCard, IdCard, Phone, AlertCircle, CheckCircle, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { QRScanner } from '@/components/QRScanner';
import cityBackground from '@/assets/city-background.jpg';

type UserRole = 'commuter' | 'driver';

interface SignupFormProps {
  role: UserRole;
  phoneNumber: string;
  onSignupComplete: (userData: any) => void;
  onBackToRoleSelection: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ 
  role, 
  phoneNumber, 
  onSignupComplete,
  onBackToRoleSelection 
}) => {
  const [fullName, setFullName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Full name is required');
      return;
    }

    if (role === 'commuter' && !cardNumber.trim()) {
      setError('Card number is required for commuters');
      return;
    }

    if (role === 'driver' && !employeeNumber.trim()) {
      setError('Employee number is required for drivers');
      return;
    }

    setIsLoading(true);

    // Simulate backend verification
    setTimeout(() => {
      // Simulate random success/failure for demo
      const isValid = Math.random() > 0.3; // 70% success rate for demo

      if (isValid) {
        const userData = {
          fullName,
          phoneNumber,
          role,
          ...(role === 'commuter' ? { cardNumber } : { employeeNumber }),
          isNewUser: true
        };

        toast({
          title: "Registration Successful!",
          description: `Welcome to GoMetro, ${fullName}!`,
        });

        onSignupComplete(userData);
      } else {
        setError(
          role === 'commuter' 
            ? 'Card number not found in our system. Please check your card number.'
            : 'Employee number not found in our system. Please check your employee number.'
        );
      }
      setIsLoading(false);
    }, 2000);
  };

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
      <Card className="w-full max-w-md backdrop-blur-sm bg-card/95">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            {role === 'commuter' ? (
              <User className="w-8 h-8 text-primary" />
            ) : (
              <IdCard className="w-8 h-8 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {role === 'commuter' ? 'Commuter Registration' : 'Driver Registration'}
          </CardTitle>
          <CardDescription>
            Complete your profile to start using GoMetro
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            {role === 'commuter' ? (
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="cardNumber"
                      type="text"
                      placeholder="Enter your bus card number"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      disabled={isLoading}
                      className="pl-10"
                      required
                    />
                  </div>
                  <QRScanner onScanResult={setCardNumber}>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      className="shrink-0"
                      disabled={isLoading}
                    >
                      <QrCode className="w-4 h-4" />
                    </Button>
                  </QRScanner>
                </div>
                <p className="text-xs text-muted-foreground">
                  Scan the QR code on your physical bus card or enter manually
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="employeeNumber">Employee Number</Label>
                <div className="relative">
                  <IdCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="employeeNumber"
                    type="text"
                    placeholder="Enter your employee number"
                    value={employeeNumber}
                    onChange={(e) => setEmployeeNumber(e.target.value)}
                    disabled={isLoading}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  disabled
                  className="pl-10 bg-muted"
                />
              </div>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>Verified</span>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <Button 
                type="submit"
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? 'Registering...' : 'Complete Registration'}
              </Button>
              
              <Button 
                type="button"
                variant="ghost" 
                onClick={onBackToRoleSelection}
                disabled={isLoading}
                className="w-full"
              >
                Back to Role Selection
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};