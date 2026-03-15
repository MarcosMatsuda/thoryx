import { View, Text } from "react-native";

interface InfoBannerProps {
  message: string;
  icon?: string;
}

export function InfoBanner({ message, icon = "ℹ️" }: InfoBannerProps) {
  return (
    <View className="bg-background-secondary rounded-xl p-4 flex-row">
      <Text className="text-lg mr-3">{icon}</Text>
      <Text className="flex-1 text-xs text-text-secondary leading-5">
        {message}
      </Text>
    </View>
  );
}
