import { View, Text, Pressable } from "react-native";
import { Check } from "lucide-react-native";
import { tokens } from "@presentation/theme/design-tokens";

interface CheckboxOptionProps {
  label: string;
  checked: boolean;
  onToggle?: () => void;
}

export function CheckboxOption({
  label,
  checked,
  onToggle,
}: CheckboxOptionProps) {
  return (
    <Pressable className="flex-row items-center py-3" onPress={onToggle}>
      <View
        className={`w-6 h-6 rounded-md mr-3 items-center justify-center ${
          checked
            ? "bg-primary-main"
            : "bg-transparent border-2 border-ui-border"
        }`}
      >
        {checked && <Check size={14} color={tokens.colors.text.primary} />}
      </View>
      <Text className="text-sm text-text-primary flex-1">{label}</Text>
    </Pressable>
  );
}
