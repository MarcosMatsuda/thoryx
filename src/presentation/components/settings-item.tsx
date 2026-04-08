import { View, Text, Pressable, Switch, ActivityIndicator } from "react-native";
import { ReactNode } from "react";

interface SettingsItemProps {
  label: string;
  onPress?: () => void;
  icon?: ReactNode;
  value?: string;
  showChevron?: boolean;
  destructive?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  isFirst?: boolean;
  isLast?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

export function SettingsItem({
  label,
  onPress,
  icon,
  value,
  showChevron = true,
  destructive = false,
  switchValue,
  onSwitchChange,
  isFirst = false,
  isLast = false,
  disabled = false,
  loading = false,
}: SettingsItemProps) {
  const content = (
    <View
      className={`
        flex-row items-center justify-between px-4 py-4
        ${!isLast ? "border-b border-light-border dark:border-border-subtle" : ""}
      `}
    >
      <View className="flex-row items-center flex-1">
        {icon && <View className="mr-3">{icon}</View>}
        <Text
          className={`
            text-base md:text-lg
            ${destructive ? "text-status-error" : "text-light-text dark:text-text-primary"}
          `}
        >
          {label}
        </Text>
      </View>

      <View className="flex-row items-center gap-2">
        {value && (
          <Text className="text-sm md:text-base text-light-textSecondary dark:text-text-secondary">
            {value}
          </Text>
        )}
        {switchValue !== undefined && onSwitchChange && (
          <View className="relative">
            <Switch
              value={switchValue}
              onValueChange={onSwitchChange}
              disabled={disabled || loading}
              trackColor={{ false: "#767577", true: "#3B82F6" }}
              thumbColor={switchValue ? "#FFFFFF" : "#f4f3f4"}
            />
            {loading && (
              <View className="absolute inset-0 items-center justify-center bg-black/10 rounded-full">
                <ActivityIndicator
                  size="small"
                  color={destructive ? "#EF4444" : "#3B82F6"}
                />
              </View>
            )}
          </View>
        )}
        {showChevron && !onSwitchChange && (
          <Text className="text-light-textSecondary dark:text-text-secondary text-lg">›</Text>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        className={`${disabled || loading ? "opacity-50" : "active:bg-surface-hover"}`}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}
