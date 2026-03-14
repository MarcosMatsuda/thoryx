import { useEffect, useState } from 'react';
import { View, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { PinRepositoryImpl } from '@data/repositories/pin.repository.impl';
import { CheckPinExistsUseCase } from '@domain/use-cases/check-pin-exists.use-case';

export function SplashScreen() {
  const router = useRouter();
  const opacity = useSharedValue(0);
  const [hasPinChecked, setHasPinChecked] = useState(false);
  const [hasPinSaved, setHasPinSaved] = useState(false);

  useEffect(() => {
    // Start fade-in animation when component mounts
    opacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });

    // Check if PIN exists
    checkPinExists();
  }, []);

  useEffect(() => {
    // When PIN check is complete and animation is done, navigate
    if (hasPinChecked) {
      const timer = setTimeout(() => {
        // Navigate to appropriate screen based on PIN existence
        // Use replace to reset stack so back button doesn't go back to splash
        if (hasPinSaved) {
          router.replace('/unlock');
        } else {
          router.replace('/pin-setup');
        }
      }, 2000); // Wait 2 seconds total (including animation time)

      return () => clearTimeout(timer);
    }
  }, [hasPinChecked, hasPinSaved, router]);

  const checkPinExists = async () => {
    try {
      const repository = new PinRepositoryImpl();
      const checkPinExistsUseCase = new CheckPinExistsUseCase(repository);
      
      const exists = await checkPinExistsUseCase.execute();
      setHasPinSaved(exists);
    } catch (error) {
      console.error('Error checking PIN existence:', error);
      setHasPinSaved(false);
    } finally {
      setHasPinChecked(true);
    }
  };

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