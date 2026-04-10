import { Pressable, Text, View, StyleSheet } from "react-native";
import { Hourglass, Camera } from "lucide-react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import { tokens } from "@presentation/theme/design-tokens";

let TextRecognition: any = null;
try {
  TextRecognition = require("expo-text-recognition");
} catch (error) {
  console.log(
    "expo-text-recognition not available in Expo Go. OCR will be disabled.",
  );
}

interface CameraScannerProps {
  onCardDataExtracted?: (data: {
    cardNumber?: string;
    cardholderName?: string;
    expiryDate?: string;
  }) => void;
}

export function CameraScanner({ onCardDataExtracted }: CameraScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const extractCardData = (text: string) => {
    const cardNumber = text.match(/\d{4}\s?\d{4}\s?\d{4}\s?\d{4}/)?.[0];
    const expiryDate = text.match(/\d{2}\/\d{2,4}/)?.[0];

    const lines = text.split("\n").filter((line) => line.trim().length > 0);
    const cardholderName = lines.find(
      (line) =>
        /^[A-Z\s]{5,}$/.test(line.trim()) &&
        !line.includes("CARD") &&
        !line.includes("CREDIT"),
    );

    return {
      cardNumber: cardNumber?.replace(/\s/g, ""),
      expiryDate,
      cardholderName: cardholderName?.trim(),
    };
  };

  const handleScan = async () => {
    if (cameraRef.current && !isScanning) {
      setIsScanning(true);
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo) {
          if (TextRecognition) {
            try {
              const textLines = await TextRecognition.getTextFromFrame(
                photo.uri,
                false,
              );
              const fullText = textLines.join("\n");
              const cardData = extractCardData(fullText);

              if (onCardDataExtracted) {
                onCardDataExtracted(cardData);
              }
            } catch (ocrError) {
              console.warn("OCR failed:", ocrError);
              console.log("User can fill fields manually.");
            }
          } else {
            console.log(
              "OCR not available in Expo Go. User can fill fields manually.",
            );
          }
        }
      } catch (error) {
        console.error("Error scanning card:", error);
      } finally {
        setIsScanning(false);
      }
    }
  };

  if (!permission) {
    return (
      <View className="w-full rounded-2xl aspect-[4/3] overflow-hidden mb-6 bg-background-secondary items-center justify-center">
        <Text className="text-text-secondary">Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="w-full rounded-2xl aspect-[4/3] overflow-hidden mb-6 bg-background-secondary items-center justify-center p-6">
        <Text className="text-text-primary text-center mb-4">
          Camera permission is required to scan cards
        </Text>
        <Pressable
          className="bg-primary-main rounded-xl px-6 py-3"
          onPress={requestPermission}
        >
          <Text className="text-text-primary font-semibold">
            Grant Permission
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="w-full rounded-2xl aspect-[4/3] overflow-hidden mb-6">
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        <View className="flex-1 items-center justify-center">
          <View className="absolute top-[18%] left-[8%] w-16 h-16 border-l-[6px] border-t-[6px] border-primary-main rounded-tl-3xl" />
          <View className="absolute top-[18%] right-[8%] w-16 h-16 border-r-[6px] border-t-[6px] border-primary-main rounded-tr-3xl" />
          <View className="absolute bottom-[18%] left-[8%] w-16 h-16 border-l-[6px] border-b-[6px] border-primary-main rounded-bl-3xl" />
          <View className="absolute bottom-[18%] right-[8%] w-16 h-16 border-r-[6px] border-b-[6px] border-primary-main rounded-br-3xl" />

          <View className="absolute inset-0 items-center justify-center">
            <View className="bg-background-primary/70 rounded-full px-5 py-2">
              <Text className="text-xs font-bold text-text-primary tracking-widest">
                POSITION CARD HERE
              </Text>
            </View>
          </View>

          <View className="absolute bottom-6 left-0 right-0 items-center">
            <Pressable
              className={`rounded-full px-6 py-3 flex-row items-center justify-center ${
                isScanning
                  ? "bg-ui-border"
                  : "bg-primary-main active:bg-primary-dark"
              }`}
              onPress={handleScan}
              disabled={isScanning}
            >
              {isScanning ? (
                <Hourglass
                  size={18}
                  color={tokens.colors.text.primary}
                  className="mr-2"
                />
              ) : (
                <Camera
                  size={18}
                  color={tokens.colors.text.primary}
                  className="mr-2"
                />
              )}
              <Text className="text-base font-bold text-text-primary">
                {isScanning ? "Scanning..." : "Scan Card"}
              </Text>
            </Pressable>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
});
