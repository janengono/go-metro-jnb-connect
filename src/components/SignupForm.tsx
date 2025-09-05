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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  CreditCard,
  IdCard,
  Phone,
  AlertCircle,
  CheckCircle,

  QrCode,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QRScanner } from "@/components/QRScanner";
import AuthService from "@/services/authService";
import { auth } from "@/lib/firebase.ts";
import cityBackground from "@/assets/hero-bg.jpg";


type UserRole = "commuter" | "driver";

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
  onBackToRoleSelection,
}) => {
  const [fullName, setFullName] = useState("");

  const [cardNumber, setCardNumber] = useState("");
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const validateForm = async () => {
    if (!fullName.trim()) {
      setError("Full name is required");
      return false;
    }

    if (role === "commuter") {

      if (!cardNumber.trim() || cardNumber.length !== 16) {
        setError("Bus card number must be exactly 16 digits");
        return false;
      }

      const cardCheck = await AuthService.validateBusCard(cardNumber);
      if (!cardCheck.valid) {
        setError(cardCheck.error || "Invalid bus card");

        return false;
      }
    }

    if (role === "driver") {
      if (!employeeNumber.trim()) {
        setError("Employee number is required");
        return false;
      }


      const check = await AuthService.verifyEmployee(employeeNumber, phoneNumber);
      if (!check.valid) {
        setError(check.error || "Employee verification failed");
        return false;
      }

    }

    return true;
  };

  // ✅ Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const isValid = await validateForm();
    if (!isValid) return;

    setIsLoading(true);

    try {

      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

      let result;

      if (role === "commuter") {
        result = await AuthService.saveUserProfile(user.uid, "commuter", {

          fullName,
          employeeNumber,
          phoneNumber,

          role,
          cardNumber,
        });
      } else if (role === "driver") {
        result = await AuthService.saveUserProfile(user.uid, "driver", {
          fullName,
          phoneNumber,
          role,
          employeeNumber,
        });
      }

      if (result.success) {
        toast({
          title: "Success!",
          description: `${
            role === "commuter" ? "Commuter" : "Driver"
          } account created successfully`,
        });

        onSignupComplete({
          fullName,
          phoneNumber,
          role,
          ...(role === "commuter" ? { cardNumber } : { employeeNumber }),
        });
      } else {
        setError(result.error || "Signup failed");

      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (

    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${cityBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Card className="w-full max-w-md backdrop-blur-sm bg-card/95">

        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            {role === "commuter" ? (
              <User className="w-8 h-8 text-primary" />
            ) : (
              <IdCard className="w-8 h-8 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {role === "commuter"
              ? "Commuter Registration"
              : "Driver Registration"}
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
              />
            </div>

            {role === "commuter" && (

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">

                    <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="cardNumber"
                      type="text"
                      placeholder="1234567890123456"
                      value={cardNumber}
                      onChange={(e) =>
                        setCardNumber(e.target.value.replace(/\D/g, ""))
                      }
                      disabled={isLoading}
                      className="pl-10"
                      maxLength={16}
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

            )}

            {role === "driver" && (
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
                {isLoading ? "Registering..." : "Complete Registration"}
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
