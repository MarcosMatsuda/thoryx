import React from "react";
import { View, Image, Pressable, ActivityIndicator, Text } from "react-native";
import { User } from "lucide-react-native";

interface UserAvatarProps {
  photoUri?: string | null;
  size?: number;
  onPress?: () => void;
  isLoading?: boolean;
}

export function UserAvatar({
  photoUri,
  size = 64,
  onPress,
  isLoading = false,
}: UserAvatarProps) {
  return (
    <Pressable
      {...(onPress && { onPress })}
      disabled={!onPress}
      className="rounded-full overflow-hidden border-2 border-primary-main/30"
      style={{ width: size, height: size }}
    >
      {photoUri ? (
        <Image
          source={{ uri: photoUri }}
          className="w-full h-full"
          style={{ resizeMode: "cover" }}
        />
      ) : (
        <View className="w-full h-full bg-primary-main/20 items-center justify-center">
          <User size={28} color="#135BEC" />
        </View>
      )}

      {isLoading && (
        <View
          className="absolute inset-0 bg-black/50 items-center justify-center"
          accessibilityRole="progressbar"
          accessibilityLabel="Loading profile photo"
          accessibilityLiveRegion="polite"
        >
          <ActivityIndicator color="white" />
          <Text className="text-white text-xs mt-1">Loading...</Text>
        </View>
      )}
    </Pressable>
  );
}
