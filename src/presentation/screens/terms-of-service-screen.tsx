import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ThoryxHeader,
  BackButton,
} from "@presentation/components/thoryx-header";

export function TermsOfServiceScreen() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background-primary"
      edges={["top", "bottom"]}
    >
      {/* Header */}
      <ThoryxHeader
        left={<BackButton onPress={handleBack} />}
        center={
          <Text className="text-lg font-semibold text-text-primary">
            Terms of Service
          </Text>
        }
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-8">
          {/* Title */}
          <Text className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
            Terms of Service — Thoryx
          </Text>
          <Text className="text-sm md:text-base text-text-secondary mb-8">
            Last updated: March 2026
          </Text>

          {/* Section 1: Acceptance */}
          <View className="mb-8">
            <Text className="text-lg md:text-xl font-semibold text-text-primary mb-3">
              1. Acceptance
            </Text>
            <Text className="text-base md:text-lg text-text-secondary leading-relaxed">
              By using Thoryx, you agree to these Terms of Service. If you do
              not agree, do not use the app.
            </Text>
          </View>

          {/* Section 2: About Thoryx */}
          <View className="mb-8">
            <Text className="text-lg md:text-xl font-semibold text-text-primary mb-3">
              2. About Thoryx
            </Text>
            <Text className="text-base md:text-lg text-text-secondary leading-relaxed">
              Thoryx is a personal security vault for storing documents, cards,
              and emergency information locally on your device. No data is sent
              to external servers.
            </Text>
          </View>

          {/* Section 3: Local Storage Only */}
          <View className="mb-8">
            <Text className="text-lg md:text-xl font-semibold text-text-primary mb-3">
              3. Local Storage Only
            </Text>
            <Text className="text-base md:text-lg text-text-secondary leading-relaxed">
              All data you store in Thoryx — including documents, cards, and
              emergency contacts — is saved exclusively on your device. Thoryx
              does not have access to your data and cannot recover it if lost.
            </Text>
          </View>

          {/* Section 4: Your Responsibility */}
          <View className="mb-8">
            <Text className="text-lg md:text-xl font-semibold text-text-primary mb-3">
              4. Your Responsibility
            </Text>
            <Text className="text-base md:text-lg text-text-secondary leading-relaxed mb-2">
              You are solely responsible for:
            </Text>
            <View className="ml-4">
              <Text className="text-base md:text-lg text-text-secondary leading-relaxed mb-1">
                • Keeping your PIN and biometric access secure
              </Text>
              <Text className="text-base md:text-lg text-text-secondary leading-relaxed mb-1">
                • Backing up any data you store in the app
              </Text>
              <Text className="text-base md:text-lg text-text-secondary leading-relaxed">
                • Any consequences of losing access to your device
              </Text>
            </View>
          </View>

          {/* Section 5: No Warranty */}
          <View className="mb-8">
            <Text className="text-lg md:text-xl font-semibold text-text-primary mb-3">
              5. No Warranty
            </Text>
            <Text className="text-base md:text-lg text-text-secondary leading-relaxed">
              Thoryx is provided &quot;as is&quot; without warranty of any kind.
              We do not guarantee uninterrupted or error-free operation.
            </Text>
          </View>

          {/* Section 6: Limitation of Liability */}
          <View className="mb-8">
            <Text className="text-lg md:text-xl font-semibold text-text-primary mb-3">
              6. Limitation of Liability
            </Text>
            <Text className="text-base md:text-lg text-text-secondary leading-relaxed">
              To the maximum extent permitted by law, Thoryx and its developers
              are not liable for any loss of data, loss of access, or damages
              arising from use of the app.
            </Text>
          </View>

          {/* Section 7: Changes to These Terms */}
          <View className="mb-8">
            <Text className="text-lg md:text-xl font-semibold text-text-primary mb-3">
              7. Changes to These Terms
            </Text>
            <Text className="text-base md:text-lg text-text-secondary leading-relaxed">
              We may update these Terms from time to time. Continued use of the
              app after changes constitutes acceptance of the new Terms.
            </Text>
          </View>

          {/* Section 8: Governing Law */}
          <View className="mb-8">
            <Text className="text-lg md:text-xl font-semibold text-text-primary mb-3">
              8. Governing Law
            </Text>
            <Text className="text-base md:text-lg text-text-secondary leading-relaxed">
              These Terms are governed by the laws of Brazil.
            </Text>
          </View>

          {/* Section 9: Contact */}
          <View className="mb-8">
            <Text className="text-lg md:text-xl font-semibold text-text-primary mb-3">
              9. Contact
            </Text>
            <Text className="text-base md:text-lg text-text-secondary leading-relaxed">
              For questions, contact us at support@thoryx.app
            </Text>
          </View>

          {/* Footer Spacing */}
          <View className="h-16" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
