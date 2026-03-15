import { View, Text, Pressable, Switch } from 'react-native';
import { ReactNode } from 'react';

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
}: SettingsItemProps) {
  const content = (
    <View
      className={`
        flex-row items-center justify-between px-4 py-4
        ${!isLast ? 'border-b border-border-subtle' : ''}
      `}
    >
      <View className="flex-row items-center flex-1">
        {icon && <View className="mr-3">{icon}</View>}
        <Text
          className={`
            text-base md:text-lg
            ${destructive ? 'text-status-error' : 'text-text-primary'}
          `}
        >
          {label}
        </Text>
      </View>

      <View className="flex-row items-center gap-2">
        {value && (
          <Text className="text-sm md:text-base text-text-secondary">
            {value}
          </Text>
        )}
        {switchValue !== undefined && onSwitchChange && (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: '#767577', true: '#3B82F6' }}
            thumbColor={switchValue ? '#FFFFFF' : '#f4f3f4'}
          />
        )}
        {showChevron && !onSwitchChange && (
          <Text className="text-text-secondary text-lg">›</Text>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className="active:bg-surface-hover"
      >
        {content}
      </Pressable>
    );
  }

  return content;
}
