import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useUserProfile } from '@presentation/hooks/use-user-profile';
import { useProfilePhoto } from '@presentation/hooks/use-profile-photo';
import { UserAvatar } from '@presentation/components/user-avatar';

export function ProfileSetupScreen() {
  const navigation = useNavigation();
  const { profile, saveProfile, reloadProfile } = useUserProfile();
  const { showImagePickerOptions } = useProfilePhoto();
  const [name, setName] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      reloadProfile();
    }, [reloadProfile])
  );

  useEffect(() => {
    if (profile?.name) {
      setName(profile.name);
    }
    if (profile?.photoUri) {
      setPhotoUri(profile.photoUri);
    }
  }, [profile?.name, profile?.photoUri]);

  const handleSelectPhoto = async () => {
    const newPhotoUri = await showImagePickerOptions();
    if (newPhotoUri) {
      setPhotoUri(newPhotoUri);
    }
  };

  const handleSave = async () => {
    if (name.trim().length < 2) {
      Alert.alert('Invalid Name', 'Please enter a name with at least 2 characters');
      return;
    }

    setIsLoading(true);
    const result = await saveProfile({ name: name.trim(), photoUri });
    setIsLoading(false);

    if (result.success) {
      navigation.goBack();
    } else {
      Alert.alert('Error', result.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary px-6" edges={['top']}>
      <View className="flex-1 justify-center">
        <View className="items-center mb-8">
          <View className="items-center mb-6">
            <UserAvatar
              photoUri={photoUri}
              size={80}
              onPress={handleSelectPhoto}
            />
            <Pressable onPress={handleSelectPhoto} className="mt-3">
              <Text className="text-sm text-primary-main font-semibold">
                {photoUri ? 'Alterar imagem' : 'Escolher imagem'}
              </Text>
            </Pressable>
          </View>
          <Text className="text-2xl font-bold text-text-primary mb-2">Welcome to Thoryx</Text>
          <Text className="text-base text-text-secondary text-center">
            Let's set up your profile to get started
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
