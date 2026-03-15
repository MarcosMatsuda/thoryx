import { EmergencyDetailsScreen } from "@presentation/screens/emergency-details-screen";
import { EmergencySetupScreen } from "@presentation/screens/emergency-setup-screen";
import { useEmergencyInfo } from "@presentation/hooks/use-emergency-info";
import { ActivityIndicator, View } from "react-native";

export default function EmergencyRoute() {
  const { emergencyInfo, isLoading } = useEmergencyInfo();

  if (isLoading) {
    return (
      <View className="flex-1 bg-background-primary items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  // Se não tem informações, mostra a tela de setup
  if (!emergencyInfo) {
    return <EmergencySetupScreen />;
  }

  // Se tem informações, mostra a tela de detalhes
  return <EmergencyDetailsScreen />;
}
