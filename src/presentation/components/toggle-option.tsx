import { View, Text, Pressable } from 'react-native';

interface ToggleOptionProps {
  title: string;
  subtitle: string;
  enabled: boolean;
  onToggle?: () => void;
}

export function ToggleOption({ title, subtitle, enabled, onToggle }: ToggleOptionProps) {
  return (
    <View className="bg-background-secondary rounded-xl p-4 flex-row items-center justify-between">
      <View className="flex-1 mr-4">
        <Text className="text-base font-semibold text-text-primary mb-1">
          {title}
        </Text>
        <Text className="text-sm text-text-secondary">
          {subtitle}
        </Text>
      </View>
      <Pressable
        className={`w-14 h-8 rounded-full justify-center ${
          enabled ? 'bg-primary-main' : 'bg-ui-border'
        }`}
        onPress={onToggle}
      >
        <View
          className={`w-6 h-6 rounded-full bg-text-primary shadow-sm ${
            enabled ? 'ml-7' : 'ml-1'
          }`}
        />
      </Pressable>
    </View>
  );
}
