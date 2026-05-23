import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface OrderConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cartItems: any[];
  total: number;
  deliveryFee: number;
  selectedAddress?: any;
  selectedPayment?: string;
  loading?: boolean;
}

export function OrderConfirmationModal({
  visible,
  onClose,
  onConfirm,
  cartItems,
  total,
  deliveryFee,
  selectedAddress,
  selectedPayment,
  loading = false,
}: OrderConfirmationModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'elista':
        return 'E-Lista Credit';
      case 'gcash':
        return 'GCash';
      case 'maya':
        return 'Maya';
      case 'cod':
        return 'Cash on Delivery';
      default:
        return method;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Confirm Order
            </Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Order Items */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Order Items
              </Text>
              {cartItems.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <Text style={[styles.itemName, { color: colors.text }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.itemPrice, { color: colors.text }]}>
                    ₱{item.price} × {item.quantity}
                  </Text>
                </View>
              ))}
            </View>

            {/* Delivery Address */}
            {selectedAddress && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Delivery Address
                </Text>
                <Text style={[styles.addressText, { color: colors.text }]}>
                  {selectedAddress.address}
                </Text>
                <Text style={[styles.phoneText, { color: colors.text }]}>
                  {selectedAddress.phone}
                </Text>
              </View>
            )}

            {/* Payment Method */}
            {selectedPayment && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Payment Method
                </Text>
                <Text style={[styles.paymentText, { color: colors.text }]}>
                  {getPaymentMethodName(selectedPayment)}
                </Text>
              </View>
            )}

            {/* Order Summary */}
            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.text }]}>
                  Subtotal
                </Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  ₱{total}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.text }]}>
                  Delivery Fee
                </Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  ₱{deliveryFee}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={[styles.totalLabel, { color: colors.primary }]}>
                  Total
                </Text>
                <Text style={[styles.totalValue, { color: colors.primary }]}>
                  ₱{total + deliveryFee}
                </Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.primary }]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={[styles.cancelText, { color: colors.primary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: colors.primary }]}
              onPress={onConfirm}
              disabled={loading}
            >
              <Text style={styles.confirmText}>
                {loading ? 'Processing...' : 'Confirm Order'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: BorderRadius.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
  content: {
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  itemName: {
    fontSize: Typography.sizes.md,
    flex: 1,
  },
  itemPrice: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
  },
  addressText: {
    fontSize: Typography.sizes.md,
    marginBottom: Spacing.xs,
  },
  phoneText: {
    fontSize: Typography.sizes.sm,
    opacity: 0.7,
  },
  paymentText: {
    fontSize: Typography.sizes.md,
  },
  summary: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: Spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  summaryLabel: {
    fontSize: Typography.sizes.md,
  },
  summaryValue: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: Spacing.md,
    marginTop: Spacing.md,
  },
  totalLabel: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  totalValue: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  footer: {
    flexDirection: 'row',
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
  },
});
