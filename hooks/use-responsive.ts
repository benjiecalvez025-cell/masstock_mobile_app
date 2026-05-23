import { useWindowDimensions } from 'react-native';

export interface ResponsiveSize {
  isSmallPhone: boolean;
  isStandardPhone: boolean;
  isLargePhone: boolean;
  isTablet: boolean;
  isLandscape: boolean;
  width: number;
  height: number;
}

export function useResponsive(): ResponsiveSize {
  const { width, height } = useWindowDimensions();

  const isSmallPhone = width < 380;
  const isStandardPhone = width >= 380 && width < 480;
  const isLargePhone = width >= 480 && width < 600;
  const isTablet = width >= 600;
  const isLandscape = width > height;

  return {
    isSmallPhone,
    isStandardPhone,
    isLargePhone,
    isTablet,
    isLandscape,
    width,
    height,
  };
}

/**
 * Get responsive spacing multiplier based on screen size
 */
export function getResponsiveSpacing(baseSpacing: number, size: ResponsiveSize): number {
  if (size.isSmallPhone) return Math.round(baseSpacing * 0.8);
  if (size.isStandardPhone) return baseSpacing;
  if (size.isLargePhone) return Math.round(baseSpacing * 1.1);
  if (size.isTablet) return Math.round(baseSpacing * 1.3);
  return baseSpacing;
}

/**
 * Get responsive font size based on screen size
 */
export function getResponsiveFontSize(baseFontSize: number, size: ResponsiveSize): number {
  if (size.isSmallPhone) return baseFontSize * 0.9;
  if (size.isStandardPhone) return baseFontSize;
  if (size.isLargePhone) return baseFontSize * 1.05;
  if (size.isTablet) return baseFontSize * 1.2;
  return baseFontSize;
}

/**
 * Get responsive column count for grid layouts
 */
export function getGridColumns(size: ResponsiveSize): number {
  if (size.isSmallPhone) return 2;
  if (size.isStandardPhone) return 2;
  if (size.isLargePhone) return 3;
  if (size.isTablet) return 4;
  return 2;
}

/**
 * Get responsive width percentage for items
 */
export function getItemWidth(size: ResponsiveSize, columns: number): number {
  return size.width / columns;
}
