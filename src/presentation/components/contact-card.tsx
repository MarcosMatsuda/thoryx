import { View, Text, Pressable } from "react-native";
import { X, ChevronRight, Phone } from "lucide-react-native";
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
        <View className="flex-1">
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
        {onRemove && (
          <Pressable
            className="w-8 h-8 items-center justify-center"
            onPress={onRemove}
          >
            <X size={18} color={tokens.colors.status.error} />
          </Pressable>
        )}
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-xs font-semibold text-light-textSecondary dark:text-text-secondary mb-1 tracking-wide">
            RELATIONSHIP
          </Text>
          <View className="flex-row items-center">
            <Text className="text-sm text-light-text dark:text-text-primary">
              {relationship}
            </Text>
            <ChevronRight
              size={16}
              color={tokens.colors.text.secondary}
              className="ml-1"
            />
          </View>
        </View>

        <View className="flex-1 ml-4">
          <Text className="text-xs font-semibold text-light-textSecondary dark:text-text-secondary mb-1 tracking-wide">
            PHONE NUMBER
          </Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-light-text dark:text-text-primary">
              {phoneNumber}
            </Text>
            <Pressable
              className="w-8 h-8 bg-status-success/20 rounded-full items-center justify-center"
              onPress={onCall}
            >
              <Phone size={14} color={tokens.colors.status.success} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
