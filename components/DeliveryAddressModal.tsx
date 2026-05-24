import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { ClientInfo } from '@/types/client';

interface DeliveryAddressModalProps {
  visible: boolean;
  clientInfo: ClientInfo | null;
  cartItems: any[];
  cartTotal: number;
  deliveryFee: number;
  paymentMode: string | null;
  onConfirm: (address: string) => void;
  onClose: () => void;
  colorScheme: 'light' | 'dark';
}

export default function DeliveryAddressModal({
  visible,
  clientInfo,
  cartItems,
  cartTotal,
  deliveryFee,
  paymentMode,
  onConfirm,
  onClose,
  colorScheme,
}: DeliveryAddressModalProps) {
  const colors = Colors[colorScheme];
  const [customAddress, setCustomAddress] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  if (!visible || !clientInfo) return null;

  const handleConfirm = () => {
    const finalAddress = useCustom ? customAddress.trim() : clientInfo.address;

    if (!finalAddress) {
      Alert.alert('Error', 'Please provide a delivery address');
      return;
    }

    onConfirm(finalAddress);
  };

  const grandTotal = cartTotal;

  return (
    <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
      <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Confirm Order</Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
          {/* Client Info Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Client Information</Text>
            <View style={[styles.infoBox, { backgroundColor: colors.background }]}>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Name:</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {clientInfo.completeName}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Store:</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {clientInfo.storeName}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Contact:</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {clientInfo.contactNo}
                </Text>
              </View>
            </View>
          </View>

          {/* Delivery Address Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Delivery Address</Text>
            <View style={[styles.addressBox, { backgroundColor: colors.background }]}>
              <View style={styles.addressRow}>
                <MaterialIcons name="location-on" size={20} color={colors.primary} />
                <Text style={[styles.addressText, { color: colors.text }]}>
                  {clientInfo.address}
                </Text>
              </View>
            </View>

            {/* Override Toggle */}
            <TouchableOpacity
              style={styles.overrideToggle}
              onPress={() => setUseCustom(!useCustom)}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: useCustom ? colors.primary : colors.background,
                    borderColor: colors.primary,
                  },
                ]}
              >
                {useCustom && (
                  <MaterialIcons name="check" size={16} color="#fff" />
                )}
              </View>
              <Text style={[styles.overrideText, { color: colors.text }]}>
                Use different delivery address (optional)
              </Text>
            </TouchableOpacity>

            {useCustom && (
              <TextInput
                style={[
                  styles.customAddressInput,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border ?? '#e0e0e0',
                  },
                ]}
                placeholder="Enter delivery address"
                placeholderTextColor={colors.textSecondary}
                value={customAddress}
                onChangeText={setCustomAddress}
                multiline
              />
            )}
          </View>

          {/* Order Items Summary */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Items</Text>
            {cartItems.map((item) => (
              <View key={item.productId} style={styles.itemRow}>
                <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[styles.itemQty, { color: colors.textSecondary }]}>
                  ×{item.quantity}
                </Text>
                <Text style={[styles.itemTotal, { color: colors.primary, fontWeight: '600' }]}>
                  ₱{(item.price * item.quantity).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>

          {/* Payment Mode */}
          {paymentMode && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Mode</Text>
              <View style={[styles.paymentBox, { backgroundColor: colors.background }]}>
                <Text style={[styles.paymentText, { color: colors.text }]}>
                  {paymentMode.charAt(0).toUpperCase() + paymentMode.slice(1)}
                </Text>
              </View>
            </View>
          )}

          {/* Order Summary */}
          <View style={[styles.summary, { backgroundColor: colors.background }]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.totalLabel, { color: colors.primary }]}>Total</Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>
                ₱{parseFloat(cartTotal.toFixed(2)).toLocaleString()}
              </Text>
            </View>
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.cancelBtn, { borderColor: colors.primary }]}
            onPress={onClose}
          >
            <Text style={[styles.cancelText, { color: colors.primary }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmText}>Place Order</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  modalContent: {
    maxHeight: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    marginBottom: Spacing.md,
  },
  infoBox: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
  },
  infoValue: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    flex: 1,
    textAlign: 'right',
  },
  addressBox: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  addressText: {
    fontSize: Typography.fontSizes.sm,
    flex: 1,
  },
  overrideToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overrideText: {
    fontSize: Typography.fontSizes.sm,
  },
  customAddressInput: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSizes.md,
    marginTop: Spacing.md,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  itemName: {
    fontSize: Typography.fontSizes.sm,
    flex: 1,
  },
  itemQty: {
    fontSize: Typography.fontSizes.sm,
    marginHorizontal: Spacing.sm,
  },
  itemTotal: {
    fontSize: Typography.fontSizes.sm,
  },
  paymentBox: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  paymentText: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
  },
  summary: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  summaryLabel: {
    fontSize: Typography.fontSizes.sm,
  },
  summaryValue: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
  },
  totalLabel: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
  },
  totalValue: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: Spacing.md,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
  },
});
