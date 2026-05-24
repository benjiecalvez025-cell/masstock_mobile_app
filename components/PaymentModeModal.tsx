import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { PaymentMode, PAYMENT_MODES } from "@/types/client";
import { Colors, Spacing, BorderRadius, Typography } from "@/constants/theme";

interface PaymentModeModalProps {
  visible: boolean;
  onSelect: (mode: PaymentMode) => void;
  colorScheme: "light" | "dark";
}

export default function PaymentModeModal({
  visible,
  onSelect,
  colorScheme,
}: PaymentModeModalProps) {
  const colors = Colors[colorScheme];

  if (!visible) return null;

  return (
    <View style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
      <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Select Payment Mode</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            How will this order be paid?
          </Text>
        </View>

        <FlatList
          data={PAYMENT_MODES}
          keyExtractor={(item) => item.value}
          scrollEnabled={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.paymentOption,
                {
                  borderColor: colors.border ?? "#e0e0e0",
                  backgroundColor: colors.background,
                },
              ]}
              onPress={() => onSelect(item.value)}
            >
              <View style={styles.paymentIcon}>
                <MaterialIcons
                  name={
                    item.value === "cash"
                      ? "attach-money"
                      : item.value === "card"
                      ? "credit-card"
                      : item.value === "check"
                      ? "receipt"
                      : "account-balance"
                  }
                  size={28}
                  color={colors.primary}
                />
              </View>
              <View style={styles.paymentLabel}>
                <Text style={[styles.paymentText, { color: colors.text }]}>
                  {item.label}
                </Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    zIndex: 1001,
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    paddingTop: Spacing.lg,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
  },
  subtitle: {
    fontSize: Typography.fontSizes.sm,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  paymentLabel: {
    flex: 1,
  },
  paymentText: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
  },
});
