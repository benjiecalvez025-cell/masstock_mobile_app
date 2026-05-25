import { useAppContext } from '@/context/app-context';
import { useOrders } from '@/hooks/use-firestore';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
<<<<<<< HEAD
import React from 'react';
=======
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useState, useMemo } from 'react';
>>>>>>> de0fad422e2d20ea1624737c7a5a5c2b53602267
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
<<<<<<< HEAD
=======
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
>>>>>>> de0fad422e2d20ea1624737c7a5a5c2b53602267
} from 'react-native';

export default function OrdersScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user } = useAppContext();
  const { orders, loading } = useOrders(user?.id);

<<<<<<< HEAD
=======
  // Filter states
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'all' | 'thisMonth' | 'lastMonth'>('all');
  const [clientSearch, setClientSearch] = useState('');

  const statuses = ['pending', 'packing', 'in-transit', 'delivered', 'cancelled'];

  // Filter orders based on selected filters
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Status filter
    if (selectedStatus) {
      filtered = filtered.filter((order) => order.status === selectedStatus);
    }

    // Date range filter
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    if (dateRange === 'thisMonth') {
      filtered = filtered.filter((order) => {
        const orderDate =
          order.createdAt?.toDate?.() || new Date(order.createdAt);
        return (
          orderDate.getMonth() === currentMonth &&
          orderDate.getFullYear() === currentYear
        );
      });
    } else if (dateRange === 'lastMonth') {
      const lastMonthDate = new Date(currentYear, currentMonth - 1);
      filtered = filtered.filter((order) => {
        const orderDate =
          order.createdAt?.toDate?.() || new Date(order.createdAt);
        return (
          orderDate.getMonth() === lastMonthDate.getMonth() &&
          orderDate.getFullYear() === lastMonthDate.getFullYear()
        );
      });
    }

    // Client search filter
    if (clientSearch.trim()) {
      const search = clientSearch.toLowerCase();
      filtered = filtered.filter((order) => {
        const clientName = order.clientInfo?.storeName || '';
        return clientName.toLowerCase().includes(search);
      });
    }

    return filtered;
  }, [orders, selectedStatus, dateRange, clientSearch]);

>>>>>>> de0fad422e2d20ea1624737c7a5a5c2b53602267
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

<<<<<<< HEAD
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
=======
  const hasActiveFilters =
    selectedStatus !== null || dateRange !== 'all' || clientSearch.trim() !== '';

  const resetFilters = () => {
    setSelectedStatus(null);
    setDateRange('all');
    setClientSearch('');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Order History</Text>
            <Text style={styles.headerSubtitle}>Track your latest grocery deliveries</Text>
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterVisible(true)}
          >
            <MaterialIcons name="tune" size={24} color="#fff" />
            {hasActiveFilters && <View style={styles.filterBadge} />}
          </TouchableOpacity>
        </View>
      </View>

      {filteredOrders.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {hasActiveFilters ? 'No orders match your filters' : 'No orders yet'}
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {hasActiveFilters
              ? 'Try adjusting your filter criteria'
              : 'Start shopping and your latest purchases will appear here.'}
          </Text>
          {hasActiveFilters && (
            <TouchableOpacity
              style={[styles.resetButton, { backgroundColor: colors.primary }]}
              onPress={resetFilters}
            >
              <Text style={styles.resetButtonText}>Reset Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <>
          <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
            Showing {filteredOrders.length} of {orders.length} orders
          </Text>
          <FlatList
            contentContainerStyle={styles.listContent}
            data={filteredOrders}
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
          </>
        )}

      {/* Filter Modal */}
      <Modal visible={filterVisible} transparent animationType="slide">
        <View style={styles.filterOverlay}>
          <View
            style={[styles.filterModal, { backgroundColor: colors.background }]}
          >
            <View style={styles.filterHeader}>
              <Text style={[styles.filterTitle, { color: colors.text }]}>
                Filter Orders
              </Text>
              <TouchableOpacity onPress={() => setFilterVisible(false)}>
                <MaterialIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterContent}>
              {/* Client Search */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterLabel, { color: colors.text }]}>
                  Search by Client/Store
                </Text>
                <TextInput
                  style={[
                    styles.searchInput,
                    { backgroundColor: colors.surface, color: colors.text },
                  ]}
                  placeholder="Enter store name..."
                  placeholderTextColor={colors.textSecondary}
                  value={clientSearch}
                  onChangeText={setClientSearch}
                />
              </View>

              {/* Status Filter */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterLabel, { color: colors.text }]}>
                  Order Status
                </Text>
                <View style={styles.statusButtons}>
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor:
                          selectedStatus === null ? colors.primary : colors.surface,
                      },
                    ]}
                    onPress={() => setSelectedStatus(null)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color: selectedStatus === null ? '#fff' : colors.text,
                        },
                      ]}
                    >
                      All
                    </Text>
                  </TouchableOpacity>
                  {statuses.map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.filterChip,
                        {
                          backgroundColor:
                            selectedStatus === status
                              ? colors.primary
                              : colors.surface,
                        },
                      ]}
                      onPress={() => setSelectedStatus(status)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          {
                            color:
                              selectedStatus === status ? '#fff' : colors.text,
                          },
                        ]}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Date Range Filter */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterLabel, { color: colors.text }]}>
                  Date Range
                </Text>
                <View style={styles.dateButtons}>
                  {['all', 'thisMonth', 'lastMonth'].map((range) => (
                    <TouchableOpacity
                      key={range}
                      style={[
                        styles.dateButton,
                        {
                          backgroundColor:
                            dateRange === range ? colors.primary : colors.surface,
                        },
                      ]}
                      onPress={() =>
                        setDateRange(range as 'all' | 'thisMonth' | 'lastMonth')
                      }
                    >
                      <Text
                        style={[
                          styles.buttonText,
                          {
                            color:
                              dateRange === range ? '#fff' : colors.text,
                          },
                        ]}
                      >
                        {range === 'all'
                          ? 'All Time'
                          : range === 'thisMonth'
                          ? 'This Month'
                          : 'Last Month'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Filter Actions */}
            <View style={styles.filterFooter}>
              {hasActiveFilters && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.surface }]}
                  onPress={resetFilters}
                >
                  <Text style={[styles.actionButtonText, { color: colors.text }]}>
                    Reset
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                onPress={() => setFilterVisible(false)}
              >
                <Text style={styles.actionButtonTextPrimary}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
>>>>>>> de0fad422e2d20ea1624737c7a5a5c2b53602267
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
<<<<<<< HEAD
=======
  resultCount: {
    fontSize: Typography.fontSizes.sm,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
  },
  resetButton: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  filterButton: {
    position: 'relative',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
  },
  filterOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '90%',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
  },
  filterContent: {
    padding: Spacing.lg,
  },
  filterSection: {
    marginBottom: Spacing.xl,
  },
  filterLabel: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
    marginBottom: Spacing.sm,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSizes.md,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xl,
  },
  chipText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
  },
  dateButtons: {
    gap: Spacing.sm,
  },
  dateButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
  },
  filterFooter: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
  },
  actionButtonTextPrimary: {
    color: '#fff',
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
  },
>>>>>>> de0fad422e2d20ea1624737c7a5a5c2b53602267
});
