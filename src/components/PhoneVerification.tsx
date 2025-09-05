import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Phone, Shield, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/firebase/config";

import { signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";

interface PhoneVerificationProps {
  onVerificationComplete: (phoneNumber: string) => void;
}

export const PhoneVerification: React.FC<PhoneVerificationProps> = ({
  onVerificationComplete,
}) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // ✅ SA number validation (+27XXXXXXXXX)
  const validateSAPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\s/g, "");
    const regex = /^\+27\d{9}$/;
    return regex.test(cleaned);
  };


  // ✅ Setup reCAPTCHA safely
  const setupRecaptcha = () => {
    const container = document.getElementById("recaptcha-container");
    if (!container) throw new Error("Recaptcha container not found");

    // Clear old verifier if it exists
    if ((window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier.clear();
    }

    (window as any).recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: () => console.log("reCAPTCHA solved ✅"),
      }
    );

    return (window as any).recaptchaVerifier;
  };

  const handleSendOtp = async () => {
    if (!validateSAPhoneNumber(phoneNumber)) {
      toast({
        title: "Invalid Phone Number",

        description: "Enter a valid SA number (+27...)",

        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const appVerifier = setupRecaptcha();
      const confirmation = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        appVerifier
      );

      (window as any).confirmationResult = confirmation;

      setIsOtpSent(true);

      toast({
        title: "OTP Sent",
        description: `Verification code sent to ${phoneNumber}`,
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error sending OTP",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Verify OTP
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",

        description: "Please enter the 6-digit code",

        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const confirmationResult = (window as any).confirmationResult;
      const result = await confirmationResult.confirm(otp);

      console.log("Verified user:", result.user);

      setIsVerified(true);

      toast({
        title: "Phone Verified!",
        description: "Your number has been verified successfully",
      });


      // move on to role selection after short delay

      setTimeout(() => {
        onVerificationComplete(phoneNumber);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Verification failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (

    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${cityBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
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

            {isVerified ? "Phone Verified!" : ""}

          </CardTitle>
          <CardDescription>
            {isVerified
              ? "You can now proceed to select your role"

              : "Please enter your phone number to get started with GoMetro"}

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
                  {isLoading ? "Sending..." : "Send Verification Code"}
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter Verification Code</Label>
                    <div className="flex justify-center">

                      <InputOTP value={otp} onChange={setOtp} maxLength={6}>

                        <InputOTPGroup>
                          {[0, 1, 2, 3, 4, 5].map((i) => (
                            <InputOTPSlot key={i} index={i} />
                          ))}
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
                      {isLoading ? "Verifying..." : "Verify Code"}
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={() => {
                        setIsOtpSent(false);
                        setOtp("");
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
                <span className="font-medium">
                  Phone Verified Successfully
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Proceeding to role selection...
              </p>
            </div>
          )}
        </CardContent>
      </Card>


      {/* 🔑 Must always exist for Firebase reCAPTCHA */}

      <div id="recaptcha-container"></div>
    </div>
  );
};
