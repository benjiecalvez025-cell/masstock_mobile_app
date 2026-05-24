import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  FlatList,
} from "react-native";
import { Colors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface AgentComparisonModalProps {
  visible: boolean;
  onClose: () => void;
  agents: any[];
  currentUserId?: string;
  loading?: boolean;
  onSortByCommission?: () => void;
  onSortBySales?: () => void;
}

export function AgentComparisonModal({
  visible,
  onClose,
  agents,
  currentUserId,
  loading = false,
  onSortByCommission,
  onSortBySales,
}: AgentComparisonModalProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const [sortBy, setSortBy] = useState<"sales" | "commission">("sales");

  const handleSortBySales = () => {
    setSortBy("sales");
    onSortBySales?.();
  };

  const handleSortByCommission = () => {
    setSortBy("commission");
    onSortByCommission?.();
  };

  const getRankBadgeColor = (index: number) => {
    if (index === 0) return "#FFD700"; // Gold
    if (index === 1) return "#C0C0C0"; // Silver
    if (index === 2) return "#CD7F32"; // Bronze
    return colors.secondary;
  };

  const getRankLabel = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `${index + 1}`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Agent Leaderboard
            </Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Sort Controls */}
          <View style={[styles.sortControls, { backgroundColor: colors.surface }]}>
            <TouchableOpacity
              style={[
                styles.sortButton,
                {
                  backgroundColor:
                    sortBy === "sales" ? colors.primary : colors.background,
                  borderColor: colors.primary,
                },
              ]}
              onPress={handleSortBySales}
            >
              <MaterialIcons
                name="trending-up"
                size={16}
                color={sortBy === "sales" ? "#fff" : colors.primary}
              />
              <Text
                style={[
                  styles.sortButtonText,
                  {
                    color: sortBy === "sales" ? "#fff" : colors.text,
                  },
                ]}
              >
                By Sales
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sortButton,
                {
                  backgroundColor:
                    sortBy === "commission" ? colors.primary : colors.background,
                  borderColor: colors.primary,
                },
              ]}
              onPress={handleSortByCommission}
            >
              <MaterialIcons
                name="monetization-on"
                size={16}
                color={sortBy === "commission" ? "#fff" : colors.primary}
              />
              <Text
                style={[
                  styles.sortButtonText,
                  {
                    color: sortBy === "commission" ? "#fff" : colors.text,
                  },
                ]}
              >
                By Commission
              </Text>
            </TouchableOpacity>
          </View>

          {/* Agents List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: colors.text }]}>
                Loading agents...
              </Text>
            </View>
          ) : agents.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons
                name="group"
                size={40}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyText, { color: colors.text }]}>
                No agents found
              </Text>
            </View>
          ) : (
            <FlatList
              data={agents}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              scrollEnabled={false}
              renderItem={({ item, index }) => {
                const isCurrentUser = item.id === currentUserId;
                return (
                  <View
                    style={[
                      styles.agentCard,
                      {
                        backgroundColor: isCurrentUser
                          ? colors.primary + "15"
                          : colors.surface,
                        borderColor: isCurrentUser ? colors.primary : "transparent",
                        borderWidth: isCurrentUser ? 2 : 0,
                      },
                    ]}
                  >
                    <View style={styles.rankContainer}>
                      <View
                        style={[
                          styles.rankBadge,
                          {
                            backgroundColor: getRankBadgeColor(index),
                          },
                        ]}
                      >
                        <Text style={styles.rankText}>
                          {getRankLabel(index)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.agentInfo}>
                      <View style={styles.nameRow}>
                        <Text
                          style={[
                            styles.agentName,
                            {
                              color: colors.text,
                              fontWeight: isCurrentUser ? "700" : "600",
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                        {isCurrentUser && (
                          <Text style={styles.youBadge}>You</Text>
                        )}
                      </View>

                      <View style={styles.statsGrid}>
                        <View style={styles.stat}>
                          <Text
                            style={[
                              styles.statLabel,
                              { color: colors.textSecondary },
                            ]}
                          >
                            Orders
                          </Text>
                          <Text
                            style={[
                              styles.statValue,
                              { color: colors.primary },
                            ]}
                          >
                            {item.totalOrders}
                          </Text>
                        </View>

                        <View style={styles.stat}>
                          <Text
                            style={[
                              styles.statLabel,
                              { color: colors.textSecondary },
                            ]}
                          >
                            Total Sales
                          </Text>
                          <Text
                            style={[
                              styles.statValue,
                              { color: colors.primary },
                            ]}
                          >
                            ₱{item.totalSales.toLocaleString()}
                          </Text>
                        </View>

                        <View style={styles.stat}>
                          <Text
                            style={[
                              styles.statLabel,
                              { color: colors.textSecondary },
                            ]}
                          >
                            Commission
                          </Text>
                          <Text
                            style={[
                              styles.statValue,
                              { color: "#4CAF50" },
                            ]}
                          >
                            ₱{item.commission.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </Text>
                        </View>

                        <View style={styles.stat}>
                          <Text
                            style={[
                              styles.statLabel,
                              { color: colors.textSecondary },
                            ]}
                          >
                            Avg Order
                          </Text>
                          <Text
                            style={[
                              styles.statValue,
                              { color: colors.secondary },
                            ]}
                          >
                            ₱
                            {item.averageOrderValue.toLocaleString(undefined, {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            })}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              }}
            />
          )}
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
  sortControls: {
    flexDirection: "row",
    gap: Spacing.md,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  sortButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  sortButtonText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: Typography.sizes.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  emptyText: {
    fontSize: Typography.sizes.md,
    marginTop: Spacing.md,
  },
  agentCard: {
    flexDirection: "row",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  rankContainer: {
    marginRight: Spacing.md,
  },
  rankBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  rankText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: "#fff",
  },
  agentInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  agentName: {
    fontSize: Typography.sizes.md,
    flex: 1,
  },
  youBadge: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  statsGrid: {
    flexDirection: "row",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  stat: {
    width: "48%",
  },
  statLabel: {
    fontSize: Typography.sizes.xs,
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
});
