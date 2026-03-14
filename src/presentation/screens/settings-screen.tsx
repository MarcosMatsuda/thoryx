import { View, Text, ScrollView, Pressable, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useUserProfile } from '@presentation/hooks/use-user-profile';
import { useBiometry } from '@presentation/hooks/use-biometry';
import { useProfilePhoto } from '@presentation/hooks/use-profile-photo';
import { SettingsSection } from '@presentation/components/settings-section';
import { SettingsItem } from '@presentation/components/settings-item';
import { SecureStorageAdapter } from '@infrastructure/storage/secure-storage.adapter';
import { AuthService } from '@infrastructure/services/auth.service';
import * as Application from 'expo-application';

const BIOMETRY_ENABLED_KEY = 'biometry_enabled';
const storage = new SecureStorageAdapter('settings-storage', 'thoryx-mmkv-encryption-key-2026');

export function SettingsScreen() {
  const router = useRouter();
  const { profile, reloadProfile } = useUserProfile();
  const { isAvailable: biometryAvailable, getBiometryName, authenticate } = useBiometry();
  const { showImagePickerOptions, isLoading: isPhotoLoading } = useProfilePhoto(reloadProfile);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [autoLockTimeout, setAutoLockTimeout] = useState('5 minutes');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    loadBiometryPreference();
  }, []);

  const loadBiometryPreference = async () => {
    try {
      const enabled = await storage.get(BIOMETRY_ENABLED_KEY);
      if (enabled === 'true') {
        setBiometricEnabled(true);
      }
    } catch (error) {
      console.error('Error loading biometry preference:', error);
    }
  };

  const handleChangePin = () => {
    router.push('/change-pin');
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (!biometryAvailable) {
      Alert.alert(
        'Not Available',
        'Biometric authentication is not available on this device or not set up.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (value) {
      // Test biometry before enabling
      const result = await authenticate('Enable biometric lock');
      if (result.success) {
        await storage.set(BIOMETRY_ENABLED_KEY, 'true');
        setBiometricEnabled(true);
        Alert.alert(
          'Enabled',
          `${getBiometryName()} has been enabled for unlocking the app.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Authentication Failed',
          result.error || 'Could not verify biometric authentication.',
          [{ text: 'OK' }]
        );
      }
    } else {
      await storage.set(BIOMETRY_ENABLED_KEY, 'false');
      setBiometricEnabled(false);
      Alert.alert(
        'Disabled',
        'Biometric lock has been disabled.',
        [{ text: 'OK' }]
      );
    }
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

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              const authService = new AuthService();
              const result = await authService.logout();
              
              if (result.success) {
                // Navigate to unlock screen (index will show unlock since PIN still exists)
                router.replace('/unlock');
              } else {
                Alert.alert('Error', result.error || 'Failed to log out. Please try again.');
              }
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Failed to log out. Please try again.');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
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
          onPress: async () => {
            try {
              // Clear all MMKV storage instances
              const creditCardStorage = new SecureStorageAdapter('credit-cards-storage', 'thoryx-mmkv-encryption-key-2026');
              const documentStorage = new SecureStorageAdapter('documents-storage', 'thoryx-mmkv-encryption-key-2026');
              const emergencyStorage = new SecureStorageAdapter('emergency-info-storage', 'thoryx-mmkv-encryption-key-2026');
              const pinStorage = new SecureStorageAdapter('pin-storage', 'thoryx-mmkv-encryption-key-2026');
              const profileStorage = new SecureStorageAdapter('user-profile-storage', 'thoryx-mmkv-encryption-key-2026');

              await creditCardStorage.clear();
              await documentStorage.clear();
              await emergencyStorage.clear();
              await pinStorage.clear();
              await profileStorage.clear();
              await storage.clear();

              Alert.alert('Success', 'All data has been cleared. Please restart the app.');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear all data. Please try again.');
            }
          },
        },
      ]
    );
  };



  const handleTermsOfService = () => {
    router.push('/terms-of-service');
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
              onPress={() => router.push('/profile-setup')}
              className="p-4 active:bg-surface-hover"
            >
              <View className="flex-row items-center">
                <View className="items-center mr-4">
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      showImagePickerOptions();
                    }}
                    disabled={isPhotoLoading}
                    className="relative"
                  >
                    <View className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-primary-main/30">
                      {profile?.photoUri ? (
                        <Image
                          source={{ uri: profile.photoUri }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="w-full h-full bg-primary-main/20 items-center justify-center">
                          <Text className="text-3xl md:text-4xl">👤</Text>
                        </View>
                      )}
                      {isPhotoLoading && (
                        <View className="absolute inset-0 bg-black/50 items-center justify-center">
                          <Text className="text-white text-sm">Loading...</Text>
                        </View>
                      )}
                    </View>
                  </Pressable>
                  <Text className="text-xs text-center mt-1 text-primary-main font-medium">
                    {profile?.photoUri ? 'Alterar imagem' : 'Escolher imagem'}
                  </Text>
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
              label={biometryAvailable ? `${getBiometryName()}` : 'Biometric Lock (Not Available)'}
              icon={<Text className="text-xl">👆</Text>}
              switchValue={biometricEnabled}
              onSwitchChange={handleBiometricToggle}
              disabled={!biometryAvailable}
            />
            <SettingsItem
              label="Auto-lock Timeout"
              onPress={handleAutoLockTimeout}
              icon={<Text className="text-xl">⏱️</Text>}
              value={autoLockTimeout}
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
              label="Log Out"
              onPress={handleLogout}
              icon={<Text className="text-xl">🚪</Text>}
              destructive
              showChevron={false}
              loading={isLoggingOut}
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
