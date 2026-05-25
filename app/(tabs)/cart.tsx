import { ConfirmationModal } from "@/components/ConfirmationModal";
import DeliveryAddressModal from "@/components/DeliveryAddressModal";
import { OrderConfirmationModal, SuccessModal } from "@/components/modals";
import { Colors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { useAppContext } from "@/context/app-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCart, useOrders } from "@/hooks/use-firestore";
<<<<<<< HEAD
=======
import { saveClient } from "@/services/firestore-enhanced";
>>>>>>> de0fad422e2d20ea1624737c7a5a5c2b53602267
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CartScreen() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const [selectedClientKey, setSelectedClientKey] = useState<string | null>(
    null,
  );
  const [deliveryAddressModalVisible, setDeliveryAddressModalVisible] =
    useState(false);
  const [confirmationModalVisible, setConfirmationModalVisible] =
    useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [deliveryAddress, setDeliveryAddress] = useState<string>("");
  const [removeConfirmVisible, setRemoveConfirmVisible] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { user, clientInfo, paymentMode, setClientInfo, setPaymentMode } =
    useAppContext();
  const {
    cartItems,
    allClientCarts,
    loading: cartLoading,
    updateItem,
    removeItem,
    clearCart,
  } = useCart(user?.id, selectedClientKey || undefined);
  const { createOrder, loading: orderLoading, refreshOrders } = useOrders(user?.id);

  const cartTotal = useMemo(
    () =>
      cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems],
  );
  const deliveryFee = 0;
  const grandTotal = cartTotal;
  const loading = cartLoading || orderLoading;

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) return;
    updateItem(itemId, newQuantity);
  };

  const handleChatWithAgent = () => {
    Alert.alert("Agent Support", "Open chat with Nanay Linda?", [
      { text: "Cancel", onPress: () => {}, style: "cancel" },
      {
        text: "Open Chat",
        onPress: () => {
          Alert.alert(
            "Chat Opened",
            "Connecting with Nanay Linda...\n\n(Chat feature coming soon)",
            [{ text: "OK", onPress: () => {} }],
          );
        },
      },
    ]);
  };

  const handleAddByBarcode = () => {
    Alert.alert("Add by Barcode", "Scan product barcode or enter manually", [
      { text: "Cancel", onPress: () => {}, style: "cancel" },
      {
        text: "Use Camera",
        onPress: () => {
          Alert.alert(
            "Camera Scanner",
            "Camera scanner launching...\n\n(Scanner feature coming soon)",
            [{ text: "OK", onPress: () => {} }],
          );
        },
      },
      {
        text: "Enter Manually",
        onPress: () => {
          Alert.prompt(
            "Enter Product Code",
            "Enter barcode or product code",
            [
              { text: "Cancel", onPress: () => {}, style: "cancel" },
              {
                text: "Add",
                onPress: (code: string | undefined) => {
                  Alert.alert(
                    "Product Added",
                    `Product code: ${code}\n\n(Will be connected to product database)`,
                  );
                },
              },
            ],
            "plain-text",
          );
        },
      },
    ]);
  };

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      Alert.alert("Empty Cart", "Please add items before placing an order");
      return;
    }

    if (!user?.id) {
      Alert.alert("Not Logged In", "Please login before placing an order");
      return;
    }

    const selectedCart = selectedClientKey
      ? allClientCarts[selectedClientKey]
      : null;
    if (!selectedCart?.clientInfo || !selectedCart?.paymentMode) {
      Alert.alert("Missing Info", "Client info or payment mode is missing");
      return;
    }

    setDeliveryAddress(selectedCart.clientInfo.address);
    setDeliveryAddressModalVisible(true);
  };

  const handleAddressConfirmed = (address: string) => {
    setDeliveryAddress(address);
    setDeliveryAddressModalVisible(false);
    setConfirmationModalVisible(true);
  };

  const handleConfirmOrder = async () => {
    setConfirmationModalVisible(false);

    try {
      // Debug log 1: Log initial state
      console.log("=== ORDER CREATION DEBUG START ===");
      console.log("selectedClientKey:", selectedClientKey);
      console.log("user.id:", user?.id);

      const selectedCart = selectedClientKey
        ? allClientCarts[selectedClientKey]
        : null;
      console.log("selectedCart:", selectedCart);

      const clientInfoData = selectedCart?.clientInfo || clientInfo;
      const paymentModeData = selectedCart?.paymentMode || paymentMode;

      console.log("clientInfoData:", clientInfoData);
      console.log("paymentModeData:", paymentModeData);
      console.log("cartItems:", cartItems);
      console.log("cartTotal:", cartTotal);
      console.log("deliveryAddress:", deliveryAddress);

      if (!clientInfoData) {
        throw new Error("Client information is missing");
      }

      console.log("=== CALLING createOrder ===");
      const orderId = await createOrder(
        cartItems,
        cartTotal,
        paymentModeData ?? "cash",
        deliveryAddress,
        clientInfoData,
        paymentModeData ?? undefined,
      );

      console.log("Order creation response - orderId:", orderId);

      if (!orderId) {
        throw new Error("Failed to create order - orderId is null/undefined");
      }

<<<<<<< HEAD
=======
      // Save client information to Firestore for future reuse
      if (user?.id && clientInfoData) {
        try {
          console.log("=== SAVING CLIENT ===");
          await saveClient(user.id, clientInfoData);
          console.log("Client saved successfully");
        } catch (saveError) {
          console.warn("Warning: Failed to save client info:", saveError);
          // Don't fail the order if client save fails
        }
      }

>>>>>>> de0fad422e2d20ea1624737c7a5a5c2b53602267
      console.log("=== CLEARING CART ===");
      // Clear cart for this specific client
      if (selectedClientKey) {
        await clearCart(selectedClientKey);
        console.log("Cart cleared for clientKey:", selectedClientKey);
      }

      console.log("=== REFRESHING ORDERS ===");
      // Refresh orders to ensure new order appears
      await refreshOrders();
      console.log("Orders refreshed");

      console.log("=== ORDER SUCCESS ===");
      setSuccessData({
        type: "success",
<<<<<<< HEAD
        title: "Order Placed! ✅",
=======
        title: "Order Placed",
>>>>>>> de0fad422e2d20ea1624737c7a5a5c2b53602267
        message: `Order Total: ₱${parseFloat(grandTotal.toFixed(2)).toLocaleString()}\n\nPayment Mode: ${paymentModeData || "Cash"}\n\nDelivering to:\n${clientInfoData?.storeName ?? "Client Store"}`,
        orderId: orderId,
      });
      setSuccessModalVisible(true);
    } catch (error: any) {
      console.error("=== ORDER FAILED ===");
      console.error("Error type:", error?.name);
      console.error("Error message:", error?.message);
      console.error("Full error object:", error);
      console.error("Error stack:", error?.stack);

      setSuccessData({
        type: "error",
        title: "Order Failed",
        message: error.message || "Failed to place order. Please try again.",
      });
      setSuccessModalVisible(true);
    }
  };

  const handleRemoveItem = (itemId: string, itemName: string) => {
    console.log("REMOVE: Opening confirmation for item:", itemId);
    setItemToRemove({ id: itemId, name: itemName });
    setRemoveConfirmVisible(true);
  };

  const handleConfirmRemove = async () => {
    if (!itemToRemove) return;

    try {
      console.log("REMOVE: Confirmed - Deleting item:", itemToRemove.id);
      setRemoveConfirmVisible(false);
      await removeItem(itemToRemove.id, selectedClientKey ?? undefined);
      console.log("REMOVE: Success - Item deleted from Firestore");
      setItemToRemove(null);
    } catch (error) {
      console.error("REMOVE: Error -", error);
      setItemToRemove(null);
    }
  };

  const handleCancelRemove = () => {
    console.log("REMOVE: Cancelled");
    setRemoveConfirmVisible(false);
    setItemToRemove(null);
  };

  const clientKeys = Object.keys(allClientCarts).filter(
    (key) => allClientCarts[key].items && allClientCarts[key].items.length > 0,
  );

  // Show client selection if there are clients but none selected
  if (!selectedClientKey) {
    if (clientKeys.length === 0) {
      // Empty state
      return (
        <View
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          <View style={[styles.header, { backgroundColor: colors.primary }]}>
            <Text style={styles.headerTitle}>Shopping Cart</Text>
            <Text style={styles.headerSubtitle}>
              No orders yet - start by selecting a client
            </Text>
          </View>
          <View style={styles.emptyStateContainer}>
            <MaterialIcons
              name="shopping-cart"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
              No Orders Yet
            </Text>
            <Text
              style={[
                styles.emptyStateSubtitle,
                { color: colors.textSecondary },
              ]}
            >
              Start by adding products from the Products tab
            </Text>
          </View>
        </View>
      );
    }

    // Client selection screen
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <Text style={styles.headerTitle}>My Cart</Text>
          <Text style={styles.headerSubtitle}>
            Manage orders for multiple clients
          </Text>
        </View>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.clientListHeader}>
            <Text style={[styles.cartTitle, { color: colors.text }]}>
              Active Orders ({clientKeys.length})
            </Text>
            <Text
              style={[
                styles.clientListSubtitle,
                { color: colors.textSecondary },
              ]}
            >
              Select a client to continue
            </Text>
          </View>

          {clientKeys.map((key) => {
            const clientCart = allClientCarts[key];
            const itemCount = clientCart.items?.length || 0;
            const total = (clientCart.items || []).reduce(
              (sum: number, item: any) => sum + item.price * item.quantity,
              0,
            );

            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.clientCard,
                  {
                    backgroundColor: colors.lightGray,
                    borderColor: colors.border ?? "#e0e0e0",
                  },
                ]}
                onPress={() => setSelectedClientKey(key)}
              >
                <View
                  style={[
                    styles.clientCardIcon,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <MaterialIcons name="store" size={24} color="#fff" />
                </View>
                <View style={styles.clientCardContent}>
                  <Text style={[styles.clientCardName, { color: colors.text }]}>
                    {clientCart.clientInfo?.storeName || "Store"}
                  </Text>
                  <Text
                    style={[
                      styles.clientCardDetails,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {clientCart.clientInfo?.contactNo}
                  </Text>
                  <View style={styles.clientCardBadges}>
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: colors.primary },
                      ]}
                    >
                      <Text style={styles.badgeText}>{itemCount} items</Text>
                    </View>
                    <Text
                      style={[
                        styles.clientCardTotal,
                        { color: colors.primary },
                      ]}
                    >
                      ₱{total.toLocaleString()}
                    </Text>
                  </View>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={colors.primary}
                />
              </TouchableOpacity>
            );
          })}

          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    );
  }

  const selectedCart = selectedClientKey
    ? allClientCarts[selectedClientKey]
    : null;
  const cartTitle = selectedCart?.clientInfo?.storeName
    ? `${selectedCart.clientInfo.storeName}'s Cart`
    : "My Cart";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Shopping Cart</Text>
            <Text style={styles.headerSubtitle}>
              {selectedCart?.clientInfo?.storeName || "Select items before checkout"}
            </Text>
          </View>
          {selectedClientKey && (
            <TouchableOpacity
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                padding: 8,
                borderRadius: 8,
              }}
              onPress={() => setSelectedClientKey(null)}
            >
              <MaterialIcons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={[styles.agentBanner, { backgroundColor: colors.primary }]}>
        <Image
          source={{ uri: "https://via.placeholder.com/40" }}
          style={styles.agentImage}
        />
        <TouchableOpacity
          style={styles.agentInfo}
          onPress={handleChatWithAgent}
        >
          <Text style={styles.agentLabel}>AGENT SUPPORT: NANAY LINDA</Text>
          <Text style={styles.agentAction}>Chat Now</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.cartHeader}>
          <Text style={[styles.cartTitle, { color: colors.text }]}>
            {cartTitle} ({cartItems.length} Items)
          </Text>
        </View>


        {cartItems.length === 0 ? (
          <View style={styles.emptyCart}>
            <MaterialIcons
              name="shopping-cart"
              size={48}
              color={colors.darkGray}
            />
            <Text style={[styles.emptyText, { color: colors.darkGray }]}>
              No items in this order
            </Text>
          </View>
        ) : (
          cartItems.map((item) => (
            <View
              key={item.productId}
              style={[styles.cartItem, { backgroundColor: colors.lightGray }]}
            >
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={[styles.itemCategory, { color: colors.primary }]}>
                  {item.category}
                </Text>
                <Text
                  style={[styles.itemName, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <Text style={[styles.itemPrice, { color: colors.primary }]}>
                  ₱{(item.price || 0).toLocaleString()} / unit
                </Text>
              </View>
              <View style={styles.itemRight}>
                <View style={styles.quantityControl}>
                  <TouchableOpacity
                    onPress={() =>
                      handleQuantityChange(item.productId, item.quantity - 1)
                    }
                  >
                    <MaterialIcons
                      name="remove"
                      size={18}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                  <Text style={[styles.quantityText, { color: colors.text }]}>
                    {item.quantity}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      handleQuantityChange(item.productId, item.quantity + 1)
                    }
                  >
                    <MaterialIcons
                      name="add"
                      size={18}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.itemTotal, { color: colors.primary }]}>
                  ₱{(item.price * item.quantity).toLocaleString()}
                </Text>
                <TouchableOpacity
                  onPress={() => handleRemoveItem(item.productId, item.name)}
                >
                  <Text style={{ color: colors.danger }}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View style={styles.addByBarcode}>
          <TouchableOpacity
            style={[styles.barcodeButton]}
            onPress={handleAddByBarcode}
          >
            <MaterialIcons name="qr-code-2" size={20} color={colors.primary} />
            <Text style={[styles.barcodeText, { color: colors.primary }]}>
              Add Items by Barcode: [|||||]
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[styles.orderSummary, { backgroundColor: colors.lightGray }]}
        >
          <View style={styles.summaryRow}>
            <Text style={[styles.totalLabel, { color: colors.primary }]}>
              Order Total
            </Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              ₱{parseFloat(cartTotal.toFixed(2)).toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {cartItems.length > 0 && (
        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            { backgroundColor: colors.accent, opacity: loading ? 0.6 : 1 },
          ]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          <Text style={styles.placeOrderButtonText}>
            {loading
              ? "PROCESSING..."
              : `PLACE ORDER (₱${grandTotal.toLocaleString()})`}
          </Text>
        </TouchableOpacity>
      )}

      <DeliveryAddressModal
        visible={deliveryAddressModalVisible}
        clientInfo={
          selectedClientKey && allClientCarts[selectedClientKey]
            ? allClientCarts[selectedClientKey].clientInfo
            : clientInfo
        }
        cartItems={cartItems}
        cartTotal={cartTotal}
        deliveryFee={deliveryFee}
        paymentMode={
          selectedClientKey && allClientCarts[selectedClientKey]
            ? allClientCarts[selectedClientKey].paymentMode
            : paymentMode
        }
        onConfirm={handleAddressConfirmed}
        onClose={() => setDeliveryAddressModalVisible(false)}
        colorScheme={colorScheme}
      />

      <OrderConfirmationModal
        visible={confirmationModalVisible}
        onClose={() => setConfirmationModalVisible(false)}
        onConfirm={handleConfirmOrder}
        cartItems={cartItems}
        total={cartTotal}
        deliveryFee={deliveryFee}
        selectedAddress={{
          address: deliveryAddress,
          city: clientInfo?.storeName,
        }}
        selectedPayment={paymentMode ?? undefined}
        loading={loading}
      />

      <ConfirmationModal
        visible={removeConfirmVisible}
        title="Remove Item"
        message={`Remove ${itemToRemove?.name} from cart?`}
        confirmText="Remove"
        cancelText="Cancel"
        isDangerous
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
      />

      <SuccessModal
        visible={successModalVisible}
        title={successData?.title}
        message={successData?.message}
        type={successData?.type}
        onClose={() => {
          setSuccessModalVisible(false);
          setConfirmationModalVisible(false);
          setDeliveryAddressModalVisible(false);
          // Navigate to Orders tab after successful order
          if (successData?.type === "success") {
            setSelectedClientKey(null);
            setDeliveryAddress("");
            (navigation as any).navigate("orders");
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingTop: Spacing.xxl,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
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
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  clientListHeader: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  clientListSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  clientCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  clientCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  clientCardContent: {
    flex: 1,
  },
  clientCardName: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  clientCardDetails: {
    fontSize: 12,
    marginBottom: 8,
  },
  clientCardBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  clientCardTotal: {
    fontSize: 14,
    fontWeight: "700",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  agentBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  agentImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  agentInfo: {
    flex: 1,
  },
  agentLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },
  agentAction: {
    fontSize: 12,
    color: "#fff",
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  cartHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cartTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  upsellBanner: {
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  upsellText: {
    fontSize: 12,
    color: "#000",
    fontWeight: "600",
    marginBottom: 6,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  emptyCart: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
  cartItem: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    gap: 12,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 6,
  },
  itemInfo: {
    flex: 1,
  },
  itemCategory: {
    fontSize: 11,
    fontWeight: "600",
  },
  itemName: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
  },
  itemRight: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  quantityText: {
    fontSize: 12,
    fontWeight: "600",
  },
  itemTotal: {
    fontSize: 12,
    fontWeight: "700",
  },
  addByBarcode: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  barcodeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  barcodeText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 8,
  },
  orderSummary: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 12,
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: "700",
  },
  totalRow: {
    borderTopWidth: 1,
    paddingTop: 10,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: "800",
  },
  totalValue: {
    fontSize: 13,
    fontWeight: "800",
  },
  placeOrderButton: {
    padding: 16,
    alignItems: "center",
  },
  placeOrderButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
