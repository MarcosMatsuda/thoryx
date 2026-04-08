import { Tabs } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";

import { HapticTab } from "@presentation/components/haptic-tab";
import { IconSymbol } from "@presentation/components/ui/icon-symbol";
import { Colors } from "@presentation/theme/colors";
import { useColorScheme } from "@presentation/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.wallet"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="creditcard.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          title: t("tabs.documents"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="doc.text.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="emergency"
        options={{
          title: t("tabs.emergency"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="cross.case.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("tabs.settings"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="gearshape.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
