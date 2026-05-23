import React, { useState, useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { useAppContext } from "@/context/app-context";
import { useOrders } from "@/hooks/use-firestore";
import { Colors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { user, logout } = useAppContext();
  const { orders } = useOrders(user?.id);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Filter orders by month and year
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderDate = order.createdAt?.toDate?.() || new Date(order.createdAt);
      return (
        orderDate.getMonth() === selectedMonth &&
        orderDate.getFullYear() === selectedYear
      );
    });
  }, [orders, selectedMonth, selectedYear]);

  // Calculate summary
  const summary = useMemo(() => {
    const total = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const rate = 0.003; // 0.30%
    const amount = total * rate;
    return { total, amount, count: filteredOrders.length };
  }, [filteredOrders]);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentMonth = months[selectedMonth];
  const currentYear = selectedYear;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.profileCard, { backgroundColor: colors.surface }]}> 
        <Text style={[styles.title, { color: colors.text }]}>Account</Text>
        <Text style={[styles.userName, { color: colors.text }]}>{user?.name || "Guest User"}</Text>
        <Text style={[styles.userEmail, { color: colors.textSecondary }]}> 
          {user?.email ? user.email : "Please sign in to unlock your account"}
        </Text>
        {user && (
          <View style={styles.balanceRow}>
            <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>E-Wallet</Text>
            <Text style={[styles.balanceAmount, { color: colors.primary }]}>₱{user.ewallet?.toLocaleString() || 0}</Text>
          </View>
        )}
        {user ? (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={logout}
          >
            <Text style={styles.actionButtonText}>Sign Out</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.actionButtonText}>Sign In</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}> 
        <Text style={[styles.cardTitle, { color: colors.text }]}>Quick Actions</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.badge, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)/orders')}
          >
            <Text style={[styles.badgeText, { color: '#fff' }]}>Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.badge, { backgroundColor: colors.accent }]}
            onPress={() => router.push('/(tabs)/cart')}
          >
            <Text style={[styles.badgeText, { color: '#fff' }]}>Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.badge, { backgroundColor: colors.secondary }]}
            onPress={() => router.push({ pathname: '/wallet' } as any)}
          >
            <Text style={[styles.badgeText, { color: '#fff' }]}>Wallet</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Agent Summary Orders */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.summaryHeader}>
          <View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Agent Summary Orders</Text>
            <Text style={[styles.summaryPeriod, { color: colors.textSecondary }]}>
              Sales {currentMonth} {currentYear}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.dateButton, { borderColor: colors.primary }]}
            onPress={() => setSelectedMonth((m) => (m - 1 + 12) % 12)}
          >
            <MaterialIcons name="chevron-left" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dateButton, { borderColor: colors.primary }]}
            onPress={() => setSelectedMonth((m) => (m + 1) % 12)}
          >
            <MaterialIcons name="chevron-right" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Summary Table */}
        <View style={[styles.table, { borderColor: colors.border ?? "#e0e0e0" }]}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader, { backgroundColor: colors.primary }]}>
            <Text style={[styles.tableCell, styles.tableCellHeader, { color: "#fff", flex: 1.2 }]}>Sales Man</Text>
            <Text style={[styles.tableCell, styles.tableCellHeader, { color: "#fff", flex: 1.8 }]}>Supplier</Text>
            <Text style={[styles.tableCell, styles.tableCellHeader, { color: "#fff", flex: 0.9, textAlign: "right" }]}>Total</Text>
            <Text style={[styles.tableCell, styles.tableCellHeader, { color: "#fff", flex: 0.7, textAlign: "center" }]}>% Rate</Text>
            <Text style={[styles.tableCell, styles.tableCellHeader, { color: "#fff", flex: 0.8, textAlign: "right" }]}>Amount</Text>
          </View>

          {/* Table Body */}
          {filteredOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="inbox" size={40} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No orders this month</Text>
            </View>
          ) : (
            filteredOrders.map((order) => (
              <View key={order.id} style={[styles.tableRow, { borderBottomColor: colors.border ?? "#e0e0e0" }]}>
                <Text style={[styles.tableCell, { flex: 1.2, color: colors.text }]} numberOfLines={1}>
                  {user?.name || "Agent"}
                </Text>
                <Text style={[styles.tableCell, { flex: 1.8, color: colors.text }]} numberOfLines={1}>
                  {order.clientInfo?.storeName || "Store"}
                </Text>
                <Text style={[styles.tableCell, { flex: 0.9, color: colors.text, textAlign: "right" }]}>
                  ₱{(order.total || 0).toLocaleString()}
                </Text>
                <Text style={[styles.tableCell, { flex: 0.7, color: colors.text, textAlign: "center" }]}>
                  0.30%
                </Text>
                <Text style={[styles.tableCell, { flex: 0.8, color: colors.primary, textAlign: "right", fontWeight: "600" }]}>
                  -
                </Text>
              </View>
            ))
          )}

          {/* Summary Row */}
          <View style={[styles.tableRow, styles.summaryRow, { backgroundColor: colors.accent }]}>
            <Text style={[styles.tableCell, styles.summaryCell, { flex: 1.2, color: colors.text, fontWeight: "700" }]}>
              TOTAL
            </Text>
            <Text style={[styles.tableCell, { flex: 1.8 }]}></Text>
            <Text style={[styles.tableCell, styles.summaryCell, { flex: 0.9, color: colors.text, textAlign: "right", fontWeight: "700" }]}>
              ₱{summary.total.toLocaleString()}
            </Text>
            <Text style={[styles.tableCell, { flex: 0.7 }]}></Text>
            <Text style={[styles.tableCell, styles.summaryCell, { flex: 0.8, color: colors.text, textAlign: "right", fontWeight: "700" }]}>
              ₱{summary.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.background }]}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Orders</Text>
            <Text style={[styles.statValue, { color: colors.primary }]}>{summary.count}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.background }]}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Sales</Text>
            <Text style={[styles.statValue, { color: colors.primary }]}>₱{summary.total.toLocaleString()}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.background }]}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Commission</Text>
            <Text style={[styles.statValue, { color: colors.primary }]}>₱{summary.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Help & Support</Text>
        <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>Contact support anytime from within the Masstock app if you need help with orders, payments, or your seller dashboard.</Text>
      </View>
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
  profileCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 24,
  },
  title: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: Spacing.sm,
  },
  userName: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
  },
  userEmail: {
    marginTop: Spacing.xs,
    fontSize: Typography.fontSizes.sm,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  balanceLabel: {
    fontSize: Typography.fontSizes.sm,
  },
  balanceAmount: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
  },
  card: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 20,
  },
  cardTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  badge: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 14,
  },
  badgeText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
  },
  cardDescription: {
    fontSize: Typography.fontSizes.sm,
    lineHeight: 20,
  },
  actionButton: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 14,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
  },
  // Agent Summary Styles
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  summaryPeriod: {
    fontSize: Typography.fontSizes.sm,
    marginTop: Spacing.xs,
  },
  dateButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  table: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    marginBottom: Spacing.lg,
  },
  tableRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  tableHeader: {
    paddingVertical: Spacing.md,
  },
  tableCell: {
    fontSize: Typography.fontSizes.xs,
    paddingHorizontal: Spacing.xs,
  },
  tableCellHeader: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semibold,
  },
  summaryRow: {
    borderBottomWidth: 0,
    paddingVertical: Spacing.md,
  },
  summaryCell: {
    fontSize: Typography.fontSizes.sm,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    fontSize: Typography.fontSizes.sm,
    marginTop: Spacing.sm,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  statCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  statLabel: {
    fontSize: Typography.fontSizes.xs,
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
  },
});
