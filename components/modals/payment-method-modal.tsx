import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface PaymentMethodModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectMethod: (method: string) => void;
  selectedMethod?: string;
}

export function PaymentMethodModal({
  visible,
  onClose,
  onSelectMethod,
  selectedMethod,
}: PaymentMethodModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const paymentMethods = [
    {
      id: 'elista',
      name: 'E-Lista Credit',
      description: 'Pay with your E-Lista credit balance',
      icon: 'account-balance-wallet',
    },
    {
      id: 'gcash',
      name: 'GCash',
      description: 'Pay with GCash e-wallet',
      icon: 'phone-android',
    },
    {
      id: 'maya',
      name: 'Maya',
      description: 'Pay with Maya digital wallet',
      icon: 'smartphone',
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      description: 'Pay when you receive your order',
      icon: 'local-shipping',
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Select Payment Method
            </Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.methodItem,
                  selectedMethod === method.id && {
                    borderColor: colors.primary,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => onSelectMethod(method.id)}
              >
                <View style={styles.methodHeader}>
                  <View style={styles.methodInfo}>
                    <MaterialIcons
                      name={method.icon as any}
                      size={24}
                      color={colors.primary}
                    />
                    <View style={styles.methodText}>
                      <Text style={[styles.methodName, { color: colors.text }]}>
                        {method.name}
                      </Text>
                      <Text style={[styles.methodDesc, { color: colors.text }]}>
                        {method.description}
                      </Text>
                    </View>
                  </View>
                  {selectedMethod === method.id && (
                    <MaterialIcons
                      name="check-circle"
                      size={24}
                      color={colors.primary}
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}
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
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '60%',
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
  methodItem: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: Spacing.md,
  },
  methodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  methodName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs,
  },
  methodDesc: {
    fontSize: Typography.sizes.sm,
    opacity: 0.7,
  },
});
