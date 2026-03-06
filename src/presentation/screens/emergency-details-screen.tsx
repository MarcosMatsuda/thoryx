import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

export function EmergencyDetailsScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-background-primary" edges={['top']}>
      <View className="flex-1">
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-ui-border">
          <Pressable 
            className="w-10 h-10 items-center justify-center"
            onPress={() => navigation.goBack()}
          >
            <Text className="text-2xl text-text-primary">←</Text>
          </Pressable>
          <Text className="text-lg font-bold text-text-primary">
            Emergency Profile
          </Text>
          <Pressable 
            className="w-10 h-10 items-center justify-center"
            onPress={() => navigation.navigate('emergency' as never)}
          >
            <Text className="text-xl text-primary-main">✏️</Text>
          </Pressable>
        </View>

        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6 py-6">
            <View className="bg-primary-main/10 rounded-2xl p-4 mb-6 border border-primary-main/30">
              <View className="flex-row items-start mb-2">
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
              <Pressable className="mt-2">
                <Text className="text-sm font-semibold text-primary-main">
                  Privacy Settings →
                </Text>
              </Pressable>
            </View>

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
                <View className="flex-1 bg-background-secondary rounded-xl p-4">
                  <View className="w-10 h-10 bg-status-error/20 rounded-lg items-center justify-center mb-3">
                    <Text className="text-2xl">🩸</Text>
                  </View>
                  <Text className="text-xs font-semibold text-text-secondary mb-1 tracking-wide">
                    BLOOD TYPE
                  </Text>
                  <Text className="text-lg font-bold text-text-primary">
                    O-Positive
                  </Text>
                </View>

                <View className="flex-1 bg-background-secondary rounded-xl p-4">
                  <View className="w-10 h-10 bg-primary-main/20 rounded-lg items-center justify-center mb-3">
                    <Text className="text-2xl">🛡️</Text>
                  </View>
                  <Text className="text-xs font-semibold text-text-secondary mb-1 tracking-wide">
                    HEALTH PLAN
                  </Text>
                  <Text className="text-base font-bold text-text-primary">
                    Blue Shield
                  </Text>
                  <Text className="text-sm text-text-secondary">
                    Platinum
                  </Text>
                </View>
              </View>

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
                  Penicillin, Peanuts, Latex
                </Text>
              </View>

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
                  Type 1 Diabetes, Asthma
                </Text>
              </View>

              <View className="bg-background-secondary rounded-xl p-4">
                <View className="flex-row items-center mb-3">
                  <View className="w-10 h-10 bg-accent-green/20 rounded-lg items-center justify-center mr-3">
                    <Text className="text-2xl">💊</Text>
                  </View>
                  <Text className="text-base font-bold text-text-primary">
                    Continuous Meds
                  </Text>
                </View>
                <Text className="text-sm text-text-secondary mb-1">
                  Insulin (Humalog), Albuterol inhaler as needed
                </Text>
              </View>
            </View>

            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <Text className="text-xs font-bold text-text-secondary tracking-wider">
                  IN CASE OF EMERGENCY (ICE)
                </Text>
              </View>

              <View className="bg-background-secondary rounded-xl p-4 mb-3">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="w-12 h-12 rounded-full overflow-hidden mr-3">
                      <View className="w-full h-full bg-primary-main/20 items-center justify-center">
                        <Text className="text-xl">👤</Text>
                      </View>
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-bold text-text-primary mb-0.5">
                        Sarah Johnson
                      </Text>
                      <Text className="text-sm text-text-secondary">
                        Wife
                      </Text>
                    </View>
                  </View>
                  <Pressable className="w-12 h-12 bg-primary-main rounded-full items-center justify-center ml-3">
                    <Text className="text-2xl">📞</Text>
                  </Pressable>
                </View>
              </View>

              <View className="bg-background-secondary rounded-xl p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="w-12 h-12 rounded-full bg-text-secondary/20 items-center justify-center mr-3">
                      <Text className="text-lg font-bold text-text-primary">
                        MK
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-bold text-text-primary mb-0.5">
                        Michael Klein
                      </Text>
                      <Text className="text-sm text-text-secondary">
                        Brother
                      </Text>
                    </View>
                  </View>
                  <Pressable className="w-12 h-12 bg-primary-main rounded-full items-center justify-center ml-3">
                    <Text className="text-2xl">📞</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        <View className="flex-row bg-background-secondary border-t border-ui-border">
          <Pressable 
            className="flex-1 items-center py-3"
            onPress={() => navigation.navigate('home' as never)}
          >
            <Text className="text-2xl mb-1">💼</Text>
            <Text className="text-xs font-medium text-text-secondary">Wallet</Text>
          </Pressable>
          <Pressable className="flex-1 items-center py-3">
            <Text className="text-2xl mb-1">❤️</Text>
            <Text className="text-xs font-medium text-text-secondary">Health</Text>
          </Pressable>
          <Pressable className="flex-1 items-center py-3">
            <Text className="text-2xl mb-1">🚨</Text>
            <Text className="text-xs font-medium text-primary-main">Emergency</Text>
          </Pressable>
          <Pressable className="flex-1 items-center py-3">
            <Text className="text-2xl mb-1">⚙️</Text>
            <Text className="text-xs font-medium text-text-secondary">Settings</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
