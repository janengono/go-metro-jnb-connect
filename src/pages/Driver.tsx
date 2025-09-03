import { RequireDriver } from "../context/AuthContext";
import { Dashboard } from "../components/Dashboard";

export default function DriverPage() {
  return (
    <RequireDriver>
      <Dashboard userMode="driver" />
    </RequireDriver>
  );
}
