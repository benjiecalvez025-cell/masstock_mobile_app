import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface FilterSortModalProps {
  visible: boolean;
  onClose: () => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
}

export function FilterSortModal({
  visible,
  onClose,
  sortBy,
  onSortChange,
  selectedCategory,
  onCategoryChange,
  categories,
}: FilterSortModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const sortOptions = [
    { id: 'popular', label: 'Most Popular' },
    { id: 'price-low', label: 'Price: Low to High' },
    { id: 'price-high', label: 'Price: High to Low' },
    { id: 'rating', label: 'Highest Rated' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Filter & Sort
            </Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {/* Sort Options */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Sort By
              </Text>
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.option,
                    sortBy === option.id && {
                      backgroundColor: colors.primary + '20',
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => onSortChange(option.id)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: colors.text },
                      sortBy === option.id && { color: colors.primary },
                    ]}
                  >
                    {option.label}
                  </Text>
                  {sortBy === option.id && (
                    <MaterialIcons
                      name="check"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Category Filter */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Category
              </Text>
              <TouchableOpacity
                style={[
                  styles.option,
                  !selectedCategory && {
                    backgroundColor: colors.primary + '20',
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => onCategoryChange('')}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: colors.text },
                    !selectedCategory && { color: colors.primary },
                  ]}
                >
                  All Categories
                </Text>
                {!selectedCategory && (
                  <MaterialIcons
                    name="check"
                    size={20}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.option,
                    selectedCategory === category && {
                      backgroundColor: colors.primary + '20',
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => onCategoryChange(category)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: colors.text },
                      selectedCategory === category && { color: colors.primary },
                    ]}
                  >
                    {category}
                  </Text>
                  {selectedCategory === category && (
                    <MaterialIcons
                      name="check"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: colors.primary }]}
              onPress={onClose}
            >
              <Text style={styles.applyText}>Apply Filters</Text>
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
    maxHeight: '70%',
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
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.md,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: Spacing.sm,
  },
  optionText: {
    fontSize: Typography.sizes.md,
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  applyButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  applyText: {
    color: '#fff',
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
  },
});
