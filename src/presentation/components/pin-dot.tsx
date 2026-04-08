import { View } from "react-native";

interface PinDotProps {
  filled: boolean;
  error?: boolean;
  testID?: string;
}

export function PinDot({ filled, error = false, testID }: PinDotProps) {
  return (
    <View
      testID={testID}
      className={`w-4 h-4 rounded-full border-2 ${
        error
          ? "bg-status-error border-status-error"
          : filled
            ? "bg-primary-main border-primary-main"
            : "bg-transparent border-light-border dark:border-ui-border"
      }`}
    />
  );
}
