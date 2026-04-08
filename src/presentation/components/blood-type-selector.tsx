import { View, Text, Pressable } from "react-native";

interface BloodTypeSelectorProps {
  selectedType?: string;
  onSelect?: (type: string) => void;
}

export function BloodTypeSelector({
  selectedType,
  onSelect,
}: BloodTypeSelectorProps) {
  const bloodTypes = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

  return (
    <View className="flex-row flex-wrap gap-2">
      {bloodTypes.map((type) => (
        <Pressable
          key={type}
          className={`px-5 py-3 rounded-lg ${
            selectedType === type
              ? "bg-primary-main"
              : "bg-light-bgTertiary dark:bg-background-tertiary active:bg-light-border dark:active:bg-ui-border"
          }`}
          onPress={() => onSelect?.(type)}
        >
          <Text
            className={`text-base font-semibold ${
              selectedType === type
                ? "text-light-text dark:text-text-primary"
                : "text-light-textSecondary dark:text-text-secondary"
            }`}
          >
            {type}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
