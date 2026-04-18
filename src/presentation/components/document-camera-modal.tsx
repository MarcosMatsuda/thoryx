import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import { ChevronLeft, RefreshCw } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { tokens } from "@presentation/theme/design-tokens";

interface DocumentCameraModalProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (uri: string) => void;
}

// ISO/IEC 7810 ID-1 aspect — 85.60 × 54.00 mm (~1.585:1). Covers CNH,
// RG novo (CIN), CPF, cartão de crédito and most Brazilian IDs in the
// same frame. Passport is a separate, taller format and intentionally
// not targeted here.
const DOCUMENT_ASPECT_RATIO = 85.6 / 54;
// Side margin so the dashed outline isn't flush against the edges.
const GUIDE_HORIZONTAL_MARGIN = 16;
// Cap for tablets — above ~480 the guide dominates the viewfinder and
// hurts framing on large portrait screens.
const GUIDE_MAX_WIDTH = 480;
// Absolute pinch bounds so the user can't shrink the guide into
// invisibility or blow it past the edge of the camera preview.
const GUIDE_MIN_PT = 200;
// Extra padding in photo pixels on each side of the crop. Compensates
// for the dashed border width, sub-pixel rounding, and the preview's
// small layout differences between devices — without it, users were
// losing a sliver of content at the edges of the framed area.
const CROP_BUFFER_RATIO = 0.03;

export function DocumentCameraModal({
  visible,
  onClose,
  onCapture,
}: DocumentCameraModalProps) {
  const { t } = useTranslation();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facing, setFacing] = useState<"front" | "back">("back");

  const baseWidth = Math.min(
    screenWidth - GUIDE_HORIZONTAL_MARGIN * 2,
    GUIDE_MAX_WIDTH,
  );
  const minScale = GUIDE_MIN_PT / baseWidth;
  const maxScale = (screenWidth - GUIDE_HORIZONTAL_MARGIN) / baseWidth;

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      const next = savedScale.value * event.scale;
      scale.value =
        next < minScale ? minScale : next > maxScale ? maxScale : next;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const animatedGuideStyle = useAnimatedStyle(() => {
    const width = baseWidth * scale.value;
    return {
      width,
      height: width / DOCUMENT_ASPECT_RATIO,
    };
  });

  // Reset the guide size whenever the modal is reopened so a new
  // capture session doesn't inherit the previous zoom.
  useEffect(() => {
    if (visible) {
      scale.value = 1;
      savedScale.value = 1;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

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
        quality: 1,
        skipProcessing: false,
      });
      if (!photo) {
        return;
      }

      // Read the current pinch-adjusted guide size so the crop follows
      // whatever the user framed at capture time.
      const currentScale = scale.value;
      const currentGuideWidth = baseWidth * currentScale;
      const currentGuideHeight = currentGuideWidth / DOCUMENT_ASPECT_RATIO;

      // CameraView renders in "cover" mode: the photo is scaled so its
      // smallest dimension matches the screen, and the overflow on the
      // other axis is cropped from the preview. We derive the scale
      // factor from whichever axis is filling the screen, then express
      // the guide's on-screen size in photo pixels.
      const { width: w, height: h } = photo;
      const photoAspect = w / h;
      const screenAspect = screenWidth / screenHeight;
      const photoPxPerScreenPx =
        photoAspect > screenAspect ? h / screenHeight : w / screenWidth;
      const guidePhotoWidth = currentGuideWidth * photoPxPerScreenPx;
      const guidePhotoHeight = currentGuideHeight * photoPxPerScreenPx;
      // Grow the crop proportionally on both axes so the aspect ratio
      // stays 1.585:1 and the dashed border area is fully included.
      const bufferedWidth = guidePhotoWidth * (1 + CROP_BUFFER_RATIO * 2);
      const bufferedHeight = guidePhotoHeight * (1 + CROP_BUFFER_RATIO * 2);
      const originX = Math.max(0, Math.round((w - bufferedWidth) / 2));
      const originY = Math.max(0, Math.round((h - bufferedHeight) / 2));
      const cropWidth = Math.min(w - originX, Math.round(bufferedWidth));
      const cropHeight = Math.min(h - originY, Math.round(bufferedHeight));

      const cropped = await ImageManipulator.manipulateAsync(
        photo.uri,
        [
          {
            crop: {
              originX,
              originY,
              width: cropWidth,
              height: cropHeight,
            },
          },
        ],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG },
      );
      onCapture(cropped.uri);
      onClose();
    } catch (error) {
      console.error("Error capturing document photo:", error);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleFlipFacing = () => {
    if (isCapturing) return;
    setFacing((current) => (current === "back" ? "front" : "back"));
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
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View className="flex-1 bg-black">
          {permission?.granted ? (
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              facing={facing}
              autofocus="on"
            >
              <GestureDetector gesture={pinchGesture}>
                <View className="flex-1 items-center justify-center">
                  <Animated.View
                    style={[
                      animatedGuideStyle,
                      {
                        borderRadius: 12,
                        borderWidth: 3,
                        borderColor: "rgba(255,255,255,0.9)",
                        borderStyle: "dashed",
                      },
                    ]}
                  />
                  <Text
                    pointerEvents="none"
                    className="text-white text-base font-semibold mt-6 mx-8 text-center"
                  >
                    {t("addDocument.documentPhotoGuide")}
                  </Text>
                  <Text
                    pointerEvents="none"
                    className="text-white/80 text-sm mt-2 mx-8 text-center"
                  >
                    {t("addDocument.documentPhotoHint")}
                  </Text>
                </View>
              </GestureDetector>
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
                accessibilityLabel={t("addDocument.capturePhoto")}
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
      </GestureHandlerRootView>
    </Modal>
  );
}
