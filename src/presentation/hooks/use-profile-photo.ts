import { useCallback, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export function useProfilePhoto() {
  const [isLoading, setIsLoading] = useState(false);

  const pickFromGallery = useCallback(async (): Promise<string | null> => {
    setIsLoading(true);
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Media library permission is required to select photos.",
          [{ text: "OK" }],
        );
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
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
  }, []);

  return {
    pickFromGallery,
    isLoading,
  };
}
