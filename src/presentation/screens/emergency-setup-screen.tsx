import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertBanner } from '@presentation/components/alert-banner';
import { SectionHeader } from '@presentation/components/section-header';
import { BloodTypeSelector } from '@presentation/components/blood-type-selector';
import { TextInputField } from '@presentation/components/text-input-field';
import { ContactCard } from '@presentation/components/contact-card';
import { DropdownInput } from '@presentation/components/dropdown-input';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';

export function EmergencySetupScreen() {
  const navigation = useNavigation();
  const [lockScreenVisible, setLockScreenVisible] = useState(false);
  const [bloodType, setBloodType] = useState<string>();

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
            Emergency Information
          </Text>
          <Pressable className="w-10 h-10 items-center justify-center">
            <Text className="text-xl text-primary-main">✓</Text>
          </Pressable>
        </View>

        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-6 py-6"
        >
          <AlertBanner
            title="CRITICAL ACCESS"
            message="These emergency details will be accessible even when the device is locked in case of emergency."
            icon="⚠️"
            toggleLabel="Visible on lock screen"
            toggleEnabled={lockScreenVisible}
            onToggle={() => setLockScreenVisible(!lockScreenVisible)}
          />

          <View className="mb-6">
            <SectionHeader 
              icon="🏥" 
              title="Vital Medical Info"
              iconBg="#3B82F6"
            />

            <TextInputField
              label="Health Plan"
              placeholder="e.g. Blue Shield Gold"
            />

            <View className="mb-4">
              <Text className="text-sm text-text-secondary mb-3">Blood Type</Text>
              <BloodTypeSelector 
                selectedType={bloodType}
                onSelect={setBloodType}
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm text-text-secondary mb-2">Serious Allergies</Text>
              <TextInput
                className="bg-background-secondary rounded-xl px-4 py-3 text-text-primary min-h-[80px]"
                placeholder="List any life-threatening allergies..."
                placeholderTextColor="#64748B"
                multiline
                textAlignVertical="top"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm text-text-secondary mb-2">Health Conditions</Text>
              <TextInput
                className="bg-background-secondary rounded-xl px-4 py-3 text-text-primary min-h-[80px]"
                placeholder="Diabetes, Hypertension, etc."
                placeholderTextColor="#64748B"
                multiline
                textAlignVertical="top"
              />
            </View>

            <View className="mb-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm text-text-secondary">Chronic Medications</Text>
                <Pressable className="w-8 h-8 bg-primary-main rounded-full items-center justify-center">
                  <Text className="text-xl text-text-primary font-bold">+</Text>
                </Pressable>
              </View>
              <TextInput
                className="bg-background-secondary rounded-xl px-4 py-3 text-text-primary"
                placeholder="Add medication"
                placeholderTextColor="#64748B"
              />
            </View>
          </View>

          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <SectionHeader 
                icon="🚨" 
                title="Emergency Contacts (ICE)"
                iconBg="#EF4444"
              />
              <Pressable>
                <Text className="text-sm font-semibold text-primary-main">Add New</Text>
              </Pressable>
            </View>

            <ContactCard
              fullName="Sarah Jenkins"
              relationship="Spouse"
              phoneNumber="+1 (555) 0123"
            />

            <Pressable className="bg-background-secondary rounded-xl p-4 flex-row items-center justify-center border-2 border-dashed border-ui-border active:bg-background-tertiary">
              <Text className="text-xl mr-2">👥</Text>
              <Text className="text-sm font-medium text-text-secondary">
                Add a secondary emergency contact
              </Text>
            </Pressable>
          </View>
        </ScrollView>

        <View className="flex-row bg-background-secondary border-t border-ui-border">
          <Pressable className="flex-1 items-center py-3">
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
