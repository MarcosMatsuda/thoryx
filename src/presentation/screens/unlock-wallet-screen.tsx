import { NumericKeypad } from "@presentation/components/numeric-keypad";
import { PinDot } from "@presentation/components/pin-dot";
import { useState, useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from '@react-navigation/native';
import { PinRepositoryImpl } from '@data/repositories/pin.repository.impl';
import { VerifyPinUseCase } from '@domain/use-cases/verify-pin.use-case';

const PIN_LENGTH = 6;

export function UnlockWalletScreen() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    if (pin.length === PIN_LENGTH) {
      verifyPin();
    }
  }, [pin]);

  const verifyPin = async () => {
    try {
      const repository = new PinRepositoryImpl();
      const verifyPinUseCase = new VerifyPinUseCase(repository);
      
      const result = await verifyPinUseCase.execute(pin);
      
      if (result.success) {
        setError(false);
        navigation.navigate('home' as never);
      } else {
        setError(true);
        setTimeout(() => {
          setPin("");
          setError(false);
        }, 1000);
      }
    } catch (error) {
      console.error('Error verifying PIN:', error);
      setError(true);
      setTimeout(() => {
        setPin("");
        setError(false);
      }, 1000);
    }
  };

  const handleKeyPress = (value: string) => {
    if (pin.length < PIN_LENGTH) {
      setPin(pin + value);
      setError(false);
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary" edges={["top", "bottom"]}>
      <Pressable className="absolute top-4 left-6 w-10 h-10 md:w-12 md:h-12 justify-center items-center z-10">
        <Text className="text-2xl md:text-3xl text-text-secondary">✕</Text>
      </Pressable>

      <View className="flex-1 w-full max-w-[500px] self-center">
        <View className="px-4 md:px-8 pt-8">
          <View className="items-center">
            <View className="mb-3">
              <View className="w-[120px] h-[120px] md:w-[160px] md:h-[160px] rounded-full bg-primary-main/5 justify-center items-center">
                <View className="w-[90px] h-[90px] md:w-[120px] md:h-[120px] rounded-full bg-primary-main/10 justify-center items-center">
                  <View className="w-[60px] h-[60px] md:w-[80px] md:h-[80px] rounded-full bg-primary-main justify-center items-center">
                    <View className="w-6 h-6 justify-end items-center">
                      <View className="w-4 h-2.5 bg-text-primary rounded-[3px]" />
                      <View className="absolute top-0 w-2.5 h-3 border-2 border-text-primary rounded-t-md border-b-0" />
                    </View>
                  </View>
                </View>
              </View>
            </View>

            <View className="mb-3">
              <View className="flex-row items-center gap-1 px-3 py-1 md:px-4 md:py-1.5 bg-primary-main/15 rounded-md">
                <Text className="text-xs md:text-sm">🔒</Text>
                <Text className="text-xs md:text-sm font-semibold text-primary-main tracking-wider">
                  SECURE STORAGE
                </Text>
              </View>
            </View>

            <View className="items-center mb-3">
              <Text className="text-3xl font-bold text-text-primary mb-1">
                Unlock Wallet
              </Text>
              <Text className="text-sm md:text-base text-text-secondary text-center px-6 md:px-8">
                Use FaceID or enter your PIN to access your documents
              </Text>
            </View>

            {error && (
              <View className="items-center mt-2 mb-2">
                <View className="flex-row items-center">
                  <Text className="text-xl mr-2">⚠️</Text>
                  <Text className="text-sm font-semibold text-status-error">
                    Incorrect PIN. Please try again.
                  </Text>
                </View>
              </View>
            )}

            <View className="flex-row gap-5 mt-4">
              {Array.from({ length: PIN_LENGTH }).map((_, index) => (
                <PinDot 
                  key={index} 
                  filled={index < pin.length}
                  error={error && pin.length === PIN_LENGTH}
                />
              ))}
            </View>
          </View>
        </View>

        <View className="flex-1 justify-center items-center">
          <View className="w-[75%] h-[75%] justify-center">
            <NumericKeypad
              onKeyPress={handleKeyPress}
              onBackspace={handleBackspace}
            />
          </View>
        </View>

        <View className="items-center pb-8">
          <Pressable className="py-3">
            <Text className="text-base md:text-lg text-primary-main font-semibold">
              Forgot PIN?
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
