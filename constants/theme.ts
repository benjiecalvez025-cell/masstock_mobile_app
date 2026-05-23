/**
 * Enhanced Design System for Masstock Mobile App
 * Comprehensive theme with colors, spacing, typography, shadows, and more
 */

import { Platform } from "react-native";

// ============ COLOR PALETTE ============

const tintColorLight = "#5DAA68";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    // Primary colors
    primary: "#5DAA68",
    primaryLight: "#3ba9c7",
    primaryBg: "#e8f5f9",

    // Secondary colors
    secondary: "#1976d2",
    secondaryLight: "#42a5f5",

    // Accent colors
    accent: "#ff6f00",
    accentBg: "#ffe8d1",

    // Text colors
    text: "#11181C",
    textSecondary: "#666666",

    // Extra UI colors used by older screens
    darkGray: "#687076",
    danger: "#D32F2F",

    // Background colors
    background: "#fff",
    surface: "#f5f5f5",
    cardBg: "#fafafa",

    // Border and divider
    border: "#e0e0e0",
    lightGray: "#f0f0f0",
    mediumGray: "#d0d0d0",
    veryLightGray: "#f9f9f9",

    // Icon colors
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    tint: tintColorLight,
  },
  dark: {
    // Legacy keys
    darkGray: "#687076",
    danger: "#D32F2F",

    // Primary colors
    primary: "#4fc3f7",
    primaryLight: "#80deea",
    primaryBg: "#1a3a3f",

    // Secondary colors
    secondary: "#64b5f6",
    secondaryLight: "#90caf9",

    // Accent colors
    accent: "#ffb74d",
    accentBg: "#3d2817",

    // Text colors
    text: "#ECEDEE",
    textSecondary: "#aaaaaa",

    // Background colors
    background: "#151718",
    surface: "#2a2a2a",
    cardBg: "#1f1f1f",

    // Border and divider
    border: "#444444",
    lightGray: "#333333",
    mediumGray: "#555555",
    veryLightGray: "#222222",

    // Icon colors
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    tint: tintColorDark,
  },
};

// ============ SPACING SYSTEM ============

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

// ============ TYPOGRAPHY SYSTEM ============

export const Typography = {
  // Font sizes (in pixels)
  fontSizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    xxxxl: 32,
  },

  // Font weights
  fontWeights: {
    light: "300" as any,
    normal: "400" as any,
    medium: "500" as any,
    semibold: "600" as any,
    bold: "700" as any,
    extrabold: "800" as any,
  },

  // Backward compatible aliases (some components reference Typography.sizes / Typography.weights)
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    xxxxl: 32,
  },
  weights: {
    light: "300" as any,
    normal: "400" as any,
    medium: "500" as any,
    semibold: "600" as any,
    bold: "700" as any,
    extrabold: "800" as any,
  },

  // Predefined text styles
  heading1: {
    fontSize: 32,
    fontWeight: "700" as any,
    lineHeight: 40,
  },
  heading2: {
    fontSize: 24,
    fontWeight: "700" as any,
    lineHeight: 32,
  },
  heading3: {
    fontSize: 20,
    fontWeight: "600" as any,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as any,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: "400" as any,
    lineHeight: 21,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as any,
    lineHeight: 18,
  },
};

// ============ SHADOW SYSTEM ============

export const Shadows = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    default: {
      elevation: 2,
    },
  }),
  md: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
    },
    default: {
      elevation: 4,
    },
  }),
  lg: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    default: {
      elevation: 6,
    },
  }),
  xl: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
    },
    default: {
      elevation: 8,
    },
  }),
};

// ============ BORDER RADIUS ============

export const BorderRadius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
