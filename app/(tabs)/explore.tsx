import { ProductCard } from "@/components/product-card";
import { Colors, Spacing, Typography } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCategories, useProducts } from "@/hooks/use-firestore";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ExploreScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const { products, loading: productsLoading } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();

  const featuredProducts = products.slice(0, 4);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <View style={[styles.hero, { backgroundColor: colors.primary }]}>
        <Text style={[styles.heroTitle, { color: "#fff" }]}>Discover More</Text>
        <Text style={[styles.heroSubtitle, { color: "#f1f1f1" }]}>
          Browse trending categories and top wholesale picks from your
          marketplace.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Browse categories
        </Text>
        {categoriesLoading ? (
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={styles.sectionLoader}
          />
        ) : (
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => undefined}
                style={[
                  styles.categoryButton,
                  { backgroundColor: colors.surface },
                ]}
              >
                <Text style={[styles.categoryText, { color: colors.text }]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Top picks
          </Text>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            {featuredProducts.length} items
          </Text>
        </View>

        {productsLoading ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={styles.sectionLoader}
          />
        ) : (
          <View style={styles.gridWrapper}>
            {featuredProducts.map((product) => (
              <View key={product.id} style={styles.gridCell}>
                <ProductCard
                  id={product.id}
                  name={product.name}
                  category={product.category}
                  price={product.wholesalePrice}
                  originalPrice={product.retailPrice}
                  image={product.image}
                  minOrder={product.minOrder}
                  rating={product.rating}
                  reviews={product.reviews}
                  onPress={() => {}}
                />
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Fresh seller updates
        </Text>
        <Text
          style={[styles.sectionDescription, { color: colors.textSecondary }]}
        >
          Stay on top of the latest product trends and inventory updates across
          the marketplace.
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
  hero: {
    margin: Spacing.lg,
    borderRadius: 24,
    padding: Spacing.lg,
  },
  heroTitle: {
    fontSize: Typography.fontSizes.xxxl,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    fontSize: Typography.fontSizes.md,
    lineHeight: 22,
  },
  section: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
  },
  sectionLabel: {
    fontSize: Typography.fontSizes.sm,
  },
  sectionDescription: {
    marginTop: Spacing.sm,
    fontSize: Typography.fontSizes.sm,
    lineHeight: 20,
  },
  categoryList: {
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  categoryButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 14,
    marginRight: Spacing.sm,
  },
  categoryText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
  },
  sectionLoader: {
    marginTop: Spacing.md,
  },

  // 2-column inline grid: consistent spacing and guaranteed side-by-side cards.
  gridWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    columnGap: Spacing.sm,
    rowGap: Spacing.sm,
  },
  gridCell: {
    // ProductCard has fixed width (160) + margin; ensure 2 fit by using flex basis.
    width: "48%",
    flexBasis: "48%",
    marginBottom: 0,
  },
});
