import { useEffect } from 'react';
import { View, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

export function SplashScreen() {
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Start fade-in animation when component mounts
    opacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <View testID="splash-container" className="flex-1 bg-primary-main items-center justify-center">
      <Animated.View style={animatedStyle}>
        <Image
          source={require('../../../assets/images/splash-icon.png')}
          className="w-48 h-48"
          resizeMode="contain"
          accessibilityLabel="Thoryx Logo"
          testID="splash-logo"
        />
      </Animated.View>
    </View>
  );
}