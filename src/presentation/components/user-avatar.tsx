import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';

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
  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    overflow: 'hidden' as const,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  };

  const content = (
    <>
      {photoUri ? (
        <Image
          source={{ uri: photoUri }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
        />
      ) : (
        <View
          style={{ flex: 1, backgroundColor: 'rgba(59, 130, 246, 0.2)', alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ fontSize: size * 0.45 }}>👤</Text>
        </View>
      )}

      {isLoading && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator color="white" />
          <Text style={{ color: 'white', fontSize: 10, marginTop: 4 }}>Loading...</Text>
        </View>
      )}
    </>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={containerStyle}>
        {content}
      </Pressable>
    );
  }

  return <View style={containerStyle}>{content}</View>;
}
