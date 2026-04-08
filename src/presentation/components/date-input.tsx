import { View, Text, Pressable, TextInput } from "react-native";
import { Calendar } from "lucide-react-native";

interface DateInputProps {
  label: string;
  value?: string;
  placeholder?: string;
  onPress?: () => void;
  onChangeText?: (text: string) => void;
}

export function DateInput({
  label,
  value,
  placeholder = "DD/MM/YYYY",
  onPress,
  onChangeText,
}: DateInputProps) {
  return (
    <View className="mb-4">
      <Text className="text-sm text-light-textSecondary dark:text-text-secondary mb-2">{label}</Text>
      <View className="bg-light-bgSecondary dark:bg-background-secondary rounded-xl px-4 py-4 flex-row items-center justify-between">
        <TextInput
          className="flex-1 text-light-text dark:text-text-primary"
          placeholder={placeholder}
          placeholderTextColor="#64748B"
          value={value}
          onChangeText={onChangeText}
          keyboardType="number-pad"
          maxLength={10}
        />
        <Pressable
          className="ml-2 w-8 h-8 items-center justify-center active:opacity-60"
          onPress={onPress}
        >
          <Calendar size={20} color="#94A3B8" />
        </Pressable>
      </View>
    </View>
  );
}
