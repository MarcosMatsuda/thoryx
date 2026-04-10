import { View, Text } from "react-native";
import { ReactNode } from "react";

import { tokens } from "@presentation/theme/design-tokens";

interface SectionHeaderProps {
  icon: ReactNode;
  title: string;
  iconBg?: string;
}

export function SectionHeader({
  icon,
  title,
  iconBg = tokens.colors.status.info,
}: SectionHeaderProps) {
  return (
    <View className="flex-row items-center mb-4">
      <View
        className="w-8 h-8 rounded-lg items-center justify-center mr-3"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </View>
      <Text className="text-lg font-bold text-text-primary">{title}</Text>
    </View>
  );
}
