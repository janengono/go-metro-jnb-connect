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
  Plus,
  Users,
  AlertTriangle,
  TrendingUp,
  Navigation,
} from "lucide-react";
import { db } from "../lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  onSnapshot as onDocSnapshot,
  DocumentData,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { VirtualCard } from "@/components/VirtualCard";

type UserMode = "commuter" | "driver";

interface BusType {
  id: string;
  bus_number: string;
  route_id: string;
  capacity: number;
  current_capacity: number;
  status: string;
}

interface RouteType {
  id: string;
  route_name: string;
  start_point: string;
  end_point: string;
  stops: string[];
}

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

interface ReportType {
  busId: string;
  type: string;
  details: string;
  timestamp: string;
  reporterId?: string | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ userMode, userData }) => {
  const { user } = useAuth();
  const [bus, setBus] = useState<BusType | null>(null);
  const [route, setRoute] = useState<RouteType | null>(null);
  const [loading, setLoading] = useState(true);
  const [newCapacity, setNewCapacity] = useState<number | "">("");
  const [topUpAmount, setTopUpAmount] = useState<number>();
  const [showTopUp, setShowTopUp] = useState(false);
  const [nearbyBuses, setNearbyBuses] = useState<BusType[]>([]);
  const [selectedBus, setSelectedBus] = useState<BusType | null>(null);
  const [currentReport, setCurrentReport] = useState<ReportType | null>(null);

  const quickAmounts = [50, 100, 200, 300];
  const driverId = user?.uid;

  // ---------------- DRIVER: Capacity update ----------------
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

  // ---------------- DRIVER: Subscribe to assigned bus ----------------
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

  // ---------------- DRIVER: Subscribe to route ----------------
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

  // ---------------- COMMUTER: Nearby buses ----------------
  useEffect(() => {
    if (userMode !== "commuter") return;
    const q = query(collection(db, "buses"));
    const unsub = onSnapshot(q, (snapshot) => {
      const buses: BusType[] = snapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          bus_number: data.bus_number,
          route_id: data.route_id,
          capacity: data.capacity,
          current_capacity: data.current_capacity,
          status: data.status,
        };
      });
      setNearbyBuses(buses);
      if (buses.length > 0 && !selectedBus) setSelectedBus(buses[0]);
    });
    return () => unsub();
  }, [userMode, selectedBus]);

  // ---------------- Subscribe to latest report ----------------
  useEffect(() => {
    const targetBusId = userMode === "driver" ? bus?.id : selectedBus?.id;
    if (!targetBusId) return;

    const reportRef = doc(db, "reports", targetBusId);
    const unsub = onDocSnapshot(reportRef, (snap) => {
      if (!snap.exists()) {
        setCurrentReport(null);
        return;
      }
      const data = snap.data() as ReportType;
      setCurrentReport(data);
    });
    return () => unsub();
  }, [bus?.id, selectedBus?.id, userMode]);

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

        {/* Last Report */}
        {currentReport && (
          <Card className="metro-card mt-4">
            <h3 className="metro-subheading mb-2">Last Report</h3>
            <p>
              <strong>Type:</strong> {currentReport.type}
            </p>
            <p>
              <strong>Details:</strong> {currentReport.details}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Reported at:</strong>{" "}
              {new Date(currentReport.timestamp).toLocaleString()}
            </p>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="card-elevated animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <QuickReport userMode={userMode} bus={bus} user={user} />
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---------------- COMMUTER VIEW ----------------
  return (
    <div className="p-4 space-y-6">
      {/* Virtual Card */}
      <div className="flex justify-center">
        <VirtualCard
          cardNumber={userData.cardNumber || "0000000000000000"}
          balance={87.5}
          holderName={userData.fullName}
          className="mb-2"
        />
      </div>

      {/* Balance Actions */}
      <Card className="metro-card">
        <div className="flex justify-center">
          <Button className="w-full max-w-sm" onClick={() => setShowTopUp(true)}>
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
            <Button variant="ghost" size="sm" onClick={() => setShowTopUp(false)}>
              ✕
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Please enter a minimum of R50
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(Number(e.target.value))}
                className="text-lg"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-foreground mb-2">Quick Amounts</p>
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

            <div className="flex justify-center mt-4">
              {topUpAmount && topUpAmount >= 50 ? (
                <TopUp topUpAmount={topUpAmount} onClose={() => setShowTopUp(false)} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Enter R50 or more to enable Google Pay
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Nearby Buses */}
      <Card className="metro-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="metro-subheading">Nearby Buses</h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary"
            onClick={() => {}}
          >
            Refresh
          </Button>
        </div>
        <div className="space-y-3">
          {nearbyBuses.map((bus, index) => (
            <div
              key={bus.id}
              className={`flex items-center justify-between p-4 rounded-xl metro-fade-in cursor-pointer ${
                selectedBus?.id === bus.id ? "bg-primary/20" : "bg-muted/30"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => setSelectedBus(bus)}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Bus className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Bus {bus.bus_number}</p>
                  <p className="text-sm text-muted-foreground">Route: {bus.route_id}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">ETA unknown</span>
                </div>
                <StatusIndicator status={bus.status as "online" | "warning" | "offline"} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Last Report */}
      {currentReport && (
        <Card className="metro-card mt-4">
          <h3 className="metro-subheading mb-2">Last Report</h3>
          <p>
            <strong>Type:</strong> {currentReport.type}
          </p>
          <p>
            <strong>Details:</strong> {currentReport.details}
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Reported at:</strong>{" "}
            {new Date(currentReport.timestamp).toLocaleString()}
          </p>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="card-elevated animate-slide-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedBus && (
            <QuickReport userMode={userMode} bus={selectedBus} user={user} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
