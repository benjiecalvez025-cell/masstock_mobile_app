import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    query,
    where
} from "firebase/firestore";
import { db } from "./firebase.config";

type FirestoreDoc = any;

/**
 * Firestore service for the Masstock mobile app
 * Handles all database queries and operations
 */

// ============ PRODUCTS ============

export async function getProducts(limitNum: number = 20, offset: number = 0) {
  try {
    const snapshot = await getDocs(
      query(collection(db, "products"), limit(limitNum + offset)),
    );

    const products = snapshot.docs.slice(offset).map((doc: FirestoreDoc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

export async function getProductByCode(productCode: string) {
  try {
    const docRef = doc(db, "products", productCode);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data(),
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
}

export async function getProductsByCategory(
  category: string,
  limitNum: number = 20,
) {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, "products"),
        where("category", "==", category),
        limit(limitNum),
      ),
    );

    return snapshot.docs.map((doc: FirestoreDoc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching products by category:", error);
    throw error;
  }
}

export async function searchProducts(
  searchTerm: string,
  limitNum: number = 20,
) {
  try {
    const snapshot = await getDocs(
      query(collection(db, "products"), limit(limitNum)),
    );

    const searchTermLower = searchTerm.toLowerCase();
    const results = snapshot.docs
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
      .map((doc: FirestoreDoc) => ({
        id: doc.id,
        ...doc.data(),
      }));

    return results;
  } catch (error) {
    console.error("Error searching products:", error);
    throw error;
  }
}

export async function getProductsByBrand(brand: string, limitNum: number = 20) {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, "products"),
        where("brand", "==", brand),
        limit(limitNum),
      ),
    );

    return snapshot.docs.map((doc: FirestoreDoc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching products by brand:", error);
    throw error;
  }
}

export async function getFeaturedProducts(limitNum: number = 10) {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, "products"),
        where("featured", "==", true),
        limit(limitNum),
      ),
    );

    return snapshot.docs.map((doc: FirestoreDoc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching featured products:", error);
    throw error;
  }
}

export async function getProductsByPriceRange(
  minPrice: number,
  maxPrice: number,
  limitNum: number = 20,
) {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, "products"),
        where("retailPrice", ">=", minPrice),
        where("retailPrice", "<=", maxPrice),
        limit(limitNum),
      ),
    );

    return snapshot.docs.map((doc: FirestoreDoc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching products by price range:", error);
    throw error;
  }
}

export async function getInStockProducts(limitNum: number = 20) {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, "products"),
        where("stock", ">", 0),
        limit(limitNum),
      ),
    );

    return snapshot.docs.map((doc: FirestoreDoc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching in-stock products:", error);
    throw error;
  }
}

// ============ USERS ============

export async function getUserProfile(userId: string) {
  try {
    const docRef = doc(db, "users", userId);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data(),
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
}

// ============ METADATA ============

export async function getInventorySummary() {
  try {
    const docRef = doc(db, "metadata", "inventory_summary");
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      return snapshot.data();
    }

    return null;
  } catch (error) {
    console.error("Error fetching inventory summary:", error);
    throw error;
  }
}

export async function getCategories() {
  try {
    const summary = await getInventorySummary();
    return summary?.categories || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}

// ============ UTILITY FUNCTIONS ============

export function getProductImageUrl(
  productCode: string,
  imageIndex: number = 0,
) {
  // Placeholder for product image URLs
  // In a real app, these would be stored in Firebase Storage
  return `https://via.placeholder.com/200?text=${productCode}`;
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(price);
}

export function calculateDiscount(retailPrice: number, wholesalePrice: number) {
  if (wholesalePrice >= retailPrice) return 0;
  return Math.round(((retailPrice - wholesalePrice) / retailPrice) * 100);
}
