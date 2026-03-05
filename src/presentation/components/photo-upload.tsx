import { View, Text, Pressable, Image } from 'react-native';

interface PhotoUploadProps {
  title: string;
  subtitle?: string;
  imageUri?: string | null;
  onPress?: () => void;
}

export function PhotoUpload({ 
  title, 
  subtitle = "Tap to take a photo",
  imageUri,
  onPress 
}: PhotoUploadProps) {
  return (
    <Pressable
      className={`bg-background-secondary rounded-2xl mb-4 overflow-hidden ${
        imageUri ? 'p-0' : 'p-8 border-2 border-dashed border-ui-border'
      } items-center justify-center active:opacity-80`}
      onPress={onPress}
    >
      {imageUri ? (
        <View className="relative w-full">
          <Image
            source={{ uri: imageUri }}
            className="w-full h-48"
            resizeMode="cover"
          />
          <View className="absolute top-2 right-2 bg-primary-main rounded-full px-3 py-1">
            <Text className="text-xs font-bold text-text-primary">{title}</Text>
          </View>
          <View className="absolute bottom-2 left-2 bg-black/60 rounded-lg px-2 py-1">
            <Text className="text-xs text-text-primary">Tap to retake</Text>
          </View>
        </View>
      ) : (
        <>
          <View className="w-16 h-16 bg-primary-main/20 rounded-full items-center justify-center mb-3">
            <Text className="text-3xl">📷</Text>
          </View>
          <Text className="text-base font-semibold text-text-primary mb-1">
            {title}
          </Text>
          <Text className="text-sm text-text-secondary text-center">
            {subtitle}
          </Text>
        </>
      )}
    </Pressable>
  );
}
