import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUserProfile } from '@presentation/hooks/use-user-profile';

export function ProfileSetupScreen() {
  const router = useRouter();
  const { saveProfile } = useUserProfile();
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (name.trim().length < 2) {
      Alert.alert('Invalid Name', 'Please enter a name with at least 2 characters');
      return;
    }

    setIsLoading(true);
    const result = await saveProfile({ name: name.trim() });
    setIsLoading(false);

    if (result.success) {
      // Navigate to main app after profile setup
      router.replace('/(tabs)');
    } else {
      Alert.alert('Error', result.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary px-6" edges={['top']}>
      <View className="flex-1 justify-center">
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-primary-main/20 rounded-full items-center justify-center mb-6">
            <Text className="text-5xl">👤</Text>
          </View>
          <Text className="text-2xl font-bold text-text-primary mb-2">Welcome to Thoryx</Text>
          <Text className="text-base text-text-secondary text-center">
            Let&apos;s set up your profile to get started
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-sm font-semibold text-text-secondary mb-2">YOUR NAME</Text>
          <TextInput
            className="bg-background-secondary rounded-xl px-4 py-4 text-text-primary text-base"
            placeholder="Enter your name"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
            autoFocus
            editable={!isLoading}
          />
        </View>

        <Pressable
          className={`bg-primary-main rounded-xl py-4 items-center ${isLoading ? 'opacity-50' : 'active:opacity-80'}`}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-bold text-base">Continue</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
