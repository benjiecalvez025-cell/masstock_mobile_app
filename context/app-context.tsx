import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

let AsyncStorage: any = null;
try {
  // Avoid hard crash if native module isn't available on some setups/platforms
   
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: PropsWithChildren) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const setUser = (newUser: User) => {
    setUserState(newUser);
  };

  const logout = async () => {
    try {
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

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);

        if (!AsyncStorage) {
          setUserState(null);
          return;
        }

        const userRaw = await AsyncStorage.getItem("user");
        if (!userRaw) {
          setUserState(null);
          return;
        }

        const parsed = JSON.parse(userRaw);

        setUserState({
          id: parsed.id,
          name:
            parsed.name ||
            `${parsed.firstName || ""} ${parsed.lastName || ""}`.trim() ||
            "User",
          email: parsed.email,
          phone: parsed.phone || "",
          ewallet: parsed.eWallet ?? parsed.ewallet ?? 0,
        });
      } catch (error) {
        console.error("Error loading user from storage:", error);
        setUserState(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
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
