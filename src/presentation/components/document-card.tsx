import { View, Text, Pressable } from "react-native";

interface DocumentCardProps {
  type: string;
  title: string;
  subtitle: string;
  badge?: string;
  icon: string;
  verified?: boolean;
  onPress?: () => void;
}

export function DocumentCard({
  type,
  title,
  subtitle,
  badge,
  icon,
  verified = false,
  onPress,
}: DocumentCardProps) {
  return (
    <Pressable
      className="bg-primary-main rounded-2xl p-6 mr-4 w-[280px] active:opacity-90"
      onPress={onPress}
    >
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-row items-center gap-2">
          <Text className="text-3xl">{icon}</Text>
          {badge && (
            <View className="bg-primary-light/30 px-3 py-1 rounded-md">
              <Text className="text-xs font-semibold text-text-primary tracking-wide">
                {badge}
              </Text>
            </View>
          )}
        </View>
        {verified && (
          <View className="bg-background-primary/20 rounded-full p-2">
            <Text className="text-lg">👆</Text>
          </View>
        )}
      </View>

      <Text className="text-sm text-text-primary/70 mb-1">{type}</Text>
      <Text className="text-xl font-bold text-text-primary mb-1">{title}</Text>
      <Text className="text-sm text-text-primary/70">{subtitle}</Text>
    </Pressable>
  );
}
