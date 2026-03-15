import { View, Text, Pressable, Modal } from "react-native";
import { useState, useEffect } from "react";
import { PinDot } from "./pin-dot";
import { NumericKeypad } from "./numeric-keypad";

interface PinConfirmationBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (confirmedPin: string) => void;
  originalPin: string;
  title?: string;
  subtitle?: string;
  context?: string;
}

const PIN_LENGTH = 6;

export function PinConfirmationBottomSheet({
  visible,
  onClose,
  onConfirm,
  originalPin,
  title = "Confirm Your PIN",
  subtitle = "Please re-enter your 6-digit PIN to verify.",
  context = "Initial PIN Setup",
}: PinConfirmationBottomSheetProps) {
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (confirmPin.length === PIN_LENGTH) {
      if (confirmPin === originalPin) {
        setError(false);
        onConfirm(confirmPin);
        setConfirmPin("");
      } else {
        setError(true);
        setTimeout(() => {
          setConfirmPin("");
          setError(false);
        }, 1000);
      }
    }
  }, [confirmPin, originalPin]);

  const handleKeyPress = (value: string) => {
    if (confirmPin.length < PIN_LENGTH) {
      setConfirmPin(confirmPin + value);
      setError(false);
    }
  };

  const handleBackspace = () => {
    setConfirmPin(confirmPin.slice(0, -1));
    setError(false);
  };

  const handleClose = () => {
    setConfirmPin("");
    setError(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable
        className="flex-1 bg-black/70 justify-end"
        onPress={handleClose}
      >
        <Pressable
          className="bg-background-primary rounded-t-3xl h-[80%]"
          onPress={(e) => e.stopPropagation()}
        >
          <View className="flex-1 w-full max-w-[500px] self-center">
            <View className="items-center pt-4 pb-2">
              <View className="w-12 h-1 bg-ui-border rounded-full mb-4" />
              <Text className="text-base text-text-secondary">{context}</Text>
            </View>

            <View className="px-4 md:px-8 pt-4">
              <View className="items-center">
                <Text className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
                  {title}
                </Text>
                <Text className="text-sm md:text-base text-text-secondary text-center px-6 md:px-8">
                  {subtitle}
                </Text>
              </View>

              {error && (
                <View className="items-center mt-4 mb-2">
                  <View className="flex-row items-center">
                    <Text className="text-sm font-semibold text-status-error">
                      PINs do not match. Please try again.
                    </Text>
                  </View>
                </View>
              )}

              <View className="items-center mt-6">
                <View className="flex-row gap-3 md:gap-5">
                  {Array.from({ length: PIN_LENGTH }).map((_, index) => (
                    <PinDot
                      key={index}
                      filled={index < confirmPin.length}
                      error={error && confirmPin.length === PIN_LENGTH}
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

            <View className="px-6 pb-8">
              <View className="h-14" />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
