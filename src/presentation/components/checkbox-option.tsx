import { View, Text, Pressable } from 'react-native';

interface CheckboxOptionProps {
  label: string;
  checked: boolean;
  onToggle?: () => void;
}

export function CheckboxOption({ label, checked, onToggle }: CheckboxOptionProps) {
  return (
    <Pressable 
      className="flex-row items-center py-3"
      onPress={onToggle}
    >
      <View
        className={`w-6 h-6 rounded-md mr-3 items-center justify-center ${
          checked 
            ? 'bg-primary-main' 
            : 'bg-transparent border-2 border-ui-border'
        }`}
      >
        {checked && (
          <Text className="text-sm text-text-primary font-bold">✓</Text>
        )}
      </View>
      <Text className="text-sm text-text-primary flex-1">
        {label}
      </Text>
    </Pressable>
  );
}
