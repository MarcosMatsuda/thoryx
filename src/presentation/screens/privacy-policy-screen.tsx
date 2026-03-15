import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ThoryxHeader,
  BackButton,
} from "@presentation/components/thoryx-header";

export function PrivacyPolicyScreen() {
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
            Privacy Policy
          </Text>
        }
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-8">
          {/* Title */}
          <Text className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
            Privacy Policy — Thoryx
          </Text>
          <Text className="text-sm md:text-base text-text-secondary mb-8">
            Last updated: March 2026
          </Text>

          {/* Section 1: No Data Collection */}
          <View className="mb-8">
            <Text className="text-lg md:text-xl font-semibold text-text-primary mb-3">
              1. No Data Collection
            </Text>
            <Text className="text-base md:text-lg text-text-secondary leading-relaxed">
              Thoryx does not collect, transmit, or store any personal data. All
              information you enter — documents, cards, emergency contacts, PINs
              — stays exclusively on your device.
            </Text>
          </View>

          {/* Section 2: Local Storage Only */}
          <View className="mb-8">
            <Text className="text-lg md:text-xl font-semibold text-text-primary mb-3">
              2. Local Storage Only
            </Text>
            <Text className="text-base md:text-lg text-text-secondary leading-relaxed">
              Your data is saved locally using encrypted storage
              (SecureStorage). We have no access to your data and cannot recover
              it if you lose your device or uninstall the app.
            </Text>
          </View>

          {/* Section 3: No Analytics or Tracking */}
          <View className="mb-8">
            <Text className="text-lg md:text-xl font-semibold text-text-primary mb-3">
              3. No Analytics or Tracking
            </Text>
            <Text className="text-base md:text-lg text-text-secondary leading-relaxed">
              Thoryx does not use analytics, tracking, cookies, or any
              third‑party services that could identify you or your usage.
            </Text>
          </View>

          {/* Section 4: Permissions */}
          <View className="mb-8">
            <Text className="text-lg md:text-xl font-semibold text-text-primary mb-3">
              4. Permissions
            </Text>
            <Text className="text-base md:text-lg text-text-secondary leading-relaxed mb-2">
              Thoryx only requests permissions when you choose to use specific
              features:
            </Text>
            <View className="ml-4">
              <Text className="text-base md:text-lg text-text-secondary leading-relaxed mb-1">
                • Camera: Used only when you choose to take a photo for your
                profile picture. Images are stored locally and never leave your
                device.
              </Text>
              <Text className="text-base md:text-lg text-text-secondary leading-relaxed">
                • Photo Library: Used only when you choose a photo from your
                library for your profile picture. Images are stored locally and
                never leave your device.
              </Text>
            </View>
          </View>

          {/* Section 5: Biometric Data */}
          <View className="mb-8">
            <Text className="text-lg md:text-xl font-semibold text-text-primary mb-3">
              5. Biometric Data
            </Text>
            <Text className="text-base md:text-lg text-text-secondary leading-relaxed">
              If you enable Face ID / Touch ID, the biometric data is managed by
              your device&apos;s operating system. Thoryx never receives or
              stores your biometric information.
            </Text>
          </View>

          {/* Section 6: Changes to This Policy */}
          <View className="mb-8">
            <Text className="text-lg md:text-xl font-semibold text-text-primary mb-3">
              6. Changes to This Policy
            </Text>
            <Text className="text-base md:text-lg text-text-secondary leading-relaxed">
              We may update this Privacy Policy from time to time. Continued use
              of the app after changes constitutes acceptance of the new policy.
            </Text>
          </View>

          {/* Section 7: Contact */}
          <View className="mb-8">
            <Text className="text-lg md:text-xl font-semibold text-text-primary mb-3">
              7. Contact
            </Text>
            <Text className="text-base md:text-lg text-text-secondary leading-relaxed">
              For questions about this Privacy Policy, contact us at
              support@thoryx.app
            </Text>
          </View>

          {/* Footer Spacing */}
          <View className="h-16" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
