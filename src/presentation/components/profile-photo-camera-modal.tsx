import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import { ChevronLeft, RefreshCw } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { tokens } from "@presentation/theme/design-tokens";

interface ProfilePhotoCameraModalProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (uri: string) => void;
}

// Stadium-shaped face guide (vertically oriented). Height > width keeps it
// matching the natural face aspect, and the capped corners read as an oval
// without needing SVG to draw a true ellipse.
const GUIDE_WIDTH = 320;
const GUIDE_HEIGHT = 420;

export function ProfilePhotoCameraModal({
  visible,
  onClose,
  onCapture,
}: ProfilePhotoCameraModalProps) {
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facing, setFacing] = useState<"front" | "back">("front");

  useEffect(() => {
    if (
      visible &&
      permission &&
      !permission.granted &&
      permission.canAskAgain
    ) {
      requestPermission();
    }
  }, [visible, permission, requestPermission]);

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) {
      return;
    }
    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: false,
      });
      if (!photo) {
        return;
      }
      // Avatar is displayed as a circle; centre-crop to a square so the
      // saved file doesn't carry letterboxing.
      const size = Math.min(photo.width, photo.height);
      const originX = Math.max(0, (photo.width - size) / 2);
      const originY = Math.max(0, (photo.height - size) / 2);
      const cropped = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ crop: { originX, originY, width: size, height: size } }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG },
      );
      onCapture(cropped.uri);
      onClose();
    } catch (error) {
      console.error("Error capturing profile photo:", error);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleFlipFacing = () => {
    if (isCapturing) return;
    setFacing((current) => (current === "front" ? "back" : "front"));
  };

  return (
    <Modal
      visible={visible}
      transparent
      presentationStyle="overFullScreen"
      statusBarTranslucent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black">
        {permission?.granted ? (
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing={facing}
          >
            <View
              pointerEvents="none"
              className="flex-1 items-center justify-center"
            >
              <View
                style={{
                  width: GUIDE_WIDTH,
                  height: GUIDE_HEIGHT,
                  borderRadius: GUIDE_WIDTH / 2,
                  borderWidth: 3,
                  borderColor: "rgba(255,255,255,0.9)",
                  borderStyle: "dashed",
                }}
              />
              <Text className="text-white text-base font-semibold mt-6 mx-8 text-center">
                {t("profile.facePhotoGuide")}
              </Text>
            </View>
          </CameraView>
        ) : (
          <View className="flex-1 items-center justify-center px-8">
            <Text className="text-white text-center mb-4 text-base">
              {permission === null
                ? t("common.loading")
                : t("addDocument.cameraPermissionMsg")}
            </Text>
            {permission && !permission.granted && permission.canAskAgain && (
              <Pressable
                accessibilityRole="button"
                onPress={requestPermission}
                className="bg-primary-main px-6 py-3 rounded-xl"
              >
                <Text className="text-white font-semibold">
                  {t("common.continue")}
                </Text>
              </Pressable>
            )}
          </View>
        )}

        <SafeAreaView
          edges={["top"]}
          pointerEvents="box-none"
          className="absolute top-0 left-0 right-0"
        >
          <View className="flex-row justify-between items-center px-4 py-2">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("common.close")}
              className="w-10 h-10 items-center justify-center bg-black/50 rounded-full"
              onPress={onClose}
            >
              <ChevronLeft color="white" size={24} />
            </Pressable>
            {permission?.granted && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("profile.flipCamera")}
                className="w-10 h-10 items-center justify-center bg-black/50 rounded-full"
                onPress={handleFlipFacing}
              >
                <RefreshCw color="white" size={20} />
              </Pressable>
            )}
          </View>
        </SafeAreaView>

        <SafeAreaView
          edges={["bottom"]}
          pointerEvents="box-none"
          className="absolute bottom-0 left-0 right-0"
        >
          <View className="items-center pb-8">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("profile.takePhoto")}
              accessibilityState={{ disabled: isCapturing }}
              disabled={isCapturing || !permission?.granted}
              onPress={handleCapture}
              className="w-20 h-20 rounded-full items-center justify-center"
              style={{
                backgroundColor: "rgba(255,255,255,0.25)",
                borderWidth: 4,
                borderColor: "white",
              }}
            >
              {isCapturing ? (
                <ActivityIndicator color={tokens.colors.text.primary} />
              ) : (
                <View className="w-14 h-14 rounded-full bg-white" />
              )}
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
