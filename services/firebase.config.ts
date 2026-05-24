import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

import Constants from "expo-constants";

// Firebase configuration - Masstock App
// Project: masstock-app
const expoExtra = (Constants.expoConfig?.extra || (Constants.manifest as any)?.extra || {}) as Record<string, any>;

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAh839VuyHxVBuXgdCVrUrcFjI07wIvvsU",
  authDomain: "masstock-app.firebaseapp.com",
  projectId: "masstock-app",
  storageBucket: "masstock-app.appspot.com",
  messagingSenderId: "1048213734901",
  appId: "1:1048213734901:web:ee709f87b02cd48d518cbc",
  measurementId: "G-SW1RX3GEE6",
};

const firebaseConfig = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
    expoExtra.EXPO_PUBLIC_FIREBASE_API_KEY ||
    DEFAULT_FIREBASE_CONFIG.apiKey,
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    expoExtra.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    DEFAULT_FIREBASE_CONFIG.authDomain,
  projectId:
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ||
    expoExtra.EXPO_PUBLIC_FIREBASE_PROJECT_ID ||
    DEFAULT_FIREBASE_CONFIG.projectId,
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    expoExtra.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    DEFAULT_FIREBASE_CONFIG.storageBucket,
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    expoExtra.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    DEFAULT_FIREBASE_CONFIG.messagingSenderId,
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ||
    expoExtra.EXPO_PUBLIC_FIREBASE_APP_ID ||
    DEFAULT_FIREBASE_CONFIG.appId,
  measurementId:
    process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID ||
    expoExtra.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID ||
    DEFAULT_FIREBASE_CONFIG.measurementId,
};

const missingRequiredFields =
  !firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId;

if (missingRequiredFields) {
  console.warn(
    "Firebase configuration appears incomplete. Falling back to default app config.",
    firebaseConfig,
  );
}

// Reuse the existing app instance on hot reload
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export { firebaseConfig as resolvedFirebaseConfig };
export default app;
