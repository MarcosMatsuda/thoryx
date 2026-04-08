import { create } from "zustand";
import { SecureStorageAdapter } from "@infrastructure/storage/secure-storage.adapter";

export type ThemeMode = "system" | "dark" | "light";

const THEME_KEY = "app_theme";
const storage = new SecureStorageAdapter(
  "settings-storage",
  "thoryx-mmkv-encryption-key-2026",
);

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: "system",

  setMode: async (mode: ThemeMode) => {
    set({ mode });
    await storage.set(THEME_KEY, mode);
  },

  loadTheme: async () => {
    try {
      const saved = await storage.get(THEME_KEY);
      if (saved === "dark" || saved === "light" || saved === "system") {
        set({ mode: saved });
      }
    } catch {
      // Keep default "system"
    }
  },
}));
