import {
  View,
  ScrollView,
  Image,
  Pressable,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { useState } from "react";

interface DocumentPhotoCarouselProps {
  frontPhotoUri: string;
  backPhotoUri: string;
  onPhotoPress?: (uri: string) => void;
}

export function DocumentPhotoCarousel({
  frontPhotoUri,
  backPhotoUri,
  onPhotoPress,
}: DocumentPhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const screenWidth = Dimensions.get("window").width;
  const photoWidth = Math.min(screenWidth - 48, 400);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / photoWidth);
    setCurrentIndex(index);
  };

  return (
    <View className="mb-6">
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        snapToInterval={photoWidth}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingHorizontal: 24,
        }}
      >
        <Pressable
          style={{ width: photoWidth, marginRight: 16 }}
          onPress={
            onPhotoPress ? () => onPhotoPress(frontPhotoUri) : undefined
          }
          accessibilityRole={onPhotoPress ? "button" : undefined}
        >
          <Image
            source={{ uri: frontPhotoUri }}
            className="w-full rounded-2xl bg-light-bgSecondary dark:bg-background-secondary"
            style={{ aspectRatio: 4 / 3 }}
            resizeMode="cover"
          />
        </Pressable>
        <Pressable
          style={{ width: photoWidth }}
          onPress={
            onPhotoPress ? () => onPhotoPress(backPhotoUri) : undefined
          }
          accessibilityRole={onPhotoPress ? "button" : undefined}
        >
          <Image
            source={{ uri: backPhotoUri }}
            className="w-full rounded-2xl bg-light-bgSecondary dark:bg-background-secondary"
            style={{ aspectRatio: 4 / 3 }}
            resizeMode="cover"
          />
        </Pressable>
      </ScrollView>

      <View className="flex-row justify-center gap-2 mt-4">
        <View
          className={`w-2 h-2 rounded-full ${currentIndex === 0 ? "bg-primary-main" : "bg-light-border dark:bg-ui-border"}`}
        />
        <View
          className={`w-2 h-2 rounded-full ${currentIndex === 1 ? "bg-primary-main" : "bg-light-border dark:bg-ui-border"}`}
        />
      </View>
    </View>
  );
}
