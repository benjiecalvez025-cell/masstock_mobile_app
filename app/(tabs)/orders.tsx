import { useAppContext } from '@/context/app-context';
import { useOrders } from '@/hooks/use-firestore';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function OrdersScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user } = useAppContext();
  const { orders, loading } = useOrders(user?.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return '#4CAF50';
      case 'in-transit':
        return '#2196F3';
      case 'packing':
        return '#FF9800';
      case 'cancelled':
        return '#F44336';
      default:
        return colors.secondary;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    if (typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleDateString('en-PH');
    }
    return new Date(timestamp).toLocaleDateString('en-PH');
  };

  if (!user) {
    return (
      <View style={[styles.emptyState, { backgroundColor: colors.background }]}> 
        <Text style={[styles.emptyText, { color: colors.text, fontSize: Typography.fontSizes.lg }]}> 
          Please sign in to view your orders.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}> 
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={[styles.header, { backgroundColor: colors.primary }]}> 
        <Text style={styles.headerTitle}>Order History</Text>
        <Text style={styles.headerSubtitle}>Track your latest grocery deliveries</Text>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No orders yet</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Start shopping and your latest purchases will appear here.</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={orders}
          keyExtractor={(order) => order.id}
          renderItem={({ item }) => (
            <View style={[styles.orderCard, { backgroundColor: colors.cardBg, ...Shadows.sm }]}> 
              <View style={styles.cardHeader}>
                <View>
                  <Text style={[styles.orderId, { color: colors.text }]}>Order #{item.id.slice(-6)}</Text>
                  <Text style={[styles.orderDate, { color: colors.textSecondary }]}>Placed {formatDate(item.createdAt)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}> 
                  <Text style={styles.statusText}>{item.status.replace('-', ' ').toUpperCase()}</Text>
                </View>
              </View>

              <View style={styles.orderInfo}>
                <Text style={[styles.orderLabel, { color: colors.textSecondary }]}>Items</Text>
                <Text style={[styles.orderValue, { color: colors.text }]}>{item.items.length}</Text>
              </View>

              <View style={styles.orderInfo}>
                <Text style={[styles.orderLabel, { color: colors.textSecondary }]}>Total</Text>
                <Text style={[styles.orderValue, { color: colors.primary }]}>₱{item.total.toLocaleString()}</Text>
              </View>

              <View style={styles.orderInfo}> 
                <Text style={[styles.orderLabel, { color: colors.textSecondary }]}>Delivery</Text>
                <Text style={[styles.orderValue, { color: colors.text }]} numberOfLines={1}>{item.shippingAddress}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingTop: Spacing.xxl,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  headerTitle: {
    fontSize: Typography.fontSizes.xxxl,
    fontWeight: Typography.fontWeights.bold,
    color: '#fff',
  },
  headerSubtitle: {
    marginTop: Spacing.sm,
    fontSize: Typography.fontSizes.md,
    color: '#F0F8FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.lg,
    fontSize: Typography.fontSizes.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.fontSizes.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  listContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  orderCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  orderId: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
  },
  orderDate: {
    fontSize: Typography.fontSizes.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    color: '#fff',
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semibold,
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  orderLabel: {
    fontSize: Typography.fontSizes.sm,
  },
  orderValue: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
  },
});
