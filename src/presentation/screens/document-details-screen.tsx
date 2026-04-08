import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  BackHandler,
  Image,
  Modal,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DocumentPhotoCarousel } from "@presentation/components/document-photo-carousel";
import { DetailRow } from "@presentation/components/detail-row";
import { InfoBanner } from "@presentation/components/info-banner";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { DocumentRepositoryImpl } from "@data/repositories/document.repository.impl";
import { Document } from "@domain/entities/document.entity";
import { getDocumentTypeById } from "@domain/entities/document-type-registry";
import { useDocumentsStore } from "@stores/documents.store";
import { useTranslation } from "react-i18next";

export function DocumentDetailsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { documentId, guestMode } = params as {
    documentId?: string;
    guestMode?: string;
  };
  const isGuestMode = guestMode === "true";
  const { customDocumentTypes, loadCustomTypes } = useDocumentsStore();

  const [document, setDocument] = useState<Document | null>(null);
  const [photoUris, setPhotoUris] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isAutoLockEnabled, setIsAutoLockEnabled] = useState(false);
  const [isTogglingAutoLock, setIsTogglingAutoLock] = useState(false);
  const [fullscreenPhoto, setFullscreenPhoto] = useState<string | null>(null);

  useEffect(() => {
    loadCustomTypes();
    if (documentId) {
      loadDocument();
    } else {
      setIsLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    if (!isGuestMode) return;
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        router.replace("/guest-mode" as any);
        return true;
      },
    );
    return () => subscription.remove();
  }, [isGuestMode, router]);

  const loadDocument = async () => {
    if (!documentId) return;
    try {
      setIsLoading(true);
      const repository = new DocumentRepositoryImpl();
      const doc = await repository.findById(documentId);
      if (doc) {
        setDocument(doc);
        setIsAutoLockEnabled(doc.isAutoLockEnabled || false);
        const decrypted = await repository.decryptPhotos(doc.photos);
        setPhotoUris(decrypted);
      }
    } catch (error) {
      console.error("Error loading document:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAutoLock = async () => {
    if (!documentId || !document) return;
    const previousState = isAutoLockEnabled;
    try {
      const newState = !isAutoLockEnabled;
      setIsAutoLockEnabled(newState);
      setIsTogglingAutoLock(true);
      const repository = new DocumentRepositoryImpl();
      const updatedDocument = await repository.toggleAutoLock(documentId);
      setDocument(updatedDocument);
      setIsAutoLockEnabled(updatedDocument.isAutoLockEnabled);
    } catch (error) {
      console.error("Error toggling auto-lock:", error);
      setIsAutoLockEnabled(previousState);
    } finally {
      setIsTogglingAutoLock(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background-primary" edges={["top"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaView>
    );
  }

  if (!document) {
    return (
      <SafeAreaView className="flex-1 bg-background-primary" edges={["top"]}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-text-secondary">
            {t("documentDetails.notFound")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const typeDef = getDocumentTypeById(document.typeId, customDocumentTypes);
  const photoSlots = Object.keys(photoUris);

  return (
    <SafeAreaView className="flex-1 bg-background-primary" edges={["top"]}>
      <View className="flex-1">
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-ui-border">
          <Pressable
            className="w-10 h-10 items-center justify-center"
            onPress={() => {
              if (isGuestMode) {
                router.replace("/guest-mode" as any);
              } else {
                router.back();
              }
            }}
          >
            <Text className="text-2xl text-text-primary">←</Text>
          </Pressable>
          <Text className="text-lg font-bold text-text-primary">
            {document.typeName ?? typeDef?.label ?? "Documento"}
          </Text>
          {!isGuestMode && (
            <Pressable
              className="w-10 h-10 items-center justify-center"
              onPress={() =>
                router.push({
                  pathname: "/add-document",
                  params: { documentId: document.id },
                })
              }
            >
              <Text className="text-xl text-primary-main">✏️</Text>
            </Pressable>
          )}
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="py-6">
            {/* Photos — tap to view fullscreen */}
            {photoSlots.length >= 2 &&
              photoUris[photoSlots[0]] &&
              photoUris[photoSlots[1]] && (
                <View>
                  <Pressable
                    onPress={() => setFullscreenPhoto(photoUris[photoSlots[0]])}
                  >
                    <DocumentPhotoCarousel
                      frontPhotoUri={photoUris[photoSlots[0]]}
                      backPhotoUri={photoUris[photoSlots[1]]}
                    />
                  </Pressable>
                </View>
              )}
            {photoSlots.length === 1 && photoUris[photoSlots[0]] && (
              <Pressable
                className="px-6 mb-4"
                onPress={() => setFullscreenPhoto(photoUris[photoSlots[0]])}
              >
                <View className="rounded-2xl overflow-hidden">
                  <Image
                    source={{ uri: photoUris[photoSlots[0]] }}
                    className="w-full aspect-[4/3]"
                    resizeMode="cover"
                  />
                </View>
              </Pressable>
            )}

            <View className="px-6 mb-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-bold text-text-primary">
                  {t("documentDetails.title")}
                </Text>
              </View>

              <View className="bg-background-secondary rounded-2xl px-4">
                {/* Render fields dynamically from schema or raw fields */}
                {typeDef
                  ? typeDef.fields.map((fieldDef) => {
                      const value = document.fields[fieldDef.key];
                      if (!value) return null;
                      return (
                        <DetailRow
                          key={fieldDef.key}
                          label={fieldDef.label}
                          value={value}
                        />
                      );
                    })
                  : Object.entries(document.fields).map(([key, value]) => (
                      <DetailRow key={key} label={key} value={value} />
                    ))}
              </View>
            </View>
          </View>

          {/* Auto-lock toggle — available for all document types */}
          {!isGuestMode && (
            <View className="px-6 mb-6">
              <View className="bg-background-secondary rounded-2xl overflow-hidden px-4 py-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 mr-3">
                    <Text className="text-base font-medium text-text-primary">
                      {t("documentDetails.autoLock")}
                    </Text>
                    <Text className="text-sm text-text-secondary mt-1">
                      {t("documentDetails.autoLockDesc")}
                    </Text>
                  </View>
                  <View>
                    {isTogglingAutoLock ? (
                      <ActivityIndicator size="small" color="#3B82F6" />
                    ) : (
                      <Pressable
                        onPress={handleToggleAutoLock}
                        className={`w-12 h-7 rounded-full justify-center ${
                          isAutoLockEnabled
                            ? "bg-primary-main"
                            : "bg-text-secondary/30"
                        }`}
                      >
                        <View
                          className={`w-5 h-5 rounded-full bg-white mx-1 ${
                            isAutoLockEnabled ? "self-end" : "self-start"
                          }`}
                        />
                      </Pressable>
                    )}
                  </View>
                </View>
              </View>
            </View>
          )}

          <View className="px-6">
            <InfoBanner
              icon="🔒"
              message={t("documentDetails.encryptionNotice")}
            />
          </View>
        </ScrollView>
      </View>

      {/* Fullscreen photo modal — rotated to fill screen */}
      <Modal
        visible={fullscreenPhoto !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setFullscreenPhoto(null)}
      >
        <Pressable
          className="flex-1 bg-black items-center justify-center"
          onPress={() => setFullscreenPhoto(null)}
        >
          {fullscreenPhoto && (
            <View
              style={{
                transform: [{ rotate: "90deg" }],
                width: Dimensions.get("window").height,
                height: Dimensions.get("window").width,
              }}
              className="items-center justify-center"
            >
              <Image
                source={{ uri: fullscreenPhoto }}
                style={{
                  width: Dimensions.get("window").height * 0.95,
                  height: Dimensions.get("window").width * 0.95,
                }}
                resizeMode="contain"
              />
            </View>
          )}
          <Pressable
            className="absolute top-14 right-6 w-10 h-10 bg-white/20 rounded-full items-center justify-center"
            onPress={() => setFullscreenPhoto(null)}
          >
            <Text className="text-white text-xl font-bold">✕</Text>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
