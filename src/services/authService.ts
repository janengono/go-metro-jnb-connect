import {
  onAuthStateChanged,
  signOut,
  User
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";

class AuthService {
  // ✅ Validate bus card exists in database
  async validateBusCard(cardNumber: string) {
    try {
      if (!/^\d{16}$/.test(cardNumber)) {
        return { valid: false, error: "Card number must be 16 digits" };
      }

      const q = query(
        collection(db, "busCards"),
        where("cardNumber", "==", cardNumber)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return { valid: false, error: "Invalid card number" };
      }

      const cardData = querySnapshot.docs[0].data();

      if (cardData.blocked) {
        return { valid: false, error: "Card is blocked" };
      }

      if (!cardData.active) {
        return { valid: false, error: "Card is not active" };
      }

      if (cardData.expiryDate) {
        const expiryDate = new Date(cardData.expiryDate);
        if (expiryDate < new Date()) {
          return { valid: false, error: "Card has expired" };
        }
      }

      return { valid: true, cardData };
    } catch (error) {
      console.error("Error validating bus card:", error);
      return { valid: false, error: "Error validating card" };
    }
  }

  // ✅ Save user profile after phone auth
  async saveUserProfile(
    uid: string,
    role: "commuter" | "driver",
    data: Record<string, any>
  ) {
    try {
      await setDoc(
        doc(db, "users", uid),
        {
          uid,
          role,
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ✅ Verify employee exists AND is a driver
  async verifyEmployee(employeeNumber: string, cellphoneNumber: string) {
    try {
      const q = query(
        collection(db, "employees"),
        where("employeeNumber", "==", employeeNumber),
        where("cellphoneNumber", "==", cellphoneNumber),
        where("active", "==", true)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return { valid: false, error: "Invalid employee credentials" };
      }

      const employeeData = querySnapshot.docs[0].data();

      if (!employeeData.position || employeeData.position !== "Driver") {
        return { valid: false, error: "You are not registered as a Driver" };
      }

      return { valid: true, employeeData };
    } catch (error) {
      console.error("Error verifying employee:", error);
      return { valid: false, error: "Error verifying employee" };
    }
  }

  // ✅ Sign out
  async signout() {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === "driver") {
          await setDoc(
            doc(db, "users", user.uid),
            { status: "offline" },
            { merge: true }
          );
        }
      }
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ✅ Get current user data
  async getCurrentUserData() {
    const user = auth.currentUser;
    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      return userDoc.exists() ? userDoc.data() : null;
    }
    return null;
  }

  // ✅ Listen to auth state
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
}

export default new AuthService();
