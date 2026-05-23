import {
    CartItemData,
    OrderData,
    ProductData,
    StoreData,
    addToCart,
    clearCart,
    createOrder,
    createStore,
    getAllProducts,
    getCart,
    getAllClientCarts,
    getCategories,
    getFeaturedProducts,
    getInStockProducts,
    getOutOfStockProducts,
    getProduct,
    getProductsByCategory,
    getStoreOrders,
    getStoreProducts,
    getStoreProfile,
    getUserOrders,
    removeFromCart,
    searchProducts,
    updateCartItem,
    updateOrderStatus,
    updateProductPrice,
    updateProductStock,
    updateStore,
    createProduct,
    deleteProduct,
    updateProduct,
    claimUnownedProducts,
} from "@/services/firestore-enhanced";
import { Timestamp, doc, onSnapshot, collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/services/firebase.config";

// ============ useCart HOOK ============

export function useCart(userId?: string, clientKey?: string) {
  const [cartItems, setCartItems] = useState<CartItemData[]>([]);
  const [allClientCarts, setAllClientCarts] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const cartRef = doc(db, "carts", userId);

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      cartRef,
      (snapshot) => {
        try {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setAllClientCarts(data);

            // If clientKey is provided, load that specific client's cart
            if (clientKey && data[clientKey]) {
              setCartItems(data[clientKey].items || []);
            } else if (!clientKey) {
              // Fallback for backwards compatibility
              setCartItems(data.items || []);
            }
          } else {
            setAllClientCarts({});
            setCartItems([]);
          }
          setError(null);
          setLoading(false);
        } catch (err) {
          console.error("Error processing cart snapshot:", err);
          setError("Failed to load cart");
          setLoading(false);
        }
      },
      (err) => {
        console.error("Error subscribing to cart:", err);
        setError("Failed to load cart");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, clientKey]);

  const handleAddToCart = async (item: CartItemData, key?: string, clientInfo?: any, paymentMode?: string) => {
    try {
      if (!userId) throw new Error("User not authenticated");
      const finalKey = key || clientKey || "default";
      await addToCart(userId, item, finalKey, clientInfo, paymentMode);
      const updated = await getCart(userId, finalKey);
      setCartItems(updated);
      setError(null);
    } catch (err) {
      console.error("Error adding to cart:", err);
      setError("Failed to add item to cart");
    }
  };

  const handleUpdateItem = async (productId: string, quantity: number, key?: string) => {
    try {
      if (!userId) throw new Error("User not authenticated");
      const finalKey = key || clientKey || "default";
      await updateCartItem(userId, productId, quantity, finalKey);
      // Let the real-time listener update the cart items
      setError(null);
    } catch (err) {
      console.error("Error updating cart item:", err);
      setError("Failed to update cart item");
    }
  };

  const handleRemoveItem = async (productId: string, key?: string) => {
    try {
      console.log("=== handleRemoveItem called ===");
      console.log("productId:", productId);
      console.log("key:", key);
      console.log("userId:", userId);
      console.log("clientKey:", clientKey);

      if (!userId) throw new Error("User not authenticated");
      const finalKey = key || clientKey || "default";
      console.log("finalKey:", finalKey);
      console.log("cartItems before remove:", cartItems);

      await removeFromCart(userId, productId, finalKey);
      console.log("removeFromCart completed");

      // Manually update cart items by filtering out the removed product
      setCartItems(prevItems => {
        const filtered = prevItems.filter(item => item.productId !== productId);
        console.log("State update - filtered cartItems:", filtered);
        return filtered;
      });

      setError(null);
      console.log("=== handleRemoveItem SUCCESS ===");
    } catch (err) {
      console.error("=== handleRemoveItem FAILED ===");
      console.error("Error removing from cart:", err);
      setError("Failed to remove item");
    }
  };

  const handleClearCart = async (key?: string) => {
    try {
      if (!userId) throw new Error("User not authenticated");
      const finalKey = key || clientKey || "default";
      await clearCart(userId, finalKey);
      // Let the real-time listener update the cart items
      setError(null);
    } catch (err) {
      console.error("Error clearing cart:", err);
      setError("Failed to clear cart");
    }
  };

  const getTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };

  const getItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return {
    cartItems,
    allClientCarts,
    loading,
    error,
    addToCart: handleAddToCart,
    updateItem: handleUpdateItem,
    removeItem: handleRemoveItem,
    clearCart: handleClearCart,
    getTotal,
    getItemCount,
  };
}

