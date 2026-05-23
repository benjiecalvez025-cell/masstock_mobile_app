import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  orderId?: string;
  autoCloseDelay?: number;
}

export function SuccessModal({
  visible,
  onClose,
  title = 'Success!',
  message = 'Your order has been placed successfully.',
  orderId,
  autoCloseDelay = 3000,
}: SuccessModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();

      // Auto close after delay
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    } else {
      // Reset animation
      scaleAnim.setValue(0);
    }
  }, [visible, scaleAnim, onClose, autoCloseDelay]);

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: colors.background,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <MaterialIcons
              name="check-circle"
              size={64}
              color={colors.primary}
            />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            {title}
          </Text>

          <Text style={[styles.message, { color: colors.text }]}>
            {message}
          </Text>

          {orderId && (
            <View style={styles.orderIdContainer}>
              <Text style={[styles.orderIdLabel, { color: colors.text }]}>
                Order ID:
              </Text>
              <Text style={[styles.orderId, { color: colors.primary }]}>
                {orderId}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  iconContainer: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: Typography.sizes.md,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  orderIdContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  orderIdLabel: {
    fontSize: Typography.sizes.sm,
    marginBottom: Spacing.xs,
  },
  orderId: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  button: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
  },
});
