import { Pressable, Text, View, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { FakeCreditCard } from "./fake-credit-card";

let VisionCamera: any = null;
let TextRecognition: any = null;

try {
  VisionCamera = require("react-native-vision-camera");
} catch (error) {
  console.log("Vision Camera not available. Using fallback mode.");
}

try {
  TextRecognition = require("@react-native-ml-kit/text-recognition");
} catch (error) {
  console.log("ML Kit Text Recognition not available.");
}

interface CameraScannerV2Props {
  onCardDataExtracted?: (data: {
    cardNumber?: string;
    cardholderName?: string;
    expiryDate?: string;
  }) => void;
  cardNumber?: string;
  cardholderName?: string;
  expiryDate?: string;
}

export function CameraScannerV2({
  onCardDataExtracted,
  cardNumber,
  cardholderName,
  expiryDate,
}: CameraScannerV2Props) {
  const [hasPermission, setHasPermission] = useState(false);
  const [isVisionCameraAvailable, setIsVisionCameraAvailable] = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const device = VisionCamera ? VisionCamera.useCameraDevice("back") : null;

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    if (VisionCamera && VisionCamera.Camera) {
      try {
        const cameraPermission =
          await VisionCamera.Camera.requestCameraPermission();
        setHasPermission(cameraPermission === "granted");
        setIsVisionCameraAvailable(true);
      } catch (error) {
        console.log("Vision Camera not available, using fallback");
        setIsVisionCameraAvailable(false);
      }
    } else {
      setIsVisionCameraAvailable(false);
    }
  };

  if (!isVisionCameraAvailable || !VisionCamera) {
    return (
      <View className="mb-6">
        <FakeCreditCard
          cardNumber={cardNumber}
          cardholderName={cardholderName}
          expiryDate={expiryDate}
        />
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View className="w-full rounded-2xl aspect-[4/3] overflow-hidden mb-6 bg-background-secondary items-center justify-center p-6">
        <Text className="text-text-primary text-center mb-4">
          Camera permission is required to scan cards
        </Text>
        <Pressable
          className="bg-primary-main rounded-xl px-6 py-3"
          onPress={checkPermissions}
        >
          <Text className="text-text-primary font-semibold">
            Grant Permission
          </Text>
        </Pressable>
      </View>
    );
  }

  const Camera = VisionCamera.Camera;

  if (!device) {
    return (
      <View className="w-full rounded-2xl aspect-[4/3] overflow-hidden mb-6 bg-background-secondary items-center justify-center">
        <Text className="text-text-secondary">Loading camera...</Text>
      </View>
    );
  }

  return (
    <View className="w-full rounded-2xl aspect-[4/3] overflow-hidden mb-6">
      <Camera style={StyleSheet.absoluteFill} device={device} isActive={true}>
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
        </View>
      </Camera>
    </View>
  );
}