// ============ FALLBACK ORDERS QUERY ============

// Fallback function for getting orders without composite index
async function getUserOrdersNoIndex(userId: string): Promise<(OrderData & { id: string })[]> {
  try {
    console.log("Using fallback query (no index required)...");
    const q = query(
      collection(db, "orders"),
      where("userId", "==", userId)
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
    console.log("Fallback query returned:", orders.length, "orders");
    return orders;
  } catch (err) {
    console.error("Fallback query also failed:", err);
    throw err;
  }
}

// ============ useOrders HOOK ============

export function useOrders(userId?: string) {
  const [orders, setOrders] = useState<(OrderData & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    let indexFailure = false;

    const q = query(
      collection(db, "orders"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          console.log("=== ORDERS QUERY SUCCESS ===");
          console.log("Orders query returned:", snapshot.docs.length, "documents");
          const userOrders = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as (OrderData & { id: string })[];
          console.log("Processed orders:", userOrders.length);
          userOrders.forEach((order) => {
            console.log("Order ID:", order.id, "Total:", order.total, "Date:", order.createdAt);
          });
          setOrders(userOrders);
          setError(null);
          setLoading(false);
        } catch (err) {
          console.error("Error processing orders snapshot:", err);
          setError("Failed to load orders");
          setLoading(false);
        }
      },
      (err: any) => {
        console.error("=== ORDERS QUERY FAILED ===");
        console.error("Error code:", err?.code);
        console.error("Error message:", err?.message);

        // Check if it's an index error and use fallback
        if (err?.message?.includes("index") || err?.code === "failed-precondition") {
          console.warn("⚠️ Index missing - using fallback query without orderBy");
          indexFailure = true;

          // Use fallback query without index
          getUserOrdersNoIndex(userId)
            .then((orders) => {
              setOrders(orders);
              setError(null);
              setLoading(false);
            })
            .catch((fallbackErr) => {
              console.error("Fallback also failed:", fallbackErr);
              setError("Failed to load orders");
              setLoading(false);
            });
        } else {
          setError("Failed to load orders");
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const handleCreateOrder = async (
    items: CartItemData[],
    total: number,
    paymentMethod: string,
    shippingAddress: string,
    clientInfo?: any,
    paymentMode?: string,
  ): Promise<string | null> => {
    try {
      if (!userId) throw new Error("User not authenticated");

      const order: OrderData = {
        userId,
        items,
        total,
        status: "pending",
        paymentStatus: "pending",
        paymentMethod,
        shippingAddress,
        clientInfo: clientInfo ? {
          completeName: clientInfo.completeName,
          storeName: clientInfo.storeName,
          address: clientInfo.address,
          contactNo: clientInfo.contactNo,
          pinLocation: clientInfo.pinLocation,
          storeImage: clientInfo.storeImage,
        } : undefined,
        paymentMode: paymentMode as any,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      console.log("=== Calling createOrder from firestore-enhanced ===");
      const orderId = await createOrder(order);
      console.log("orderId returned:", orderId);

      if (!orderId) {
        throw new Error("createOrder returned null/undefined orderId");
      }

      console.log("=== Order created successfully ===");
      // Don't fetch orders here - let the real-time listener handle it
      // This avoids needing a Firestore composite index

      setError(null);
      console.log("=== Order creation completed successfully ===");
      return orderId;
    } catch (err: any) {
      console.error("=== Error in handleCreateOrder (useOrders) ===");
      console.error("Error type:", err?.name);
      console.error("Error message:", err?.message);
      console.error("Full error:", err);
      console.error("Error stack:", err?.stack);
      setError("Failed to create order");
      return null;
    }
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    status: OrderData["status"],
    paymentStatus?: OrderData["paymentStatus"],
  ) => {
    try {
      if (!userId) throw new Error("User not authenticated");
      await updateOrderStatus(orderId, status, paymentStatus);
      const updated = await getUserOrders(userId);
      setOrders(
        updated.map((o: any) => ({ ...(o as any), id: o.id || o.orderId })),
      );
      setError(null);
    } catch (err) {
      console.error("Error updating order status:", err);
      setError("Failed to update order status");
    }
  };

  const getOrderById = (orderId: string) => {
    return orders.find((order) => order.id === orderId) || null;
  };

  const getOrdersByStatus = (status: OrderData["status"]) => {
    return orders.filter((order) => order.status === status);
  };

  const refreshOrders = async () => {
    if (!userId) {
      console.log("refreshOrders: No userId");
      return;
    }
    try {
      console.log("=== REFRESHING ORDERS ===");
      console.log("userId:", userId);
      const updated = await getUserOrders(userId);
      console.log("Refreshed orders count:", updated.length);
      updated.forEach((order: any) => {
        console.log("Refreshed order ID:", order.id, "Total:", order.total);
      });
      setOrders(
        updated.map((o: any) => ({ ...(o as any), id: o.id || o.orderId })),
      );
      console.log("Orders state updated");
    } catch (err: any) {
      console.error("=== ERROR REFRESHING ORDERS ===");
      console.error("Error code:", err?.code);
      console.error("Error message:", err?.message);
      console.error("Full error:", err);
    }
  };

  return {
    orders,
    loading,
    error,
    createOrder: handleCreateOrder,
    updateOrderStatus: handleUpdateOrderStatus,
    getOrderById,
    getOrdersByStatus,
    refreshOrders,
  };
}

// ============ useStore HOOK ============

export function useStore(userId?: string) {
  const [store, setStore] = useState<(StoreData & { id: string }) | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [storeOrders, setStoreOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadStore = async () => {
      try {
        setLoading(true);
        const [storeData, storeProducts] = await Promise.all([
          getStoreProfile(userId),
          getStoreProducts(userId),
        ]);
        if (storeData) setStore(storeData);
        setProducts(storeProducts);
        setError(null);
      } catch (err) {
        console.error("Error loading store:", err);
        setError("Failed to load store");
      } finally {
        setLoading(false);
      }
    };

    loadStore();
  }, [userId]);

  const handleCreateStore = async (storeData: StoreData) => {
    try {
      if (!userId) throw new Error("User not authenticated");
      const dataWithUserId = { ...storeData, userId };
      await createStore(dataWithUserId);
      const updated = await getStoreProfile(userId);
      if (updated) setStore(updated);
      setError(null);
      return true;
    } catch (err) {
      console.error("Error creating store:", err);
      setError("Failed to create store");
      return false;
    }
  };

  const handleUpdateStore = async (updates: Partial<StoreData>) => {
    try {
      if (!userId) throw new Error("User not authenticated");
      await updateStore(userId, updates);
      const updated = await getStoreProfile(userId);
      if (updated) setStore(updated);
      setError(null);
    } catch (err) {
      console.error("Error updating store:", err);
      setError("Failed to update store");
    }
  };

  const handleCreateProduct = async (productData: Omit<ProductData, "id">) => {
    try {
      if (!userId) throw new Error("User not authenticated");
      const payload = {
        ...productData,
        sellerId: userId,
        updatedAt: Timestamp.now(),
      };
      const productId = await createProduct(payload);
      const created = await getProduct(productId);
      if (created) {
        setProducts((prev) => [created, ...prev]);
      }
      setError(null);
      return true;
    } catch (err) {
      console.error("Error creating product:", err);
      setError("Failed to create product");
      return false;
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setError(null);
    } catch (err) {
      console.error("Error deleting product:", err);
      setError("Failed to delete product");
    }
  };

  const handleUpdateProduct = async (
    productId: string,
    data: Partial<Omit<ProductData, "id">>,
  ) => {
    try {
      await updateProduct(productId, data);
      const updated = await getProduct(productId);
      if (updated) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? updated : p)),
        );
      }
      setError(null);
    } catch (err) {
      console.error("Error updating product:", err);
      setError("Failed to update product");
    }
  };

  const handleLoadStoreOrders = async () => {
    try {
      if (!userId) throw new Error("User not authenticated");
      const orders = await getStoreOrders(userId);
      setStoreOrders(orders);
      setError(null);
    } catch (err) {
      console.error("Error loading store orders:", err);
      setError("Failed to load store orders");
    }
  };

  const handleUpdateProductPrice = async (
    productId: string,
    retailPrice: number,
    wholesalePrice: number,
  ) => {
    try {
      await updateProductPrice(productId, retailPrice, wholesalePrice);
      setProducts((prev) =>
        prev.map((product) =>
          product.id === productId
            ? { ...product, retailPrice, wholesalePrice }
            : product,
        ),
      );
      setError(null);
    } catch (err) {
      console.error("Error updating price:", err);
      setError("Failed to update price");
    }
  };

  const handleUpdateProductStock = async (productId: string, stock: number) => {
    try {
      await updateProductStock(productId, stock);
      setProducts((prev) =>
        prev.map((product) =>
          product.id === productId ? { ...product, stock } : product,
        ),
      );
      setError(null);
    } catch (err) {
      console.error("Error updating stock:", err);
      setError("Failed to update stock");
    }
  };

  return {
    store,
    products,
    storeOrders,
    loading,
    error,
    createStore: handleCreateStore,
    updateStore: handleUpdateStore,
    loadStoreOrders: handleLoadStoreOrders,
    createProduct: handleCreateProduct,
    updateProductPrice: handleUpdateProductPrice,
    updateProductStock: handleUpdateProductStock,
    deleteProduct: handleDeleteProduct,
    updateProduct: handleUpdateProduct,
    claimProducts: async () => {
      if (!userId) return 0;
      const count = await claimUnownedProducts(userId);
      if (count > 0) {
        const storeProducts = await getStoreProducts(userId);
        setProducts(storeProducts);
      }
      return count;
    },
  };
}

