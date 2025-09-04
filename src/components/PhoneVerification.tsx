import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Phone, Shield, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import cityBackground from '@/assets/city-background.jpg';

interface PhoneVerificationProps {
  onVerificationComplete: (phoneNumber: string) => void;
}

export const PhoneVerification: React.FC<PhoneVerificationProps> = ({ onVerificationComplete }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsOtpSent(true);
      setIsLoading(false);
      toast({
        title: "OTP Sent",
        description: `Verification code sent to ${phoneNumber}`,
      });
    }, 1500);
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit verification code",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsVerified(true);
      setIsLoading(false);
      toast({
        title: "Phone Verified!",
        description: "Your phone number has been successfully verified",
      });
      // Wait a moment before calling the callback
      setTimeout(() => {
        onVerificationComplete(phoneNumber);
      }, 1000);
    }, 1500);
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
            {isVerified ? (
              <CheckCircle className="w-8 h-8 text-green-500" />
            ) : (
              <Phone className="w-8 h-8 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {isVerified ? 'Phone Verified!' : 'Verify Your Phone'}
          </CardTitle>
          <CardDescription>
            {isVerified 
              ? 'You can now proceed to select your role'
              : 'Enter your phone number to get started with GoMetro'
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {!isVerified && (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+27 XX XXX XXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={isOtpSent}
                  className="text-lg"
                />
              </div>

              {!isOtpSent ? (
                <Button 
                  onClick={handleSendOtp}
                  disabled={isLoading || !phoneNumber}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? 'Sending...' : 'Send Verification Code'}
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter Verification Code</Label>
                    <div className="flex justify-center">
                      <InputOTP
                        value={otp}
                        onChange={setOtp}
                        maxLength={6}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Code sent to {phoneNumber}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      onClick={handleVerifyOtp}
                      disabled={isLoading || otp.length !== 6}
                      className="w-full"
                      size="lg"
                    >
                      {isLoading ? 'Verifying...' : 'Verify Code'}
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        setIsOtpSent(false);
                        setOtp('');
                      }}
                      className="w-full"
                    >
                      Change Phone Number
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {isVerified && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <Shield className="w-5 h-5" />
                <span className="font-medium">Phone Verified Successfully</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Proceeding to role selection...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};