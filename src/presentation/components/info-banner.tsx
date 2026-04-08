import { View, Text } from "react-native";
import { ReactNode } from "react";
import { Info } from "lucide-react-native";

interface InfoBannerProps {
  message: string;
  icon?: ReactNode;
}

export function InfoBanner({
  message,
  icon = <Info size={18} color="#94A3B8" />,
}: InfoBannerProps) {
  return (
    <View className="bg-light-bgSecondary dark:bg-background-secondary rounded-xl p-4 flex-row">
      <View className="mr-3">{icon}</View>
      <Text className="flex-1 text-xs text-light-textSecondary dark:text-text-secondary leading-5">
        {message}
      </Text>
    </View>
  );
}
