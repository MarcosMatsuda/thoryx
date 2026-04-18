import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Lock } from "lucide-react-native";
import { tokens } from "@presentation/theme/design-tokens";
import { CheckboxOption } from "@presentation/components/checkbox-option";
import { PinResponsibilityRepositoryImpl } from "@data/repositories/pin-responsibility.repository.impl";
import { AcceptPinResponsibilityUseCase } from "@domain/use-cases/accept-pin-responsibility.use-case";

export function PinResponsibilityScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleContinue = async () => {
    if (!accepted || submitting) {
      return;
    }
    try {
      setSubmitting(true);
      const useCase = new AcceptPinResponsibilityUseCase(
        new PinResponsibilityRepositoryImpl(),
      );
      await useCase.execute();
      router.replace("/pin-setup");
    } catch {
      setSubmitting(false);
    }
  };

  const bullets = t("auth.pinResponsibility.bullets", {
    returnObjects: true,
  }) as string[];

  return (
    <SafeAreaView
      className="flex-1 bg-light-bg dark:bg-background-primary"
      edges={["top", "bottom"]}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View className="w-full max-w-[500px] self-center px-6 pt-8">
          <View className="items-center mb-6">
            <View className="w-[80px] h-[80px] rounded-full bg-primary-main/10 justify-center items-center mb-6">
              <View className="w-[55px] h-[55px] rounded-full bg-primary-main justify-center items-center">
                <Lock size={26} color={tokens.colors.text.primary} />
              </View>
            </View>

            <Text className="text-3xl font-bold text-light-text dark:text-text-primary text-center mb-3">
              {t("auth.pinResponsibility.title")}
            </Text>
            <Text className="text-base text-light-textSecondary dark:text-text-secondary text-center px-2">
              {t("auth.pinResponsibility.intro")}
            </Text>
          </View>

          <View className="rounded-xl border border-status-warning/30 bg-status-warning/10 p-4 mb-5 flex-row">
            <View className="mr-3 mt-0.5">
              <AlertTriangle size={20} color={tokens.colors.status.warning} />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-status-warning mb-1">
                {t("auth.pinResponsibility.warningTitle")}
              </Text>
              <Text className="text-sm text-light-text dark:text-text-primary">
                {t("auth.pinResponsibility.warningBody")}
              </Text>
            </View>
          </View>

          <View className="mb-5">
            {Array.isArray(bullets) &&
              bullets.map((bullet, index) => (
                <View key={index} className="flex-row mb-2">
                  <Text className="text-light-textSecondary dark:text-text-secondary mr-2">
                    •
                  </Text>
                  <Text className="flex-1 text-sm text-light-textSecondary dark:text-text-secondary">
                    {bullet}
                  </Text>
                </View>
              ))}
          </View>

          <Text className="text-sm text-light-textSecondary dark:text-text-secondary mb-6">
            {t("auth.pinResponsibility.recommendation")}
          </Text>

          <View className="mb-6 rounded-xl border border-ui-border px-3">
            <CheckboxOption
              label={t("auth.pinResponsibility.checkbox")}
              checked={accepted}
              onToggle={() => setAccepted((prev) => !prev)}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !accepted || submitting }}
            accessibilityLabel={t("auth.pinResponsibility.continue")}
            disabled={!accepted || submitting}
            onPress={handleContinue}
            className={`rounded-xl py-4 items-center ${
              accepted && !submitting
                ? "bg-primary-main active:bg-primary-dark"
                : "bg-light-border dark:bg-ui-border"
            }`}
          >
            <Text
              className={`text-base font-bold ${
                accepted && !submitting
                  ? "text-text-primary"
                  : "text-light-textSecondary dark:text-text-secondary"
              }`}
            >
              {t("auth.pinResponsibility.continue")}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
