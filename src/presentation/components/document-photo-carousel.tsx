import {
  View,
  ScrollView,
  Image,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { useState } from "react";

interface DocumentPhotoCarouselProps {
  frontPhotoUri: string;
  backPhotoUri: string;
}

export function DocumentPhotoCarousel({
  frontPhotoUri,
  backPhotoUri,
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
        <View style={{ width: photoWidth, marginRight: 16 }}>
          <Image
            source={{ uri: frontPhotoUri }}
            className="w-full rounded-2xl bg-background-secondary"
            style={{ aspectRatio: 4 / 3 }}
            resizeMode="cover"
          />
        </View>
        <View style={{ width: photoWidth }}>
          <Image
            source={{ uri: backPhotoUri }}
            className="w-full rounded-2xl bg-background-secondary"
            style={{ aspectRatio: 4 / 3 }}
            resizeMode="cover"
          />
        </View>
      </ScrollView>

      <View className="flex-row justify-center gap-2 mt-4">
        <View
          className={`w-2 h-2 rounded-full ${currentIndex === 0 ? "bg-primary-main" : "bg-ui-border"}`}
        />
        <View
          className={`w-2 h-2 rounded-full ${currentIndex === 1 ? "bg-primary-main" : "bg-ui-border"}`}
        />
      </View>
    </View>
  );
}
