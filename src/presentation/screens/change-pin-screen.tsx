import { useState, useEffect } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { NumericKeypad } from "@presentation/components/numeric-keypad";
import { PinDot } from "@presentation/components/pin-dot";
import { PinConfirmationBottomSheet } from "@presentation/components/pin-confirmation-bottom-sheet";
import {
  ThoryxHeader,
  BackButton,
} from "@presentation/components/thoryx-header";
import { PinRepositoryImpl } from "@data/repositories/pin.repository.impl";
import { VerifyPinUseCase } from "@domain/use-cases/verify-pin.use-case";
import { SavePinUseCase } from "@domain/use-cases/save-pin.use-case";

const PIN_LENGTH = 6;

type Step = "current" | "new";

export function ChangePinScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("current");
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [error, setError] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (step === "current" && currentPin.length === PIN_LENGTH) {
      handleVerifyCurrentPin();
    }
  }, [currentPin]);

  useEffect(() => {
    if (step === "new" && newPin.length === PIN_LENGTH) {
      setShowConfirmation(true);
    }
  }, [newPin]);

  const handleKeyPress = (value: string) => {
    if (step === "current") {
      if (currentPin.length < PIN_LENGTH) {
        setCurrentPin(currentPin + value);
        setError(false);
      }
    } else {
      if (newPin.length < PIN_LENGTH) {
        setNewPin(newPin + value);
      }
    }
  };

  const handleBackspace = () => {
    if (step === "current") {
      setCurrentPin(currentPin.slice(0, -1));
      setError(false);
    } else {
      setNewPin(newPin.slice(0, -1));
    }
  };

  const handleVerifyCurrentPin = async () => {
    if (currentPin.length !== PIN_LENGTH) {
      return;
    }

    try {
      const repository = new PinRepositoryImpl();
      const verifyPinUseCase = new VerifyPinUseCase(repository);

      const result = await verifyPinUseCase.execute(currentPin);

      if (result.success) {
        setStep("new");
        setError(false);
      } else {
        setError(true);
        setTimeout(() => {
          setCurrentPin("");
          setError(false);
        }, 1000);
      }
    } catch {
      setError(true);
      setTimeout(() => {
        setCurrentPin("");
        setError(false);
      }, 1000);
    }
  };

  const handleConfirmNewPin = async (confirmedPin: string) => {
    if (newPin === confirmedPin) {
      try {
        const repository = new PinRepositoryImpl();
        const savePinUseCase = new SavePinUseCase(repository);

        const result = await savePinUseCase.execute({ pin: newPin });

        if (result.success) {
          setShowConfirmation(false);
          Alert.alert("Success", "Your PIN has been changed successfully.", [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]);
        } else {
          Alert.alert("Error", result.message || "Failed to save new PIN.");
        }
      } catch {
        Alert.alert("Error", "Failed to save new PIN. Please try again.");
      }
    }
  };

  const getTitle = () => {
    switch (step) {
      case "current":
        return "Enter your current PIN";
      case "new":
        return "Enter your new PIN";
      default:
        return "";
    }
  };

  const getSubtitle = () => {
    switch (step) {
      case "current":
        return "Please enter your current 6-digit PIN to continue.";
      case "new":
        return "Create a new 6-digit PIN for your account.";
      default:
        return "";
    }
  };

  const getPin = () => {
    return step === "current" ? currentPin : newPin;
  };

  const handleBack = () => {
    if (step === "new") {
      setStep("current");
      setNewPin("");
      setError(false);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background-primary"
      edges={["top", "bottom"]}
    >
      {/* Header */}
      <ThoryxHeader left={<BackButton onPress={handleBack} />} />

      <View className="flex-1 w-full max-w-[500px] self-center">
        <View className="px-6 pt-6 pb-4">
          <View className="items-center mb-6">
            <Text className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
              {getTitle()}
            </Text>
            <Text className="text-sm md:text-base text-text-secondary text-center px-6 md:px-8">
              {getSubtitle()}
            </Text>
          </View>

          {/* Error Message */}
          {error && (
            <View className="items-center mb-4">
              <View className="flex-row items-center">
                <Text className="text-sm font-semibold text-status-error">
                  Incorrect PIN. Please try again.
                </Text>
              </View>
            </View>
          )}

          {/* PIN Dots */}
          <View className="items-center mb-8">
            <View className="flex-row gap-3 md:gap-5">
              {Array.from({ length: PIN_LENGTH }).map((_, index) => (
                <PinDot
                  key={index}
                  filled={index < getPin().length}
                  error={!!error && getPin().length === PIN_LENGTH}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Keypad */}
        <View className="flex-1 justify-center items-center px-4">
          <View className="w-[75%] h-[75%] justify-center">
            <NumericKeypad
              onKeyPress={handleKeyPress}
              onBackspace={handleBackspace}
            />
          </View>
        </View>

        <View className="px-6 pb-8">
          <View className="h-14" />
        </View>
      </View>

      {/* Confirmation Bottom Sheet */}
      <PinConfirmationBottomSheet
        visible={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmNewPin}
        originalPin={newPin}
        title="Confirm New PIN"
        subtitle="Please re-enter your new 6-digit PIN to verify."
        context="Change PIN"
      />
    </SafeAreaView>
  );
}
