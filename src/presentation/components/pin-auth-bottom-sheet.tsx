import { View, Text, Pressable, Modal } from "react-native";
import { useState, useEffect } from "react";
import { PinDot } from "./pin-dot";
import { NumericKeypad } from "./numeric-keypad";
import { PinRepositoryImpl } from "@data/repositories/pin.repository.impl";
import { VerifyPinUseCase } from "@domain/use-cases/verify-pin.use-case";
import { SecureStorageAdapter } from "@infrastructure/storage/secure-storage.adapter";
import { useBiometry } from "@presentation/hooks/use-biometry";
import { useTranslation } from "react-i18next";
import { Fingerprint } from "lucide-react-native";

const BIOMETRY_ENABLED_KEY = "biometry_enabled";
const settingsStorage = new SecureStorageAdapter(
  "settings-storage",
  "thoryx-mmkv-encryption-key-2026",
);

interface PinAuthBottomSheetProps {
  visible: boolean;
  onSuccess: () => void;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

const PIN_LENGTH = 6;

export function PinAuthBottomSheet({
  visible,
  onSuccess,
  onClose,
  title,
  subtitle,
}: PinAuthBottomSheetProps) {
  const { t } = useTranslation();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [biometryEnabled, setBiometryEnabled] = useState(false);
  const { isAvailable: biometryAvailable, authenticate, getBiometryName } = useBiometry();

  useEffect(() => {
    if (visible) {
      loadBiometryPreference();
    }
  }, [visible]);

  const loadBiometryPreference = async () => {
    try {
      const saved = await settingsStorage.get(BIOMETRY_ENABLED_KEY);
      setBiometryEnabled(saved === "true" && biometryAvailable);
    } catch {
      setBiometryEnabled(false);
    }
  };

  const handleBiometryAuth = async () => {
    try {
      const result = await authenticate();
      if (result.success) {
        setPin("");
        setError("");
        onSuccess();
      } else {
        setError(t("auth.wrongPin"));
      }
    } catch {
      setError(t("common.error"));
    }
  };

  // Auto-trigger biometry when sheet opens
  useEffect(() => {
    if (visible && biometryEnabled) {
      const timer = setTimeout(handleBiometryAuth, 300);
      return () => clearTimeout(timer);
    }
  }, [visible, biometryEnabled]);

  const handleKeyPress = (value: string) => {
    if (pin.length < PIN_LENGTH) {
      setPin(pin + value);
      setError("");
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setError("");
  };

  const verifyPin = async () => {
    if (pin.length !== PIN_LENGTH) return;

    setIsVerifying(true);
    try {
      const repository = new PinRepositoryImpl();
      const verifyPinUseCase = new VerifyPinUseCase(repository);
      const result = await verifyPinUseCase.execute(pin);

      if (result.success) {
        setPin("");
        setError("");
        onSuccess();
      } else {
        setError(result.message || t("auth.wrongPin"));
        setTimeout(() => {
          setPin("");
          setError("");
        }, 1500);
      }
    } catch {
      setError(t("common.error"));
      setTimeout(() => {
        setPin("");
        setError("");
      }, 1500);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (pin.length === PIN_LENGTH && !isVerifying) {
      verifyPin();
    }
  }, [pin]);

  const handleClose = () => {
    setPin("");
    setError("");
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
          className="bg-light-bg dark:bg-background-primary rounded-t-3xl h-[80%]"
          onPress={(e) => e.stopPropagation()}
        >
          <View className="flex-1 w-full max-w-[500px] self-center">
            <View className="items-center pt-4 pb-2">
              <View className="w-12 h-1 bg-light-border dark:bg-ui-border rounded-full mb-4" />
              <Text className="text-base text-light-textSecondary dark:text-text-secondary">
                {t("guestMode.exitSecureMode")}
              </Text>
            </View>

            <View className="px-4 md:px-8 pt-4">
              <View className="items-center">
                <Text className="text-3xl md:text-4xl font-bold text-light-text dark:text-text-primary mb-2">
                  {title || t("auth.enterPin")}
                </Text>
                <Text className="text-sm md:text-base text-light-textSecondary dark:text-text-secondary text-center px-6 md:px-8">
                  {subtitle || t("auth.createPinDesc")}
                </Text>
              </View>

              {error && (
                <View className="items-center mt-4 mb-2">
                  <Text className="text-sm font-semibold text-status-error text-center px-4">
                    {error}
                  </Text>
                </View>
              )}

              <View className="items-center mt-6">
                <View className="flex-row gap-3 md:gap-5">
                  {Array.from({ length: PIN_LENGTH }).map((_, index) => (
                    <PinDot
                      key={index}
                      filled={index < pin.length}
                      error={!!error && pin.length === PIN_LENGTH}
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

            <View className="px-6 pb-8 gap-3">
              {biometryEnabled && (
                <Pressable
                  className="bg-primary-main rounded-xl py-4 flex-row items-center justify-center active:bg-primary-dark"
                  onPress={handleBiometryAuth}
                >
                  <Fingerprint size={20} color="#FFFFFF" />
                  <Text className="text-base font-semibold text-white ml-2">
                    {getBiometryName()}
                  </Text>
                </Pressable>
              )}
              <Pressable
                className="bg-light-border dark:bg-ui-border rounded-xl py-4 items-center"
                onPress={handleClose}
              >
                <Text className="text-base font-semibold text-light-text dark:text-text-primary">
                  {t("common.cancel")}
                </Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
