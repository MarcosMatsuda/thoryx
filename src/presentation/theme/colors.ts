/**
 * Legacy shim — re-exports from design-tokens.ts in the shape expected by
 * the Expo-template helpers (`useThemeColor`, `ThemedText`, `ThemedView`,
 * `Collapsible`). New code should import `tokens` from design-tokens.ts
 * directly instead of using `Colors`.
 */

import { Platform } from "react-native";

import { tokens, lightTokens } from "@presentation/theme/design-tokens";

export const Colors = {
  light: {
    text: lightTokens.colors.text.primary,
    background: lightTokens.colors.background.primary,
    tint: tokens.colors.primary.main,
    icon: lightTokens.colors.text.secondary,
    tabIconDefault: lightTokens.colors.text.secondary,
    tabIconSelected: tokens.colors.primary.main,
  },
  dark: {
    text: tokens.colors.text.primary,
    background: tokens.colors.background.primary,
    tint: tokens.colors.primary.main,
    icon: tokens.colors.text.secondary,
    tabIconDefault: tokens.colors.text.secondary,
    tabIconSelected: tokens.colors.primary.main,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
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
