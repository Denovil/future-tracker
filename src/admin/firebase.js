import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // ✅ IMPORTANT
import { GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCdjLkAoAq3zNoCBMxuMb6lAUZj3s2BY4o",
  authDomain: "future-tracker-e8f5e.firebaseapp.com",
  projectId: "future-tracker-e8f5e",
  storageBucket: "future-tracker-e8f5e.firebasestorage.app",
  messagingSenderId: "561219388868",
  appId: "1:561219388868:web:ae41ad433eb6219f359091",
  measurementId: "G-WV263XY5VL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize Auth
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();