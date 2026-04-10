/**
 * Design System Tokens — single source of truth.
 *
 * This file is consumed by both TypeScript code (via `tokens` import)
 * and by tailwind.config.js (via require). Values here MUST match what
 * ends up in NativeWind classes.
 *
 * Usage in TSX (for `color=` props that can't use className):
 *   import { tokens } from "@presentation/theme/design-tokens";
 *   <ChevronLeft size={24} color={tokens.colors.text.secondary} />
 *
 * Usage in className (NativeWind):
 *   <View className="bg-background-primary text-text-primary" />
 */

// ============================================================================
// Colors — dark mode (primary theme)
// ============================================================================

const darkColors = {
  primary: {
    main: "#135BEC",
    light: "#4A7EF0",
    dark: "#0D47B8",
  },
  background: {
    primary: "#0A1628",
    secondary: "#0F1F38",
    tertiary: "#152840",
  },
  text: {
    primary: "#FFFFFF",
    secondary: "#94A3B8",
    tertiary: "#64748B",
  },
  surface: {
    card: "#1A2942",
    hover: "#243352",
  },
  ui: {
    border: "#1E293B",
    divider: "#334155",
    overlay: "rgba(0, 0, 0, 0.5)",
  },
  border: {
    primary: "#1E293B",
    subtle: "#1E293B",
  },
} as const;

// ============================================================================
// Colors — light mode
// ============================================================================

const lightColors = {
  primary: {
    main: "#135BEC",
    light: "#4A7EF0",
    dark: "#0D47B8",
  },
  background: {
    primary: "#FFFFFF",
    secondary: "#F1F5F9",
    tertiary: "#E2E8F0",
  },
  text: {
    primary: "#0F172A",
    secondary: "#64748B",
    tertiary: "#94A3B8",
  },
  surface: {
    card: "#FFFFFF",
    hover: "#F1F5F9",
  },
  ui: {
    border: "#E2E8F0",
    divider: "#CBD5E1",
    overlay: "rgba(15, 23, 42, 0.5)",
  },
  border: {
    primary: "#E2E8F0",
    subtle: "#E2E8F0",
  },
} as const;

// ============================================================================
// Colors — shared (status, accent) — same in both modes
// ============================================================================

const statusColors = {
  success: "#10B981",
  error: "#EF4444",
  warning: "#F59E0B",
  info: "#3B82F6",
} as const;

const accentColors = {
  orange: "#F97316",
  green: "#22C55E",
} as const;

// ============================================================================
// Spacing (in px, 4px base scale)
// ============================================================================

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

// ============================================================================
// Border radius
// ============================================================================

const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
} as const;

// ============================================================================
// Typography
// ============================================================================

const typography = {
  fontFamily: {
    regular: "System",
    medium: "System",
    semiBold: "System",
    bold: "System",
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  fontWeight: {
    regular: "400" as const,
    medium: "500" as const,
    semiBold: "600" as const,
    bold: "700" as const,
  },
} as const;

// ============================================================================
// Shadows
// ============================================================================

const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// ============================================================================
// Animation
// ============================================================================

const animation = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
  },
} as const;

// ============================================================================
// Exported tokens object — primary shape used across the app
// ============================================================================

export const tokens = {
  colors: {
    ...darkColors,
    status: statusColors,
    accent: accentColors,
  },
  spacing,
  borderRadius,
  typography,
  shadows,
  animation,
} as const;

// Light mode variants — exposed separately for components that need both
export const lightTokens = {
  colors: {
    ...lightColors,
    status: statusColors,
    accent: accentColors,
  },
} as const;

// ============================================================================
// Tailwind-compatible export — consumed by tailwind.config.js
// ============================================================================

/**
 * Exported in a shape that tailwind.config.js can spread into `theme.extend`.
 * Dark colors live at the root (default), light colors under the `light`
 * namespace, matching the original tailwind config.
 */
export const tailwindTheme = {
  colors: {
    primary: darkColors.primary,
    background: darkColors.background,
    text: darkColors.text,
    surface: darkColors.surface,
    ui: darkColors.ui,
    border: darkColors.border,
    status: statusColors,
    accent: accentColors,
    light: {
      bg: lightColors.background.primary,
      bgSecondary: lightColors.background.secondary,
      bgTertiary: lightColors.background.tertiary,
      text: lightColors.text.primary,
      textSecondary: lightColors.text.secondary,
      textTertiary: lightColors.text.tertiary,
      card: lightColors.surface.card,
      border: lightColors.ui.border,
      divider: lightColors.ui.divider,
    },
  },
  spacing: Object.fromEntries(
    Object.entries(spacing).map(([k, v]) => [k, `${v}px`]),
  ),
  borderRadius: Object.fromEntries(
    Object.entries(borderRadius).map(([k, v]) =>
      k === "full" ? [k, "9999px"] : [k, `${v}px`],
    ),
  ),
  fontSize: Object.fromEntries(
    Object.entries(typography.fontSize)
      .filter(([k]) => k !== "display")
      .map(([k, v]) => [k, `${v}px`]),
  ),
} as const;

// ============================================================================
// Legacy aliases — DO NOT USE in new code. Kept for gradual migration.
// ============================================================================

/** @deprecated Use `tokens` instead */
export const DesignTokens = tokens;

export type TokensType = typeof tokens;
export type LightTokensType = typeof lightTokens;
