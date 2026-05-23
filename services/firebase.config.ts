import { initializeApp } from 'firebase/app';
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
  messagingSenderId: "105365672865418221",
  appId: "1:105365672865418221:web:8d9b7c6e5f4a3b2c1d0e",
  measurementId: "G-MASSTOCK-APP",
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
    expoExtra.EXPO_PUBLIC_MEASUREMENT_ID ||
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

let firebaseAppConfig = firebaseConfig;
let app;

try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.warn(
    "Firebase initializeApp failed with resolved config. Retrying default config.",
    error,
  );
  app = initializeApp(DEFAULT_FIREBASE_CONFIG);
  firebaseAppConfig = DEFAULT_FIREBASE_CONFIG;
}

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Enable emulators in development (optional)
if (process.env.NODE_ENV === 'development') {
  // Uncomment these lines to use Firebase emulators locally
  // connectFirestoreEmulator(db, 'localhost', 8080);
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectStorageEmulator(storage, 'localhost', 9199);
}

if (__DEV__) {
  console.log("Resolved Firebase config:", firebaseAppConfig);
}

export const resolvedFirebaseConfig = firebaseAppConfig;
export default app;
