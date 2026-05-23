import { CategoryCard } from "@/components/category-card";
import { HubButton } from "@/components/hub-button";
import { ProductCard } from "@/components/product-card";
import { QuickAccessItem } from "@/components/quick-access-item";
import { Colors, Shadows, Spacing, Typography } from "@/constants/theme";
import { useAppContext } from "@/context/app-context";
import { Product, useCategories, useOrders, useProducts } from "@/hooks/use-firestore";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { useColorScheme } from "@/hooks/use-color-scheme";
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
    const categoryCounts = products.reduce<Record<string, number>>((counts, product) => {
      if (product.category) {
        counts[product.category] = (counts[product.category] || 0) + 1;
      }
      return counts;
    }, {});

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
      caption: "Available in marketplace",
    },
    {
      id: "categories",
      label: "Categories",
      value: `${categories.length}`,
      caption: "Active product sections",
    },
    {
      id: "top",
      label: "Top Category",
      value: topCategory,
      caption: "Most stocked category",
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
    { title: "My Orders", iconName: "assignment", badge: "2", route: "/orders" },
    { title: "Messages", iconName: "mail", badge: "5", route: "/profile" },
    { title: "Wallet", iconName: "account-balance-wallet", badge: undefined, route: "/wallet" },
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
      <View style={[styles.hero, { backgroundColor: colors.primary }]}> 
        <View style={styles.heroText}>
          <Text style={styles.greeting}>Hello, {user?.name?.split(" ")[0] || "Guest"}! ??</Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>

        <View style={[styles.walletCard, { backgroundColor: colors.surface }]}> 
          <Text style={styles.walletLabel}>E-Wallet Balance</Text>
          <Text style={styles.walletAmount}>₱{(user?.ewallet || 0).toLocaleString()}</Text>
          <Text style={[styles.walletSub, { color: colors.textSecondary }]}>
            {activeOrdersCount} active order{activeOrdersCount !== 1 ? "s" : ""} • {totalProducts} products available
          </Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        {metrics.map((item) => (
          <View key={item.id} style={[styles.metricCard, Shadows.sm, { backgroundColor: colors.surface }]}> 
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{item.label}</Text>
            <Text style={[styles.metricValue, { color: colors.primary }]}>{item.value}</Text>
            <Text style={[styles.metricCaption, { color: colors.textSecondary }]}>{item.caption}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Platform Hubs</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/browse")}> 
            <Text style={[styles.viewAll, { color: colors.primary }]}>Explore</Text>
          </TouchableOpacity>
        </View>
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

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Access</Text>
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

      {!categoriesLoading && categories.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Popular Categories</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/browse")}> 
              <Text style={[styles.viewAll, { color: colors.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={categories.slice(0, 8).map((cat, idx) => ({ id: idx.toString(), name: cat, icon: "local-grocery-store", color: colors.primary }))}
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

      {!productsLoading && featuredProducts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Rated Products</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/browse")}> 
              <Text style={[styles.viewAll, { color: colors.primary }]}>See More</Text>
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

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading the latest marketplace data...</Text>
        </View>
      )}

      <View style={[styles.promoBanner, { backgroundColor: colors.accentBg }]}> 
        <View>
          <Text style={[styles.promoTitle, { color: colors.text }]}>Bulk Order Savings</Text>
          <Text style={[styles.promoText, { color: colors.textSecondary }]}>Unlock better prices when you order 50+ items today.</Text>
        </View>
        <TouchableOpacity style={[styles.promoCTA, { backgroundColor: colors.primary }]} onPress={() => router.push("/(tabs)/browse")}> 
          <Text style={styles.promoCTAText}>Shop Deals</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: Spacing.xxxl }} />
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
  hero: {
    padding: Spacing.xl,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroText: {
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: Typography.fontSizes.xxxxl,
    fontWeight: Typography.fontWeights.bold,
    color: "#fff",
    marginBottom: Spacing.sm,
  },
  date: {
    fontSize: Typography.fontSizes.md,
    color: "rgba(255,255,255,0.85)",
  },
  walletCard: {
    padding: Spacing.lg,
    borderRadius: 24,
    width: "100%",
  },
  walletLabel: {
    fontSize: Typography.fontSizes.sm,
    color: "#1A3A52",
    fontWeight: Typography.fontWeights.medium,
    marginBottom: Spacing.xs,
  },
  walletAmount: {
    fontSize: Typography.fontSizes.xxxl,
    fontWeight: Typography.fontWeights.extrabold,
    color: "#1A3A52",
  },
  walletSub: {
    marginTop: Spacing.xs,
    fontSize: Typography.fontSizes.xs,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    marginTop: -Spacing.xl,
    gap: Spacing.md,
  },
  metricCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: 20,
    minWidth: 110,
  },
  metricLabel: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.medium,
    marginBottom: Spacing.xs,
  },
  metricValue: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.extrabold,
  },
  metricCaption: {
    marginTop: Spacing.xs,
    fontSize: Typography.fontSizes.xs,
  },
  section: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
  },
  viewAll: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
  },
  quickAccessRow: {
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  quickAccessList: {
    gap: Spacing.md,
  },
  categoryList: {
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  productList: {
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  loadingText: {
    fontSize: Typography.fontSizes.sm,
    marginTop: Spacing.sm,
  },
  promoBanner: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...Shadows.md,
  },
  promoTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
  },
  promoText: {
    fontSize: Typography.fontSizes.sm,
    marginTop: Spacing.xs,
    maxWidth: 180,
  },
  promoCTA: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: 14,
  },
  promoCTAText: {
    color: "#fff",
    fontWeight: Typography.fontWeights.bold,
  },
});
