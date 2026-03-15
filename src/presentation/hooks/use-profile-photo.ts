import { useState, useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { UpdateProfilePhotoUseCase } from "@domain/use-cases/update-profile-photo.use-case";
import { UserProfileRepositoryImpl } from "@data/repositories/user-profile.repository.impl";

type OnPhotoUpdateCallback = () => void;

export function useProfilePhoto(onPhotoUpdate?: OnPhotoUpdateCallback) {
  const [isLoading, setIsLoading] = useState(false);
  const repository = new UserProfileRepositoryImpl();
  const updatePhotoUseCase = new UpdateProfilePhotoUseCase(repository);

  const requestPermissions = useCallback(async () => {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    return {
      camera: cameraStatus === "granted",
      mediaLibrary: mediaStatus === "granted",
    };
  }, []);

  const pickImage = useCallback(
    async (source: "camera" | "gallery") => {
      setIsLoading(true);
      try {
        const permissions = await requestPermissions();

        if (source === "camera" && !permissions.camera) {
          Alert.alert(
            "Permission Required",
            "Camera permission is required to take photos. Please enable it in your device settings.",
            [{ text: "OK" }],
          );
          return null;
        }

        if (source === "gallery" && !permissions.mediaLibrary) {
          Alert.alert(
            "Permission Required",
            "Media library permission is required to select photos. Please enable it in your device settings.",
            [{ text: "OK" }],
          );
          return null;
        }

        const options: ImagePicker.ImagePickerOptions = {
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
          base64: false,
        };

        let result: ImagePicker.ImagePickerResult;

        if (source === "camera") {
          result = await ImagePicker.launchCameraAsync(options);
        } else {
          result = await ImagePicker.launchImageLibraryAsync(options);
        }

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const photoUri = result.assets[0].uri;

          const updateResult = await updatePhotoUseCase.execute(photoUri);

          if (updateResult.success) {
            Alert.alert("Success", updateResult.message, [{ text: "OK" }]);
            onPhotoUpdate?.();
            return photoUri;
          } else {
            Alert.alert("Error", updateResult.message, [{ text: "OK" }]);
            return null;
          }
        }

        return null;
      } catch (error) {
        console.error("Error picking image:", error);
        Alert.alert("Error", "Failed to pick image. Please try again.", [
          { text: "OK" },
        ]);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [requestPermissions, updatePhotoUseCase, onPhotoUpdate],
  );

  const showImagePickerOptions = useCallback(() => {
    Alert.alert(
      "Choose Profile Photo",
      "Select an option to choose your profile photo",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Take Photo", onPress: () => pickImage("camera") },
        { text: "Choose from Gallery", onPress: () => pickImage("gallery") },
      ],
    );
  }, [pickImage]);

  const removePhoto = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await updatePhotoUseCase.execute(null);

      if (result.success) {
        Alert.alert("Success", result.message, [{ text: "OK" }]);
        onPhotoUpdate?.();
        return true;
      } else {
        Alert.alert("Error", result.message, [{ text: "OK" }]);
        return false;
      }
    } catch (error) {
      console.error("Error removing photo:", error);
      Alert.alert("Error", "Failed to remove photo. Please try again.", [
        { text: "OK" },
      ]);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [updatePhotoUseCase, onPhotoUpdate]);

  return {
    pickImage,
    showImagePickerOptions,
    removePhoto,
    isLoading,
    requestPermissions,
  };
}
