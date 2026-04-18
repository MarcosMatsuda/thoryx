import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { useUserProfile } from "@presentation/hooks/use-user-profile";
import { useBiometry } from "@presentation/hooks/use-biometry";
import { SettingsSection } from "@presentation/components/settings-section";
import { SettingsItem } from "@presentation/components/settings-item";
import { UserAvatar } from "@presentation/components/user-avatar";
import { SecureStorageAdapter } from "@infrastructure/storage/secure-storage.adapter";
import { AuthService } from "@infrastructure/services/auth.service";
import { APP_CONFIG } from "@shared/constants/app";
import { useTranslation } from "react-i18next";
import { setStoredLanguage } from "@shared/i18n/language-detector";
import { useThemeStore, ThemeMode } from "@stores/theme.store";
import { useDocumentsStore } from "@stores/documents.store";
import { useCardsStore } from "@stores/cards.store";
import { useProfileStore } from "@stores/profile.store";
import {
  ChevronRight,
  KeyRound,
  Pointer,
  Hourglass,
  Globe,
  Palette,
  Info,
  FileText,
  Lock,
  Trash2,
  LogOut,
} from "lucide-react-native";
import { tokens } from "@presentation/theme/design-tokens";

const BIOMETRY_ENABLED_KEY = "biometry_enabled";
const AUTO_LOCK_TIMEOUT_KEY = "auto_lock_timeout_minutes";
const storage = new SecureStorageAdapter(
  "settings-storage",
  "thoryx-mmkv-encryption-key-2026",
);

