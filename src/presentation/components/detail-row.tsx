import { View, Text } from 'react-native';

interface DetailRowProps {
  label: string;
  value: string;
}

export function DetailRow({ label, value }: DetailRowProps) {
  return (
    <View className="flex-row justify-between items-center py-4 border-b border-ui-border">
      <Text className="text-sm text-text-secondary">{label}</Text>
      <Text className="text-base font-semibold text-text-primary">{value}</Text>
    </View>
  );
}
