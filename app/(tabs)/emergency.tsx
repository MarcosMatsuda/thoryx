import { EmergencyDetailsScreen } from '@presentation/screens/emergency-details-screen';
import { EmergencySetupScreen } from '@presentation/screens/emergency-setup-screen';
import { useEmergencyInfo } from '@presentation/hooks/use-emergency-info';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function EmergencyTab() {
  const { emergencyInfo, isLoading, refresh } = useEmergencyInfo();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [])
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-background-primary items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!emergencyInfo) {
    return <EmergencySetupScreen />;
  }

  return <EmergencyDetailsScreen />;
}
