import { PinRepositoryImpl } from "@data/repositories/pin.repository.impl";
import { VerifyPinUseCase } from "@domain/use-cases/verify-pin.use-case";
import { NumericKeypad } from "@presentation/components/numeric-keypad";
import { PinDot } from "@presentation/components/pin-dot";
import { SvgIcon } from "@presentation/components/svg-icon";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBiometry } from "@presentation/hooks/use-biometry";
import { SecureStorageAdapter } from "@infrastructure/storage/secure-storage.adapter";

const PIN_LENGTH = 6;
const BIOMETRY_ENABLED_KEY = 'biometry_enabled';
const storage = new SecureStorageAdapter('settings-storage', 'thoryx-mmkv-encryption-key-2026');

export function UnlockWalletScreen() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [biometryEnabled, setBiometryEnabled] = useState(false);
  const router = useRouter();
  const { isAvailable: biometryAvailable, authenticate, getBiometryName } = useBiometry();

  useEffect(() => {
    checkBiometryEnabled();
  }, []);

  const checkBiometryEnabled = async () => {
    try {
      const enabled = await storage.get(BIOMETRY_ENABLED_KEY);
      setBiometryEnabled(enabled === 'true' && biometryAvailable);
    } catch (error) {
      console.error('Error checking biometry enabled:', error);
      setBiometryEnabled(false);
    }
  };

  useEffect(() => {
    if (pin.length === PIN_LENGTH) {
      verifyPin();
    }
  }, [pin]);

  const handleBiometricAuth = async () => {
    try {
      setIsAuthenticating(true);
      const result = await authenticate("Unlock your wallet");
      
      if (result.success) {
        // Navigate to main app (tabs)
        router.replace('/(tabs)');
      } else {
        // Show error message if authentication failed
        if (result.error) {
          setError(true);
          setTimeout(() => setError(false), 2000);
        }
      }
    } catch (error) {
      console.error("Biometric auth error:", error);
      setError(true);
      setTimeout(() => setError(false), 2000);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const verifyPin = async () => {
    try {
      const repository = new PinRepositoryImpl();
      const verifyPinUseCase = new VerifyPinUseCase(repository);

      const result = await verifyPinUseCase.execute(pin);

      if (result.success) {
        setError(false);
        // Navigate to main app (tabs) and reset stack
        router.replace('/(tabs)');
      } else {
        setError(true);
        setTimeout(() => {
          setPin("");
          setError(false);
        }, 1000);
      }
    } catch (error) {
      console.error("Error verifying PIN:", error);
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
    <SafeAreaView
      className="flex-1 bg-background-primary"
      edges={["top", "bottom"]}
    >
      <View className="flex-1 w-full max-w-[500px] self-center">
        <View className="px-4 md:px-8 pt-8">
          <View className="items-center">
            <View className="mb-3">
              <View className="w-[120px] h-[120px] md:w-[160px] md:h-[160px] rounded-full bg-primary-main/5 justify-center items-center">
                <View className="w-[90px] h-[90px] md:w-[120px] md:h-[120px] rounded-full bg-primary-main/10 justify-center items-center">
                  <View className="w-[60px] h-[60px] md:w-[80px] md:h-[80px] rounded-full bg-primary-main justify-center items-center">
                    <SvgIcon name="lock-unlock" width={32} height={32} />
                  </View>
                </View>
              </View>
            </View>

            <View className="mb-3">
              <View className="flex-row items-center gap-1 px-3 py-1 md:px-4 md:py-1.5 bg-primary-main/15 rounded-md">
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
                {biometryEnabled 
                  ? `Use ${getBiometryName()} or enter your PIN to access your documents`
                  : "Enter your PIN to access your documents"
                }
              </Text>
            </View>

            {biometryEnabled && !isAuthenticating && (
              <Pressable 
                className="mt-2 mb-2 px-6 py-3 bg-primary-main/10 rounded-xl active:opacity-70"
                onPress={handleBiometricAuth}
              >
                <Text className="text-sm font-semibold text-primary-main text-center">
                  Use {getBiometryName()}
                </Text>
              </Pressable>
            )}

            {isAuthenticating && (
              <View className="mt-2 mb-2 px-6 py-3">
                <ActivityIndicator size="small" color="#3B82F6" />
              </View>
            )}

            {error && (
              <View className="items-center mt-2 mb-2">
                <View className="flex-row items-center">
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
          <Pressable
            className="py-3"
            onPress={() => router.push('/emergency')}
          >
            <Text className="text-base md:text-lg text-primary-main font-semibold">
              Emergency Details
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
