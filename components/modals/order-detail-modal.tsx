import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from "react-native";
import { Colors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface OrderDetailModalProps {
  visible: boolean;
  onClose: () => void;
  order: any;
}

export function OrderDetailModal({
  visible,
  onClose,
  order,
}: OrderDetailModalProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  if (!order) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "#4CAF50";
      case "in-transit":
        return "#2196F3";
      case "packing":
        return "#FF9800";
      case "cancelled":
        return "#F44336";
      case "pending":
        return "#9C27B0";
      default:
        return colors.secondary;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    if (typeof timestamp.toDate === "function") {
      return timestamp.toDate().toLocaleDateString("en-PH");
    }
    return new Date(timestamp).toLocaleDateString("en-PH");
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    if (typeof timestamp.toDate === "function") {
      return timestamp.toDate().toLocaleTimeString("en-PH");
    }
    return new Date(timestamp).toLocaleTimeString("en-PH");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Order Details
            </Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Order ID and Date */}
            <View style={[styles.section, { backgroundColor: colors.surface }]}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Order Information
                </Text>
              </View>

              <View style={styles.row}>
                <Text
                  style={[styles.label, { color: colors.textSecondary }]}
                >
                  Order ID
                </Text>
                <Text style={[styles.value, { color: colors.text }]}>
                  #{order.id?.slice(-8) || "N/A"}
                </Text>
              </View>

              <View style={styles.row}>
                <Text
                  style={[styles.label, { color: colors.textSecondary }]}
                >
                  Date
                </Text>
                <Text style={[styles.value, { color: colors.text }]}>
                  {formatDate(order.createdAt)}
                </Text>
              </View>

              <View style={styles.row}>
                <Text
                  style={[styles.label, { color: colors.textSecondary }]}
                >
                  Time
                </Text>
                <Text style={[styles.value, { color: colors.text }]}>
                  {formatTime(order.createdAt)}
                </Text>
              </View>

              <View style={styles.row}>
                <Text
                  style={[styles.label, { color: colors.textSecondary }]}
                >
                  Status
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(order.status) },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {order.status?.replace("-", " ").toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Client Information */}
            {order.clientInfo && (
              <View
                style={[
                  styles.section,
                  { backgroundColor: colors.surface, marginTop: Spacing.md },
                ]}
              >
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Client Information
                </Text>

                <View style={styles.row}>
                  <Text
                    style={[styles.label, { color: colors.textSecondary }]}
                  >
                    Name
                  </Text>
                  <Text
                    style={[styles.value, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {order.clientInfo.completeName}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text
                    style={[styles.label, { color: colors.textSecondary }]}
                  >
                    Store
                  </Text>
                  <Text
                    style={[styles.value, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {order.clientInfo.storeName}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text
                    style={[styles.label, { color: colors.textSecondary }]}
                  >
                    Contact
                  </Text>
                  <Text style={[styles.value, { color: colors.text }]}>
                    {order.clientInfo.contactNo}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text
                    style={[styles.label, { color: colors.textSecondary }]}
                  >
                    Address
                  </Text>
                  <Text
                    style={[styles.value, { color: colors.text }]}
                    numberOfLines={2}
                  >
                    {order.clientInfo.address}
                  </Text>
                </View>
              </View>
            )}

            {/* Items */}
            <View
              style={[
                styles.section,
                { backgroundColor: colors.surface, marginTop: Spacing.md },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Items ({order.items?.length || 0})
              </Text>

              {order.items?.map((item: any, index: number) => (
                <View key={index} style={styles.itemRow}>
                  <View>
                    <Text
                      style={[styles.itemName, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={[styles.itemCategory, { color: colors.textSecondary }]}
                    >
                      {item.category}
                    </Text>
                  </View>
                  <View style={styles.itemRight}>
                    <Text
                      style={[styles.itemQuantity, { color: colors.text }]}
                    >
                      x{item.quantity}
                    </Text>
                    <Text
                      style={[styles.itemPrice, { color: colors.primary }]}
                    >
                      ₱{(item.price * item.quantity).toLocaleString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Payment Information */}
            <View
              style={[
                styles.section,
                { backgroundColor: colors.surface, marginTop: Spacing.md },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Payment Information
              </Text>

              <View style={styles.row}>
                <Text
                  style={[styles.label, { color: colors.textSecondary }]}
                >
                  Method
                </Text>
                <Text style={[styles.value, { color: colors.text }]}>
                  {order.paymentMethod || "Cash"}
                </Text>
              </View>

              <View style={styles.row}>
                <Text
                  style={[styles.label, { color: colors.textSecondary }]}
                >
                  Mode
                </Text>
                <Text style={[styles.value, { color: colors.text }]}>
                  {order.paymentMode || "Cash"}
                </Text>
              </View>

              <View style={styles.row}>
                <Text
                  style={[styles.label, { color: colors.textSecondary }]}
                >
                  Status
                </Text>
                <Text
                  style={[
                    styles.value,
                    {
                      color:
                        order.paymentStatus === "completed"
                          ? "#4CAF50"
                          : "#FF9800",
                    },
                  ]}
                >
                  {order.paymentStatus?.toUpperCase() || "PENDING"}
                </Text>
              </View>
            </View>

            {/* Delivery Information */}
            <View
              style={[
                styles.section,
                { backgroundColor: colors.surface, marginTop: Spacing.md },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Delivery Information
              </Text>

              <View style={styles.row}>
                <Text
                  style={[styles.label, { color: colors.textSecondary }]}
                >
                  Address
                </Text>
                <Text
                  style={[styles.value, { color: colors.text }]}
                  numberOfLines={2}
                >
                  {order.shippingAddress || "N/A"}
                </Text>
              </View>
            </View>

            {/* Order Summary */}
            <View
              style={[
                styles.section,
                { backgroundColor: colors.surface, marginTop: Spacing.md },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Order Summary
              </Text>

              <View style={styles.summaryRow}>
                <Text
                  style={[styles.label, { color: colors.textSecondary }]}
                >
                  Subtotal
                </Text>
                <Text style={[styles.value, { color: colors.text }]}>
                  ₱{(order.total || 0).toLocaleString()}
                </Text>
              </View>

              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={[styles.totalLabel, { color: colors.text }]}>
                  Total
                </Text>
                <Text style={[styles.totalValue, { color: colors.primary }]}>
                  ₱
                  {parseFloat((order.total || 0).toFixed(2)).toLocaleString()}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text
                  style={[styles.label, { color: colors.textSecondary }]}
                >
                  Commission (0.3%)
                </Text>
                <Text style={[styles.value, { color: colors.primary }]}>
                  ₱
                  {((order.total || 0) * 0.003)
                    .toFixed(2)
                    .toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                </Text>
              </View>
            </View>

            <View style={styles.spacer} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: "95%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  section: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  label: {
    fontSize: Typography.sizes.sm,
    flex: 1,
  },
  value: {
    fontSize: Typography.sizes.sm,
    flex: 1,
    textAlign: "right",
    fontWeight: Typography.weights.semibold,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    color: "#fff",
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  itemName: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
  itemCategory: {
    fontSize: Typography.sizes.xs,
    marginTop: Spacing.xs,
  },
  itemRight: {
    alignItems: "flex-end",
  },
  itemQuantity: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
  itemPrice: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    marginTop: Spacing.xs,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  totalRow: {
    borderBottomWidth: 2,
    marginVertical: Spacing.sm,
  },
  totalLabel: {
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.md,
  },
  totalValue: {
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.md,
  },
  spacer: {
    height: Spacing.xl,
  },
});
