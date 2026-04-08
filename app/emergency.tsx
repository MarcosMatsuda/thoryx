import { EmergencyDetailsScreen } from "@presentation/screens/emergency-details-screen";
import { useEmergencyInfo } from "@presentation/hooks/use-emergency-info";
import { ActivityIndicator, View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ChevronLeft, Siren } from "lucide-react-native";

export default function EmergencyRoute() {
  const { t } = useTranslation();
  const { emergencyInfo, isLoading } = useEmergencyInfo();
  const router = useRouter();

  if (isLoading) {
    return (
      <View className="flex-1 bg-light-bg dark:bg-background-primary items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  // Unauthenticated: no data → show empty state (NOT setup)
  if (!emergencyInfo) {
    return (
      <SafeAreaView
        className="flex-1 bg-light-bg dark:bg-background-primary"
        edges={["top"]}
      >
        <View className="flex-1">
          <View className="flex-row items-center px-6 py-4 border-b border-light-border dark:border-ui-border">
            <Pressable
              className="w-10 h-10 items-center justify-center"
              onPress={() => router.back()}
            >
              <ChevronLeft size={24} color="#94A3B8" />
            </Pressable>
            <Text className="text-lg font-bold text-light-text dark:text-text-primary ml-2">
              {t("emergency.title")}
            </Text>
          </View>
          <View className="flex-1 items-center justify-center px-6">
            <Siren size={24} color="#EF4444" className="mb-2" />
            <Text className="text-lg font-bold text-light-text dark:text-text-primary mb-2 text-center">
              {t("emergency.noInfo")}
            </Text>
            <Text className="text-sm text-light-textSecondary dark:text-text-secondary text-center">
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
