import React, { useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  Alert,
} from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppContext } from '@/context/app-context';
import { useCart, useOrders } from '@/hooks/use-firestore';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Header } from '@/components/header';
import {
  PaymentMethodModal,
  AddressSelectionModal,
  OrderConfirmationModal,
  SuccessModal,
} from '@/components/modals';

export default function CartScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user } = useAppContext();
  const {
    cartItems,
    loading: cartLoading,
    updateItem,
    removeItem,
    clearCart,
  } = useCart(user?.id);
  const { createOrder, loading: orderLoading } = useOrders(user?.id);

  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('elista');
  const [selectedAddress, setSelectedAddress] = useState<any>(null);

  const cartTotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems],
  );
  const deliveryFee = 50;
  const grandTotal = cartTotal + deliveryFee;
  const loading = cartLoading || orderLoading;

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) return;
    updateItem(itemId, newQuantity);
  };

  const handleChatWithAgent = () => {
    Alert.alert(
      'Agent Support',
      'Open chat with Nanay Linda?',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Open Chat',
          onPress: () => {
            Alert.alert(
              'Chat Opened',
              'Connecting with Nanay Linda...\n\n(Chat feature coming soon)',
              [{ text: 'OK', onPress: () => {} }],
            );
          },
        },
      ],
    );
  };

  const handleAddByBarcode = () => {
    Alert.alert(
      'Add by Barcode',
      'Scan product barcode or enter manually',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Use Camera',
          onPress: () => {
            Alert.alert(
              'Camera Scanner',
              'Camera scanner launching...\n\n(Scanner feature coming soon)',
              [{ text: 'OK', onPress: () => {} }],
            );
          },
        },
        {
          text: 'Enter Manually',
          onPress: () => {
            Alert.prompt(
              'Enter Product Code',
              'Enter barcode or product code',
              [
                { text: 'Cancel', onPress: () => {}, style: 'cancel' },
                {
                  text: 'Add',
                  onPress: (code: string | undefined) => {
                    Alert.alert(
                      'Product Added',
                      `Product code: ${code}\n\n(Will be connected to product database)`,
                    );
                  },
                },
              ],
              'plain-text',
            );
          },
        },
      ],
    );
  };

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add items before placing an order');
      return;
    }

    if (!user?.id) {
      Alert.alert('Not Logged In', 'Please login before placing an order');
      return;
    }

    setAddressModalVisible(true);
  };

  const handleAddressSelected = (address: any) => {
    setSelectedAddress(address);
    setAddressModalVisible(false);
    setPaymentModalVisible(true);
  };

  const handlePaymentSelected = (method: string) => {
    setSelectedPaymentMethod(method);
    setPaymentModalVisible(false);
    setConfirmationModalVisible(true);
  };

  const handleConfirmOrder = async () => {
    setConfirmationModalVisible(false);

    try {
      const orderId = await createOrder(
        cartItems,
        cartTotal,
        selectedPaymentMethod,
        selectedAddress?.address ?? '',
      );

      if (orderId) {
        await clearCart();
      }

      setSuccessData({
        type: 'success',
        title: 'Order Placed! ✅',
        message: `Order Total: ₱${grandTotal.toLocaleString()}\n\nPayment: ${selectedPaymentMethod}\n\nDelivering to:\n${selectedAddress?.city ?? 'Selected Address'}`,
        orderId: orderId || 'MAS-' + Date.now(),
      });
      setSuccessModalVisible(true);
    } catch (error: any) {
      setSuccessData({
        type: 'error',
        title: 'Order Failed ?',
        message: error.message || 'Failed to place order. Please try again.',
      });
      setSuccessModalVisible(true);
    }
  };

  const handleRemoveItem = (itemId: string, itemName: string) => {
    Alert.alert(
      'Remove Item',
      `Remove ${itemName} from cart?`,
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Remove',
          onPress: () => {
            removeItem(itemId);
            Alert.alert('Removed', 'Item removed from cart', [
              { text: 'OK', onPress: () => {} },
            ]);
          },
          style: 'destructive',
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <Header title="MASSTOCK" subtitle="My Cart" />
      <View style={[styles.agentBanner, { backgroundColor: colors.primary }]}> 
        <Image source={{ uri: 'https://via.placeholder.com/40' }} style={styles.agentImage} />
        <TouchableOpacity style={styles.agentInfo} onPress={handleChatWithAgent}> 
          <Text style={styles.agentLabel}>AGENT SUPPORT: NANAY LINDA</Text>
          <Text style={styles.agentAction}>Chat Now</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.cartHeader}>
          <Text style={[styles.cartTitle, { color: colors.text }]}>My Cart ({cartItems.length} Items)</Text>
        </View>

        {cartItems.length > 0 && cartTotal < 450 && (
          <View style={[styles.upsellBanner, { backgroundColor: colors.accent }]}> 
            <Text style={styles.upsellText}>Add ₱{(450 - cartTotal).toLocaleString()} more for FREE Delivery!</Text>
            <View style={[styles.progressBar, { width: `${(cartTotal / 450) * 100}%`, backgroundColor: colors.primary }]} />
          </View>
        )}

        {cartItems.length === 0 ? (
          <View style={styles.emptyCart}>
            <MaterialIcons name="shopping-cart" size={48} color={colors.darkGray} />
            <Text style={[styles.emptyText, { color: colors.darkGray }]}>Your cart is empty</Text>
          </View>
        ) : (
          cartItems.map((item) => (
            <View key={item.productId} style={[styles.cartItem, { backgroundColor: colors.lightGray }]}> 
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemInfo}> 
                <Text style={[styles.itemCategory, { color: colors.primary }]}>{item.category}</Text>
                <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.itemPrice, { color: colors.primary }]}>₱{item.price.toLocaleString()} / unit</Text>
              </View>
              <View style={styles.itemRight}> 
                <View style={styles.quantityControl}> 
                  <TouchableOpacity onPress={() => handleQuantityChange(item.productId, item.quantity - 1)}>
                    <MaterialIcons name="remove" size={18} color={colors.primary} />
                  </TouchableOpacity>
                  <Text style={[styles.quantityText, { color: colors.text }]}>{item.quantity}</Text>
                  <TouchableOpacity onPress={() => handleQuantityChange(item.productId, item.quantity + 1)}>
                    <MaterialIcons name="add" size={18} color={colors.primary} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.itemTotal, { color: colors.primary }]}>₱{(item.price * item.quantity).toLocaleString()}</Text>
                <TouchableOpacity onPress={() => handleRemoveItem(item.productId, item.name)}>
                  <Text style={{ color: colors.danger }}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View style={styles.addByBarcode}> 
          <TouchableOpacity style={[styles.barcodeButton]} onPress={handleAddByBarcode}> 
            <MaterialIcons name="qr-code-2" size={20} color={colors.primary} />
            <Text style={[styles.barcodeText, { color: colors.primary }]}>Add Items by Barcode: [|||||]</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.paymentSection}> 
          <Text style={[styles.paymentTitle, { color: colors.text }]}>PAYMENT OPTIONS (Select One)</Text>
          <TouchableOpacity
            style={[styles.paymentOption, { backgroundColor: selectedPaymentMethod === 'elista' ? colors.accent : colors.lightGray }]}
            onPress={() => setSelectedPaymentMethod('elista')}>
            <View style={styles.paymentRadio}>{selectedPaymentMethod === 'elista' && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}</View>
            <View style={styles.paymentInfo}>
              <Text style={[styles.paymentOptionName, { color: colors.text }]}>E-Lista Credit</Text>
              <Text style={[styles.paymentBalance, { color: colors.darkGray }]}>Available Balance: ₱{user?.ewallet?.toLocaleString()}</Text>
            </View>
            <MaterialIcons name="account-balance-wallet" size={24} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentOption, { backgroundColor: selectedPaymentMethod === 'gcash' ? colors.accent : colors.lightGray }]}
            onPress={() => setSelectedPaymentMethod('gcash')}>
            <View style={styles.paymentRadio}>{selectedPaymentMethod === 'gcash' && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}</View>
            <Text style={[styles.paymentOptionName, { color: colors.text }]}>GCash / Maya</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.orderSummary, { backgroundColor: colors.lightGray }]}> 
          <View style={styles.summaryRow}> 
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Items Total</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>₱{cartTotal.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}> 
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Delivery</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>₱{deliveryFee.toLocaleString()}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow, { borderTopColor: colors.darkGray }]}>            <Text style={[styles.totalLabel, { color: colors.primary }]}>Grand Total</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>₱{grandTotal.toLocaleString()}</Text>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {cartItems.length > 0 && (
        <TouchableOpacity
          style={[styles.placeOrderButton, { backgroundColor: colors.accent, opacity: loading ? 0.6 : 1 }]}
          onPress={handlePlaceOrder}
          disabled={loading}>
          <Text style={styles.placeOrderButtonText}>{loading ? 'PROCESSING...' : `PLACE ORDER (₱${grandTotal.toLocaleString()})`}</Text>
        </TouchableOpacity>
      )}

      <AddressSelectionModal
        visible={addressModalVisible}
        onClose={() => setAddressModalVisible(false)}
        onSelectAddress={handleAddressSelected}
      />

      <PaymentMethodModal
        visible={paymentModalVisible}
        onClose={() => setPaymentModalVisible(false)}
        onSelectMethod={handlePaymentSelected}
        selectedMethod={selectedPaymentMethod}
      />

      <OrderConfirmationModal
        visible={confirmationModalVisible}
        onClose={() => setConfirmationModalVisible(false)}
        onConfirm={handleConfirmOrder}
        cartItems={cartItems}
        total={cartTotal}
        deliveryFee={deliveryFee}
      />

      <SuccessModal
        visible={successModalVisible}
        title={successData?.title}
        message={successData?.message}
        onClose={() => setSuccessModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  agentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '700',
    color: '#fff',
  },
  agentAction: {
    fontSize: 12,
    color: '#fff',
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
    fontWeight: '700',
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
    color: '#000',
    fontWeight: '600',
    marginBottom: 6,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  emptyCart: {
    alignItems: 'center',
    justifyContent: 'center',
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
    flexDirection: 'row',
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
    fontWeight: '600',
  },
  itemName: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  itemRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemTotal: {
    fontSize: 12,
    fontWeight: '700',
  },
  addByBarcode: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  barcodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  barcodeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
  paymentSection: {
    marginHorizontal: 16,
    marginVertical: 16,
  },
  paymentTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  paymentRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#999',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  paymentInfo: {
    flex: 1,
    marginHorizontal: 10,
  },
  paymentOptionName: {
    fontSize: 12,
    fontWeight: '700',
  },
  paymentBalance: {
    fontSize: 11,
    marginTop: 4,
  },
  orderSummary: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 12,
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  totalRow: {
    borderTopWidth: 1,
    paddingTop: 10,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  totalValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  placeOrderButton: {
    padding: 16,
    alignItems: 'center',
  },
  placeOrderButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
