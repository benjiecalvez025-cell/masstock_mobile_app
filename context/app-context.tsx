import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/services/firebase.config";
import { ClientInfo, PaymentMode } from "@/types/client";

let AsyncStorage: any = null;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch {
  AsyncStorage = null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  ewallet: number;
}

export interface CartItemData {
  productId: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image: string;
  minOrder: number;
  stock: number;
  id?: string; // allow mapping from Firestore
}

export interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  logout: () => void;

  // Minimal cart/order/payment API so screens can compile.
  // Full implementation can be wired later.
  cart: (CartItemData & { id: string })[];
  removeFromCart: (itemId: string) => void;
  updateCartItem: (itemId: string, quantity: number) => void;
  getCartTotal: () => number;
  loading: boolean;
  createOrder: (
    paymentMethod: string,
    shippingAddress: string,
  ) => Promise<void>;
  processPayment: (orderId: string, method: string) => Promise<void>;

  // Agent order flow: client info and payment mode
  clientInfo: ClientInfo | null;
  paymentMode: PaymentMode | null;
  setClientInfo: (info: ClientInfo | null) => void;
  setPaymentMode: (mode: PaymentMode | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: PropsWithChildren) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [paymentMode, setPaymentMode] = useState<PaymentMode | null>(null);

  const setUser = (newUser: User) => {
    setUserState(newUser);
  };

  const logout = async () => {
    try {
      await signOut(auth);
      if (AsyncStorage) {
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user");
      }
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setUserState(null);
    }
  };

  // Drive user state from Firebase Auth — this fires on app start (restoring
  // persisted session) and on every sign-in / sign-out.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Auth is confirmed — enrich with cached profile from AsyncStorage
          let profile: any = {};
          if (AsyncStorage) {
            const raw = await AsyncStorage.getItem("user");
            if (raw) profile = JSON.parse(raw);
          }
          setUserState({
            id: firebaseUser.uid,
            name:
              profile.name ||
              `${profile.firstName || ""} ${profile.lastName || ""}`.trim() ||
              firebaseUser.displayName ||
              "User",
            email: firebaseUser.email || profile.email || "",
            phone: profile.phone || "",
            ewallet: profile.eWallet ?? profile.ewallet ?? 0,
          });
        } else {
          // No Firebase Auth session — clear state and storage
          setUserState(null);
          if (AsyncStorage) {
            await AsyncStorage.multiRemove(["token", "user"]);
          }
        }
      } catch (error) {
        console.error("Error syncing auth state:", error);
        setUserState(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value: AppContextType = {
    user,
    isAuthenticated: user !== null,
    setUser,
    logout,
    loading,

    cart: [],
    removeFromCart: () => {},
    updateCartItem: () => {},
    getCartTotal: () => 0,
    createOrder: async () => {},
    processPayment: async () => {},

    clientInfo,
    paymentMode,
    setClientInfo,
    setPaymentMode,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
}

// Backward-compatible alias (some screens import `useApp`)
export function useApp() {
  return useAppContext();
}
