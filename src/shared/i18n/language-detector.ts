import { getLocales } from "expo-localization";
import { SecureStorageAdapter } from "@infrastructure/storage/secure-storage.adapter";

const LANGUAGE_KEY = "app_language";
const storage = new SecureStorageAdapter(
  "settings-storage",
  "thoryx-mmkv-encryption-key-2026",
);

export async function getStoredLanguage(): Promise<string | null> {
  try {
    return await storage.get(LANGUAGE_KEY);
  } catch {
    return null;
  }
}

export async function setStoredLanguage(lang: string): Promise<void> {
  await storage.set(LANGUAGE_KEY, lang);
}

export function getDeviceLanguage(): string {
  const locales = getLocales();
  const locale = locales[0]?.languageTag ?? "pt-BR";
  // Map to supported languages
  if (locale.startsWith("pt")) return "pt-BR";
  return "en-US";
}

export async function detectLanguage(): Promise<string> {
  const stored = await getStoredLanguage();
  if (stored) return stored;
  return getDeviceLanguage();
}
