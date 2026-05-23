import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useAppContext } from "@/context/app-context";
import { Colors, Spacing, Typography } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { user, logout } = useAppContext();

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
});
