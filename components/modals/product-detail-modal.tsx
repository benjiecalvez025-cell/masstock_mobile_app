import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Image,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface ProductDetailModalProps {
  visible: boolean;
  onClose: () => void;
  product: any;
  onAddToCart?: (productId: string, quantity: number) => void;
  priceType?: "retail" | "wholesale";
}

export function ProductDetailModal({
  visible,
  onClose,
  product,
  onAddToCart,
  priceType = "wholesale",
}: ProductDetailModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [quantity, setQuantity] = useState(1);

  const displayPrice = priceType === "retail" ? product?.retailPrice : product?.wholesalePrice;
  const originalPrice = priceType === "retail" ? product?.wholesalePrice : product?.retailPrice;

  if (!product) return null;

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product.id, quantity);
      onClose();
    }
  };

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > product.minOrder) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Product Details
            </Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Product Image */}
            <Image
              source={{ uri: product.image }}
              style={styles.productImage}
              resizeMode="cover"
            />

            {/* Product Info */}
            <View style={styles.productInfo}>
              <Text style={[styles.productName, { color: colors.text }]}>
                {product.name}
              </Text>

              <View style={styles.priceContainer}>
                <Text style={[styles.price, { color: colors.primary }]}>
                  ₱{(displayPrice || 0).toLocaleString()}
                </Text>
                {originalPrice && (
                  <Text style={[styles.originalPrice, { color: colors.text }]}>
                    ₱{originalPrice.toLocaleString()}
                  </Text>
                )}
              </View>

              {/* Stock Info */}
              <View style={styles.stockInfo}>
                <Text style={[styles.stockText, { color: colors.text }]}>
                  Stock: {product.stock} available
                </Text>
                <Text style={[styles.minOrderText, { color: colors.text }]}>
                  Minimum order: {product.minOrder}
                </Text>
              </View>

              {/* Description */}
              <Text style={[styles.description, { color: colors.text }]}>
                {product.description || 'High-quality product perfect for your business needs. This item is sourced from trusted suppliers and meets our quality standards.'}
              </Text>
            </View>
          </ScrollView>

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={[styles.quantityLabel, { color: colors.text }]}>
              Quantity
            </Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={[styles.quantityButton, { borderColor: colors.primary }]}
                onPress={decreaseQuantity}
                disabled={quantity <= product.minOrder}
              >
                <MaterialIcons
                  name="remove"
                  size={20}
                  color={quantity <= product.minOrder ? '#ccc' : colors.primary}
                />
              </TouchableOpacity>

              <Text style={[styles.quantityText, { color: colors.text }]}>
                {quantity}
              </Text>

              <TouchableOpacity
                style={[styles.quantityButton, { borderColor: colors.primary }]}
                onPress={increaseQuantity}
                disabled={quantity >= product.stock}
              >
                <MaterialIcons
                  name="add"
                  size={20}
                  color={quantity >= product.stock ? '#ccc' : colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Add to Cart Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.addToCartButton, { backgroundColor: colors.primary }]}
              onPress={handleAddToCart}
            >
              <MaterialIcons name="add-shopping-cart" size={20} color="#fff" />
              <Text style={styles.addToCartText}>
                Add to Cart - ₱{(product.wholesalePrice * quantity).toLocaleString()}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
  content: {
    flex: 1,
  },
  productImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
  },
  productInfo: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  productName: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: BorderRadius.md,
  },
  price: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    marginRight: Spacing.sm,
  },
  originalPrice: {
    fontSize: Typography.sizes.lg,
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  categoryRating: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  category: {
    fontSize: Typography.sizes.md,
    opacity: 0.7,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: Typography.sizes.sm,
    marginLeft: Spacing.xs,
  },
  stockInfo: {
    marginBottom: Spacing.md,
  },
  stockText: {
    fontSize: Typography.sizes.sm,
    marginBottom: Spacing.xs,
  },
  minOrderText: {
    fontSize: Typography.sizes.sm,
    opacity: 0.7,
  },
  description: {
    fontSize: Typography.sizes.md,
    lineHeight: 22,
  },
  quantitySection: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  quantityLabel: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.md,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    marginHorizontal: Spacing.lg,
    minWidth: 30,
    textAlign: 'center',
  },
  footer: {
    padding: Spacing.lg,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  addToCartText: {
    color: '#fff',
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    marginLeft: Spacing.sm,
  },
});
