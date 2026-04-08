import { Text, Pressable, View } from "react-native";

interface ActionButtonLargeProps {
  icon: string;
  label: string;
  onPress?: () => void;
  variant?: "primary" | "secondary";
}

export function ActionButtonLarge({
  icon,
  label,
  onPress,
  variant = "primary",
}: ActionButtonLargeProps) {
  const isPrimary = variant === "primary";

  return (
    <Pressable
      className={`flex-1 rounded-xl py-4 flex-row items-center justify-center ${
        isPrimary
          ? "bg-primary-main active:bg-primary-dark"
          : "bg-light-bgSecondary dark:bg-background-secondary active:bg-light-bgTertiary dark:active:bg-background-tertiary"
      }`}
      onPress={onPress}
    >
      <Text
        className={`text-xl mr-2 ${isPrimary ? "text-light-text dark:text-text-primary" : "text-primary-main"}`}
      >
        {icon}
      </Text>
      <Text
        className={`text-base font-semibold ${
          isPrimary
            ? "text-light-text dark:text-text-primary"
            : "text-light-text dark:text-text-primary"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
