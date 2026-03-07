import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// Firebase web config is safe to include in client-side code.
// Security is enforced by Firebase Security Rules, not by hiding this config.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBAp9_BjGzz2PmatSJ1utGovMo5yW1vn_s",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "sentencecraft-ai-b9a49.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "sentencecraft-ai-b9a49",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "sentencecraft-ai-b9a49.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1076596030785",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1076596030785:web:660a4910b20c5120cdb5c0",
};

let app: FirebaseApp;
let auth: Auth | null = null;
let db: Firestore | null = null;
const googleProvider = new GoogleAuthProvider();
export let isFirebaseConfigured = false;

// Robust check for config presence
const hasConfig = 
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.apiKey !== "undefined" && 
  firebaseConfig.projectId !== "undefined";

if (typeof window !== 'undefined') {
  console.log('[Firebase] hasConfig:', hasConfig);
  console.log('[Firebase] apiKey present:', !!firebaseConfig.apiKey);
  console.log('[Firebase] projectId:', firebaseConfig.projectId);
}

if (hasConfig && typeof window !== 'undefined') {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    isFirebaseConfigured = true;
    console.log('[Firebase] Initialized successfully');
  } catch (error) {
    console.error("[Firebase] Initialization error:", error);
    isFirebaseConfigured = false;
  }
}

export { auth, db, googleProvider };
