import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from "@/constants/theme";
import { useAppContext } from "@/context/app-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useStore } from "@/hooks/use-firestore";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Timestamp } from "firebase/firestore";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProductForm {
  name: string;
  category: string;
  brand: string;
  description: string;
  retailPrice: string;
  wholesalePrice: string;
  stock: string;
  minOrder: string;
  image: string;
}

const EMPTY_FORM: ProductForm = {
  name: "",
  category: "",
  brand: "",
  description: "",
  retailPrice: "",
  wholesalePrice: "",
  stock: "",
  minOrder: "",
  image: "",
};

const placeholder = (title: string) =>
  `https://via.placeholder.com/300?text=${encodeURIComponent(title || "Product")}`;

// ─── Component ───────────────────────────────────────────────────────────────

export default function StoreScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { user } = useAppContext();

  const {
    store,
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useStore(user?.id);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageSizeWarning, setImageSizeWarning] = useState<string | null>(null);

  // ── Refs ────────────────────────────────────────────────────────────────
  // Store category scrollview offset to restore after header remounts
  const categoryScrollRef = React.useRef<ScrollView>(null);
  const categoryScrollOffsetRef = React.useRef(0);

  // ── Derived data ──────────────────────────────────────────────────────────
  const categories = useMemo(
    () => [
      "All",
      ...Array.from(new Set(products.map((p) => p.category).filter(Boolean))),
    ],
    [products],
  );

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) => {
      const matchesSearch =
        !q ||
        (p.name ?? "").toLowerCase().includes(q) ||
        (p.brand ?? "").toLowerCase().includes(q) ||
        (p.category ?? "").toLowerCase().includes(q);
      const matchesCat =
        selectedCategory === "All" || p.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [products, search, selectedCategory]);

  const stats = useMemo(
    () => ({
      total: products.length,
      inStock: products.filter((p) => (p.stock ?? 0) > 0).length,
      outOfStock: products.filter((p) => (p.stock ?? 0) === 0).length,
    }),
    [products],
  );

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingProduct(null);
    setImageSizeWarning(null);
    setModalVisible(true);
  };

  const openEdit = (product: any) => {
    setForm({
      name: product.name ?? "",
      category: product.category ?? "",
      brand: product.brand ?? "",
      description: product.description ?? "",
      retailPrice: String(product.retailPrice ?? ""),
      wholesalePrice: String(product.wholesalePrice ?? ""),
      stock: String(product.stock ?? ""),
      minOrder: String(product.minOrder ?? ""),
      image: product.image ?? "",
    });
    setEditingProduct(product);
    setImageSizeWarning(null);
    setModalVisible(true);
  };

  const handleDelete = (product: any) => {
    Alert.alert(
      "Delete Product",
      `Remove "${product.name}" from your inventory? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteProduct?.(product.id),
        },
      ],
    );
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please grant access to your photo library.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const sizeMb = (asset.fileSize ?? 0) / (1024 * 1024);
      if (sizeMb > 5) {
        setImageSizeWarning(
          `Image is too large (${sizeMb.toFixed(1)} MB). Use an image under 5 MB.`,
        );
        return;
      }
      setImageSizeWarning(null);
      setForm((prev) => ({ ...prev, image: asset.uri }));
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please grant camera access.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setImageSizeWarning(null);
      setForm((prev) => ({ ...prev, image: result.assets[0].uri }));
    }
  };

  const handleSubmit = async () => {
    const retailPrice = Number(form.retailPrice);
    const wholesalePrice = Number(form.wholesalePrice);
    const stock = Number(form.stock);
    const minOrder = Number(form.minOrder);

    if (!form.name.trim() || !form.category.trim()) {
      Alert.alert("Validation", "Product name and category are required.");
      return;
    }
    if (
      isNaN(retailPrice) ||
      isNaN(wholesalePrice) ||
      isNaN(stock) ||
      isNaN(minOrder)
    ) {
      Alert.alert(
        "Validation",
        "Please enter valid numbers for price, stock, and minimum order.",
      );
      return;
    }

    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      brand: form.brand.trim() || "General",
      description: form.description.trim() || "",
      retailPrice,
      wholesalePrice,
      stock,
      minOrder,
      image: form.image.trim() || placeholder(form.name),
      featured: false,
      updatedAt: Timestamp.now(),
    };

    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await updateProduct?.(editingProduct.id, payload);
      } else {
        await createProduct?.(payload as any);
      }
      setModalVisible(false);
      setForm(EMPTY_FORM);
      setEditingProduct(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!user) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <MaterialIcons name="store" size={64} color={colors.textSecondary} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          Sign in to manage your store
        </Text>
        <TouchableOpacity
          style={[styles.ctaButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/auth/login")}
        >
          <Text style={styles.ctaText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Render product card ───────────────────────────────────────────────────
  const renderProduct = ({ item }: { item: any }) => {
    const inStock = (item.stock ?? 0) > 0;
    return (
      <View
        style={[
          styles.productCard,
          { backgroundColor: colors.surface, ...Shadows.sm },
        ]}
      >
        <Image
          source={{ uri: item.image || placeholder(item.name) }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.productInfo}>
          <Text
            style={[styles.productName, { color: colors.text }]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text
            style={[styles.productCategory, { color: colors.primary }]}
            numberOfLines={1}
          >
            {item.category}
            {item.brand ? ` · ${item.brand}` : ""}
          </Text>
          <View style={styles.priceRow}>
            <Text style={[styles.priceWholesale, { color: colors.text }]}>
              ₱{(item.wholesalePrice ?? 0).toLocaleString()}
            </Text>
            <Text style={[styles.priceRetail, { color: colors.textSecondary }]}>
              ₱{(item.retailPrice ?? 0).toLocaleString()} retail
            </Text>
          </View>
          <View
            style={[
              styles.stockBadge,
              { backgroundColor: inStock ? "#E8F5E9" : "#FFEBEE" },
            ]}
          >
            <MaterialIcons
              name={inStock ? "check-circle" : "cancel"}
              size={12}
              color={inStock ? "#388E3C" : "#D32F2F"}
            />
            <Text
              style={[
                styles.stockText,
                { color: inStock ? "#388E3C" : "#D32F2F" },
              ]}
            >
              {inStock ? `${item.stock} in stock` : "Out of stock"}
            </Text>
          </View>
        </View>
        <View style={styles.productActions}>
          <TouchableOpacity
            style={[
              styles.actionIcon,
              { backgroundColor: colors.accentBg ?? "#EEF2FF" },
            ]}
            onPress={() => openEdit(item)}
          >
            <MaterialIcons name="edit" size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionIcon, { backgroundColor: "#FFEBEE" }]}
            onPress={() => handleDelete(item)}
          >
            <MaterialIcons name="delete-outline" size={18} color="#D32F2F" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Memoized header to prevent remounts when search/category changes.
  // This keeps the header stable (same function reference) so the FlatList doesn't
  // unmount/remount it, which preserves keyboard focus and category scroll position.
  const renderListHeader = useCallback(
    () => (
      <>
        {/* Stats */}
        <View style={styles.statsRow}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.surface, ...Shadows.sm },
            ]}
          >
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {stats.total}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Products
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.surface, ...Shadows.sm },
            ]}
          >
            <Text style={[styles.statValue, { color: "#388E3C" }]}>
              {stats.inStock}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              In Stock
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.surface, ...Shadows.sm },
            ]}
          >
            <Text style={[styles.statValue, { color: "#D32F2F" }]}>
              {stats.outOfStock}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Out of Stock
            </Text>
          </View>
        </View>

        {/* Search */}
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border ?? "#e0e0e0",
            },
          ]}
        >
          <MaterialIcons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search products..."
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <MaterialIcons
                name="close"
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Category chips */}
        <ScrollView
          ref={categoryScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          keyboardShouldPersistTaps="handled"
          scrollEventThrottle={16}
          onScroll={(e) => {
            categoryScrollOffsetRef.current = e.nativeEvent.contentOffset.x;
          }}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    selectedCategory === cat ? colors.primary : colors.surface,
                  borderColor:
                    selectedCategory === cat
                      ? colors.primary
                      : (colors.border ?? "#e0e0e0"),
                },
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: selectedCategory === cat ? "#fff" : colors.text },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Results count */}
        <View style={styles.resultsRow}>
          <Text style={[styles.resultsText, { color: colors.textSecondary }]}>
            {filteredProducts.length} product
            {filteredProducts.length !== 1 ? "s" : ""}
            {search ? ` for "${search}"` : ""}
            {selectedCategory !== "All" ? ` in ${selectedCategory}` : ""}
          </Text>
        </View>

        {error ? (
          <View style={[styles.errorBanner, { backgroundColor: "#FFEBEE" }]}>
            <MaterialIcons name="error-outline" size={16} color="#D32F2F" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
      </>
    ),
    [
      colorScheme,
      search,
      selectedCategory,
      categories.length,
      filteredProducts.length,
      error,
      stats.total,
      stats.inStock,
      stats.outOfStock,
    ],
  );

  // Restore category scroll position after header updates
  React.useEffect(() => {
    if (categoryScrollRef.current && categoryScrollOffsetRef.current > 0) {
      categoryScrollRef.current.scrollTo({
        x: categoryScrollOffsetRef.current,
        animated: false,
      });
    }
  }, [selectedCategory]);

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyState}>
        <MaterialIcons
          name="inventory-2"
          size={56}
          color={colors.textSecondary}
        />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          {search || selectedCategory !== "All"
            ? "No products match"
            : "No products yet"}
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          {search || selectedCategory !== "All"
            ? "Try adjusting your search or filter."
            : "Add your first product to start selling."}
        </Text>
      </View>
    );
  };

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top bar */}
      <View style={[styles.topBar, { backgroundColor: colors.primary }]}>
        <View>
          <Text style={styles.topBarTitle}>Store Inventory</Text>
          <Text style={styles.topBarSub}>{store?.name ?? "My Store"}</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openAdd}>
          <MaterialIcons name="add" size={20} color={colors.primary} />
          <Text style={[styles.addButtonText, { color: colors.primary }]}>
            Add Product
          </Text>
        </TouchableOpacity>
      </View>

      {loading && products.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading inventory...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item, i) => item.id ?? `product-${i}`}
          renderItem={renderProduct}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}

      {/* Add / Edit Modal */}
      {modalVisible && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View
            style={[styles.modalSheet, { backgroundColor: colors.surface }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.modalScroll}
            >
              {/* Image preview */}
              {form.image ? (
                <Image
                  source={{ uri: form.image }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[
                    styles.imagePlaceholder,
                    { backgroundColor: colors.background },
                  ]}
                >
                  <MaterialIcons
                    name="image"
                    size={40}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.imagePlaceholderText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    No image selected
                  </Text>
                </View>
              )}

              {imageSizeWarning ? (
                <Text style={styles.warnText}>{imageSizeWarning}</Text>
              ) : null}

              <View style={styles.imageButtons}>
                <TouchableOpacity
                  style={[styles.imageBtn, { backgroundColor: colors.primary }]}
                  onPress={handlePickImage}
                >
                  <MaterialIcons name="photo-library" size={16} color="#fff" />
                  <Text style={styles.imageBtnText}>Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.imageBtn,
                    { backgroundColor: colors.accent ?? colors.primary },
                  ]}
                  onPress={handleTakePhoto}
                >
                  <MaterialIcons name="camera-alt" size={16} color="#fff" />
                  <Text style={styles.imageBtnText}>Camera</Text>
                </TouchableOpacity>
              </View>

              {/* Form fields */}
              {(
                [
                  {
                    label: "Product Name *",
                    field: "name",
                    keyboard: "default",
                  },
                  {
                    label: "Category *",
                    field: "category",
                    keyboard: "default",
                  },
                  { label: "Brand", field: "brand", keyboard: "default" },
                  {
                    label: "Description",
                    field: "description",
                    keyboard: "default",
                    multiline: true,
                  },
                  {
                    label: "Retail Price (₱) *",
                    field: "retailPrice",
                    keyboard: "decimal-pad",
                  },
                  {
                    label: "Wholesale Price (₱) *",
                    field: "wholesalePrice",
                    keyboard: "decimal-pad",
                  },
                  {
                    label: "Stock Quantity *",
                    field: "stock",
                    keyboard: "number-pad",
                  },
                  {
                    label: "Minimum Order *",
                    field: "minOrder",
                    keyboard: "number-pad",
                  },
                  {
                    label: "Image URL (optional)",
                    field: "image",
                    keyboard: "default",
                  },
                ] as Array<{
                  label: string;
                  field: keyof ProductForm;
                  keyboard: string;
                  multiline?: boolean;
                }>
              ).map(({ label, field, keyboard, multiline }) => (
                <View key={field} style={styles.fieldGroup}>
                  <Text
                    style={[styles.fieldLabel, { color: colors.textSecondary }]}
                  >
                    {label}
                  </Text>
                  <TextInput
                    style={[
                      styles.fieldInput,
                      {
                        backgroundColor: colors.background,
                        color: colors.text,
                        borderColor: colors.border ?? "#e0e0e0",
                      },
                      multiline && { height: 72, textAlignVertical: "top" },
                    ]}
                    value={form[field]}
                    keyboardType={keyboard as any}
                    multiline={multiline}
                    onChangeText={(v) =>
                      setForm((prev) => ({ ...prev, [field]: v }))
                    }
                    placeholder={label.replace(" *", "")}
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              ))}

              <View style={{ height: 16 }} />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[
                  styles.footerBtn,
                  { backgroundColor: colors.background },
                ]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.footerBtnText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.footerBtn,
                  styles.footerBtnPrimary,
                  {
                    backgroundColor: colors.primary,
                    opacity: isSubmitting ? 0.6 : 1,
                  },
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.footerBtnTextWhite}>
                    {editingProduct ? "Save Changes" : "Create Product"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.lg,
  },
  topBarTitle: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.bold,
    color: "#fff",
  },
  topBarSub: {
    fontSize: Typography.fontSizes.sm,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    gap: 4,
  },
  addButtonText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
  },

  // List
  listContent: { paddingBottom: 100 },

  // Stats
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  statValue: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.extrabold,
  },
  statLabel: {
    fontSize: Typography.fontSizes.xs,
    marginTop: 2,
  },

  // Search
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSizes.md,
  },

  // Category chips
  chipRow: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
  },

  // Results
  resultsRow: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  resultsText: {
    fontSize: Typography.fontSizes.sm,
  },

  // Import banner
  importBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: "#E3F2FD",
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: "#90CAF9",
  },
  importTitle: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    color: "#1565C0",
  },
  importSub: {
    fontSize: Typography.fontSizes.xs,
    color: "#1976D2",
    marginTop: 2,
  },

  // Error banner
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  errorText: {
    fontSize: Typography.fontSizes.sm,
    color: "#D32F2F",
    flex: 1,
  },

  // Product card
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  productImage: {
    width: 80,
    height: 80,
  },
  productInfo: {
    flex: 1,
    padding: Spacing.sm,
  },
  productName: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
  },
  productCategory: {
    fontSize: Typography.fontSizes.xs,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing.xs,
    marginTop: 4,
  },
  priceWholesale: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
  },
  priceRetail: {
    fontSize: Typography.fontSizes.xs,
    textDecorationLine: "line-through",
  },
  stockBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 20,
    gap: 3,
  },
  stockText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semibold,
  },
  productActions: {
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  actionIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  // Empty / loading states
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSizes.md,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    marginTop: Spacing.lg,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: Typography.fontSizes.md,
    marginTop: Spacing.sm,
    textAlign: "center",
    lineHeight: 22,
  },
  ctaButton: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 20,
  },
  ctaText: {
    color: "#fff",
    fontWeight: Typography.fontWeights.bold,
    fontSize: Typography.fontSizes.md,
  },

  // Modal
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "92%",
    paddingTop: Spacing.lg,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
  },
  modalScroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },

  // Image section
  imagePreview: {
    width: "100%",
    height: 160,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  imagePlaceholder: {
    width: "100%",
    height: 120,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  imagePlaceholderText: {
    fontSize: Typography.fontSizes.sm,
    marginTop: Spacing.xs,
  },
  warnText: {
    fontSize: Typography.fontSizes.xs,
    color: "#D32F2F",
    marginBottom: Spacing.sm,
  },
  imageButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  imageBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  imageBtnText: {
    color: "#fff",
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
  },

  // Form fields
  fieldGroup: { marginBottom: Spacing.md },
  fieldLabel: {
    fontSize: Typography.fontSizes.sm,
    marginBottom: 4,
    fontWeight: Typography.fontWeights.medium,
  },
  fieldInput: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSizes.md,
  },

  // Modal footer
  modalFooter: {
    flexDirection: "row",
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  footerBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  footerBtnPrimary: {},
  footerBtnText: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
  },
  footerBtnTextWhite: {
    color: "#fff",
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
  },
});
