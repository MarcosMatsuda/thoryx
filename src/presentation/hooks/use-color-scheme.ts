import { useColorScheme as useNativeColorScheme } from "react-native";
import { useThemeStore } from "@stores/theme.store";

export function useColorScheme(): "light" | "dark" {
  const systemScheme = useNativeColorScheme();
  const { mode } = useThemeStore();

  if (mode === "dark") return "dark";
  if (mode === "light") return "light";
  // mode === "system"
  return systemScheme ?? "dark";
}
