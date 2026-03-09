import { View, Text, ScrollView, Pressable, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useUserProfile } from '@presentation/hooks/use-user-profile';
import { SettingsSection } from '@presentation/components/settings-section';
import { SettingsItem } from '@presentation/components/settings-item';
import * as Application from 'expo-application';

export function SettingsScreen() {
  const navigation = useNavigation();
  const { profile } = useUserProfile();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [autoLockTimeout, setAutoLockTimeout] = useState('5 minutes');

  const handleChangePin = () => {
    Alert.alert(
      'Change PIN',
      'This feature will be implemented soon.',
      [{ text: 'OK' }]
    );
  };

  const handleBiometricToggle = (value: boolean) => {
    setBiometricEnabled(value);
    // TODO: Implement biometric authentication
  };

  const handleAutoLockTimeout = () => {
    Alert.alert(
      'Auto-lock Timeout',
      'Choose when to lock the app',
      [
        { text: '1 minute', onPress: () => setAutoLockTimeout('1 minute') },
        { text: '5 minutes', onPress: () => setAutoLockTimeout('5 minutes') },
        { text: '15 minutes', onPress: () => setAutoLockTimeout('15 minutes') },
        { text: '30 minutes', onPress: () => setAutoLockTimeout('30 minutes') },
        { text: 'Never', onPress: () => setAutoLockTimeout('Never') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will remove all your documents, cards, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement clear all data
            Alert.alert('Success', 'All data has been cleared.');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure? This will permanently delete your account and all associated data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion
            Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
          },
        },
      ]
    );
  };

  const handleTermsOfService = () => {
    Alert.alert(
      'Terms of Service',
      'This feature will be implemented soon.',
      [{ text: 'OK' }]
    );
  };

  const handlePrivacyPolicy = () => {
    Alert.alert(
      'Privacy Policy',
      'This feature will be implemented soon.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="pt-4 pb-8">
          <Text className="text-2xl md:text-3xl font-bold text-text-primary mb-6 px-6">
            Settings
          </Text>

          {/* Profile Section */}
          <SettingsSection title="PROFILE">
            <Pressable
              onPress={() => navigation.navigate('profile-setup' as never)}
              className="p-4 active:bg-surface-hover"
            >
              <View className="flex-row items-center">
                <View className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden mr-4">
                  <View className="w-full h-full bg-primary-main/20 items-center justify-center">
                    <Text className="text-3xl md:text-4xl">👤</Text>
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="text-lg md:text-xl font-bold text-text-primary mb-1">
                    {profile?.name || 'Set up profile'}
                  </Text>
                  <Text className="text-sm md:text-base text-text-secondary">
                    Tap to edit profile
                  </Text>
                </View>
                <Text className="text-text-secondary text-xl">›</Text>
              </View>
            </Pressable>
          </SettingsSection>

          {/* Security Section */}
          <SettingsSection title="SECURITY">
            <SettingsItem
              label="Change PIN"
              onPress={handleChangePin}
              icon={<Text className="text-xl">🔐</Text>}
              isFirst
            />
            <SettingsItem
              label="Biometric Lock"
              icon={<Text className="text-xl">👆</Text>}
              switchValue={biometricEnabled}
              onSwitchChange={handleBiometricToggle}
            />
            <SettingsItem
              label="Auto-lock Timeout"
              onPress={handleAutoLockTimeout}
              icon={<Text className="text-xl">⏱️</Text>}
              value={autoLockTimeout}
              isLast
            />
          </SettingsSection>

          {/* Data & Privacy Section */}
          <SettingsSection title="DATA & PRIVACY">
            <SettingsItem
              label="Clear All Data"
              onPress={handleClearData}
              icon={<Text className="text-xl">🗑️</Text>}
              destructive
              showChevron={false}
              isFirst
            />
            <SettingsItem
              label="Delete Account"
              onPress={handleDeleteAccount}
              icon={<Text className="text-xl">⚠️</Text>}
              destructive
              showChevron={false}
              isLast
            />
          </SettingsSection>

          {/* About Section */}
          <SettingsSection title="ABOUT">
            <SettingsItem
              label="Version"
              value={Application.nativeApplicationVersion || '1.0.0'}
              showChevron={false}
              icon={<Text className="text-xl">ℹ️</Text>}
              isFirst
            />
            <SettingsItem
              label="Terms of Service"
              onPress={handleTermsOfService}
              icon={<Text className="text-xl">📄</Text>}
            />
            <SettingsItem
              label="Privacy Policy"
              onPress={handlePrivacyPolicy}
              icon={<Text className="text-xl">🔒</Text>}
              isLast
            />
          </SettingsSection>

          {/* Footer */}
          <Text className="text-xs md:text-sm text-text-secondary text-center mt-8 px-6">
            Thoryx Wallet • Secure Digital Wallet
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
