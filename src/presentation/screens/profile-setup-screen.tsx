import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { useUserProfile } from "@presentation/hooks/use-user-profile";
import { useProfilePhoto } from "@presentation/hooks/use-profile-photo";
import { UserAvatar } from "@presentation/components/user-avatar";

export function ProfileSetupScreen() {
  const router = useRouter();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const { profile, saveProfile, reloadProfile } = useUserProfile();
  const {
    pickImage,
    showImagePickerOptions,
    isLoading: isPhotoLoading,
  } = useProfilePhoto();
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      reloadProfile();
    }, [reloadProfile]),
  );

  useEffect(() => {
    if (profile?.photoUri) {
      setPhotoUri(profile.photoUri);
    }
  }, [profile?.photoUri]);

  useEffect(() => {
    if (profile?.name) {
      setName(profile.name);
    }
  }, [profile]);

  const handleSave = async () => {
    if (name.trim().length < 2) {
      Alert.alert(
        "Invalid Name",
        "Please enter a name with at least 2 characters",
      );
      return;
    }

    setIsSaving(true);
    const result = await saveProfile({
      name: name.trim(),
      photoUri: photoUri ?? undefined, // ← Incluir photoUri
    });
    setIsSaving(false);

    if (result.success) {
      // Use router.canGoBack() to decide navigation
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(tabs)");
      }
    } else {
      Alert.alert("Error", result.message);
    }
  };

  const handleSelectPhoto = async () => {
    const newUri = await showImagePickerOptions();
    if (newUri) {
      setPhotoUri(newUri); // ← Apenas atualiza estado local
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary px-6" edges={["top"]}>
      <View className="flex-1 justify-center">
        <View className="items-center mb-6">
          <UserAvatar
            photoUri={photoUri}
            size={80}
            onPress={handleSelectPhoto}
          />
          <Pressable onPress={handleSelectPhoto} className="mt-3">
            <Text className="text-sm text-primary-main font-semibold">
              {photoUri ? "Change Image" : "Choose Image"}
            </Text>
          </Pressable>
        </View>

        <Text className="text-2xl font-bold text-text-primary mb-2 text-center">
          {profile ? "Edit Profile" : "Welcome to Thoryx"}
        </Text>
        <Text className="text-base text-text-secondary text-center mb-8">
          {profile
            ? "Update your profile information"
            : "Let's set up your profile to get started"}
        </Text>

        <View className="mb-6">
          <Text className="text-sm font-semibold text-text-secondary mb-2">
            YOUR NAME
          </Text>
          <TextInput
            className="bg-background-secondary rounded-xl px-4 py-4 text-text-primary text-base"
            placeholder="Enter your name"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
            autoFocus={!profile?.name}
            editable={!isSaving && !isPhotoLoading}
          />
        </View>

        <Pressable
          className={`bg-primary-main rounded-xl py-4 items-center ${isSaving ? "opacity-50" : "active:opacity-80"}`}
          onPress={handleSave}
          disabled={isSaving || isPhotoLoading}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-bold text-base">
              {profile ? "Save Changes" : "Continue"}
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
