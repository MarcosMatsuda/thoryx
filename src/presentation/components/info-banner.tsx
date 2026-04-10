import { View, Text } from "react-native";
import { ReactNode } from "react";
import { Info } from "lucide-react-native";
import { tokens } from "@presentation/theme/design-tokens";

interface InfoBannerProps {
  message: string;
  icon?: ReactNode;
}

export function InfoBanner({
  message,
  icon = <Info size={18} color={tokens.colors.text.secondary} />,
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
