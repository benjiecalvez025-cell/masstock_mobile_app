import { auth, db } from "./firebase.config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  UserCredential,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

let AsyncStorage: any = null;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch (error) {
  AsyncStorage = null;
}

export interface FirebaseUserResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    eWallet: number;
  };
  token: string;
  source?: string;
}

export function isNetworkError(error: any) {
  const status = error?.response?.status;
  return !!(
    error?.message === "Network Error" ||
    error?.code === "ERR_NETWORK" ||
    (error?.request && !error?.response) ||
    status === 404 ||
    status >= 500
  );
}

export function parseFirebaseAuthError(error: any) {
  const code = String(error?.code || error?.message || "").toLowerCase();

  if (code.includes("auth/email-already-in-use")) {
    return "Email is already registered. Please sign in or use a different email.";
  }
  if (code.includes("auth/invalid-email")) {
    return "Invalid email address. Please enter a valid email.";
  }
  if (code.includes("auth/weak-password")) {
    return "Password is too weak. Use at least 6 characters.";
  }
  if (code.includes("auth/user-not-found")) {
    return "Account not found. Please sign up or check your email address.";
  }
  if (code.includes("auth/wrong-password")) {
    return "Incorrect password. Please try again.";
  }
  if (code.includes("auth/configuration-not-found")) {
    return "Firebase configuration not found. Please restart Expo and verify .env settings.";
  }
  if (code.includes("auth/network-request-failed")) {
    return "Network error. Check your internet connection and try again.";
  }

  return error?.message || "Firebase authentication failed.";
}

async function saveFirebaseUser(user: any, token: string) {
  const userData = {
    id: user.id,
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    phone: user.phone || "",
    eWallet: user.eWallet ?? 0,
  };

  try {
    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("user", JSON.stringify(userData));
  } catch (error) {
    console.warn("Failed to persist Firebase auth user data:", error);
  }

  return {
    user: userData,
    token,
  };
}

export async function signupWithFirebase(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
): Promise<FirebaseUserResponse & { source: "firebase" }> {
  const credential: UserCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );

  const firebaseUser = credential.user;
  const userDoc = doc(db, "users", firebaseUser.uid);
  const userProfile = {
    firstName,
    lastName,
    email,
    phone: "",
    eWallet: 0,
  };

  await setDoc(userDoc, userProfile, { merge: true });
  const token = await firebaseUser.getIdToken();

  return {
    ...(await saveFirebaseUser(
      {
        id: firebaseUser.uid,
        firstName,
        lastName,
        email,
        phone: "",
        eWallet: 0,
      },
      token,
    )),
    source: "firebase",
  };
}

export async function loginWithFirebase(
  email: string,
  password: string,
): Promise<FirebaseUserResponse> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const firebaseUser = credential.user;
  const userDoc = doc(db, "users", firebaseUser.uid);
  const snapshot = await getDoc(userDoc);

  const profile = snapshot.exists()
    ? snapshot.data()
    : {
        firstName: "",
        lastName: "",
        email,
        phone: "",
        eWallet: 0,
      };

  const token = await firebaseUser.getIdToken();

  return {
    ...(await saveFirebaseUser(
      {
        id: firebaseUser.uid,
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || email,
        phone: profile.phone || "",
        eWallet: profile.eWallet ?? 0,
      },
      token,
    )),
    source: "firebase",
  };
}

export async function logoutFirebase() {
  await firebaseSignOut(auth);
  try {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
  } catch (error) {
    console.warn("Failed to clear Firebase auth storage:", error);
  }
}
