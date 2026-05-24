import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

export interface QuickAccessItemProps {
  title: string;
  iconName: string;
  badge?: string;
  onPress: () => void;
}

export function QuickAccessItem({
  title,
  iconName,
  badge,
  onPress,
}: QuickAccessItemProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.cardBg }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconWrapper}>
        <MaterialIcons name={iconName as any} size={32} color={colors.primary} />
        {badge && (
          <View style={[styles.badge, { backgroundColor: colors.accent }]}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>
      
      <Text
        style={[styles.title, { color: colors.text }]}
        numberOfLines={2}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
  },
  iconWrapper: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
  },
  title: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: '500',
    textAlign: 'center',
  },
});
