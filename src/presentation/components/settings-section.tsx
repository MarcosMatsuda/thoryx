import { View, Text } from "react-native";
import { ReactNode } from "react";

interface SettingsSectionProps {
  title: string;
  children: ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <View className="mb-6">
      <Text className="text-xs md:text-sm font-semibold text-light-textSecondary dark:text-text-secondary mb-3 px-6 tracking-wider">
        {title}
      </Text>
      <View className="bg-light-card dark:bg-surface-card rounded-2xl mx-4 overflow-hidden">
        {children}
      </View>
    </View>
  );
}
