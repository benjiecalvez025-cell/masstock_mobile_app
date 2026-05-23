import { ProductCard } from "@/components/product-card";
import { ProductDetailModal } from "@/components/modals/product-detail-modal";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";
import { useAppContext } from "@/context/app-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Product, useCategories, useCart, useProducts } from "@/hooks/use-firestore";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Older ProductCard usage expects rating/reviews fields.
// Firestore ProductData currently doesn't include them, so we treat them as optional.
type ProductWithRating = Product & { rating?: number; reviews?: number };

export default function BrowseScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<ProductWithRating[]>(
    [],
  );
  const [visibleProducts, setVisibleProducts] = useState<ProductWithRating[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [sortBy, setSortBy] = useState<
    "popular" | "price-low" | "price-high" | "rating"
  >("popular");

  const { user } = useAppContext();
  const { products, loading: productsLoading } = useProducts();
  const { categories } = useCategories();
  const { addToCart } = useCart(user?.id);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [featureModalVisible, setFeatureModalVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const toastAnimation = useRef(new Animated.Value(80)).current;

  const handleOpenDetails = (product: Product) => {
    setSelectedProduct(product);
    setDetailVisible(true);
  };

  const handleAddSelectedProduct = async (productId: string, quantity: number) => {
    if (!user) {
      setToastType("error");
      setToastMessage("Please sign in to add items to your cart.");
      return;
    }

    if (!selectedProduct) {
      setToastType("error");
      setToastMessage("Please choose a product before adding to cart.");
      return;
    }

    const item = {
      productId: selectedProduct.id,
      id: selectedProduct.id,
      name: selectedProduct.name,
      category: selectedProduct.category,
      price: selectedProduct.wholesalePrice,
      quantity,
      image: selectedProduct.image,
      minOrder: selectedProduct.minOrder,
      stock: selectedProduct.stock,
    };

    try {
      await addToCart(item);
      setToastType("success");
      setToastMessage(`${selectedProduct.name} has been added to your cart.`);
      setDetailVisible(false);
    } catch (error) {
      console.error("Add to cart failed:", error);
      setToastType("error");
      setToastMessage("Unable to add this item to the cart. Please try again.");
    }
  };

  const handleQuickAddToCart = async (product: Product) => {
    if (!user) {
      setToastType("error");
      setToastMessage("Please sign in to add items to your cart.");
      return;
    }

    const item = {
      productId: product.id,
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.wholesalePrice,
      quantity: product.minOrder,
      image: product.image,
      minOrder: product.minOrder,
      stock: product.stock,
    };

    try {
      await addToCart(item);
      setToastType("success");
      setToastMessage(`${product.name} has been added to your cart.`);
    } catch (error) {
      console.error("Quick add to cart failed:", error);
      setToastType("error");
      setToastMessage("Unable to add this item to the cart. Please try again.");
    }
  };

  const renderProductItem = ({ item }: { item: ProductWithRating }) => (
    <ProductCard
      key={item.id}
      id={item.id || ""}
      name={item.name}
      category={item.category}
      price={item.wholesalePrice}
      originalPrice={item.retailPrice}
      image={item.image}
      minOrder={item.minOrder}
      rating={item.rating}
      reviews={item.reviews}
      onPress={() => handleOpenDetails(item)}
      onAction={() => handleQuickAddToCart(item)}
      actionLabel="Add"
    />
  );

  useEffect(() => {
    if (!toastMessage) return;

    Animated.spring(toastAnimation, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 8,
    }).start();

    const hideTimeout = setTimeout(() => {
      Animated.timing(toastAnimation, {
        toValue: 80,
        duration: 220,
        useNativeDriver: true,
      }).start(() => {
        setToastMessage(null);
      });
    }, 2800);

    return () => clearTimeout(hideTimeout);
  }, [toastMessage, toastAnimation]);

  useEffect(() => {
    const filterAndSort = () => {
      let filtered: ProductWithRating[] =
        products as unknown as ProductWithRating[];

      if (selectedCategory) {
        filtered = filtered.filter((p) => p.category === selectedCategory);
      }

      if (searchQuery.trim()) {
        const searchTerm = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(searchTerm) ||
            p.brand?.toLowerCase().includes(searchTerm) ||
            p.category.toLowerCase().includes(searchTerm),
        );
      }

      switch (sortBy) {
        case "price-low":
          filtered.sort(
            (a, b) =>
              (a.wholesalePrice || a.retailPrice || 0) -
              (b.wholesalePrice || b.retailPrice || 0),
          );
          break;
        case "price-high":
          filtered.sort(
            (a, b) =>
              (b.wholesalePrice || b.retailPrice || 0) -
              (a.wholesalePrice || a.retailPrice || 0),
          );
          break;
        case "rating":
          filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case "popular":
        default:
          filtered.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
      }

      setFilteredProducts(filtered);
      setPage(1);
    };

    filterAndSort();
  }, [products, searchQuery, selectedCategory, sortBy]);

  useEffect(() => {
    const nextVisible = filteredProducts.slice(0, page * pageSize);
    setVisibleProducts(nextVisible);
  }, [filteredProducts, page]);

  const handleLoadMore = () => {
    if (visibleProducts.length < filteredProducts.length) {
      setPage((current) => current + 1);
    }
  };

  const hasMoreProducts = visibleProducts.length < filteredProducts.length;

  if (productsLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading products...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Browse Products</Text>

      </View>
      <FlatList
        data={visibleProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderProductItem}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        initialNumToRender={10}
        contentContainerStyle={styles.productsSection}
        ListHeaderComponent={
          <>
            <View style={styles.searchContainer}>
              <View
                style={[
                  styles.searchBar,
                  { backgroundColor: colors.cardBg, borderColor: colors.border },
                ]}
              >
                <MaterialIcons
                  name="search"
                  size={20}
                  color={colors.textSecondary}
                />
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholder="Search products..."
                  placeholderTextColor={colors.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}> 
                    <MaterialIcons
                      name="close"
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.categoriesSection}>
              <FlatList
                data={[
                  { id: "all", title: "All Products" },
                  ...categories.map((cat: string) => ({ id: cat, title: cat })),
                ]}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.categoryTab,
                      {
                        backgroundColor:
                          selectedCategory === item.id
                            ? colors.primary
                            : colors.cardBg,
                        borderColor:
                          selectedCategory === item.id
                            ? colors.primary
                            : colors.border,
                      },
                    ]}
                    onPress={() =>
                      setSelectedCategory(item.id === "all" ? "" : item.id)
                    }
                  >
                    <Text
                      style={[
                        styles.categoryTabText,
                        {
                          color:
                            selectedCategory === item.id ||
                            (item.id === "all" && !selectedCategory)
                              ? "#fff"
                              : colors.text,
                        },
                      ]}
                    >
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesScroll}
              />
            </View>

            <View style={[styles.sortContainer, { paddingHorizontal: Spacing.lg }]}> 
              <TouchableOpacity
                style={[
                  styles.sortButton,
                  { backgroundColor: colors.cardBg, borderColor: colors.border },
                ]}
                onPress={() => setFeatureModalVisible(true)}
              >
                <MaterialIcons
                  name="checklist"
                  size={18}
                  color={colors.text}
                />
                <Text style={[styles.sortButtonText, { color: colors.text }]}> 
                  Necessary features
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sortButton,
                  { backgroundColor: colors.cardBg, borderColor: colors.border },
                ]}
                onPress={() => {
                  const sortOptions: (
                    | "popular"
                    | "price-low"
                    | "price-high"
                    | "rating"
                  )[] = ["popular", "price-low", "price-high", "rating"];
                  const currentIndex = sortOptions.indexOf(sortBy);
                  const nextIndex = (currentIndex + 1) % sortOptions.length;
                  setSortBy(sortOptions[nextIndex]);
                }}
              >
                <MaterialIcons name="sort" size={18} color={colors.text} />
                <Text style={[styles.sortButtonText, { color: colors.text }]}> 
                  Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.resultsInfo, { paddingHorizontal: Spacing.lg }]}> 
              <Text style={[styles.resultsText, { color: colors.textSecondary }]}> 
                {filteredProducts.length} products found
              </Text>
            </View>

            {filteredProducts.length === 0 && (
              <View style={styles.emptyState}>
                <MaterialIcons
                  name="search-off"
                  size={64}
                  color={colors.textSecondary}
                />
                <Text style={[styles.emptyTitle, { color: colors.text }]}> 
                  No products found
                </Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}> 
                  Try adjusting your search or filters
                </Text>
              </View>
            )}
          </>
        }
        ListFooterComponent={
          <View style={styles.footerContainer}>
            {hasMoreProducts ? (
              <TouchableOpacity
                style={[styles.loadMoreButton, { backgroundColor: colors.primary }]}
                onPress={handleLoadMore}
              >
                <Text style={styles.loadMoreText}>Load more</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ height: Spacing.xxxl }} />
            )}
          </View>
        }
        ListEmptyComponent={
          filteredProducts.length === 0 ? null : undefined
        }
      />

      <ProductDetailModal
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        product={selectedProduct}
        onAddToCart={handleAddSelectedProduct}
      />

      <Modal
        visible={featureModalVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.featureOverlay}>
          <View style={[styles.featureModal, { backgroundColor: colors.surface }]}> 
            <Text style={[styles.featureTitle, { color: colors.text }]}>Necessary Browse Features</Text>
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>Browse wholesale products with fast filters, stock visibility, minimum order guidance, and one-tap add to cart.</Text>
            <View style={styles.featureList}>
              <Text style={[styles.featureBullet, { color: colors.text }]}>• Stock count shown per product</Text>
              <Text style={[styles.featureBullet, { color: colors.text }]}>• Wholesale pricing with retail comparison</Text>
              <Text style={[styles.featureBullet, { color: colors.text }]}>• Quick product detail modal for quantity selection</Text>
              <Text style={[styles.featureBullet, { color: colors.text }]}>• One-tap add to cart directly from the product card</Text>
            </View>
            <TouchableOpacity
              style={[styles.featureCloseButton, { backgroundColor: colors.primary }]}
              onPress={() => setFeatureModalVisible(false)}
            >
              <Text style={styles.featureCloseText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {toastMessage ? (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              backgroundColor:
                toastType === "success" ? colors.primary : colors.danger,
              transform: [{ translateY: toastAnimation }],
              opacity: toastAnimation.interpolate({
                inputRange: [0, 80],
                outputRange: [1, 0],
              }),
            },
          ]}
        >
          <View style={styles.toastContent}>
            <MaterialIcons
              name={toastType === "success" ? "shopping-cart" : "error-outline"}
              size={18}
              color="#fff"
              style={styles.toastIcon}
            />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: Spacing.lg,
    fontSize: Typography.fontSizes.md,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingTop: Spacing.xxl,
  },
  headerTitle: {
    fontSize: Typography.fontSizes.xxxl,
    fontWeight: Typography.fontWeights.bold,
    color: "#fff",
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSizes.md,
  },
  categoriesSection: {
    paddingVertical: Spacing.lg,
  },
  categoriesScroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  categoryTab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  categoryTabText: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
  },
  productRow: {
    justifyContent: "space-between",
    paddingHorizontal: 0,
  },
  productsSection: {
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  sortContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  sortButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  sortButtonText: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.medium,
  },
  resultsInfo: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  resultsText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xxxl,
  },
  emptyTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    marginTop: Spacing.lg,
  },
  featureOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  featureModal: {
    width: "100%",
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  featureTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: Spacing.sm,
  },
  featureText: {
    fontSize: Typography.fontSizes.md,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  featureList: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  featureBullet: {
    fontSize: Typography.fontSizes.sm,
  },
  featureCloseButton: {
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  featureCloseText: {
    color: "#fff",
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
  },
  toastContainer: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  toastContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  toastIcon: {
    marginRight: Spacing.sm,
  },
  toastText: {
    color: "#fff",
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
    textAlign: "center",
  },
  emptyText: {
    fontSize: Typography.fontSizes.md,
    marginTop: Spacing.sm,
  },
  footerContainer: {
    paddingVertical: Spacing.lg,
    alignItems: "center",
  },
  loadMoreButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
  },
  loadMoreText: {
    color: "#fff",
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
  },
});
