import { View, Text, Pressable, Switch, ActivityIndicator } from 'react-native';
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
        {loading ? (
          <ActivityIndicator size="small" color={destructive ? '#EF4444' : '#3B82F6'} />
        ) : (
          <>
            {value && (
              <Text className="text-sm md:text-base text-text-secondary">
                {value}
              </Text>
            )}
            {switchValue !== undefined && onSwitchChange && (
              <Switch
                value={switchValue}
                onValueChange={onSwitchChange}
                disabled={disabled}
                trackColor={{ false: '#767577', true: '#3B82F6' }}
                thumbColor={switchValue ? '#FFFFFF' : '#f4f3f4'}
              />
            )}
            {showChevron && !onSwitchChange && (
              <Text className="text-text-secondary text-lg">›</Text>
            )}
          </>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        className={`${disabled || loading ? 'opacity-50' : 'active:bg-surface-hover'}`}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}
