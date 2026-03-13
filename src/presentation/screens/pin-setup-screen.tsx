import { NumericKeypad } from "@presentation/components/numeric-keypad";
import { PinDot } from "@presentation/components/pin-dot";
import { ToggleOption } from "@presentation/components/toggle-option";
import { PinConfirmationBottomSheet } from "@presentation/components/pin-confirmation-bottom-sheet";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from 'expo-router';
import { PinRepositoryImpl } from '@data/repositories/pin.repository.impl';
import { SavePinUseCase } from '@domain/use-cases/save-pin.use-case';

const PIN_LENGTH = 6;

export function PinSetupScreen() {
  const [pin, setPin] = useState("");
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const router = useRouter();

  const handleKeyPress = (value: string) => {
    if (pin.length < PIN_LENGTH) {
      setPin(pin + value);
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const handleToggleBiometric = () => {
    setBiometricEnabled(!biometricEnabled);
  };

  const handleConfirm = () => {
    if (pin.length === PIN_LENGTH) {
      setShowConfirmation(true);
    }
  };

  const handleFinishSetup = async (confirmedPin: string) => {
    if (pin === confirmedPin) {
      try {
        const repository = new PinRepositoryImpl();
        const savePinUseCase = new SavePinUseCase(repository);
        
        const result = await savePinUseCase.execute({ pin });
        
        if (result.success) {
          setShowConfirmation(false);
          router.push('/home');
        }
      } catch (error) {
        console.error('Error saving PIN:', error);
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary" edges={["top", "bottom"]}>
      <View className="flex-1 w-full max-w-[500px] self-center">
        <View className="px-4 md:px-8 pt-8">
          <View className="items-center">
            <View className="mb-6">
              <View className="w-[100px] h-[100px] md:w-[120px] md:h-[120px] rounded-full bg-primary-main/10 justify-center items-center">
                <View className="w-[70px] h-[70px] md:w-[85px] md:h-[85px] rounded-full bg-primary-main/20 justify-center items-center">
                  <View className="w-[45px] h-[45px] md:w-[55px] md:h-[55px] rounded-full bg-primary-main justify-center items-center">
                    <Text className="text-2xl md:text-3xl">🔒</Text>
                  </View>
                </View>
              </View>
            </View>

            <View className="items-center mb-6">
              <Text className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
                Create Your Security PIN
              </Text>
              <Text className="text-sm md:text-base text-text-secondary text-center px-6 md:px-8">
                This PIN will be used to authorize transactions and secure your wallet.
              </Text>
            </View>

            <View className="flex-row gap-3 mb-6">
              {Array.from({ length: PIN_LENGTH }).map((_, index) => (
                <PinDot key={index} filled={index < pin.length} />
              ))}
            </View>
          </View>
        </View>

        <View className="flex-1 justify-center items-center px-4">
          <View className="w-[75%] h-[60%] justify-center">
            <NumericKeypad
              onKeyPress={handleKeyPress}
              onBackspace={handleBackspace}
            />
          </View>
        </View>

        <View className="px-6 pb-6">
          <View className="mb-4">
            <ToggleOption
              title="Enable Biometric Unlock?"
              subtitle="Use FaceID or Fingerprint for faster access"
              enabled={biometricEnabled}
              onToggle={handleToggleBiometric}
            />
          </View>

          <Pressable 
            className={`rounded-xl py-4 items-center ${
              pin.length === PIN_LENGTH 
                ? 'bg-primary-main active:bg-primary-dark' 
                : 'bg-ui-border'
            }`}
            disabled={pin.length !== PIN_LENGTH}
            onPress={handleConfirm}
          >
            <View className="flex-row items-center">
              <Text className={`text-base font-bold mr-2 ${
                pin.length === PIN_LENGTH ? 'text-text-primary' : 'text-text-secondary'
              }`}>
                Confirm and Continue
              </Text>
              <Text className={pin.length === PIN_LENGTH ? 'text-text-primary' : 'text-text-secondary'}>
                →
              </Text>
            </View>
          </Pressable>
        </View>
      </View>

      <PinConfirmationBottomSheet
        visible={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleFinishSetup}
        originalPin={pin}
      />
    </SafeAreaView>
  );
}
