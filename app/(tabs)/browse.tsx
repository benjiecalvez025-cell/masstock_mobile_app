import ClientInfoModal from "@/components/ClientInfoModal";
import { ProductDetailModal } from "@/components/modals/product-detail-modal";
import PaymentModeModal from "@/components/PaymentModeModal";
import { ProductCard } from "@/components/product-card";
import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from "@/constants/theme";
import { useAppContext } from "@/context/app-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  Product,
  useCart,
  useCategories,
  useClients,
  useProducts,
} from "@/hooks/use-firestore";
import { ClientInfo, PaymentMode } from "@/types/client";
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
  const [visibleProducts, setVisibleProducts] = useState<ProductWithRating[]>(
    [],
  );
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [sortBy, setSortBy] = useState<
    "popular" | "price-low" | "price-high" | "rating"
  >("popular");

  const {
    user,
    setClientInfo: setContextClientInfo,
    setPaymentMode: setContextPaymentMode,
  } = useAppContext();
  const { products, loading: productsLoading } = useProducts();
  const { categories } = useCategories();
  const { addToCart } = useCart(user?.id);
  const { clients, saveClient } = useClients(user?.id);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [featureModalVisible, setFeatureModalVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const toastAnimation = useRef(new Animated.Value(80)).current;

  // ── Agent Order State ──────────────────────────────────────────────────────
  const [clientSelectorVisible, setClientSelectorVisible] = useState(true); // Show client selector on first load
  const [clientInfoVisible, setClientInfoVisible] = useState(false); // Hidden by default
  const [paymentModeVisible, setPaymentModeVisible] = useState(false);
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [paymentMode, setPaymentMode] = useState<PaymentMode | null>(null);
  const [priceType, setPriceType] = useState<"retail" | "wholesale">(
    "wholesale",
  );
  const [clientSearchQuery, setClientSearchQuery] = useState("");

  const getClientKey = (info: ClientInfo) => {
    return `${info.storeName}_${info.contactNo}`.replace(/\s+/g, "_");
  };

  const handleOpenDetails = (product: Product) => {
    setSelectedProduct(product);
    setDetailVisible(true);
  };

  const handleAddSelectedProduct = async (
    productId: string,
    quantity: number,
  ) => {
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
      productId: `${selectedProduct.id}_${priceType === "retail" ? "retail" : "wholesale"}`,
      name: selectedProduct.name,
      category: selectedProduct.category,
      price:
        priceType === "retail"
          ? selectedProduct.retailPrice
          : selectedProduct.wholesalePrice,
      quantity,
      image: selectedProduct.image,
      minOrder: selectedProduct.minOrder,
      stock: selectedProduct.stock,
    };

    try {
      const clientKey = clientInfo ? getClientKey(clientInfo) : undefined;
      await addToCart(item, clientKey, clientInfo, paymentMode ?? undefined);
      setToastType("success");
      setToastMessage(`${selectedProduct.name} has been added to your cart.`);
      setDetailVisible(false);
    } catch (error) {
      console.error("Add to cart failed:", error);
      setToastType("error");
      setToastMessage("Unable to add this item to the cart. Please try again.");
    }
  };

  // ── Agent Order Handlers ──────────────────────────────────────────────────
  const handleClientInfoSubmit = async (info: ClientInfo) => {
    // Save client to Firestore
    await saveClient(info);

    setClientInfo(info);
    setContextClientInfo(info);
    setClientInfoVisible(false);
    setClientSelectorVisible(false);
    setPaymentModeVisible(true);
  };

  const handleClientSelect = (selectedClient: ClientInfo) => {
    setClientInfo(selectedClient);
    setContextClientInfo(selectedClient);
    setClientSelectorVisible(false);
    setPaymentModeVisible(true);
  };

  const handleAddNewClient = () => {
    setClientSelectorVisible(false);
    setClientInfoVisible(true);
  };

  const handlePaymentModeSelect = (mode: PaymentMode) => {
    setPaymentMode(mode);
    setContextPaymentMode(mode);
    setPaymentModeVisible(false);
  };

  const handleCloseSelectorAndRetry = () => {
    setClientSelectorVisible(false);
  };

  const handleNewOrder = () => {
    // Reset for next order and show client selector
    setClientInfo(null);
    setPaymentMode(null);
    setContextClientInfo(null);
    setContextPaymentMode(null);
    setClientSearchQuery("");
    setClientSelectorVisible(true);
  };

  const handleQuickAddToCart = async (product: Product) => {
    if (!user) {
      setToastType("error");
      setToastMessage("Please sign in to add items to your cart.");
      return;
    }

    if (!clientInfo || !paymentMode) {
      setToastType("error");
      setToastMessage("Please select client and payment mode first.");
      return;
    }

    const item = {
      productId: `${product.id}_${priceType === "retail" ? "retail" : "wholesale"}`,
      name: product.name,
      category: product.category,
      price:
        priceType === "retail" ? product.retailPrice : product.wholesalePrice,
      quantity: 1,
      image: product.image,
      minOrder: product.minOrder,
      stock: product.stock,
    };

    try {
      const clientKey = clientInfo ? getClientKey(clientInfo) : undefined;
      await addToCart(item, clientKey, clientInfo, paymentMode);
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
      price={priceType === "retail" ? item.retailPrice : item.wholesalePrice}
      originalPrice={
        priceType === "retail" ? item.wholesalePrice : item.retailPrice
      }
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

  // Filter clients by search query
  const filteredClients = clients.filter((client) => {
    if (!clientSearchQuery.trim()) return true;
    const query = clientSearchQuery.toLowerCase();
    return (
      client.storeName.toLowerCase().includes(query) ||
      client.completeName.toLowerCase().includes(query) ||
      client.contactNo.includes(query) ||
      client.address.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    const filterAndSort = () => {
      let filtered: ProductWithRating[] =
        products as unknown as ProductWithRating[];

      if (selectedCategory) {
        filtered = filtered.filter((p) => p.category === selectedCategory);
      }

      if (searchQuery.trim()) {
        const query = searchQuery.trim().toUpperCase();

        // Smart search: RTN+code or WS+code
        if (query.startsWith("RTN")) {
          const code = query.substring(3); // Remove "RTN" prefix
          setPriceType("retail");
          filtered = filtered.filter((p) => (p as any).code?.includes(code));
        } else if (query.startsWith("WS")) {
          const code = query.substring(2); // Remove "WS" prefix
          setPriceType("wholesale");
          filtered = filtered.filter((p) => (p as any).code?.includes(code));
        } else {
          // Regular search by name, brand, category
          const searchTerm = query.toLowerCase();
          filtered = filtered.filter(
            (p) =>
              p.name.toLowerCase().includes(searchTerm) ||
              p.brand?.toLowerCase().includes(searchTerm) ||
              p.category.toLowerCase().includes(searchTerm),
          );
        }
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
        <View style={styles.headerContent}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Products</Text>
            <Text style={styles.headerSubtitle}>
              {clientInfo && paymentMode
                ? `${clientInfo.storeName} • ${paymentMode.toUpperCase()}`
                : "Browse and add items to cart"}
            </Text>
          </View>
          {clientInfo && paymentMode && (
            <TouchableOpacity
              style={styles.headerActionBtn}
              onPress={handleNewOrder}
            >
              <MaterialIcons name="add" size={20} color="#fff" />
              <Text style={styles.headerActionText}>New Order</Text>
            </TouchableOpacity>
          )}
        </View>
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
                  {
                    backgroundColor: colors.cardBg,
                    borderColor: colors.border,
                  },
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
                          (item.id === "all" && !selectedCategory) ||
                          selectedCategory === item.id
                            ? colors.primary
                            : colors.cardBg,
                        borderColor:
                          (item.id === "all" && !selectedCategory) ||
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
                            item.id === "all" && !selectedCategory
                              ? "#fff"
                              : selectedCategory === item.id
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

            <View
              style={[styles.sortContainer, { paddingHorizontal: Spacing.lg }]}
            >
              <TouchableOpacity
                style={[
                  styles.sortButton,
                  {
                    backgroundColor: colors.cardBg,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() =>
                  setPriceType(priceType === "retail" ? "wholesale" : "retail")
                }
              >
                <MaterialIcons
                  name="layers"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text style={[styles.sortButtonText, { color: colors.text }]}>
                  {priceType === "retail" ? "Retail" : "Wholesale"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sortButton,
                  {
                    backgroundColor: colors.cardBg,
                    borderColor: colors.border,
                  },
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
                  {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.infoButton,
                  {
                    backgroundColor: colors.cardBg,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setFeatureModalVisible(true)}
              >
                <MaterialIcons name="info-outline" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View
              style={[styles.resultsInfo, { paddingHorizontal: Spacing.lg }]}
            >
              <Text
                style={[styles.resultsText, { color: colors.textSecondary }]}
              >
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
                <Text
                  style={[styles.emptyText, { color: colors.textSecondary }]}
                >
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
                style={[
                  styles.loadMoreButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleLoadMore}
              >
                <Text style={styles.loadMoreText}>Load more</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ height: Spacing.xxxl }} />
            )}
          </View>
        }
        ListEmptyComponent={filteredProducts.length === 0 ? null : undefined}
      />

      <ProductDetailModal
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        product={selectedProduct}
        onAddToCart={handleAddSelectedProduct}
        priceType={priceType}
      />

      {/* Agent Order Modals */}
      {/* Client Selector Modal */}
      <Modal visible={clientSelectorVisible} transparent animationType="slide">
        <View
          style={[
            styles.clientSelectorOverlay,
            { backgroundColor: colors.background },
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.clientSelectorHeader,
              { borderBottomColor: colors.border },
            ]}
          >
            <View>
              <Text
                style={[styles.clientSelectorTitle, { color: colors.text }]}
              >
                Select or Create Client
              </Text>
              <Text
                style={[
                  styles.clientHeaderSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                {clients.length > 0
                  ? `${clients.length} saved client${clients.length !== 1 ? "s" : ""} available`
                  : "Start by adding a new client"}
              </Text>
            </View>
          </View>

          {/* Search Section */}
          <View style={styles.clientSearchSection}>
            <View
              style={[
                styles.clientSearchBar,
                {
                  backgroundColor: colors.cardBg,
                  borderColor: colors.border,
                  ...Shadows.sm,
                },
              ]}
            >
              <MaterialIcons
                name="search"
                size={20}
                color={colors.textSecondary}
              />
              <TextInput
                style={[styles.clientSearchInput, { color: colors.text }]}
                placeholder="Search by name, store, contact..."
                placeholderTextColor={colors.textSecondary}
                value={clientSearchQuery}
                onChangeText={setClientSearchQuery}
              />
              {clientSearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setClientSearchQuery("")}>
                  <MaterialIcons
                    name="close"
                    size={18}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>
            {clients.length > 0 && (
              <Text
                style={[
                  styles.clientSearchResults,
                  { color: colors.textSecondary },
                ]}
              >
                {filteredClients.length} of {clients.length} client
                {clients.length !== 1 ? "s" : ""}
              </Text>
            )}
          </View>

          {/* Client List */}
          <FlatList
            data={filteredClients}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.clientList}
            scrollEnabled={true}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.clientCard,
                  {
                    backgroundColor: colors.surface,
                    ...Shadows.sm,
                  },
                ]}
                onPress={() => handleClientSelect(item)}
                activeOpacity={0.7}
              >
                <View style={styles.clientCardIcon}>
                  <MaterialIcons
                    name="store"
                    size={22}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.clientCardContent}>
                  <Text
                    style={[styles.clientName, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {item.storeName}
                  </Text>
                  <View style={styles.clientCardMeta}>
                    <Text
                      style={[
                        styles.clientContact,
                        { color: colors.textSecondary },
                      ]}
                      numberOfLines={1}
                    >
                      {item.completeName}
                    </Text>
                    <Text
                      style={[styles.metaDot, { color: colors.textSecondary }]}
                    >
                      •
                    </Text>
                    <Text
                      style={[
                        styles.clientContact,
                        { color: colors.textSecondary },
                      ]}
                      numberOfLines={1}
                    >
                      {item.contactNo}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.clientAddress,
                      { color: colors.textSecondary },
                    ]}
                    numberOfLines={1}
                  >
                    {item.address}
                  </Text>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={22}
                  color={colors.primary}
                />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyClientState}>
                <MaterialIcons
                  name={clients.length === 0 ? "person-add" : "search-off"}
                  size={48}
                  color={colors.textSecondary}
                />
                <Text style={[styles.emptyClientTitle, { color: colors.text }]}>
                  {clients.length === 0 ? "No Clients Yet" : "No Match Found"}
                </Text>
                <Text
                  style={[
                    styles.emptyClientText,
                    { color: colors.textSecondary },
                  ]}
                >
                  {clients.length === 0
                    ? "Create your first client to get started"
                    : "Try a different search term"}
                </Text>
              </View>
            }
          />

          {/* New Client Button */}
          <View style={styles.clientButtonFooter}>
            <TouchableOpacity
              style={[
                styles.newClientButton,
                {
                  backgroundColor: colors.primary,
                  ...Shadows.md,
                },
              ]}
              onPress={handleAddNewClient}
              activeOpacity={0.85}
            >
              <MaterialIcons name="add" size={22} color="#fff" />
              <Text style={styles.newClientButtonText}>New Client</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ClientInfoModal
        visible={clientInfoVisible}
        onSubmit={handleClientInfoSubmit}
        onBack={() => {
          setClientInfoVisible(false);
          setClientSelectorVisible(true);
        }}
        colorScheme={colorScheme}
      />

      <PaymentModeModal
        visible={paymentModeVisible}
        onSelect={handlePaymentModeSelect}
        colorScheme={colorScheme}
      />

      <Modal visible={featureModalVisible} transparent animationType="fade">
        <View style={styles.featureOverlay}>
          <View
            style={[styles.featureModal, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.featureTitle, { color: colors.text }]}>
              Necessary Browse Features
            </Text>
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              Browse wholesale products with fast filters, stock visibility,
              minimum order guidance, and one-tap add to cart.
            </Text>
            <View style={styles.featureList}>
              <Text style={[styles.featureBullet, { color: colors.text }]}>
                • Stock count shown per product
              </Text>
              <Text style={[styles.featureBullet, { color: colors.text }]}>
                • Wholesale pricing with retail comparison
              </Text>
              <Text style={[styles.featureBullet, { color: colors.text }]}>
                • Quick product detail modal for quantity selection
              </Text>
              <Text style={[styles.featureBullet, { color: colors.text }]}>
                • One-tap add to cart directly from the product card
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.featureCloseButton,
                { backgroundColor: colors.primary },
              ]}
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
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: Typography.fontSizes.xxxl,
    fontWeight: Typography.fontWeights.bold,
    color: "#fff",
  },
  headerSubtitle: {
    marginTop: Spacing.sm,
    fontSize: Typography.fontSizes.md,
    color: "#F0F8FF",
  },
  headerActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: BorderRadius.md,
  },
  headerActionText: {
    color: "#fff",
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
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
    alignItems: "center",
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
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
  },
  infoButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
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
  clientSelectorOverlay: {
    flex: 1,
  },
  clientSelectorHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
  },
  clientSelectorTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: Spacing.sm,
  },
  clientHeaderSubtitle: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    marginTop: Spacing.xs,
  },
  clientSearchSection: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  clientSearchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  clientSearchInput: {
    flex: 1,
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.normal,
  },
  clientSearchResults: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.medium,
    paddingHorizontal: Spacing.sm,
  },
  clientList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  clientCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.lg,
  },
  clientCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(63, 81, 181, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  clientCardContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  clientName: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
  },
  clientCardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  metaDot: {
    fontSize: Typography.fontSizes.sm,
  },
  clientContact: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.normal,
  },
  clientAddress: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.normal,
  },
  emptyClientState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.lg,
  },
  emptyClientTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyClientText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.normal,
    textAlign: "center",
  },
  clientButtonFooter: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.md,
  },
  newClientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  newClientButtonText: {
    color: "#fff",
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
  },
});
