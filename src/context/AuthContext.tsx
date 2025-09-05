import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDoc,updateDoc } from "firebase/firestore";

// Firestore schema for users
export type FirestoreUser = {
  full_name: string;
  role: "driver" | "commuter" | "admin";
  phone_number?: string;
  employee_number?: string | null;
  card_number?: string | null;
  balance?: number;
};

export type AppUser = {
  uid: string;
  role: "driver" | "commuter" | "admin";
  full_name: string;
  employee_number: string;
};

const AuthCtx = createContext<{ user: AppUser | null; loading: boolean }>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (fbUser: User | null) => {
    if (!fbUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    const snap = await getDoc(doc(db, "users", fbUser.uid));
    if (!snap.exists()) {
      setUser(null);
      setLoading(false);
      return;
    }

    const data = snap.data() as FirestoreUser;

      setUser({
        uid: fbUser.uid,
        role: data.role,
        full_name: data.full_name,
        employee_number: data.employee_number || "",
      });

      setLoading(false);
    });
    /*setUser({
        uid:"001",
        full_name: "Annah Mlimi",
        role:"driver",
        employee_number:"EMP-001",
        
    });
    setLoading(false);*/
    return () => unsubscribe();
  }, []);


  return (
    <AuthCtx.Provider value={{ user, loading }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}

// Gate that ensures the user is a driver
export function RequireDriver({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-6">Loading…</div>;
  if (!user) return <div className="p-6">Please log in as a driver.</div>;
  if (user.role !== "driver") return <div className="p-6">Driver access only.</div>;
  return <>{children}</>;
}
