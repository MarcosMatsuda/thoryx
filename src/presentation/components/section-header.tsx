import { View, Text } from "react-native";
import { ReactNode } from "react";

interface SectionHeaderProps {
  icon: ReactNode;
  title: string;
  iconBg?: string;
}

export function SectionHeader({
  icon,
  title,
  iconBg = "#3B82F6",
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
