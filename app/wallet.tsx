import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from "@/constants/theme";
import { useAppContext } from "@/context/app-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function WalletScreen() {
  const router = useRouter();
  const { user } = useAppContext();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Wallet</Text>
        <Text style={styles.headerSubtitle}>
          Manage your Masstock e-wallet balance
        </Text>
      </View>

      <View style={[styles.balanceCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Available Balance
        </Text>
        <Text style={[styles.balance, { color: colors.primary }]}>
          ₱{user?.ewallet?.toLocaleString() || 0}
        </Text>
        <Text style={[styles.balanceCaption, { color: colors.textSecondary }]}>
          Use this balance for checkout and store purchases.
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Wallet Actions
        </Text>
        <TouchableOpacity
          style={[styles.action, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/(tabs)/cart")}
        >
          <Text style={styles.actionText}>Use balance at checkout</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.action, { backgroundColor: colors.secondary }]}
          onPress={() => router.push("/(tabs)/browse")}
        >
          <Text style={styles.actionText}>Browse wholesale products</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Recent Activity
        </Text>
        <Text style={[styles.cardText, { color: colors.textSecondary }]}>
          Track your recent wallet top-ups, payments and credits here. This
          section will show your latest balance changes once you start using the
          wallet.
        </Text>
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
  header: {
    padding: Spacing.xl,
    paddingTop: Spacing.xxl,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTitle: {
    fontSize: Typography.fontSizes.xxxl,
    fontWeight: Typography.fontWeights.bold,
    color: "#fff",
  },
  headerSubtitle: {
    marginTop: Spacing.sm,
    fontSize: Typography.fontSizes.md,
    color: "rgba(255,255,255,0.85)",
  },
  balanceCard: {
    marginHorizontal: Spacing.lg,
    marginTop: -Spacing.xl,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    ...Shadows.md,
  },
  label: {
    fontSize: Typography.fontSizes.sm,
    marginBottom: Spacing.sm,
  },
  balance: {
    fontSize: Typography.fontSizes.xxxl,
    fontWeight: Typography.fontWeights.extrabold,
  },
  balanceCaption: {
    marginTop: Spacing.sm,
    fontSize: Typography.fontSizes.sm,
    lineHeight: 20,
  },
  card: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: Spacing.md,
  },
  action: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.sm,
  },
  actionText: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
    color: "#fff",
  },
  cardText: {
    fontSize: Typography.fontSizes.sm,
    lineHeight: 20,
  },
});
