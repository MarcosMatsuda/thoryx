import { useState, useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

type OnPhotoUpdateCallback = () => void;

export function useProfilePhoto(onPhotoUpdate?: OnPhotoUpdateCallback) {
  const [isLoading, setIsLoading] = useState(false);

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
          return photoUri; // ← SÓ RETORNA URI, sem persistir
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
    [requestPermissions],
  );

  const showImagePickerOptions = useCallback(async () => {
    return new Promise<string | null>((resolve) => {
      Alert.alert(
        "Choose Profile Photo",
        "Select an option to choose your profile photo",
        [
          { 
            text: "Cancel", 
            style: "cancel",
            onPress: () => resolve(null)
          },
          { 
            text: "Take Photo", 
            onPress: async () => {
              const uri = await pickImage("camera");
              resolve(uri);
            }
          },
          { 
            text: "Choose from Gallery", 
            onPress: async () => {
              const uri = await pickImage("gallery");
              resolve(uri);
            }
          },
        ],
      );
    });
  }, [pickImage]);

  return {
    pickImage,
    showImagePickerOptions,
    isLoading,
    requestPermissions,
  };
}
