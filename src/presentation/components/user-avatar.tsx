import React from 'react';
import { View, Image, Pressable, ActivityIndicator, Text } from 'react-native';

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
  const Container = onPress ? Pressable : View;
  
  return (
    <Container
      onPress={onPress}
      className="rounded-full overflow-hidden border-2 border-primary-main/30"
      style={{ width: size, height: size }}
    >
      {photoUri ? (
        <Image
          source={{ uri: photoUri }}
          className="w-full h-full"
          style={{ resizeMode: 'cover' }}
        />
      ) : (
        <View className="w-full h-full bg-primary-main/20 items-center justify-center">
          <Text className="text-3xl">👤</Text>
        </View>
      )}
      
      {isLoading && (
        <View className="absolute inset-0 bg-black/50 items-center justify-center">
          <ActivityIndicator color="white" />
          <Text className="text-white text-xs mt-1">Loading...</Text>
        </View>
      )}
    </Container>
  );
}