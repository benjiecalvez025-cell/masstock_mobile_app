/**
 * Enhanced Firestore Service for Masstock Mobile App
 * Comprehensive database operations for products, cart, orders, and store
 */

import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    setDoc,
    Timestamp,
    updateDoc,
    where
} from "firebase/firestore";
import { db } from "./firebase.config";

type FirestoreDoc = any;

// ============ CART OPERATIONS ============

export interface CartItemData {
  productId: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image: string;
  minOrder: number;
  stock: number;
}

export interface ClientCart {
  items: CartItemData[];
  clientInfo: any;
  paymentMode?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export async function getCart(userId: string, clientKey?: string): Promise<CartItemData[]> {
  try {
    const cartRef = doc(db, "carts", userId);
    const snapshot = await getDoc(cartRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      if (clientKey && data[clientKey]) {
        return data[clientKey].items || [];
      }
      // Fallback for old structure
      return data.items || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw error;
  }
}

export async function getAllClientCarts(userId: string): Promise<{ [key: string]: ClientCart }> {
  try {
    const cartRef = doc(db, "carts", userId);
    const snapshot = await getDoc(cartRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      // Filter out fields that aren't client carts
      const carts: { [key: string]: ClientCart } = {};
      for (const key in data) {
        if (data[key].items && Array.isArray(data[key].items)) {
          carts[key] = data[key];
        }
      }
      return carts;
    }
    return {};
  } catch (error) {
    console.error("Error fetching all carts:", error);
    throw error;
  }
}

export async function addToCart(
  userId: string,
  item: CartItemData,
  clientKey?: string,
  clientInfo?: any,
  paymentMode?: string,
): Promise<void> {
  // Firestore rejects undefined — normalise every field to a safe default
  const safeItem: CartItemData = {
    productId: item.productId ?? "",
    name: item.name ?? "",
    category: item.category ?? "",
    price: item.price ?? 0,
    quantity: item.quantity ?? 1,
    image: item.image ?? "",
    minOrder: item.minOrder ?? 1,
    stock: item.stock ?? 0,
  };

  try {
    const cartRef = doc(db, "carts", userId);
    const snapshot = await getDoc(cartRef);
    const key = clientKey || "default";

    if (snapshot.exists()) {
      const cart = snapshot.data();
      const clientCart = cart[key] || { items: [], createdAt: Timestamp.now() };
      const items = clientCart.items || [];
      const existingIndex = items.findIndex(
        (i: CartItemData) => i.productId === safeItem.productId,
      );

      if (existingIndex >= 0) {
        items[existingIndex].quantity += safeItem.quantity;
      } else {
        items.push(safeItem);
      }

      await updateDoc(cartRef, {
        [key]: {
          items,
          clientInfo: clientInfo || clientCart.clientInfo,
          paymentMode: paymentMode || clientCart.paymentMode,
          createdAt: clientCart.createdAt,
          updatedAt: Timestamp.now(),
        },
      });
    } else {
      await setDoc(cartRef, {
        [key]: {
          items: [safeItem],
          clientInfo,
          paymentMode,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        },
      });
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
}

export async function updateCartItem(
  userId: string,
  productId: string,
  quantity: number,
  clientKey?: string,
): Promise<void> {
  try {
    const cartRef = doc(db, "carts", userId);
    const snapshot = await getDoc(cartRef);
    const key = clientKey || "default";

    if (snapshot.exists()) {
      const cart = snapshot.data();
      const clientCart = cart[key];
      if (!clientCart) return;

      const items = clientCart.items || [];
      const itemIndex = items.findIndex(
        (i: CartItemData) => i.productId === productId,
      );

      if (itemIndex >= 0) {
        if (quantity <= 0) {
          items.splice(itemIndex, 1);
        } else {
          items[itemIndex].quantity = quantity;
        }
        await updateDoc(cartRef, {
          [key]: { ...clientCart, items, updatedAt: Timestamp.now() },
        });
      }
    }
  } catch (error) {
    console.error("Error updating cart item:", error);
    throw error;
  }
}

export async function removeFromCart(
  userId: string,
  productId: string,
  clientKey?: string,
): Promise<void> {
  try {
    console.log("=== removeFromCart called ===");
    console.log("userId:", userId);
    console.log("productId:", productId);
    console.log("clientKey:", clientKey);

    const cartRef = doc(db, "carts", userId);
    const snapshot = await getDoc(cartRef);
    const key = clientKey || "default";

    console.log("snapshot.exists():", snapshot.exists());

    if (snapshot.exists()) {
      const cart = snapshot.data();
      const clientCart = cart[key];
      console.log("clientCart before filter:", clientCart);

      if (!clientCart) {
        console.log("clientCart not found for key:", key);
        return;
      }

      const itemsBeforeFilter = clientCart.items || [];
      console.log("items before filter:", itemsBeforeFilter);

      const items = itemsBeforeFilter.filter(
        (i: CartItemData) => i.productId !== productId,
      );
      console.log("items after filter:", items);

      await updateDoc(cartRef, {
        [key]: { ...clientCart, items, updatedAt: Timestamp.now() },
      });

      console.log("=== removeFromCart SUCCESS ===");
      console.log("Firestore updated successfully");
    } else {
      console.log("Cart document does not exist for userId:", userId);
    }
  } catch (error) {
    console.error("=== removeFromCart FAILED ===");
    console.error("Error removing from cart:", error);
    throw error;
  }
}

export async function clearCart(userId: string, clientKey?: string): Promise<void> {
  try {
    const cartRef = doc(db, "carts", userId);
    const key = clientKey || "default";
    const snapshot = await getDoc(cartRef);

    if (snapshot.exists()) {
      const cart = snapshot.data();
      const clientCart = cart[key];
      if (!clientCart) return;

      await updateDoc(cartRef, {
        [key]: { ...clientCart, items: [], updatedAt: Timestamp.now() },
      });
    }
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
}

// ============ ORDER OPERATIONS ============

export interface ClientInfoData {
  completeName: string;
  storeName: string;
  address: string;
  contactNo: string;
  pinLocation: string;
  storeImage: string;
}

export interface OrderData {
  userId: string; // Agent ID
  items: CartItemData[];
  total: number;
  status: "pending" | "packing" | "in-transit" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "completed";
  paymentMethod: string;
  paymentMode?: "cash" | "card" | "check" | "bank-transfer"; // Mode of payment for agent orders
  shippingAddress: string;
  notes?: string;
  // Client information (embedded for agent orders)
  clientInfo?: ClientInfoData;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export async function createOrder(order: OrderData): Promise<string> {
  try {
    console.log("=== createOrder in firestore-enhanced.ts ===");
    console.log("order object:", order);

    const ordersRef = collection(db, "orders");
    const docRef = await addDoc(ordersRef, order);

    console.log("=== createOrder SUCCESS ===");
    console.log("Order created with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("=== createOrder FAILED ===");
    console.error("Error creating order:", error);
    throw error;
  }
}

export async function getUserOrders(userId: string): Promise<OrderData[]> {
  try {
    const q = query(
      collection(db, "orders"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as OrderData & { id: string },
    );
  } catch (error: any) {
    // Check if it's an index error and use fallback
    if (error?.message?.includes("index") || error?.code === "failed-precondition") {
      console.warn("⚠️ Composite index missing in getUserOrders - using fallback");
      const q = query(
        collection(db, "orders"),
        where("userId", "==", userId),
      );
      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as OrderData & { id: string },
      );
      // Sort by createdAt manually
      orders.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
      return orders;
    }
    console.error("Error fetching orders:", error);
    throw error;
  }
}

export async function getOrder(
  orderId: string,
): Promise<(OrderData & { id: string }) | null> {
  try {
    const orderRef = doc(db, "orders", orderId);
    const snapshot = await getDoc(orderRef);
    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data(),
      } as OrderData & { id: string };
    }
    return null;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderData["status"],
  paymentStatus?: OrderData["paymentStatus"],
): Promise<void> {
  try {
    const orderRef = doc(db, "orders", orderId);
    const updateData: any = { status, updatedAt: Timestamp.now() };
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }
    await updateDoc(orderRef, updateData);
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
}

// ============ STORE OPERATIONS ============

export interface StoreData {
  userId: string;
  name: string;
  description: string;
  logo?: string;
  level: "bronze" | "silver" | "gold" | "platinum";
  rating: number;
  credit: number;
  totalSales: number;
  totalOrders: number;
  followers: number;
  verified: boolean;
  createdAt: Timestamp;
}

export async function getStoreProfile(
  userId: string,
): Promise<(StoreData & { id: string }) | null> {
  try {
    const storeRef = doc(db, "stores", userId);
    const snapshot = await getDoc(storeRef);
    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data(),
      } as StoreData & { id: string };
    }
    return null;
  } catch (error) {
    console.error("Error fetching store profile:", error);
    throw error;
  }
}

export async function createStore(store: StoreData): Promise<void> {
  try {
    const storeRef = doc(db, "stores", store.userId);
    await setDoc(storeRef, store);
  } catch (error) {
    console.error("Error creating store:", error);
    throw error;
  }
}

export async function updateStore(
  userId: string,
  updates: Partial<StoreData>,
): Promise<void> {
  try {
    const storeRef = doc(db, "stores", userId);
    await updateDoc(storeRef, updates);
  } catch (error) {
    console.error("Error updating store:", error);
    throw error;
  }
}

export async function getStoreProducts(_userId?: string): Promise<any[]> {
  try {
    const snapshot = await getDocs(collection(db, "products"));
    return snapshot.docs.map((doc: FirestoreDoc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching store products:", error);
    throw error;
  }
}

export async function getStoreOrders(userId: string): Promise<any[]> {
  try {
    const q = query(
      collection(db, "orders"),
      where("sellerId", "==", userId),
      orderBy("createdAt", "desc"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc: FirestoreDoc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching store orders:", error);
    throw error;
  }
}

// ============ INVENTORY & PRICING ============

export interface ProductData {
  id?: string;
  name: string;
  category: string;
  brand: string;
  description: string;
  retailPrice: number;
  wholesalePrice: number;
  stock: number;
  minOrder: number;
  image: string;
  featured?: boolean;
  sellerId?: string;
  rating?: number;
  reviews?: number;
  updatedAt: Timestamp;
}

export async function updateProductPrice(
  productId: string,
  retailPrice: number,
  wholesalePrice: number,
): Promise<void> {
  try {
    const productRef = doc(db, "products", productId);
    await updateDoc(productRef, {
      retailPrice,
      wholesalePrice,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating product price:", error);
    throw error;
  }
}

export async function updateProductStock(
  productId: string,
  stock: number,
): Promise<void> {
  try {
    const productRef = doc(db, "products", productId);
    await updateDoc(productRef, {
      stock,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating product stock:", error);
    throw error;
  }
}

export async function createProduct(product: ProductData): Promise<string> {
  try {
    const productsRef = collection(db, "products");
    const docRef = await addDoc(productsRef, product);
    return docRef.id;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
}

export async function getProduct(
  productId: string,
): Promise<(ProductData & { id: string }) | null> {
  try {
    const productRef = doc(db, "products", productId);
    const snapshot = await getDoc(productRef);
    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data(),
      } as ProductData & { id: string };
    }
    return null;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
}

export async function getAllProducts(): Promise<ProductData[]> {
  try {
    const q = query(collection(db, "products"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as ProductData,
    );
  } catch (error) {
    console.error("Error fetching all products:", error);
    throw error;
  }
}

export async function getInStockProducts(
  limitNum: number = 20,
): Promise<ProductData[]> {
  try {
    const q = query(
      collection(db, "products"),
      where("stock", ">", 0),
      limit(limitNum),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as ProductData,
    );
  } catch (error) {
    console.error("Error fetching in-stock products:", error);
    throw error;
  }
}

export async function getOutOfStockProducts(): Promise<ProductData[]> {
  try {
    const q = query(collection(db, "products"), where("stock", "==", 0));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as ProductData,
    );
  } catch (error) {
    console.error("Error fetching out-of-stock products:", error);
    throw error;
  }
}

// ============ PRODUCT BROWSING ============

export async function getProductsByCategory(
  category: string,
  limitNum: number = 20,
): Promise<ProductData[]> {
  try {
    const q = query(
      collection(db, "products"),
      where("category", "==", category),
      where("stock", ">", 0),
      limit(limitNum),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as ProductData,
    );
  } catch (error) {
    console.error("Error fetching products by category:", error);
    throw error;
  }
}

export async function getFeaturedProducts(
  limitNum: number = 10,
): Promise<ProductData[]> {
  try {
    const q = query(
      collection(db, "products"),
      where("featured", "==", true),
      where("stock", ">", 0),
      limit(limitNum),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as ProductData,
    );
  } catch (error) {
    console.error("Error fetching featured products:", error);
    throw error;
  }
}

export async function getCategories(
  limitNum: number = 50,
): Promise<string[]> {
  try {
    const q = query(
      collection(db, "products"),
      where("stock", ">", 0),
      limit(limitNum),
    );
    const snapshot = await getDocs(q);
    const categories = snapshot.docs
      .map((doc) => ((doc.data().category || "") as string).trim())
      .filter(Boolean);

    return Array.from(new Set(categories)).slice(0, 12);
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}

export async function searchProducts(
  searchTerm: string,
  limitNum: number = 20,
): Promise<ProductData[]> {
  try {
    const q = query(
      collection(db, "products"),
      where("stock", ">", 0),
      limit(limitNum),
    );
    const snapshot = await getDocs(q);
    const searchTermLower = searchTerm.toLowerCase();

    return snapshot.docs
      .filter((doc: FirestoreDoc) => {
        const data = doc.data();
        const name = (data.name || "").toLowerCase();
        const brand = (data.brand || "").toLowerCase();
        const category = (data.category || "").toLowerCase();

        return (
          name.includes(searchTermLower) ||
          brand.includes(searchTermLower) ||
          category.includes(searchTermLower)
        );
      })
      .map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as ProductData,
      );
  } catch (error) {
    console.error("Error searching products:", error);
    throw error;
  }
}

// Assigns sellerId to every product that doesn't have one yet.
// Run once per user to claim products that were imported without a sellerId.
export async function claimUnownedProducts(userId: string): Promise<number> {
  try {
    const snapshot = await getDocs(collection(db, "products"));
    const unclaimed = snapshot.docs.filter(
      (d) => !d.data().sellerId,
    );
    await Promise.all(
      unclaimed.map((d) =>
        updateDoc(doc(db, "products", d.id), {
          sellerId: userId,
          updatedAt: Timestamp.now(),
        }),
      ),
    );
    return unclaimed.length;
  } catch (error) {
    console.error("Error claiming products:", error);
    throw error;
  }
}

export async function deleteProduct(productId: string): Promise<void> {
  try {
    const productRef = doc(db, "products", productId);
    await deleteDoc(productRef);
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
}

export async function updateProduct(
  productId: string,
  data: Partial<Omit<ProductData, "id">>,
): Promise<void> {
  try {
    const productRef = doc(db, "products", productId);
    await updateDoc(productRef, { ...data, updatedAt: Timestamp.now() });
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
}

// ============ UTILITY FUNCTIONS ============

export function calculateDiscount(
  retailPrice: number,
  wholesalePrice: number,
): number {
  if (wholesalePrice >= retailPrice) return 0;
  return Math.round(((retailPrice - wholesalePrice) / retailPrice) * 100);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(price);
}

export function isProductInStock(stock: number): boolean {
  return stock > 0;
}
