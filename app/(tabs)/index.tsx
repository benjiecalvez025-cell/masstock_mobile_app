import { CategoryCard } from "@/components/category-card";
import { HubButton } from "@/components/hub-button";
import { ProductCard } from "@/components/product-card";
import { QuickAccessItem } from "@/components/quick-access-item";
import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from "@/constants/theme";
import { useAppContext } from "@/context/app-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  Product,
  useCategories,
  useOrders,
  useProducts,
} from "@/hooks/use-firestore";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAppContext();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const { products, loading: productsLoading } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  const { orders, loading: ordersLoading } = useOrders(user?.id);

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const featured = [...products]
      .sort((a: Product, b: Product) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5);
    setFeaturedProducts(featured);
  }, [products]);

  const totalProducts = products.length;
  const topCategory = useMemo(() => {
    const categoryCounts = products.reduce<Record<string, number>>(
      (counts, product) => {
        if (product.category) {
          counts[product.category] = (counts[product.category] || 0) + 1;
        }
        return counts;
      },
      {},
    );

    const sortedCategories = Object.entries(categoryCounts).sort(
      ([, aCount], [, bCount]) => bCount - aCount,
    );

    return sortedCategories[0]?.[0] || categories[0] || "Fresh Food";
  }, [products, categories]);

  const metrics = [
    {
      id: "products",
      label: "Products",
      value: `${totalProducts}`,
      caption: "Available",
    },
    {
      id: "categories",
      label: "Categories",
      value: `${categories.length}`,
      caption: "Sections",
    },
    {
      id: "top",
      label: "Top Pick",
      value: topCategory,
      caption: "Category",
    },
  ];

  type HubRoute = "/browse" | "/orders" | "/store";
  const hubs: {
    title: string;
    subtitle: string;
    iconName: string;
    color: "primary" | "secondary" | "accent";
    route: HubRoute;
  }[] = [
    {
      title: "B2B Marketplace",
      subtitle: "Browse wholesale catalog",
      iconName: "shopping-cart",
      color: "primary",
      route: "/browse",
    },
    {
      title: "Financial Hub",
      subtitle: "Review payments",
      iconName: "account-balance-wallet",
      color: "secondary",
      route: "/orders",
    },
    {
      title: "E-Negosyo Hub",
      subtitle: "Seller dashboard",
      iconName: "store",
      color: "accent",
      route: "/store",
    },
  ];

  type QuickAccessRoute = "/orders" | "/profile" | "/cart" | "/wallet";
  const quickAccess: {
    title: string;
    iconName: string;
    badge?: string;
    route: QuickAccessRoute;
  }[] = [
    {
      title: "My Orders",
      iconName: "assignment",
      badge: "2",
      route: "/orders",
    },
    { title: "Messages", iconName: "mail", badge: "5", route: "/profile" },
    {
      title: "Wallet",
      iconName: "account-balance-wallet",
      badge: undefined,
      route: "/wallet",
    },
    { title: "Help", iconName: "help", badge: undefined, route: "/profile" },
  ];

  const formattedDate = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      }),
    [],
  );

  const activeOrdersCount = orders.length;
  const isLoading = productsLoading || categoriesLoading || ordersLoading;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Hero Section */}
      <View style={[styles.hero, { backgroundColor: colors.primary }]}>
        <View style={styles.heroText}>
          <Text style={styles.greeting}>
            Hello, {user?.name?.split(" ")[0] || "Guest"}!
          </Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>

        <View
          style={[
            styles.walletCard,
            { backgroundColor: colors.surface },
            Shadows.sm,
          ]}
        >
          <Text style={[styles.walletLabel, { color: colors.textSecondary }]}>
            E-Wallet Balance
          </Text>
          <Text style={[styles.walletAmount, { color: colors.primary }]}>
            ₱{(user?.ewallet || 0).toLocaleString()}
          </Text>
          <Text style={[styles.walletSub, { color: colors.textSecondary }]}>
            {activeOrdersCount} active order{activeOrdersCount !== 1 ? "s" : ""}{" "}
            • {totalProducts} products
          </Text>
        </View>
      </View>

      {/* Metrics Row */}
      <View style={styles.metricsSection}>
        <View style={styles.metricsRow}>
          {metrics.map((item) => (
            <View
              key={item.id}
              style={[
                styles.metricCard,
                { backgroundColor: colors.surface },
                Shadows.sm,
              ]}
            >
              <Text
                style={[styles.metricLabel, { color: colors.textSecondary }]}
              >
                {item.label}
              </Text>
              <Text style={[styles.metricValue, { color: colors.primary }]}>
                {item.value}
              </Text>
              <Text
                style={[styles.metricCaption, { color: colors.textSecondary }]}
              >
                {item.caption}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Platform Hubs */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Platform Hubs
          </Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/browse")}>
            <Text style={[styles.viewAll, { color: colors.primary }]}>
              Explore
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.hubsContainer}>
          {hubs.map((hub) => (
            <HubButton
              key={hub.title}
              title={hub.title}
              subtitle={hub.subtitle}
              iconName={hub.iconName}
              color={hub.color}
              onPress={() => router.push(hub.route)}
            />
          ))}
        </View>
      </View>

      {/* Quick Access */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Quick Access
        </Text>
        <FlatList
          data={quickAccess}
          renderItem={({ item }) => (
            <QuickAccessItem
              title={item.title}
              iconName={item.iconName}
              badge={item.badge}
              onPress={() => router.push({ pathname: item.route as any })}
            />
          )}
          keyExtractor={(item) => item.title}
          scrollEnabled={false}
          numColumns={2}
          columnWrapperStyle={styles.quickAccessRow}
          contentContainerStyle={styles.quickAccessList}
        />
      </View>

      {/* Popular Categories */}
      {!categoriesLoading && categories.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Popular Categories
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/browse")}>
              <Text style={[styles.viewAll, { color: colors.primary }]}>
                View All
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={categories.slice(0, 8).map((cat, idx) => ({
              id: idx.toString(),
              name: cat,
              icon: "local-grocery-store",
              color: colors.primary,
            }))}
            renderItem={({ item }) => (
              <CategoryCard
                id={item.id}
                name={item.name}
                icon={item.icon}
                color={item.color}
                onPress={() => router.push("/(tabs)/browse")}
              />
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          />
        </View>
      )}

      {/* Top Rated Products */}
      {!productsLoading && featuredProducts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Top Rated Products
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/browse")}>
              <Text style={[styles.viewAll, { color: colors.primary }]}>
                See More
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={featuredProducts}
            renderItem={({ item }) => (
              <ProductCard
                id={item.id}
                name={item.name}
                category={item.category}
                price={item.wholesalePrice}
                originalPrice={item.retailPrice}
                image={item.image}
                minOrder={item.minOrder}
                rating={item.rating}
                reviews={item.reviews}
                onPress={() => router.push("/(tabs)/browse")}
              />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.productList}
          />
        </View>
      )}

      {/* Loading State */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading marketplace data...
          </Text>
        </View>
      )}

      {/* Promo Banner */}
      <View style={styles.section}>
        <View
          style={[
            styles.promoBanner,
            { backgroundColor: colors.accentBg },
            Shadows.md,
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.promoTitle, { color: colors.text }]}>
              Bulk Order Savings
            </Text>
            <Text style={[styles.promoText, { color: colors.textSecondary }]}>
              Unlock better prices when you order 50+ items today.
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.promoCTA, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/(tabs)/browse")}
          >
            <Text style={styles.promoCTAText}>Shop Deals</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Spacing */}
      <View style={{ height: Spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },

  // ── Hero Section ────────────────────────────────────────────────────────
  hero: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  heroText: {
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: Typography.fontSizes.xxxxl,
    fontWeight: Typography.fontWeights.bold,
    color: "#fff",
    marginBottom: Spacing.xs,
    lineHeight: 40,
  },
  date: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    color: "rgba(255,255,255,0.8)",
  },
  walletCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  walletLabel: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.medium,
    marginBottom: Spacing.sm,
  },
  walletAmount: {
    fontSize: Typography.fontSizes.xxxl,
    fontWeight: Typography.fontWeights.extrabold,
    marginBottom: Spacing.sm,
  },
  walletSub: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.medium,
  },

  // ── Metrics Section ──────────────────────────────────────────────────────
  metricsSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: -Spacing.lg,
    marginBottom: Spacing.lg,
  },
  metricsRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  metricCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  metricLabel: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.medium,
    marginBottom: Spacing.sm,
  },
  metricValue: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.extrabold,
    marginBottom: Spacing.xs,
  },
  metricCaption: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.normal,
  },

  // ── Sections ─────────────────────────────────────────────────────────────
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
  },
  viewAll: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
  },

  // ── Hubs ─────────────────────────────────────────────────────────────────
  hubsContainer: {
    gap: Spacing.md,
  },

  // ── Quick Access ─────────────────────────────────────────────────────────
  quickAccessRow: {
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  quickAccessList: {
    gap: Spacing.md,
  },

  // ── Categories & Products ────────────────────────────────────────────────
  categoryList: {
    paddingVertical: Spacing.xs,
    gap: Spacing.md,
  },
  productList: {
    paddingVertical: Spacing.xs,
    gap: Spacing.md,
  },

  // ── Loading State ────────────────────────────────────────────────────────
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xl,
  },
  loadingText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    marginTop: Spacing.md,
  },

  // ── Promo Banner ─────────────────────────────────────────────────────────
  promoBanner: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: Spacing.md,
  },
  promoTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: Spacing.sm,
  },
  promoText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.normal,
    lineHeight: 18,
    maxWidth: 200,
  },
  promoCTA: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  promoCTAText: {
    color: "#fff",
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
  },
});
