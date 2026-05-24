import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { Colors, Spacing, Typography, Shadows, BorderRadius } from '@/constants/theme';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  minOrder: number;
  rating?: number;
  reviews?: number;
  onPress?: () => void;
  onAction?: () => void;
  actionLabel?: string;
  isDarkTheme?: boolean;
}

export function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  category,
  minOrder,
  rating = 4.5,
  reviews = 0,
  onPress,
  onAction,
  actionLabel,
  isDarkTheme = false,
}: ProductCardProps) {
  const colors = isDarkTheme ? Colors.dark : Colors.light;
  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          ...Shadows.md,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: image }}
          style={styles.image}
        />
        {discount > 0 && (
          <View style={[styles.discountBadge, { backgroundColor: colors.accent }]}>
            <Text style={styles.discountText}>-{discount}%</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text
          style={[styles.category, { color: colors.secondary }]}
          numberOfLines={1}
        >
          {category}
        </Text>

        <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
          {name}
        </Text>

        {/* Rating */}
        {reviews > 0 && (
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>★ {rating.toFixed(1)}</Text>
            <Text style={[styles.reviews, { color: colors.secondary }]}>
              ({reviews})
            </Text>
          </View>
        )}

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: colors.primary }]}>
            ₱{price.toLocaleString()}
          </Text>
          {originalPrice && (
            <Text style={[styles.originalPrice, { color: colors.secondary }]}>
              ₱{originalPrice.toLocaleString()}
            </Text>
          )}
        </View>

        {/* Min Order */}
        <Text style={[styles.minOrder, { color: colors.secondary }]}>
          Min: {minOrder} units
        </Text>

        {onAction && actionLabel ? (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={onAction}
          >
            <Text style={styles.actionButtonText}>{actionLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginHorizontal: Spacing.sm,
    marginVertical: Spacing.sm,
    width: 160,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
  },
  discountText: {
    color: '#fff',
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.bold,
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  category: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.medium,
  },
  name: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    lineHeight: 18,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  rating: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semibold,
    color: '#FFA500',
  },
  reviews: {
    fontSize: Typography.fontSizes.xs,
  },
  priceContainer: {
    gap: Spacing.xs,
  },
  price: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
  },
  originalPrice: {
    fontSize: Typography.fontSizes.sm,
    textDecorationLine: 'line-through',
  },
  minOrder: {
    fontSize: Typography.fontSizes.xs,
  },
  actionButton: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
  },
});
