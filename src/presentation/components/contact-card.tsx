import { View, Text, Pressable } from "react-native";
import { X, Pencil, Phone } from "lucide-react-native";
import { tokens } from "@presentation/theme/design-tokens";

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
    <View className="bg-light-bgSecondary dark:bg-background-secondary rounded-xl p-4 mb-3">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1 pr-2">
          {isPrimary && (
            <View className="bg-primary-main/20 px-2 py-1 rounded mb-2 self-start">
              <Text className="text-xs font-bold text-primary-main tracking-wide">
                PRIMARY CONTACT
              </Text>
            </View>
          )}
          <Text className="text-xs font-semibold text-light-textSecondary dark:text-text-secondary mb-1 tracking-wide">
            FULL NAME
          </Text>
          <Text className="text-base font-semibold text-light-text dark:text-text-primary">
            {fullName}
          </Text>
        </View>
        <View className="flex-row items-center">
          {onEdit && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit contact"
              className="w-8 h-8 items-center justify-center mr-1"
              onPress={onEdit}
              hitSlop={6}
            >
              <Pencil size={16} color={tokens.colors.text.secondary} />
            </Pressable>
          )}
          {onRemove && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Remove contact"
              className="w-8 h-8 items-center justify-center"
              onPress={onRemove}
              hitSlop={6}
            >
              <X size={18} color={tokens.colors.status.error} />
            </Pressable>
          )}
        </View>
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-xs font-semibold text-light-textSecondary dark:text-text-secondary mb-1 tracking-wide">
            RELATIONSHIP
          </Text>
          <Text className="text-sm text-light-text dark:text-text-primary">
            {relationship}
          </Text>
        </View>

        <View className="flex-1 ml-4">
          <Text className="text-xs font-semibold text-light-textSecondary dark:text-text-secondary mb-1 tracking-wide">
            PHONE NUMBER
          </Text>
          <View className="flex-row items-center justify-between">
            <Text
              className="text-sm text-light-text dark:text-text-primary flex-1"
              numberOfLines={1}
            >
              {phoneNumber}
            </Text>
            {onCall && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Call contact"
                className="w-8 h-8 bg-status-success/20 rounded-full items-center justify-center ml-2"
                onPress={onCall}
                hitSlop={6}
              >
                <Phone size={14} color={tokens.colors.status.success} />
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
