import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/StatusIndicator";
import { Input } from "@/components/ui/input";
import { TopUp } from "@/components/TopUp";
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
  Navigation,
} from "lucide-react";
import { auth, db } from "../lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  onSnapshot as onDocSnapshot,
  DocumentData,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { VirtualCard } from "@/components/VirtualCard";

type UserMode = "commuter" | "driver";

type BusType = {
  id: string;
  bus_number: string;
  route_id: string;
  capacity: number;
  current_capacity: number;
  status: string;
};

type RouteType = {
  id: string;
  route_name: string;
  start_point: string;
  end_point: string;
  stops: string[];
};

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
  const { user } = useAuth();
  const [bus, setBus] = useState<BusType | null>(null);
  const [route, setRoute] = useState<RouteType | null>(null);
  const [loading, setLoading] = useState(true);
  const [newCapacity, setNewCapacity] = useState<number | "">("");
  const [topUpAmount, setTopUpAmount] = useState<number>();
  const [showTopUp, setShowTopUp] = useState(false);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [balanceLoading, setBalanceLoading] = useState(true);

  const quickAmounts = [50, 100, 200, 300];
  const driverId = user?.uid;

  // Initialize user document with balance if it doesn't exist
  const initializeUserDocument = async () => {
    if (!user?.uid) return;
    
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // Create user document with initial balance
        await setDoc(userDocRef, {
          ...userData,
          balance: 0,
          transactions: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } else {
        // Check if balance field exists, if not add it
        const data = userDoc.data();
        if (data.balance === undefined) {
          await updateDoc(userDocRef, {
            balance: 0,
            transactions: data.transactions || 0,
            updatedAt: new Date()
          });
        }
      }
    } catch (error) {
      console.error("Error initializing user document:", error);
    }
  };

  // Subscribe to user balance changes
  useEffect(() => {
    if (!user?.uid) return;
    
    // Initialize user document first
    initializeUserDocument();
    
    const userDocRef = doc(db, "users", user.uid);
    const unsubscribe = onDocSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setUserBalance(data.balance || 0);
      }
      setBalanceLoading(false);
    });
    
    return () => unsubscribe();
  }, [user?.uid]);

  // Capacity update
  const handleCapacityUpdate = async () => {
    if (!bus || newCapacity === "") return;
    try {
      const updated = Number(newCapacity);
      await updateDoc(doc(db, "buses", bus.id), {
        current_capacity: updated,
      });
      setBus({ ...bus, current_capacity: updated });
      setNewCapacity("");
    } catch (err) {
      console.error("Error updating capacity:", err);
    }
  };

  // Subscribe to bus assigned to driver
  useEffect(() => {
    if (!driverId) return;
    const q = query(collection(db, "buses"), where("driver_id", "==", driverId));
    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) {
        setBus(null);
        setRoute(null);
        setLoading(false);
        return;
      }
      const bDoc = snap.docs[0];
      const bData = bDoc.data() as DocumentData;
      setBus({
        id: bDoc.id,
        bus_number: bData.bus_number,
        route_id: bData.route_id,
        capacity: bData.capacity,
        current_capacity: bData.current_capacity,
        status: bData.status,
      });
      setLoading(false);
    });
    return () => unsub();
  }, [driverId]);

  // Subscribe to route doc
  useEffect(() => {
    if (!bus?.route_id) return;
    const unsub = onDocSnapshot(doc(db, "routes", bus.route_id), (snap) => {
      if (!snap.exists()) {
        setRoute(null);
        return;
      }
      const r = snap.data() as DocumentData;
      setRoute({
        id: snap.id,
        route_name: r.route_name,
        start_point: r.start_point,
        end_point: r.end_point,
        stops: r.stops || [],
      });
    });
    return () => unsub();
  }, [bus?.route_id]);

  // Handle balance update callback
  const handleBalanceUpdate = (incrementAmount: number) => {
    // Don't update local state - let Firestore listener handle it
    // This prevents double updates
    setTopUpAmount(undefined);
  };

  // Handle top-up modal close
  const handleTopUpClose = () => {
    setShowTopUp(false);
    setTopUpAmount(undefined);
  };

  if (loading) return <div className="p-6">Loading dashboard…</div>;

  // ---------------- DRIVER VIEW ----------------
  if (userMode === "driver") {
    if (!bus) return <div className="p-6">No bus assigned yet.</div>;

    return (
      <div className="p-4 space-y-6">
        {/* Driver Status Card */}
        <Card className="metro-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="metro-subheading">Driver Dashboard</h2>
            <StatusIndicator status={bus.status as "online" | "warning"} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">
                {route?.stops.length ?? 0}
              </p>
              <p className="text-sm text-muted-foreground">Stops</p>
            </div>

            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <Users className="w-6 h-6 text-secondary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">
                {bus.current_capacity}
              </p>
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
              <span className="text-lg font-semibold">
                {bus.current_capacity} / {bus.capacity}
              </span>
            </div>

            <div className="w-full bg-muted rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${
                  bus.current_capacity > 80
                    ? "bg-alert"
                    : bus.current_capacity > 60
                    ? "bg-status-warning"
                    : "bg-primary"
                }`}
                style={{
                  width: `${(bus.current_capacity / bus.capacity) * 100}%`,
                }}
              />
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Navigation className="w-4 h-4" />
              <span>Route: {route?.route_name ?? "N/A"}</span>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <input
              type="number"
              min={0}
              max={bus.capacity}
              value={newCapacity}
              onChange={(e) => setNewCapacity(Number(e.target.value))}
              placeholder="Enter new capacity"
              className="w-full p-2 border rounded-lg bg-background"
            />
            <Button
              className="metro-button-primary w-full mt-4"
              onClick={handleCapacityUpdate}
              disabled={newCapacity === ""}
            >
              Update Capacity
            </Button>
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
  }

  // ---------------- COMMUTER VIEW ----------------
  const nearbyBuses = [
    {
      number: "243",
      route: "Sandton → Soweto",
      eta: "3 min",
      capacity: 85,
      status: "online" as const,
    },
    {
      number: "156",
      route: "Rosebank → Alexandra",
      eta: "7 min",
      capacity: 45,
      status: "online" as const,
    },
    {
      number: "089",
      route: "CBD → Midrand",
      eta: "12 min",
      capacity: 95,
      status: "warning" as const,
    },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Virtual Card */}
      <div className="flex justify-center">
        {balanceLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <VirtualCard
            cardNumber={userData.cardNumber || "0000000000000000"}
            balance={userBalance}
            holderName={userData.fullName}
            className="mb-2"
          />
        )}
      </div>

      {/* Balance Actions */}
      <Card className="metro-card">
        <div className="flex justify-center">
          <Button
            className="w-full max-w-sm"
            onClick={() => setShowTopUp(true)}
            disabled={balanceLoading}
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
              onClick={handleTopUpClose}
            >
              ✕
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Current Balance: R{userBalance.toFixed(2)}
              </label>
              <label className="block text-sm font-medium text-foreground mb-2">
                Please enter a minimum of R50
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={topUpAmount || ""}
                onChange={(e) => setTopUpAmount(Number(e.target.value))}
                className="text-lg"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-foreground mb-2">
                Quick Amounts
              </p>
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
              {topUpAmount && topUpAmount >= 50 ? (
                <TopUp
                  topUpAmount={topUpAmount}
                  onClose={handleTopUpClose}
                  onBalanceUpdate={handleBalanceUpdate}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Enter R50 or more to enable Google Pay
                </p>
              )}
            </div>

            {topUpAmount && topUpAmount >= 50 && (
              <div className="text-center pt-2 border-t">
                <p className="text-sm text-muted-foreground">
                  New balance will be: R{(userBalance + topUpAmount).toFixed(2)}
                </p>
              </div>
            )}
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
                <StatusIndicator status={bus.status} />
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