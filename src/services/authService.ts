import {
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
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
  // ✅ Save user profile after phone auth
async saveUserProfile(
  uid: string,
  role: "commuter" | "driver",
  data: Record<string, any>
) {
  try {
    // 1. Check if phone number already exists
    const q = query(collection(db, "users"), where("phoneNumber", "==", data.phoneNumber));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const existingUser = querySnapshot.docs[0].data();

      if (role === "commuter") {
        // Must match cardNumber + fullName
        if (
          existingUser.cardNumber !== data.cardNumber ||
          existingUser.fullName !== data.fullName
        ) {
          return { success: false, error: "Phone already linked to another commuter" };
        }
      }

      if (role === "driver") {
        // Must match employeeNumber + fullName + position + active
        if (
          existingUser.employeeNumber !== data.employeeNumber ||
          existingUser.fullName !== data.fullName
        ) {
          return { success: false, error: "Phone already linked to another driver" };
        }

        // Double-check employee record
        const empDoc = await getDocs(
          query(
            collection(db, "employees"),
            where("employeeNumber", "==", data.employeeNumber),
            where("active", "==", true)
          )
        );

        if (
          empDoc.empty ||
          empDoc.docs[0].data().position !== "Driver"
        ) {
          return { success: false, error: "Not a valid driver" };
        }
      }

      // If passed validation, just update updatedAt
      await setDoc(
        doc(db, "users", existingUser.uid),
        { updatedAt: serverTimestamp() },
        { merge: true }
      );
      return { success: true, existing: true };
    }

    // 2. Create new user if phone is not taken
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

    return { success: true, new: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}


  // ✅ Verify employee exists AND is a driver
  async verifyEmployee(employeeNumber: string, cellphoneNumber: string) {
    try {
       // Normalize phone number to +27 format
      const normalizePhone = (num: string) => {
        if (num.startsWith("0")) {
          return "+27" + num.substring(1);
        }
        return num;
      };

      const normalizedPhone = normalizePhone(cellphoneNumber);
      const q = query(
        collection(db, "employees"),
        where("employeeNumber", "==", employeeNumber),
        where("cellphoneNumber", "==", normalizedPhone),
        where("active", "==", true)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return { valid: false, error: "Invalid employee credentials" };
      }

      const employeeData = querySnapshot.docs[0].data();

      if (employeeData.position !== "Driver") {
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
