import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useEmergencyInfo } from '@presentation/hooks/use-emergency-info';
import { useUserProfile } from '@presentation/hooks/use-user-profile';
import { RootStackParamList } from '@presentation/types/navigation';

export function EmergencyScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { emergencyInfo, isLoading } = useEmergencyInfo();
  const { profile } = useUserProfile();

  return (
    <SafeAreaView className="flex-1 bg-background-primary" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-4">
          <Text className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
            Emergency Info
          </Text>
          <Text className="text-sm md:text-base text-text-secondary mb-6">
            Critical medical information
          </Text>

          {!emergencyInfo ? (
            <View className="items-center justify-center py-12">
              <Text className="text-6xl mb-4">⚠️</Text>
              <Text className="text-base md:text-lg text-text-secondary mb-2 text-center font-semibold">
                No emergency information
              </Text>
              <Text className="text-sm md:text-base text-text-secondary mb-6 text-center px-8">
                {profile 
                  ? "Add your medical info and emergency contacts for quick access"
                  : "Please log in to add emergency information"
                }
              </Text>
              {profile && (
                <Pressable
                  onPress={() => navigation.navigate('emergency')}
                  className="bg-status-error px-6 py-3 rounded-xl active:opacity-80"
                >
                  <Text className="text-white font-semibold text-base md:text-lg">
                    Add Emergency Info
                  </Text>
                </Pressable>
              )}
            </View>
          ) : (
            <>
              {/* Blood Type */}
              {emergencyInfo.bloodType && (
                <View className="bg-surface-card p-4 rounded-2xl mb-3">
                  <Text className="text-xs md:text-sm text-text-secondary mb-1">
                    Blood Type
                  </Text>
                  <Text className="text-xl md:text-2xl font-bold text-status-error">
                    {emergencyInfo.bloodType}
                  </Text>
                </View>
              )}

              {/* Allergies */}
              {emergencyInfo.allergies && emergencyInfo.allergies.trim() !== '' && (
                <View className="bg-surface-card p-4 rounded-2xl mb-3">
                  <Text className="text-xs md:text-sm text-text-secondary mb-2">
                    Allergies
                  </Text>
                  <Text className="text-base md:text-lg text-status-warning font-medium">
                    {emergencyInfo.allergies}
                  </Text>
                </View>
              )}

              {/* Medications */}
              {emergencyInfo.medications && emergencyInfo.medications.length > 0 && (
                <View className="bg-surface-card p-4 rounded-2xl mb-3">
                  <Text className="text-xs md:text-sm text-text-secondary mb-2">
                    Current Medications
                  </Text>
                  {emergencyInfo.medications.map((med, index) => (
                    <Text
                      key={index}
                      className="text-base md:text-lg text-text-primary mb-1"
                    >
                      • {med}
                    </Text>
                  ))}
                </View>
              )}

              {/* Emergency Contacts */}
              {emergencyInfo.contacts && emergencyInfo.contacts.length > 0 && (
                <View className="bg-surface-card p-4 rounded-2xl mb-3">
                  <Text className="text-xs md:text-sm text-text-secondary mb-3">
                    Emergency Contacts
                  </Text>
                  {emergencyInfo.contacts.map((contact, index) => (
                    <View key={index} className="mb-3 last:mb-0">
                      <Text className="text-base md:text-lg font-semibold text-text-primary">
                        {contact.fullName}
                      </Text>
                      <Text className="text-sm md:text-base text-text-secondary">
                        {contact.relationship}
                      </Text>
                      <Text className="text-sm md:text-base text-primary-main">
                        {contact.phoneNumber}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Edit Button */}
              <Pressable
                onPress={() => navigation.navigate('emergency-details')}
                className="bg-primary-main mt-4 p-4 rounded-2xl items-center active:opacity-80"
              >
                <Text className="text-white font-semibold text-base md:text-lg">
                  Edit Emergency Info
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
