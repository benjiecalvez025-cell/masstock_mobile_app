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
import { Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";

// ============ useCart HOOK ============

export function useCart(userId?: string) {
  const [cartItems, setCartItems] = useState<CartItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadCart = async () => {
      try {
        setLoading(true);
        const items = await getCart(userId);
        setCartItems(items);
        setError(null);
      } catch (err) {
        console.error("Error loading cart:", err);
        setError("Failed to load cart");
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [userId]);

  const handleAddToCart = async (item: CartItemData) => {
    try {
      if (!userId) throw new Error("User not authenticated");
      await addToCart(userId, item);
      const updated = await getCart(userId);
      setCartItems(updated);
      setError(null);
    } catch (err) {
      console.error("Error adding to cart:", err);
      setError("Failed to add item to cart");
    }
  };

  const handleUpdateItem = async (productId: string, quantity: number) => {
    try {
      if (!userId) throw new Error("User not authenticated");
      await updateCartItem(userId, productId, quantity);
      const updated = await getCart(userId);
      setCartItems(updated);
      setError(null);
    } catch (err) {
      console.error("Error updating cart item:", err);
      setError("Failed to update cart item");
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      if (!userId) throw new Error("User not authenticated");
      await removeFromCart(userId, productId);
      const updated = await getCart(userId);
      setCartItems(updated);
      setError(null);
    } catch (err) {
      console.error("Error removing from cart:", err);
      setError("Failed to remove item");
    }
  };

  const handleClearCart = async () => {
    try {
      if (!userId) throw new Error("User not authenticated");
      await clearCart(userId);
      setCartItems([]);
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

    const loadOrders = async () => {
      try {
        setLoading(true);
        const userOrders = await getUserOrders(userId);
        // Ensure each order has an `id` field for UI/state typing
        setOrders(
          userOrders.map((o) => ({
            ...(o as any),
            id: (o as any).id || (o as any).orderId,
          })),
        );

        setError(null);
      } catch (err) {
        console.error("Error loading orders:", err);
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [userId]);

  const handleCreateOrder = async (
    items: CartItemData[],
    total: number,
    paymentMethod: string,
    shippingAddress: string,
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
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
      };

      const orderId = await createOrder(order);
      const updated = await getUserOrders(userId);
      setOrders(
        updated.map((o: any) => ({ ...(o as any), id: o.id || o.orderId })),
      );

      setError(null);
      return orderId;
    } catch (err) {
      console.error("Error creating order:", err);
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

  return {
    orders,
    loading,
    error,
    createOrder: handleCreateOrder,
    updateOrderStatus: handleUpdateOrderStatus,
    getOrderById,
    getOrdersByStatus,
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
