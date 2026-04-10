import { View, Text, TextInput } from "react-native";
import { tokens } from "@presentation/theme/design-tokens";

interface TextInputFieldProps {
  label: string;
  value?: string;
  placeholder?: string;
  onChangeText?: (text: string) => void;
  keyboardType?: "default" | "numeric" | "email-address";
}

export function TextInputField({
  label,
  value,
  placeholder,
  onChangeText,
  keyboardType = "default",
}: TextInputFieldProps) {
  return (
    <View className="mb-4">
      <Text className="text-sm text-light-textSecondary dark:text-text-secondary mb-2">
        {label}
      </Text>
      <TextInput
        className="bg-light-bgSecondary dark:bg-background-secondary rounded-xl px-4 py-4 text-light-text dark:text-text-primary"
        placeholder={placeholder}
        placeholderTextColor={tokens.colors.text.tertiary}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />
    </View>
  );
}
