import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { useEmergencyInfo } from '@presentation/hooks/use-emergency-info';
import { useCallback } from 'react';

export function EmergencyDetailsScreen() {
  const router = useRouter();
  const { emergencyInfo, isLoading, refresh } = useEmergencyInfo();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [])
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background-primary items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  if (!emergencyInfo) {
    return (
      <SafeAreaView className="flex-1 bg-background-primary" edges={['top']}>
        <View className="flex-1">
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-ui-border">
            <Pressable 
              className="w-10 h-10 items-center justify-center"
              onPress={() => router.back()}
            >
              <Text className="text-2xl text-text-primary">←</Text>
            </Pressable>
            <Text className="text-lg font-bold text-text-primary">
              Emergency Profile
            </Text>
            <Pressable
              className="w-10 h-10 items-center justify-center"
              onPress={() => router.push('/emergency-setup')}
            >
              <Text className="text-xl text-primary-main">✏️</Text>
            </Pressable>
          </View>
          
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-2xl mb-2">🚨</Text>
            <Text className="text-lg font-bold text-text-primary mb-2 text-center">
              No Emergency Information
            </Text>
            <Text className="text-sm text-text-secondary text-center mb-6">
              Set up your emergency profile to help first responders in case of emergency.
            </Text>
            <Pressable 
              className="bg-primary-main rounded-xl py-3 px-6 active:bg-primary-dark"
              onPress={() => router.push('/emergency-setup')}
            >
              <Text className="text-base font-bold text-text-primary">
                Set Up Emergency Profile
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-primary" edges={['top']}>
      <View className="flex-1">
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-ui-border">
          <Pressable 
            className="w-10 h-10 items-center justify-center"
            onPress={() => router.back()}
          >
            <Text className="text-2xl text-text-primary">←</Text>
          </Pressable>
          <Text className="text-lg font-bold text-text-primary">
            Emergency Profile
          </Text>
          <Pressable 
            className="w-10 h-10 items-center justify-center"
            onPress={() => router.push('/emergency-setup')}
          >
            <Text className="text-xl text-primary-main">✏️</Text>
          </Pressable>
        </View>

        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6 py-6">
            {emergencyInfo.lockScreenVisible && (
              <View className="bg-primary-main/10 rounded-2xl p-4 mb-6 border border-primary-main/30">
                <View className="flex-row items-start">
                  <Text className="text-xl mr-2">ℹ️</Text>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-primary-main mb-1">
                      Lock Screen Accessibility
                    </Text>
                    <Text className="text-xs text-text-secondary leading-5">
                      This information will be accessible to first responders from the lock screen without a passcode in case of emergency.
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <View className="w-8 h-8 bg-status-error/20 rounded-lg items-center justify-center mr-2">
                  <Text className="text-lg">✱</Text>
                </View>
                <Text className="text-xs font-bold text-status-error tracking-wider">
                  VITAL MEDICAL INFO
                </Text>
              </View>

              <View className="flex-row gap-3 mb-3">
                {emergencyInfo.bloodType && (
                  <View className="flex-1 bg-background-secondary rounded-xl p-4">
                    <View className="w-10 h-10 bg-status-error/20 rounded-lg items-center justify-center mb-3">
                      <Text className="text-2xl">🩸</Text>
                    </View>
                    <Text className="text-xs font-semibold text-text-secondary mb-1 tracking-wide">
                      BLOOD TYPE
                    </Text>
                    <Text className="text-lg font-bold text-text-primary">
                      {emergencyInfo.bloodType}
                    </Text>
                  </View>
                )}

                {emergencyInfo.healthPlan && (
                  <View className="flex-1 bg-background-secondary rounded-xl p-4">
                    <View className="w-10 h-10 bg-primary-main/20 rounded-lg items-center justify-center mb-3">
                      <Text className="text-2xl">🛡️</Text>
                    </View>
                    <Text className="text-xs font-semibold text-text-secondary mb-1 tracking-wide">
                      HEALTH PLAN
                    </Text>
                    <Text className="text-base font-bold text-text-primary">
                      {emergencyInfo.healthPlan}
                    </Text>
                  </View>
                )}
              </View>

              {emergencyInfo.allergies && (
                <View className="bg-background-secondary rounded-xl p-4 mb-3">
                  <View className="flex-row items-center mb-3">
                    <View className="w-10 h-10 bg-accent-orange/20 rounded-lg items-center justify-center mr-3">
                      <Text className="text-2xl">⚠️</Text>
                    </View>
                    <Text className="text-base font-bold text-text-primary">
                      Allergies
                    </Text>
                  </View>
                  <Text className="text-sm text-text-secondary">
                    {emergencyInfo.allergies}
                  </Text>
                </View>
              )}

              {emergencyInfo.healthConditions && (
                <View className="bg-background-secondary rounded-xl p-4 mb-3">
                  <View className="flex-row items-center mb-3">
                    <View className="w-10 h-10 bg-primary-main/20 rounded-lg items-center justify-center mr-3">
                      <Text className="text-2xl">🏥</Text>
                    </View>
                    <Text className="text-base font-bold text-text-primary">
                      Health Conditions
                    </Text>
                  </View>
                  <Text className="text-sm text-text-secondary">
                    {emergencyInfo.healthConditions}
                  </Text>
                </View>
              )}

              {emergencyInfo.medications.length > 0 && (
                <View className="bg-background-secondary rounded-xl p-4">
                  <View className="flex-row items-center mb-3">
                    <View className="w-10 h-10 bg-accent-green/20 rounded-lg items-center justify-center mr-3">
                      <Text className="text-2xl">💊</Text>
                    </View>
                    <Text className="text-base font-bold text-text-primary">
                      Continuous Meds
                    </Text>
                  </View>
                  <Text className="text-sm text-text-secondary">
                    {emergencyInfo.medications.join(', ')}
                  </Text>
                </View>
              )}
            </View>

            {emergencyInfo.contacts.length > 0 && (
              <View className="mb-6">
                <View className="flex-row items-center mb-4">
                  <Text className="text-xs font-bold text-text-secondary tracking-wider">
                    IN CASE OF EMERGENCY (ICE)
                  </Text>
                </View>

                {emergencyInfo.contacts.map((contact, index) => {
                  const initials = contact.fullName
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .substring(0, 2);

                  return (
                    <View key={contact.id} className="bg-background-secondary rounded-xl p-4 mb-3">
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center flex-1">
                          {index === 0 ? (
                            <View className="w-12 h-12 rounded-full overflow-hidden mr-3">
                              <View className="w-full h-full bg-primary-main/20 items-center justify-center">
                                <Text className="text-xl">👤</Text>
                              </View>
                            </View>
                          ) : (
                            <View className="w-12 h-12 rounded-full bg-text-secondary/20 items-center justify-center mr-3">
                              <Text className="text-lg font-bold text-text-primary">
                                {initials}
                              </Text>
                            </View>
                          )}
                          <View className="flex-1">
                            <Text className="text-base font-bold text-text-primary mb-0.5">
                              {contact.fullName}
                            </Text>
                            <Text className="text-sm text-text-secondary">
                              {contact.relationship}
                            </Text>
                          </View>
                        </View>
                        <Pressable className="w-12 h-12 bg-primary-main rounded-full items-center justify-center ml-3">
                          <Text className="text-2xl">📞</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>

      </View>
    </SafeAreaView>
  );
}
