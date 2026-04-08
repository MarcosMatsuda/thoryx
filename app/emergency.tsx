import { EmergencyDetailsScreen } from "@presentation/screens/emergency-details-screen";
import { useEmergencyInfo } from "@presentation/hooks/use-emergency-info";
import { ActivityIndicator, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Pressable } from "react-native";
import { useTranslation } from "react-i18next";

export default function EmergencyRoute() {
  const { t } = useTranslation();
  const { emergencyInfo, isLoading } = useEmergencyInfo();
  const router = useRouter();

  if (isLoading) {
    return (
      <View className="flex-1 bg-background-primary items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  // Unauthenticated: no data → show empty state (NOT setup)
  if (!emergencyInfo) {
    return (
      <SafeAreaView className="flex-1 bg-background-primary" edges={["top"]}>
        <View className="flex-1">
          <View className="flex-row items-center px-6 py-4 border-b border-ui-border">
            <Pressable
              className="w-10 h-10 items-center justify-center"
              onPress={() => router.back()}
            >
              <Text className="text-2xl text-text-primary">←</Text>
            </Pressable>
            <Text className="text-lg font-bold text-text-primary ml-2">
              {t("emergency.title")}
            </Text>
          </View>
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-2xl mb-2">🚨</Text>
            <Text className="text-lg font-bold text-text-primary mb-2 text-center">
              {t("emergency.noInfo")}
            </Text>
            <Text className="text-sm text-text-secondary text-center">
              {t("emergency.noInfoUnauthDesc")}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Unauthenticated: has data → show details in read-only mode
  return <EmergencyDetailsScreen isAuthenticated={false} />;
}
