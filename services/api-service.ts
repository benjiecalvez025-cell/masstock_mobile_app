import Constants from "expo-constants";
import { Platform } from "react-native";
import axios, { AxiosInstance } from "axios";
import * as FirestoreService from "./firestore-service";
import {
  isNetworkError,
  loginWithFirebase,
  logoutFirebase,
  signupWithFirebase,
} from "./auth-service";

let AsyncStorage: any = null;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch (e) {
  AsyncStorage = null;
}

const LOCALHOST_PATTERNS = /(localhost|127\.0\.0\.1)/i;
const HOST_OVERRIDE = process.env.EXPO_PUBLIC_API_HOST;

function getRuntimeHost() {
  const manifest = Constants.manifest as any;
  const expoConfig = Constants.expoConfig as any;

  const packagerHost =
    manifest?.packagerOpts?.hostUri ||
    manifest?.debuggerHost ||
    expoConfig?.extra?.debuggerHost ||
    expoConfig?.extra?.hostUri;

  if (typeof packagerHost === "string") {
    return packagerHost.split(":")[0];
  }

  if (Platform.OS === "android") {
    return "10.0.2.2";
  }

  return null;
}

function resolveApiUrl() {
  const rawUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001/api";
  if (!LOCALHOST_PATTERNS.test(rawUrl)) {
    return rawUrl;
  }

  const host = HOST_OVERRIDE || getRuntimeHost();
  if (!host) {
    console.warn(
      "EXPO_PUBLIC_API_URL is configured with localhost, but no runtime host could be resolved. Set EXPO_PUBLIC_API_HOST to your machine LAN IP for physical devices.",
    );
    return rawUrl;
  }

  const resolvedUrl = rawUrl.replace(LOCALHOST_PATTERNS, host);
  console.log(`Resolved API URL: ${rawUrl} -> ${resolvedUrl}`);
  return resolvedUrl;
}

const API_URL = resolveApiUrl();

export function getResolvedApiUrl() {
  return API_URL;
}

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor for token
    this.api.interceptors.request.use(async (config: any) => {
      try {
        if (AsyncStorage) {
          const token = await AsyncStorage.getItem("token");
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
      } catch (err) {
        console.warn("AsyncStorage unavailable in request interceptor:", err);
      }
      return config;
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response: any) => response,
      async (error: any) => {
        try {
          if (error.response?.status === 401) {
            // Token expired, clear and redirect to login
            if (AsyncStorage) {
              await AsyncStorage.removeItem("token");
              await AsyncStorage.removeItem("user");
            }
            // Trigger logout event
            alert("Session expired. Please login again.");
          }
        } catch (e) {
          console.warn("Error handling 401 response:", e);
        }
        return Promise.reject(error);
      },
    );
  }

  // Auth Methods
  async signup(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) {
    try {
      const response = await this.api.post("/auth/signup", {
        email,
        password,
        firstName,
        lastName,
      });

      if (response.data?.success !== true) {
        throw new Error(
          response.data?.message || "Signup failed: backend did not return success",
        );
      }

      try {
        if (AsyncStorage) {
          await AsyncStorage.setItem("token", response.data.data.token);
          await AsyncStorage.setItem(
            "user",
            JSON.stringify(response.data.data.user),
          );
        }
      } catch (e) {
        console.warn("AsyncStorage unavailable during signup persistence:", e);
      }

      return response.data.data;
    } catch (error: any) {
      if (isNetworkError(error)) {
        console.warn("Backend unavailable, falling back to Firebase signup.");
        return {
          ...(await signupWithFirebase(email, password, firstName, lastName)),
          source: "firebase",
        };
      }
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      const response = await this.api.post("/auth/login", {
        email,
        password,
      });

      if (response.data?.success !== true) {
        throw new Error(
          response.data?.message || "Login failed: backend did not return success",
        );
      }

      try {
        if (AsyncStorage) {
          await AsyncStorage.setItem("token", response.data.data.token);
          await AsyncStorage.setItem(
            "user",
            JSON.stringify(response.data.data.user),
          );
        }
      } catch (e) {
        console.warn("AsyncStorage unavailable during login persistence:", e);
      }

      return response.data.data;
    } catch (error: any) {
      if (isNetworkError(error)) {
        console.warn("Backend unavailable, falling back to Firebase login.");
        return loginWithFirebase(email, password);
      }
      throw error;
    }
  }

  async logout() {
    try {
      await logoutFirebase();
    } catch (e) {
      console.warn("Firebase logout failed, clearing storage only:", e);
      try {
        if (AsyncStorage) {
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("user");
        }
      } catch (removeError) {
        console.warn("AsyncStorage unavailable during logout:", removeError);
      }
    }
  }

  // Product Methods
  async getProducts(filters?: {
    category?: string;
    search?: string;
    limit?: number;
    skip?: number;
  }) {
    try {
      // Try backend API first
      const response = await this.api.get("/products", { params: filters });
      return response.data;
    } catch (error) {
      // Fall back to Firestore if backend is unavailable
      console.log("Backend API unavailable, using Firestore for products");

      if (filters?.search) {
        return await FirestoreService.searchProducts(filters.search);
      } else if (filters?.category) {
        return await FirestoreService.getProductsByCategory(filters.category);
      } else {
        return await FirestoreService.getProducts(filters?.limit || 50);
      }
    }
  }

  async getProduct(id: string) {
    try {
      const response = await this.api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      // Fall back to Firestore
      return await FirestoreService.getProductByCode(id);
    }
  }

  async createProduct(data: any) {
    const response = await this.api.post("/products", data);
    return response.data;
  }

  // Cart Methods
  async getCart() {
    const response = await this.api.get("/cart");
    return response.data;
  }

  async addToCart(productId: string, quantity: number) {
    const response = await this.api.post("/cart", {
      productId,
      quantity,
    });
    return response.data;
  }

  async updateCartItem(itemId: string, quantity: number) {
    const response = await this.api.put(`/cart/${itemId}`, { quantity });
    return response.data;
  }

  async removeFromCart(itemId: string) {
    const response = await this.api.delete(`/cart/${itemId}`);
    return response.data;
  }

  // Order Methods
  async getOrders(status?: string) {
    const response = await this.api.get("/orders", {
      params: status ? { status } : undefined,
    });
    return response.data;
  }

  async getOrder(id: string) {
    const response = await this.api.get(`/orders/${id}`);
    return response.data;
  }

  async createOrder(paymentMethod: string, shippingAddress: string) {
    const response = await this.api.post("/orders", {
      paymentMethod,
      shippingAddress,
    });
    return response.data;
  }

  // Payment Methods
  async processPayment(orderId: string, method: string, stripeToken?: string) {
    const response = await this.api.post("/payments", {
      orderId,
      method,
      stripeToken,
    });
    return response.data;
  }

  // Profile Methods
  async getProfile() {
    const response = await this.api.get("/profile");
    return response.data;
  }

  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    city?: string;
    province?: string;
    postalCode?: string;
  }) {
    const response = await this.api.put("/profile", data);
    return response.data;
  }
}

export const apiService = new ApiService();
