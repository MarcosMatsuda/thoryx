import { Text, Pressable } from "react-native";

interface NumericKeyProps {
  value: string;
  onPress: (value: string) => void;
  isBackspace?: boolean;
}

export function NumericKey({
  value,
  onPress,
  isBackspace = false,
}: NumericKeyProps) {
  return (
    <Pressable
      className="flex-1 aspect-square justify-center items-center rounded-full active:bg-light-bgTertiary dark:active:bg-background-tertiary"
      onPress={() => onPress(value)}
    >
      {isBackspace ? (
        <Text className="text-3xl md:text-4xl text-light-text dark:text-text-primary">⌫</Text>
      ) : (
        <Text className="text-4xl md:text-5xl font-semibold text-light-text dark:text-text-primary">
          {value}
        </Text>
      )}
    </Pressable>
  );
}