// ============ useProducts HOOK ============

export interface Product extends ProductData {
  id: string;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAll = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      const withIds = data.map((p) => ({ ...p, id: p.id || "" })) as Product[];
      setProducts(withIds);
      setError(null);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getInStock = async () => {
    try {
      setLoading(true);
      const data = await getInStockProducts();
      const withIds = data.map((p) => ({ ...p, id: p.id || "" })) as Product[];
      setProducts(withIds);
      setError(null);
    } catch (err) {
      console.error("Error fetching in-stock products:", err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const getOutOfStock = async () => {
    try {
      setLoading(true);
      const data = await getOutOfStockProducts();
      const withIds = data.map((p) => ({ ...p, id: p.id || "" })) as Product[];
      setProducts(withIds);
      setError(null);
    } catch (err) {
      console.error("Error fetching out-of-stock products:", err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const getByCategory = async (category: string, limit: number = 20) => {
    try {
      setLoading(true);
      const data = await getProductsByCategory(category, limit);
      const withIds = data.map((p) => ({ ...p, id: p.id || "" })) as Product[];
      setProducts(withIds);
      setError(null);
    } catch (err) {
      console.error("Error fetching products by category:", err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const getFeatured = async (limit: number = 10) => {
    try {
      setLoading(true);
      const data = await getFeaturedProducts(limit);
      const withIds = data.map((p) => ({ ...p, id: p.id || "" })) as Product[];
      setProducts(withIds);
      setError(null);
    } catch (err) {
      console.error("Error fetching featured products:", err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const search = async (term: string, limit: number = 20) => {
    try {
      setLoading(true);
      const data = await searchProducts(term, limit);
      const withIds = data.map((p) => ({ ...p, id: p.id || "" })) as Product[];
      setProducts(withIds);
      setError(null);
    } catch (err) {
      console.error("Error searching products:", err);
      setError("Failed to search products");
    } finally {
      setLoading(false);
    }
  };

  const getById = async (productId: string) => {
    try {
      const data = await getProduct(productId);
      return data;
    } catch (err) {
      console.error("Error fetching product:", err);
      return null;
    }
  };

  return {
    products,
    loading,
    error,
    getAllProducts: getAll,
    getInStockProducts: getInStock,
    getOutOfStockProducts: getOutOfStock,
    getProductsByCategory: getByCategory,
    getFeaturedProducts: getFeatured,
    searchProducts: search,
    getProductById: getById,
  };
}

// ============ useCategories HOOK ============

export function useCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await getCategories();
        if (data.length > 0) {
          setCategories(data);
        } else {
          setCategories([
            "Snacks & Soda",
            "Beverages",
            "Dairy & Eggs",
            "Meat & Seafood",
            "Bakery",
            "Electronics",
            "Clothing",
            "Home & Garden",
          ]);
        }
        setError(null);
      } catch (err) {
        console.error("Error loading categories:", err);
        setCategories([
          "Snacks & Soda",
          "Beverages",
          "Dairy & Eggs",
          "Meat & Seafood",
          "Bakery",
          "Electronics",
          "Clothing",
          "Home & Garden",
        ]);
        setError("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  return {
    categories,
    loading,
    error,
  };
}
