import { View, Text } from "react-native";
import { ToggleOption } from "./toggle-option";
import { ReactNode } from "react";

interface AlertBannerProps {
  title: string;
  message: string;
  icon?: ReactNode;
  toggleLabel?: string;
  toggleSubtitle?: string;
  toggleEnabled?: boolean;
  onToggle?: () => void;
}

export function AlertBanner({
  title,
  message,
  icon,
  toggleLabel,
  toggleSubtitle,
  toggleEnabled = false,
  onToggle,
}: AlertBannerProps) {
  return (
    <View className="bg-status-error/10 border border-status-error/30 rounded-xl p-4 mb-6">
      <View className="flex-row items-start mb-3">
        <View className="mr-2">{icon}</View>
        <View className="flex-1">
          <Text className="text-sm font-bold text-status-error mb-1 tracking-wide">
            {title}
          </Text>
          <Text className="text-xs text-light-textSecondary dark:text-text-secondary leading-5">
            {message}
          </Text>
        </View>
      </View>

      {toggleLabel && toggleSubtitle && (
        <View className="mt-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-light-textSecondary dark:text-text-secondary flex-1">
              {toggleLabel}
            </Text>
            <View className="ml-4">
              <View
                className={`w-12 h-7 rounded-full justify-center ${
                  toggleEnabled
                    ? "bg-primary-main"
                    : "bg-light-border dark:bg-ui-border"
                }`}
              >
                <View
                  className={`w-5 h-5 rounded-full bg-text-primary shadow-sm ${
                    toggleEnabled ? "ml-6" : "ml-1"
                  }`}
                />
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
