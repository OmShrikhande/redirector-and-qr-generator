import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAlTeWkzwgJtLeWPKAj-IbbvPZBEiaBcH0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "redirector-596e9.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://redirector-596e9-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "redirector-596e9",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "redirector-596e9.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "685820159763",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:685820159763:web:50874ff954847396c3dce6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);