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

interface AddressSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectAddress: (address: any) => void;
  selectedAddress?: any;
}

export function AddressSelectionModal({
  visible,
  onClose,
  onSelectAddress,
  selectedAddress,
}: AddressSelectionModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const addresses = [
    {
      id: '1',
      type: 'Home',
      address: '123 Main Street, Barangay 1, City, Province',
      phone: '+63 912 345 6789',
    },
    {
      id: '2',
      type: 'Work',
      address: '456 Business Avenue, Barangay 2, City, Province',
      phone: '+63 987 654 3210',
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Select Delivery Address
            </Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {addresses.map((address) => (
              <TouchableOpacity
                key={address.id}
                style={[
                  styles.addressItem,
                  selectedAddress?.id === address.id && {
                    borderColor: colors.primary,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => onSelectAddress(address)}
              >
                <View style={styles.addressHeader}>
                  <Text style={[styles.addressType, { color: colors.primary }]}>
                    {address.type}
                  </Text>
                  {selectedAddress?.id === address.id && (
                    <MaterialIcons
                      name="check-circle"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </View>
                <Text style={[styles.addressText, { color: colors.text }]}>
                  {address.address}
                </Text>
                <Text style={[styles.phoneText, { color: colors.text }]}>
                  {address.phone}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
    maxHeight: '70%',
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
  addressItem: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: Spacing.md,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  addressType: {
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
});
