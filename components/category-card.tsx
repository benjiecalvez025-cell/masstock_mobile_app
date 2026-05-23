import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

interface CategoryCardProps {
  id: string;
  name: string;
  icon: string;
  color: string;
  onPress?: () => void;
  isDarkTheme?: boolean;
}

export function CategoryCard({
  id,
  name,
  icon,
  color,
  onPress,
  isDarkTheme = false,
}: CategoryCardProps) {
  const colors = isDarkTheme ? Colors.dark : Colors.light;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: color + '20',
          borderColor: color,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: color + '40',
          },
        ]}
      >
        <MaterialIcons name={icon as any} size={28} color={color} />
      </View>
      <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
        {name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    marginHorizontal: Spacing.sm,
    minWidth: 100,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  name: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    textAlign: 'center',
  },
});
