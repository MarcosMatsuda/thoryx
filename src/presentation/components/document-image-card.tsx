import { View, Text, Image } from "react-native";

interface DocumentImageCardProps {
  imageUrl?: string;
  verified?: boolean;
}

export function DocumentImageCard({
  imageUrl,
  verified = false,
}: DocumentImageCardProps) {
  return (
    <View className="bg-background-secondary rounded-2xl p-4 mb-4">
      <View className="bg-primary-main/10 rounded-xl aspect-[16/10] items-center justify-center overflow-hidden">
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="items-center justify-center">
            <View className="w-20 h-20 bg-primary-main/20 rounded-full items-center justify-center mb-3">
              <Text className="text-4xl">💳</Text>
            </View>
            <Text className="text-sm text-text-secondary">
              Document Preview
            </Text>
          </View>
        )}
      </View>

      {verified && (
        <View className="flex-row items-center justify-center mt-3">
          <View className="w-5 h-5 bg-status-success rounded-full items-center justify-center mr-2">
            <Text className="text-xs text-text-primary">✓</Text>
          </View>
          <Text className="text-sm font-medium text-text-secondary">
            Verified Document
          </Text>
        </View>
      )}
    </View>
  );
}
