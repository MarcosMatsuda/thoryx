import { View, Text, Pressable } from "react-native";

interface SelectableDocumentItemProps {
  icon: string;
  title: string;
  subtitle: string;
  selected: boolean;
  onToggle: () => void;
  iconBg?: string;
}

export function SelectableDocumentItem({
  icon,
  title,
  subtitle,
  selected,
  onToggle,
  iconBg = "bg-primary-main/10",
}: SelectableDocumentItemProps) {
  return (
    <Pressable
      className="flex-row items-center justify-between py-4 border-b border-light-border dark:border-ui-border active:opacity-70"
      onPress={onToggle}
    >
      <View className="flex-row items-center flex-1">
        <View
          className={`w-6 h-6 rounded-full border-2 mr-4 items-center justify-center ${
            selected
              ? "bg-primary-main border-primary-main"
              : "border-light-border dark:border-ui-border"
          }`}
        >
          {selected && <Text className="text-white text-xs font-bold">✓</Text>}
        </View>

        <View className="flex-1">
          <Text className="text-base md:text-lg font-bold text-light-text dark:text-text-primary mb-1">
            {title}
          </Text>
          <Text className="text-sm md:text-base text-light-textSecondary dark:text-text-secondary">
            {subtitle}
          </Text>
        </View>
      </View>

      <View
        className={`w-10 h-10 md:w-12 md:h-12 ${iconBg} rounded-lg items-center justify-center ml-3`}
      >
        <Text className="text-xl md:text-2xl">{icon}</Text>
      </View>
    </Pressable>
  );
}
