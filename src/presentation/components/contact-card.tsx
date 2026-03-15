import { View, Text, Pressable } from "react-native";

interface ContactCardProps {
  fullName: string;
  relationship: string;
  phoneNumber: string;
  onCall?: () => void;
  onEdit?: () => void;
  onRemove?: () => void;
  isPrimary?: boolean;
}

export function ContactCard({
  fullName,
  relationship,
  phoneNumber,
  onCall,
  onEdit,
  onRemove,
  isPrimary = false,
}: ContactCardProps) {
  return (
    <View className="bg-background-secondary rounded-xl p-4 mb-3">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          {isPrimary && (
            <View className="bg-primary-main/20 px-2 py-1 rounded mb-2 self-start">
              <Text className="text-xs font-bold text-primary-main tracking-wide">
                PRIMARY CONTACT
              </Text>
            </View>
          )}
          <Text className="text-xs font-semibold text-text-secondary mb-1 tracking-wide">
            FULL NAME
          </Text>
          <Text className="text-base font-semibold text-text-primary">
            {fullName}
          </Text>
        </View>
        {onRemove && (
          <Pressable
            className="w-8 h-8 items-center justify-center"
            onPress={onRemove}
          >
            <Text className="text-lg text-status-error">✕</Text>
          </Pressable>
        )}
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-xs font-semibold text-text-secondary mb-1 tracking-wide">
            RELATIONSHIP
          </Text>
          <View className="flex-row items-center">
            <Text className="text-sm text-text-primary">{relationship}</Text>
            <Text className="text-text-secondary ml-1">›</Text>
          </View>
        </View>

        <View className="flex-1 ml-4">
          <Text className="text-xs font-semibold text-text-secondary mb-1 tracking-wide">
            PHONE NUMBER
          </Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-text-primary">{phoneNumber}</Text>
            <Pressable
              className="w-8 h-8 bg-status-success/20 rounded-full items-center justify-center"
              onPress={onCall}
            >
              <Text className="text-sm">📞</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
