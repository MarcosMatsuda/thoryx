import { View, TextInput } from "react-native";
import { tokens } from "@presentation/theme/design-tokens";

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
}

export function SearchBar({
  placeholder = "Search documents, IDs, or cards",
  value,
  onChangeText,
}: SearchBarProps) {
  return (
    <View className="flex-row items-center bg-background-secondary rounded-xl px-4 py-3">
      <View className="mr-3">
        <View className="w-5 h-5 items-center justify-center">
          <View className="w-4 h-4 border-2 border-text-secondary rounded-full" />
          <View className="absolute bottom-0 right-0 w-2 h-0.5 bg-text-secondary rotate-45" />
        </View>
      </View>
      <TextInput
        className="flex-1 text-base text-text-secondary"
        placeholder={placeholder}
        placeholderTextColor={tokens.colors.text.tertiary}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}
