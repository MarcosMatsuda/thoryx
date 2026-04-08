import { View, Text } from "react-native";

interface DetailRowProps {
  label: string;
  value: string;
}

export function DetailRow({ label, value }: DetailRowProps) {
  return (
    <View className="flex-row justify-between items-center py-4 border-b border-light-border dark:border-ui-border">
      <Text className="text-sm text-light-textSecondary dark:text-text-secondary">{label}</Text>
      <Text className="text-base font-semibold text-light-text dark:text-text-primary">{value}</Text>
    </View>
  );
}
