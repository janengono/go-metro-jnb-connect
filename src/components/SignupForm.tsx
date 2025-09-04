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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AuthService from "@/services/authService";
import { auth } from "@/firebase/config";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  // ✅ Validation
  const validateForm = async () => {
    if (!fullName.trim()) {
      setError("Full name is required");
      return false;
    }

    if (role === "commuter") {
      if (!email.trim() || !email.includes("@")) {
        setError("A valid email address is required");
        return false;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters long");
        return false;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return false;
      }

      if (!cardNumber.trim() || cardNumber.length !== 16) {
        setError("Bus card number must be exactly 16 digits");
        return false;
      }

      const cardExists = await AuthService.validateBusCard(cardNumber);
      if (!cardExists) {
        setError(
          "Bus card number not found. Please check your card or contact support."
        );
        return false;
      }
    }

    if (role === "driver") {
      if (!employeeNumber.trim()) {
        setError("Employee number is required");
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
      if (role === "commuter") {
        const result = await AuthService.signupCommuter(
          fullName,
          email,
          password,
          cardNumber,
          phoneNumber
        );

        if (result.success) {
          toast({
            title: "Success!",
            description: "Commuter account created successfully",
          });
          onSignupComplete({
            fullName,
            email,
            role,
            cardNumber,
            phoneNumber,
          });
        } else {
          setError(result.error || "Signup failed");
        }
      } else if (role === "driver") {
        const user = auth.currentUser;
        if (!user) throw new Error("No authenticated user found");

        const result = await AuthService.saveUserProfile(user.uid, "driver", {
          fullName,
          employeeNumber,
          phoneNumber,
        });

        if (result.success) {
          toast({
            title: "Success!",
            description: "Driver account created successfully",
          });
          onSignupComplete({
            fullName,
            role,
            employeeNumber,
            phoneNumber,
          });
        } else {
          setError(result.error || "Signup failed");
        }
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
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
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Bus Card Number</Label>
                  <div className="relative">
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
                  <p className="text-sm text-muted-foreground">
                    Enter the 16-digit number from your Metro Bus card
                  </p>
                </div>
              </>
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
