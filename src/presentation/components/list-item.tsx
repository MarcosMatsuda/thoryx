import { View, Text, Pressable } from 'react-native';

interface ListItemProps {
  icon: string;
  iconBg: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
}

export function ListItem({
  icon,
  iconBg,
  title,
  subtitle,
  onPress,
}: ListItemProps) {
  return (
    <Pressable
      className="flex-row items-center bg-background-secondary rounded-xl p-4 mb-3 active:bg-background-tertiary"
      onPress={onPress}
    >
      <View 
        className="w-12 h-12 rounded-xl items-center justify-center mr-4"
        style={{ backgroundColor: iconBg }}
      >
        <Text className="text-2xl">{icon}</Text>
      </View>

      <View className="flex-1">
        <Text className="text-base font-semibold text-text-primary mb-1">
          {title}
        </Text>
        <Text className="text-sm text-text-secondary">
          {subtitle}
        </Text>
      </View>

      <View className="ml-2">
        <Text className="text-xl text-text-secondary">›</Text>
      </View>
    </Pressable>
  );
}
