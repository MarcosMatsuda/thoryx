import { useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { NumericKeypad } from "@presentation/components/numeric-keypad";
import { PinDot } from "@presentation/components/pin-dot";
import { PinConfirmationBottomSheet } from "@presentation/components/pin-confirmation-bottom-sheet";
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
  const [error, setError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleKeyPress = (value: string) => {
    if (step === "current") {
      if (currentPin.length < PIN_LENGTH) {
        setCurrentPin(currentPin + value);
      }
    } else {
      if (newPin.length < PIN_LENGTH) {
        setNewPin(newPin + value);
      }
    }
    setError("");
  };

  const handleBackspace = () => {
    if (step === "current") {
      setCurrentPin(currentPin.slice(0, -1));
    } else {
      setNewPin(newPin.slice(0, -1));
    }
    setError("");
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
        setError("");
      } else {
        setError("Invalid PIN. Please try again.");
        setCurrentPin("");
      }
    } catch {
      setError("Failed to verify PIN. Please try again.");
      setCurrentPin("");
    }
  };

  const handleNewPinComplete = () => {
    if (newPin.length === PIN_LENGTH) {
      setShowConfirmation(true);
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

  const isPinComplete = () => {
    return getPin().length === PIN_LENGTH;
  };

  const handleBack = () => {
    if (step === "new") {
      setStep("current");
      setNewPin("");
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background-primary"
      edges={["top", "bottom"]}
    >
      <View className="flex-1 w-full max-w-[500px] self-center">
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <View className="flex-row items-center mb-6">
            <Pressable
              className="w-10 h-10 items-center justify-center active:bg-surface-hover rounded-full"
              onPress={handleBack}
            >
              <Text className="text-2xl text-text-primary">←</Text>
            </Pressable>
            <Text className="text-2xl font-bold text-text-primary ml-4">
              Change PIN
            </Text>
          </View>

          <View className="items-center mb-6">
            <Text className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
              {getTitle()}
            </Text>
            <Text className="text-sm md:text-base text-text-secondary text-center px-6 md:px-8">
              {getSubtitle()}
            </Text>
          </View>

          {/* Error Message */}
          {error ? (
            <View className="items-center mb-4">
              <View className="flex-row items-center bg-status-error/10 px-4 py-3 rounded-lg">
                <Text className="text-xl mr-2">⚠️</Text>
                <Text className="text-sm font-semibold text-status-error">
                  {error}
                </Text>
              </View>
            </View>
          ) : null}

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
          <View className="w-[75%] h-[60%] justify-center">
            <NumericKeypad
              onKeyPress={handleKeyPress}
              onBackspace={handleBackspace}
            />
          </View>
        </View>

        {/* Continue Button */}
        <View className="px-6 pb-6">
          <Pressable
            className={`rounded-xl py-4 items-center ${
              isPinComplete()
                ? "bg-primary-main active:bg-primary-dark"
                : "bg-ui-border"
            }`}
            disabled={!isPinComplete()}
            onPress={
              step === "current" ? handleVerifyCurrentPin : handleNewPinComplete
            }
          >
            <View className="flex-row items-center">
              <Text
                className={`text-base font-bold mr-2 ${
                  isPinComplete() ? "text-text-primary" : "text-text-secondary"
                }`}
              >
                {step === "current" ? "Continue" : "Confirm New PIN"}
              </Text>
              <Text
                className={
                  isPinComplete() ? "text-text-primary" : "text-text-secondary"
                }
              >
                →
              </Text>
            </View>
          </Pressable>
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
