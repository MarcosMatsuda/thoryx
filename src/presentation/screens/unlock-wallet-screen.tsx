import { PinRepositoryImpl } from "@data/repositories/pin.repository.impl";
import { PinAttemptsRepositoryImpl } from "@data/repositories/pin-attempts.repository.impl";
import { VerifyPinWithLockoutUseCase } from "@domain/use-cases/verify-pin-with-lockout.use-case";
import { NumericKeypad } from "@presentation/components/numeric-keypad";
import { PinDot } from "@presentation/components/pin-dot";
import { SvgIcon } from "@presentation/components/svg-icon";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, Text, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBiometry } from "@presentation/hooks/use-biometry";
import { SecureStorageAdapter } from "@infrastructure/storage/secure-storage.adapter";
import { useTranslation } from "react-i18next";
import { tokens } from "@presentation/theme/design-tokens";

const PIN_LENGTH = 6;
const BIOMETRY_ENABLED_KEY = "biometry_enabled";
const WARNING_THRESHOLD = 3;
const MAX_ATTEMPTS_BEFORE_LOCKOUT = 5;
const storage = new SecureStorageAdapter(
  "settings-storage",
  "thoryx-mmkv-encryption-key-2026",
);

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function UnlockWalletScreen() {
  const { t } = useTranslation();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [biometryEnabled, setBiometryEnabled] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const router = useRouter();
  const {
    isAvailable: biometryAvailable,
    authenticate,
    getBiometryName,
  } = useBiometry();

  const attemptsRepository = useRef(new PinAttemptsRepositoryImpl()).current;
  const pinRepository = useRef(new PinRepositoryImpl()).current;

  const isLocked = lockedUntil !== null && lockedUntil > now;

  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      try {
        const enabled = await storage.get(BIOMETRY_ENABLED_KEY);
        if (cancelled) return;
        setBiometryEnabled(enabled === "true" && biometryAvailable);
        const attempts = await attemptsRepository.get();
        if (cancelled) return;
        setAttemptCount(attempts.count);
        setLockedUntil(attempts.lockedUntil);
      } catch {
        // ignore — non-fatal hydration
      }
    };
    hydrate();
    return () => {
      cancelled = true;
    };
  }, [biometryAvailable, attemptsRepository]);

  useEffect(() => {
    if (!isLocked) {
      return;
    }
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [isLocked]);

  const verifyPin = useCallback(
    async (value: string) => {
      setIsVerifyingPin(true);
      // Dev-only instrumentation so slow unlocks on real devices can be
      // inspected from Metro logs without attaching a profiler.
      const startedAt = __DEV__ ? Date.now() : 0;
      try {
        const useCase = new VerifyPinWithLockoutUseCase(
          pinRepository,
          attemptsRepository,
        );
        const result = await useCase.execute(value);
        if (__DEV__) {
          console.log(
            `[PinUnlock] verify took ${Date.now() - startedAt}ms success=${result.success}`,
          );
        }
        if (result.success) {
          setError(false);
          router.replace("/(tabs)");
          return;
        }
        setAttemptCount(result.attemptCount);
        setLockedUntil(result.lockedUntil);
        setError(true);
        setTimeout(() => {
          setPin("");
          setError(false);
        }, 1000);
      } catch {
        setError(true);
        setTimeout(() => {
          setPin("");
          setError(false);
        }, 1000);
      } finally {
        setIsVerifyingPin(false);
      }
    },
    [pinRepository, attemptsRepository, router],
  );

  useEffect(() => {
    if (pin.length === PIN_LENGTH && !isLocked && !isVerifyingPin) {
      verifyPin(pin);
    }
  }, [pin, isLocked, isVerifyingPin, verifyPin]);

  const handleBiometricAuth = async () => {
    if (isLocked) {
      return;
    }
    try {
      setIsAuthenticating(true);
      const result = await authenticate("Unlock your wallet");
      if (result.success) {
        router.replace("/(tabs)");
      } else if (result.error) {
        setError(true);
        setTimeout(() => setError(false), 2000);
      }
    } catch {
      setError(true);
      setTimeout(() => setError(false), 2000);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleKeyPress = (value: string) => {
    if (isLocked || isVerifyingPin) return;
    if (pin.length < PIN_LENGTH) {
      setPin(pin + value);
      setError(false);
    }
  };

  const handleBackspace = () => {
    if (isLocked || isVerifyingPin) return;
    setPin(pin.slice(0, -1));
    setError(false);
  };

  const remainingMs = lockedUntil ? Math.max(0, lockedUntil - now) : 0;
  const attemptsLeft = Math.max(0, MAX_ATTEMPTS_BEFORE_LOCKOUT - attemptCount);
  const showAttemptsWarning =
    !isLocked && attemptCount >= WARNING_THRESHOLD && attemptsLeft > 0;

  return (
    <SafeAreaView
      className="flex-1 bg-light-bg dark:bg-background-primary"
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
              <Text className="text-3xl font-bold text-light-text dark:text-text-primary mb-1">
                {t("auth.unlockWallet")}
              </Text>
              <Text className="text-sm md:text-base text-light-textSecondary dark:text-text-secondary text-center px-6 md:px-8">
                {biometryEnabled
                  ? `Use ${getBiometryName()} or enter your PIN to access your documents`
                  : "Enter your PIN to access your documents"}
              </Text>
            </View>

            {biometryEnabled && !isAuthenticating && !isLocked && (
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
                <ActivityIndicator
                  size="small"
                  color={tokens.colors.status.info}
                />
              </View>
            )}

            {isLocked && (
              <View
                accessibilityRole="alert"
                className="items-center mt-2 mb-2 px-6 py-3 rounded-xl bg-status-error/10 border border-status-error/30"
              >
                <Text className="text-sm font-semibold text-status-error mb-1">
                  {t("auth.lockedTitle")}
                </Text>
                <Text className="text-sm text-status-error">
                  {t("auth.lockedMessage", {
                    time: formatRemaining(remainingMs),
                  })}
                </Text>
              </View>
            )}

            {!isLocked && isVerifyingPin && (
              <View
                accessibilityRole="progressbar"
                className="flex-row items-center mt-2 mb-2 gap-2"
              >
                <ActivityIndicator
                  size="small"
                  color={tokens.colors.primary.main}
                />
                <Text className="text-sm font-semibold text-primary-main">
                  {t("auth.verifying")}
                </Text>
              </View>
            )}

            {!isLocked && !isVerifyingPin && error && (
              <View className="items-center mt-2 mb-2">
                <Text className="text-sm font-semibold text-status-error">
                  {t("auth.wrongPin")}
                </Text>
              </View>
            )}

            {showAttemptsWarning && (
              <View className="items-center mt-2 mb-2">
                <Text className="text-xs text-status-warning">
                  {t("auth.attemptsRemaining", {
                    count: attemptsLeft,
                  })}
                </Text>
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
          <Pressable className="py-3" onPress={() => router.push("/emergency")}>
            <Text className="text-base md:text-lg text-primary-main font-semibold">
              {t("auth.emergencyDetails")}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
