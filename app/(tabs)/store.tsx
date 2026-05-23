import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Header } from "@/components/header";
import { Colors, Shadows, Spacing, Typography } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAppContext } from "@/context/app-context";
import { useStore } from "@/hooks/use-firestore";
import { useRouter } from "expo-router";

interface InventoryEditState {
  stock?: string;
  retailPrice?: string;
  wholesalePrice?: string;
}

const placeholderImage = (title: string) =>
  `https://via.placeholder.com/300?text=${encodeURIComponent(title)}`;

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
    updateProductPrice,
    updateProductStock,
  } = useStore(user?.id);

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [inventoryModalVisible, setInventoryModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    brand: "",
    description: "",
    retailPrice: "",
    wholesalePrice: "",
    stock: "",
    minOrder: "",
    image: "",
  });
  const [inventoryEdits, setInventoryEdits] = useState<Record<string, InventoryEditState>>({});
  const [imageSizeWarning, setImageSizeWarning] = useState<string | null>(null);
  const [selectedImageSize, setSelectedImageSize] = useState<number | null>(null);

  const featuredProducts = products?.slice(0, 3) ?? [];

  const activeListings = products?.length ?? 0;
  const storeName = store?.name || "My Store";

  if (!user) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Header
          title="Store Dashboard"
          subtitle="Sign in to access your seller tools"
        />

        <View style={[styles.card, { backgroundColor: colors.surface }]}> 
          <Text style={[styles.cardTitle, { color: colors.text }]}>Welcome to your store</Text>
          <Text style={[styles.cardDescription, { color: colors.textSecondary, marginBottom: Spacing.md }]}>You need to be signed in to add products, manage inventory, and view your store dashboard.</Text>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/auth/login")}
          >
            <Text style={styles.actionText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }
  const handleChangeNewProduct = (field: string, value: string) => {
    setNewProduct((prev) => ({ ...prev, [field]: value }));
  };

  const MAX_PRODUCT_IMAGE_MB = 5;

  const validateImageAsset = (asset: ImagePicker.ImagePickerAsset) => {
    const sizeBytes = asset.fileSize;
    if (!sizeBytes) {
      setImageSizeWarning(null);
      setSelectedImageSize(null);
      return true;
    }

    const sizeMb = sizeBytes / (1024 * 1024);
    setSelectedImageSize(sizeMb);
    if (sizeMb > MAX_PRODUCT_IMAGE_MB) {
      setImageSizeWarning(`Selected image is too large (${sizeMb.toFixed(1)} MB). Please choose an image under ${MAX_PRODUCT_IMAGE_MB} MB.`);
      return false;
    }

    setImageSizeWarning(null);
    return true;
  };

  const handlePickProductImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please grant access to your photo library to select a product image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      if (!validateImageAsset(asset)) {
        return;
      }
      setNewProduct((prev) => ({ ...prev, image: asset.uri }));
    }
  };

  const handleTakeProductPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please grant camera access to take a product photo.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      if (!validateImageAsset(asset)) {
        return;
      }
      setNewProduct((prev) => ({ ...prev, image: asset.uri }));
    }
  };

  const handleSubmitNewProduct = async () => {
    const retailPrice = Number(newProduct.retailPrice);
    const wholesalePrice = Number(newProduct.wholesalePrice);
    const stock = Number(newProduct.stock);
    const minOrder = Number(newProduct.minOrder);

    if (
      !newProduct.name.trim() ||
      !newProduct.category.trim() ||
      isNaN(retailPrice) ||
      isNaN(wholesalePrice) ||
      isNaN(stock) ||
      isNaN(minOrder)
    ) {
      return;
    }

    setIsSubmitting(true);
    const productPayload = {
      name: newProduct.name.trim(),
      category: newProduct.category.trim(),
      brand: newProduct.brand.trim() || "General",
      description: newProduct.description.trim() || "",
      retailPrice,
      wholesalePrice,
      stock,
      minOrder,
      image: newProduct.image.trim() || placeholderImage(newProduct.name),
      featured: false,
    };

    const success = await createProduct?.(productPayload as any);
    setIsSubmitting(false);

    if (success) {
      setAddModalVisible(false);
      setNewProduct({
        name: "",
        category: "",
        brand: "",
        description: "",
        retailPrice: "",
        wholesalePrice: "",
        stock: "",
        minOrder: "",
        image: "",
      });
    }
  };

  const handleInventoryEditChange = (
    productId: string,
    field: keyof InventoryEditState,
    value: string,
  ) => {
    setInventoryEdits((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  };

  const handleSaveInventoryItem = async (product: any) => {
    const edit = inventoryEdits[product.id] || {};
    const stock = edit.stock !== undefined ? Number(edit.stock) : product.stock;
    const retailPrice =
      edit.retailPrice !== undefined
        ? Number(edit.retailPrice)
        : product.retailPrice;
    const wholesalePrice =
      edit.wholesalePrice !== undefined
        ? Number(edit.wholesalePrice)
        : product.wholesalePrice;

    if (isNaN(stock) || stock < 0) {
      return;
    }

    await updateProductStock?.(product.id, stock);

    if (!isNaN(retailPrice) && !isNaN(wholesalePrice)) {
      await updateProductPrice?.(product.id, retailPrice, wholesalePrice);
    }

    setInventoryEdits((prev) => ({
      ...prev,
      [product.id]: {
        ...prev[product.id],
        stock: String(stock),
        retailPrice: String(retailPrice),
        wholesalePrice: String(wholesalePrice),
      },
    }));
  };

  const renderInventoryItem = ({ item }: { item: any }) => {
    const edits = inventoryEdits[item.id] || {};
    return (
      <View style={[styles.inventoryCard, { backgroundColor: colors.background }]}> 
        <View style={styles.inventoryHeader}>
          <View style={[styles.inventoryAvatar, { backgroundColor: colors.surface }]}> 
            <Image
              source={{ uri: item.image || placeholderImage(item.name) }}
              style={styles.inventoryImage}
            />
          </View>
          <View style={styles.inventoryInfo}>
            <Text style={[styles.inventoryName, { color: colors.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.inventoryMeta, { color: colors.textSecondary }]}>Category: {item.category}</Text>
            <Text style={[styles.inventoryMeta, { color: colors.textSecondary }]}>Stock: {item.stock}</Text>
          </View>
        </View>
        <View style={styles.inventoryFieldRow}>
          <View style={styles.inventoryField}>
            <Text style={[styles.inlineLabel, { color: colors.textSecondary }]}>Stock</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text }]}
              value={edits.stock ?? String(item.stock)}
              keyboardType="number-pad"
              onChangeText={(value) => handleInventoryEditChange(item.id, "stock", value)}
            />
          </View>
          <View style={styles.inventoryField}>
            <Text style={[styles.inlineLabel, { color: colors.textSecondary }]}>Wholesale</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text }]}
              value={edits.wholesalePrice ?? String(item.wholesalePrice)}
              keyboardType="number-pad"
              onChangeText={(value) => handleInventoryEditChange(item.id, "wholesalePrice", value)}
            />
          </View>
          <View style={styles.inventoryField}>
            <Text style={[styles.inlineLabel, { color: colors.textSecondary }]}>Retail</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text }]}
              value={edits.retailPrice ?? String(item.retailPrice)}
              keyboardType="number-pad"
              onChangeText={(value) => handleInventoryEditChange(item.id, "retailPrice", value)}
            />
          </View>
        </View>
        <View style={styles.inventoryFooter}>
          <TouchableOpacity
            style={[styles.inventorySaveButton, { backgroundColor: colors.primary }]}
            onPress={() => handleSaveInventoryItem(item)}
          >
            <Text style={styles.actionText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Header
        title="Store Dashboard"
        subtitle={store ? `Welcome back, ${storeName}` : "Set up your seller profile"}
      />

      <View style={[styles.card, { backgroundColor: colors.surface }]}> 
        <Text style={[styles.cardTitle, { color: colors.text }]}>Store Snapshot</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statItem, { backgroundColor: colors.background }]}> 
            <Text style={[styles.statValue, { color: colors.primary }]}>{activeListings}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Active listings</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: colors.background }]}> 
            <Text style={[styles.statValue, { color: colors.primary }]}>{store?.rating ? store.rating.toFixed(1) : "–"}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Store rating</Text>
          </View>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}> 
        <Text style={[styles.cardTitle, { color: colors.text }]}>Top Actions</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => setAddModalVisible(true)}
          > 
            <Text style={styles.actionText}>Add New Product</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.accent }]}
            onPress={() => setInventoryModalVisible(true)}
          > 
            <Text style={styles.actionText}>Manage Inventory</Text>
          </TouchableOpacity>
        </View>
      </View>

      {featuredProducts.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.surface }]}> 
          <Text style={[styles.cardTitle, { color: colors.text }]}>Recent Products</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productScroll} contentContainerStyle={styles.productScrollContent}>
            {featuredProducts.map((product) => (
              <View key={product.id} style={[styles.productPreview, { backgroundColor: colors.background }]}> 
                <Image
                  source={{ uri: product.image || placeholderImage(product.name) }}
                  style={styles.previewImage}
                />
                <View style={styles.previewText}>
                  <Text style={[styles.previewName, { color: colors.text }]} numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Text style={[styles.previewMeta, { color: colors.textSecondary }]}>Stock: {product.stock}</Text>
                  <Text style={[styles.previewMeta, { color: colors.textSecondary }]}>₱{product.wholesalePrice.toLocaleString()}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={[styles.card, { backgroundColor: colors.surface }]}> 
        <Text style={[styles.cardTitle, { color: colors.text }]}>Seller Tip</Text>
        <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>Keep your top-selling products stocked, refresh wholesale pricing often, and make every listing easy to reorder.</Text>
      </View>

      {error ? (
        <View style={[styles.card, { backgroundColor: colors.surface }]}> 
          <Text style={[styles.cardDescription, { color: colors.danger }]}>{error}</Text>
        </View>
      ) : null}

      {loading && (
        <View style={[styles.card, { backgroundColor: colors.surface }]}> 
          <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>Loading store details…</Text>
        </View>
      )}

      <Modal visible={addModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalShell}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}> 
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Product</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                { label: "Product Name", field: "name" },
                { label: "Category", field: "category" },
                { label: "Brand", field: "brand" },
                { label: "Description", field: "description" },
                { label: "Retail Price", field: "retailPrice", keyboardType: "number-pad" },
                { label: "Wholesale Price", field: "wholesalePrice", keyboardType: "number-pad" },
                { label: "Stock", field: "stock", keyboardType: "number-pad" },
                { label: "Minimum Order", field: "minOrder", keyboardType: "number-pad" },
                { label: "Image URL", field: "image", keyboardType: "default" },
              ].map((input) => (
                <View key={input.field} style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{input.label}</Text>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: colors.background, color: colors.text }]}
                    value={newProduct[input.field as keyof typeof newProduct]}
                    keyboardType={input.keyboardType as any}
                    onChangeText={(text) => handleChangeNewProduct(input.field, text)}
                    multiline={input.field === "description"}
                  />
                </View>
              ))}
              {newProduct.image ? (
                <View style={styles.imagePreviewWrapper}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Selected Image</Text>
                  <Image
                    source={{ uri: newProduct.image }}
                    style={styles.productImagePreview}
                  />
                  {selectedImageSize !== null ? (
                    <Text style={[styles.imageHint, { color: colors.textSecondary }]}>Size: {selectedImageSize.toFixed(1)} MB</Text>
                  ) : null}
                </View>
              ) : null}
              <Text style={[styles.imageHint, { color: colors.textSecondary }]}>Best before: {MAX_PRODUCT_IMAGE_MB} MB, clear product photo, and high contrast.</Text>
              {imageSizeWarning ? (
                <Text style={[styles.warningText, { color: colors.danger }]}>{imageSizeWarning}</Text>
              ) : null}
              <TouchableOpacity
                style={[styles.imageButton, { backgroundColor: colors.accent }]}
                onPress={handlePickProductImage}
              >
                <Text style={styles.actionText}>Select Product Image</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.imageButton, { backgroundColor: colors.primary }]}
                onPress={handleTakeProductPhoto}
              >
                <Text style={styles.actionText}>Take Product Photo</Text>
              </TouchableOpacity>
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: colors.background }]}
                onPress={() => setAddModalVisible(false)}
              >
                <Text style={[styles.actionText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.primary, opacity: isSubmitting ? 0.7 : 1 }]}
                onPress={handleSubmitNewProduct}
                disabled={isSubmitting}
              >
                <Text style={styles.actionText}>Create Product</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={inventoryModalVisible} animationType="slide" transparent>
        <View style={styles.modalShell}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}> 
            <Text style={[styles.modalTitle, { color: colors.text }]}>Manage Inventory</Text>
            <FlatList
              data={products}
              keyExtractor={(item, index) => item.id ?? `product-${index}`}
              renderItem={renderInventoryItem}
              contentContainerStyle={styles.inventoryList}
            />
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: colors.background, alignSelf: "center" }]}
              onPress={() => setInventoryModalVisible(false)}
            >
              <Text style={[styles.actionText, { color: colors.text }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: Spacing.xxxl,
  },
  card: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 20,
    ...Shadows.md,
  },
  cardTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  statItem: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: 16,
  },
  statValue: {
    fontSize: Typography.fontSizes.xxxl,
    fontWeight: Typography.fontWeights.extrabold,
  },
  statLabel: {
    marginTop: Spacing.xs,
    fontSize: Typography.fontSizes.sm,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 18,
    marginBottom: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.sm,
  },
  actionText: {
    color: "#fff",
    fontWeight: Typography.fontWeights.semibold,
  },
  cardDescription: {
    fontSize: Typography.fontSizes.sm,
    lineHeight: 20,
  },
  productScroll: {
    marginTop: Spacing.sm,
  },
  productScrollContent: {
    paddingBottom: Spacing.sm,
  },
  productPreview: {
    width: 220,
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.sm,
    borderRadius: 20,
    marginRight: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  previewImage: {
    width: 72,
    height: 72,
    borderRadius: 16,
    marginRight: Spacing.md,
  },
  previewText: {
    flex: 1,
  },
  previewName: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
  },
  previewMeta: {
    fontSize: Typography.fontSizes.xs,
    marginTop: Spacing.xs,
  },
  modalShell: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  modalContent: {
    margin: Spacing.lg,
    borderRadius: 24,
    padding: Spacing.lg,
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: Typography.fontSizes.sm,
    marginBottom: Spacing.xs,
  },
  textInput: {
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: "#ccc",
    fontSize: Typography.fontSizes.sm,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.md,
  },
  cancelButton: {
    padding: Spacing.md,
    borderRadius: 16,
    minWidth: 120,
    alignItems: "center",
  },
  saveButton: {
    padding: Spacing.md,
    borderRadius: 16,
    minWidth: 120,
    alignItems: "center",
  },
  imagePreviewWrapper: {
    marginBottom: Spacing.md,
  },
  productImagePreview: {
    width: "100%",
    height: 180,
    borderRadius: 16,
    marginTop: Spacing.sm,
    backgroundColor: "#f0f0f0",
  },
  imageHint: {
    fontSize: Typography.fontSizes.xs,
    marginBottom: Spacing.xs,
  },
  warningText: {
    fontSize: Typography.fontSizes.xs,
    marginBottom: Spacing.xs,
  },
  imageButton: {
    padding: Spacing.md,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  inventoryList: {
    paddingBottom: Spacing.md,
  },
  inventoryCard: {
    borderRadius: 20,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  inventoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  inventoryAvatar: {
    width: 72,
    height: 72,
    borderRadius: 18,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  inventoryImage: {
    width: "100%",
    height: "100%",
  },
  inventoryInfo: {
    flex: 1,
  },
  inventoryName: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
    marginBottom: Spacing.xs,
  },
  inventoryMeta: {
    fontSize: Typography.fontSizes.xs,
    marginBottom: Spacing.xs,
  },
  inventoryFieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  inventoryField: {
    flex: 1,
    minWidth: 100,
  },
  inventoryFooter: {
    marginTop: Spacing.md,
    alignItems: "flex-end",
  },
  inventorySaveButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: 16,
  },
  inlineLabel: {
    fontSize: Typography.fontSizes.xs,
    marginBottom: Spacing.xs,
  },
});
