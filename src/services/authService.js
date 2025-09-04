import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';

class AuthService {
  // Validate bus card exists in database
  async validateBusCard(cardNumber) {
    try {
      // Validate card number format (16 digits)
      if (!/^\d{16}$/.test(cardNumber)) {
        return { valid: false, error: 'Card number must be 16 digits' };
      }

      const q = query(
        collection(db, 'busCards'),
        where('cardNumber', '==', cardNumber),
        where('active', '==', true),
        where('blocked', '==', false)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const cardData = querySnapshot.docs[0].data();
        // Check if card is not expired
        const expiryDate = new Date(cardData.expiryDate);
        const today = new Date();
        
        if (expiryDate < today) {
          return { valid: false, error: 'Card has expired' };
        }
        
        return { valid: true, cardData };
      }
      
      return { valid: false, error: 'Invalid card number' };
    } catch (error) {
      console.error('Error validating bus card:', error);
      return { valid: false, error: 'Error validating card' };
    }
  }

  // Sign up for commuters
  async signupCommuter(fullName, email, password, cardNumber, cellphoneNumber) {
    try {
      // Validate bus card first
      const cardValidation = await this.validateBusCard(cardNumber);
      if (!cardValidation.valid) {
        return { success: false, error: cardValidation.error };
      }

      // Check if card is already registered to another user
      const existingUserQuery = query(
        collection(db, 'users'),
        where('cardNumber', '==', cardNumber)
      );
      const existingUsers = await getDocs(existingUserQuery);
      
      if (!existingUsers.empty) {
        return { success: false, error: 'This card is already registered to another account' };
      }

      // Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        userType: 'commuter',
        fullName,
        email,
        cellphoneNumber,
        cardNumber,
        balance: 0,
        profileImage: null,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });

      return { success: true, user };
    } catch (error) {
      // If user creation fails after auth, delete the auth account
      if (auth.currentUser) {
        await auth.currentUser.delete();
      }
      return { success: false, error: error.message };
    }
  }

  // Sign up for drivers (with employee verification)
  async signupDriver(fullName, password, employeeNumber, cellphoneNumber) {
    try {
      // First, verify employee exists
      const employeeVerification = await this.verifyEmployee(employeeNumber, cellphoneNumber);
      if (!employeeVerification.valid) {
        return { success: false, error: employeeVerification.error };
      }

      // Check if employee is already registered
      const existingDriverQuery = query(
        collection(db, 'users'),
        where('employeeNumber', '==', employeeNumber)
      );
      const existingDrivers = await getDocs(existingDriverQuery);
      
      if (!existingDrivers.empty) {
        return { success: false, error: 'This employee number is already registered' };
      }

      // Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        userType: 'driver',
        fullName,
        cellphoneNumber,
        employeeNumber,
        busNumber: employeeVerification.employeeData.busNumber,
        verified: true,
        currentRoute: null,
        status: 'offline',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });

      return { success: true, user };
    } catch (error) {
      // If user creation fails after auth, delete the auth account
      if (auth.currentUser) {
        await auth.currentUser.delete();
      }
      return { success: false, error: error.message };
    }
  }

  // Verify employee exists in database
  async verifyEmployee(employeeNumber, cellphoneNumber) {
    try {
      const q = query(
        collection(db, 'employees'),
        where('employeeNumber', '==', employeeNumber),
        where('cellphoneNumber', '==', cellphoneNumber),
        where('active', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const employeeData = querySnapshot.docs[0].data();
        
        // Verify the employee is a driver
        if (employeeData.position !== 'Driver') {
          return { valid: false, error: 'Employee is not registered as a driver' };
        }
        
        return { valid: true, employeeData };
      }
      
      return { valid: false, error: 'Invalid employee credentials' };
    } catch (error) {
      console.error('Error verifying employee:', error);
      return { valid: false, error: 'Error verifying employee' };
    }
  }

  // Sign in
  async signin(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        await signOut(auth);
        return { success: false, error: 'User profile not found' };
      }
      
      const userData = userDoc.data();
      
      // Update last login
      await setDoc(doc(db, 'users', user.uid), {
        lastLogin: serverTimestamp()
      }, { merge: true });

      return { success: true, user, userData };
    } catch (error) {
      let errorMessage = 'Sign in failed';
      
      switch(error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        default:
          errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  }

  // Sign out
  async signout() {
    try {
      // Update user status if driver
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().userType === 'driver') {
          await setDoc(doc(db, 'users', user.uid), {
            status: 'offline'
          }, { merge: true });
        }
      }
      
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get current user data
  async getCurrentUserData() {
    const user = auth.currentUser;
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      return userDoc.exists() ? userDoc.data() : null;
    }
    return null;
  }

  // Listen to auth state changes
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }
}

export default new AuthService();