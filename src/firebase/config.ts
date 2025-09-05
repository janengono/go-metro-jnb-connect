// src/firebase/config.ts

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDIZbvvFG3_Q93KJ4v99ZHSnqvBAHQVHRI",
  authDomain: "gometrohackathon.firebaseapp.com",
  projectId: "gometrohackathon",
  storageBucket: "gometrohackathon.appspot.com",
  messagingSenderId: "244176999298",
  appId: "1:244176999298:web:7634de83752eaa1d14f59b",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Named exports ✅
export const auth = getAuth(app);
export const db = getFirestore(app);

// Default export (if you ever need just the app)
export default app;