export function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { profile, reloadProfile } = useUserProfile();
  const {
    isAvailable: biometryAvailable,
    getBiometryName,
    authenticate,
  } = useBiometry();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [autoLockTimeout, setAutoLockTimeout] = useState("5 minutes");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { mode: themeMode, setMode: setThemeMode } = useThemeStore();
  const currentLanguageName =
    i18n.language === "pt-BR" ? "Português (BR)" : "English (US)";
  const themeLabels: Record<ThemeMode, string> = {
    system: t("settings.themeSystem"),
    dark: t("settings.themeDark"),
    light: t("settings.themeLight"),
  };

  const handleThemeChange = () => {
    Alert.alert(t("settings.theme"), "", [
      { text: themeLabels.system, onPress: () => setThemeMode("system") },
      { text: themeLabels.dark, onPress: () => setThemeMode("dark") },
      { text: themeLabels.light, onPress: () => setThemeMode("light") },
      { text: t("common.cancel"), style: "cancel" },
    ]);
  };

  const handleLanguageChange = () => {
    Alert.alert(t("settings.language"), "", [
      {
        text: "Português (BR)",
        onPress: async () => {
          await setStoredLanguage("pt-BR");
          await i18n.changeLanguage("pt-BR");
        },
      },
      {
        text: "English (US)",
        onPress: async () => {
          await setStoredLanguage("en-US");
          await i18n.changeLanguage("en-US");
        },
      },
      { text: t("common.cancel"), style: "cancel" },
    ]);
  };

  useFocusEffect(
    React.useCallback(() => {
      reloadProfile();
    }, [reloadProfile]),
  );

  useEffect(() => {
    loadBiometryPreference();
    loadAutoLockTimeout();
  }, []);

  const loadBiometryPreference = async () => {
    try {
      const enabled = await storage.get(BIOMETRY_ENABLED_KEY);
      if (enabled === "true") {
        setBiometricEnabled(true);
      }
    } catch (error) {
      console.error("Error loading biometry preference:", error);
    }
  };

  const loadAutoLockTimeout = async () => {
    try {
      const saved = await storage.get(AUTO_LOCK_TIMEOUT_KEY);
      if (saved === "0") {
        setAutoLockTimeout(t("settings.never"));
      } else if (saved) {
        setAutoLockTimeout(
          t("settings.minutes", { count: parseInt(saved, 10) }),
        );
      } else {
        setAutoLockTimeout(t("settings.minutes", { count: 5 }));
      }
    } catch (error) {
      console.error("Error loading auto-lock timeout:", error);
      setAutoLockTimeout(t("settings.minutes", { count: 5 }));
    }
  };

  const handleChangePin = () => {
    router.push("/change-pin");
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (!biometryAvailable) {
      Alert.alert(
        "Not Available",
        "Biometric authentication is not available on this device or not set up.",
        [{ text: "OK" }],
      );
      return;
    }

    if (value) {
      // Test biometry before enabling
      const result = await authenticate("Enable biometric lock");
      if (result.success) {
        await storage.set(BIOMETRY_ENABLED_KEY, "true");
        setBiometricEnabled(true);
        Alert.alert(
          "Enabled",
          `${getBiometryName()} has been enabled for unlocking the app.`,
          [{ text: "OK" }],
        );
      } else {
        Alert.alert(
          "Authentication Failed",
          result.error || "Could not verify biometric authentication.",
          [{ text: "OK" }],
        );
      }
    } else {
      await storage.set(BIOMETRY_ENABLED_KEY, "false");
      setBiometricEnabled(false);
      Alert.alert("Disabled", "Biometric lock has been disabled.", [
        { text: "OK" },
      ]);
    }
  };

  const handleAutoLockTimeout = () => {
    Alert.alert(t("settings.autoLockTimeout"), "", [
      {
        text: t("settings.minutes", { count: 1 }),
        onPress: async () => {
          await storage.set(AUTO_LOCK_TIMEOUT_KEY, "1");
          setAutoLockTimeout(t("settings.minutes", { count: 1 }));
        },
      },
      {
        text: t("settings.minutes", { count: 5 }),
        onPress: async () => {
          await storage.set(AUTO_LOCK_TIMEOUT_KEY, "5");
          setAutoLockTimeout(t("settings.minutes", { count: 5 }));
        },
      },
      {
        text: t("settings.minutes", { count: 15 }),
        onPress: async () => {
          await storage.set(AUTO_LOCK_TIMEOUT_KEY, "15");
          setAutoLockTimeout(t("settings.minutes", { count: 15 }));
        },
      },
      {
        text: t("settings.minutes", { count: 30 }),
        onPress: async () => {
          await storage.set(AUTO_LOCK_TIMEOUT_KEY, "30");
          setAutoLockTimeout(t("settings.minutes", { count: 30 }));
        },
      },
      {
        text: t("settings.never"),
        onPress: async () => {
          await storage.set(AUTO_LOCK_TIMEOUT_KEY, "0");
          setAutoLockTimeout(t("settings.never"));
        },
      },
      { text: t("common.cancel"), style: "cancel" },
    ]);
  };

  const handleLogout = async () => {
    Alert.alert(t("settings.logOut"), t("settings.confirmLogout"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("settings.logOut"),
        style: "destructive",
        onPress: async () => {
          setIsLoggingOut(true);
          try {
            const authService = new AuthService();
            const result = await authService.logout();

            if (result.success) {
              // Navigate to unlock screen (index will show unlock since PIN still exists)
              router.replace("/unlock");
            } else {
              Alert.alert(t("common.error"), result.error || t("common.error"));
            }
          } catch (error) {
            console.error("Error during logout:", error);
            Alert.alert(t("common.error"), t("common.error"));
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  };

  const handleClearData = () => {
    Alert.alert(
      t("settings.confirmClearData"),
      t("settings.confirmClearDataMsg"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              const authService = new AuthService();
              await authService.clearAllData();

              // Reset in-memory Zustand caches so the app doesn't repaint
              // the home with stale documents/cards/profile during navigation.
              useDocumentsStore.getState().reset();
              useCardsStore.getState().reset();
              useProfileStore.getState().reset();

              // Send the user through the same gate a fresh install sees,
              // so they re-acknowledge the no-recovery warning before the
              // new PIN is set.
              router.replace("/pin-responsibility");
            } catch (error) {
              console.error("Error clearing data:", error);
              Alert.alert(t("common.error"), t("common.error"));
            }
          },
        },
      ],
    );
  };

  const handleTermsOfService = () => {
    router.push("/terms-of-service");
  };

  const handlePrivacyPolicy = () => {
    router.push("/privacy-policy");
  };

  return (
    <SafeAreaView
      className="flex-1 bg-light-bg dark:bg-background-primary"
      edges={["top"]}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="pt-4 pb-8">
          <Text className="text-2xl md:text-3xl font-bold text-light-text dark:text-text-primary mb-6 px-6">
            {t("settings.title")}
          </Text>

          {/* Profile Section */}
          <SettingsSection title={t("settings.profile")}>
            <Pressable
              className="flex-row items-center px-4 py-4 border-b border-light-border dark:border-border-subtle"
              onPress={() => router.push("/profile-setup")}
            >
              <UserAvatar photoUri={profile?.photoUri} size={48} />
              <View className="flex-1 ml-4">
                <Text className="text-base md:text-lg font-semibold text-light-text dark:text-text-primary">
                  {profile?.name || t("wallet.guest")}
                </Text>
                <Text className="text-sm text-light-textSecondary dark:text-text-secondary mt-1">
                  {t("profile.editProfile")}
                </Text>
              </View>
              <ChevronRight size={20} color={tokens.colors.text.secondary} />
            </Pressable>
          </SettingsSection>

          {/* Security Section */}
          <SettingsSection title={t("settings.security")}>
            <SettingsItem
              label={t("settings.changePin")}
              onPress={handleChangePin}
              icon={<KeyRound size={20} color={tokens.colors.text.secondary} />}
              isFirst
            />
            <SettingsItem
              label={
                biometryAvailable
                  ? `${getBiometryName()}`
                  : t("settings.biometricLock")
              }
              icon={<Pointer size={20} color={tokens.colors.text.secondary} />}
              switchValue={biometricEnabled}
              onSwitchChange={handleBiometricToggle}
              disabled={!biometryAvailable}
            />
            <SettingsItem
              label={t("settings.autoLockTimeout")}
              onPress={handleAutoLockTimeout}
              icon={
                <Hourglass size={20} color={tokens.colors.text.secondary} />
              }
              value={autoLockTimeout}
              isLast
            />
          </SettingsSection>

          {/* Preferences Section */}
          <SettingsSection title={t("settings.preferences")}>
            <SettingsItem
              label={t("settings.language")}
              onPress={handleLanguageChange}
              icon={<Globe size={20} color={tokens.colors.text.secondary} />}
              value={currentLanguageName}
              isFirst
            />
            <SettingsItem
              label={t("settings.theme")}
              onPress={handleThemeChange}
              icon={<Palette size={20} color={tokens.colors.text.secondary} />}
              value={themeLabels[themeMode]}
              isLast
            />
          </SettingsSection>

          {/* About Section */}
          <SettingsSection title={t("settings.about")}>
            <SettingsItem
              label={t("common.version")}
              value={APP_CONFIG.version}
              showChevron={false}
              icon={<Info size={20} color={tokens.colors.text.secondary} />}
              isFirst
            />
            <SettingsItem
              label={t("settings.termsOfService")}
              onPress={handleTermsOfService}
              icon={<FileText size={20} color={tokens.colors.text.secondary} />}
            />
            <SettingsItem
              label={t("settings.privacyPolicy")}
              onPress={handlePrivacyPolicy}
              icon={<Lock size={20} color={tokens.colors.text.secondary} />}
              isLast
            />
          </SettingsSection>

          {/* Data & Privacy Section */}
          <SettingsSection title={t("settings.dataPrivacy")}>
            <SettingsItem
              label={t("settings.clearAllData")}
              onPress={handleClearData}
              icon={<Trash2 size={20} color={tokens.colors.status.error} />}
              destructive
              showChevron={false}
              isFirst
            />
            <SettingsItem
              label={t("settings.logOut")}
              onPress={handleLogout}
              icon={<LogOut size={20} color={tokens.colors.status.error} />}
              destructive
              showChevron={false}
              loading={isLoggingOut}
              isLast
            />
          </SettingsSection>

          {/* Footer */}
          <Text className="text-xs md:text-sm text-light-textSecondary dark:text-text-secondary text-center mt-8 px-6">
            Thoryx Wallet • Secure Digital Wallet
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
