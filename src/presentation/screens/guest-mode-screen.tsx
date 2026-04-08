import { View, Text, ScrollView, Pressable, BackHandler } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { DocumentRepositoryImpl } from "@data/repositories/document.repository.impl";
import { Document } from "@domain/entities/document.entity";
import { CountdownTimer } from "@presentation/components/countdown-timer";
import { PinAuthBottomSheet } from "@presentation/components/pin-auth-bottom-sheet";
import { SecureStorageAdapter } from "@infrastructure/storage/secure-storage.adapter";
import { getDocumentIcon } from "@presentation/utils/document-display";
import { useDocumentsStore } from "@stores/documents.store";
import { useTranslation } from "react-i18next";

const AUTO_LOCK_TIMEOUT_KEY = "auto_lock_timeout_minutes";
const storage = new SecureStorageAdapter(
  "settings-storage",
  "thoryx-mmkv-encryption-key-2026",
);

export function GuestModeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ docIds?: string }>();
  const { customDocumentTypes, loadCustomTypes } = useDocumentsStore();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [timeoutMinutes, setTimeoutMinutes] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [showPinAuth, setShowPinAuth] = useState(false);
  const documentRepository = new DocumentRepositoryImpl();

  useEffect(() => {
    loadTimeout();
    loadDocuments();
    loadCustomTypes();
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true,
    );
    return () => subscription.remove();
  }, []);

  const loadTimeout = async () => {
    try {
      const saved = await storage.get(AUTO_LOCK_TIMEOUT_KEY);
      if (saved) {
        const minutes = parseInt(saved, 10);
        if (!isNaN(minutes) && minutes > 0) setTimeoutMinutes(minutes);
      }
    } catch (error) {
      console.error("Error loading auto-lock timeout:", error);
    }
  };

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const allDocuments = await documentRepository.findAll();
      if (params.docIds) {
        const selectedIds = params.docIds.split(",");
        setDocuments(
          allDocuments.filter((doc) => selectedIds.includes(doc.id)),
        );
      } else {
        setDocuments(allDocuments.filter((doc) => doc.isAutoLockEnabled));
      }
    } catch (error) {
      console.error("Error loading documents:", error);
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentPress = (documentId: string) => {
    router.push(`/document-details?documentId=${documentId}&guestMode=true`);
  };

  const handleTimerExpire = () => {
    router.replace("/unlock");
  };

  const handleExitSecureMode = () => {
    setShowPinAuth(true);
  };

  const handlePinAuthSuccess = () => {
    setShowPinAuth(false);
    router.replace("/(tabs)");
  };

  const getMainFieldValue = (doc: Document): string => {
    const keys = [
      "registrationNumber",
      "rgNumber",
      "cpfNumber",
      "passportNumber",
      "ctpsNumber",
      "voterNumber",
      "certificateNumber",
      "documentNumber",
    ];
    for (const key of keys) {
      if (doc.fields[key]) return doc.fields[key];
    }
    return "";
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-2xl font-bold text-center text-text-secondary mb-4">
        {t("guestMode.noDocuments")}
      </Text>
      <Text className="text-base text-center text-text-tertiary mb-8">
        {t("guestMode.noDocumentsDesc")}
      </Text>
      <CountdownTimer
        durationMinutes={timeoutMinutes}
        onExpire={handleTimerExpire}
        style="prominent"
      />
    </View>
  );

  const renderDocumentList = () => (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="px-6 py-4 gap-3">
        {documents.map((document) => {
          const mainField = getMainFieldValue(document);
          return (
            <Pressable
              key={document.id}
              onPress={() => handleDocumentPress(document.id)}
              className="bg-background-secondary rounded-2xl p-4 active:opacity-80"
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-row flex-1">
                  <View className="w-12 h-12 bg-primary-main/10 rounded-xl items-center justify-center mr-3">
                    <Text className="text-2xl">
                      {getDocumentIcon(document.typeId, customDocumentTypes)}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-text-primary mb-1">
                      {document.fields.fullName ?? document.typeName}
                    </Text>
                    {mainField ? (
                      <>
                        <Text className="text-xs text-text-secondary">
                          {t("guestMode.documentNumber")}
                        </Text>
                        <Text className="text-sm text-text-secondary">
                          •••• •••• {mainField.slice(-4)}
                        </Text>
                      </>
                    ) : null}
                  </View>
                </View>
                <View className="w-8 h-8 bg-primary-main/10 rounded-lg items-center justify-center ml-2">
                  <Text className="text-primary-main text-lg">📋</Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      {/* Header */}
      <View className="px-6 pt-6 pb-4 border-b border-border-primary">
        <Text className="text-3xl font-bold text-text-primary mb-4">
          {t("guestMode.title")}
        </Text>
        <Text className="text-base text-text-secondary mb-4">
          {t("guestMode.expiresIn")}
        </Text>
        <CountdownTimer
          durationMinutes={timeoutMinutes}
          onExpire={handleTimerExpire}
          style="prominent"
        />
      </View>

      {/* Content */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-text-secondary">{t("common.loading")}</Text>
        </View>
      ) : documents.length === 0 ? (
        renderEmptyState()
      ) : (
        renderDocumentList()
      )}

      {/* Fixed bottom exit button */}
      <View className="px-6 pb-6 pt-4 bg-background-primary border-t border-ui-border">
        <Pressable
          onPress={handleExitSecureMode}
          className="bg-status-error rounded-xl py-4 items-center active:opacity-80"
        >
          <Text className="text-base font-bold text-white">
            {t("guestMode.exitSecureMode")}
          </Text>
        </Pressable>
      </View>

      <PinAuthBottomSheet
        visible={showPinAuth}
        onSuccess={handlePinAuthSuccess}
        onClose={() => setShowPinAuth(false)}
      />
    </SafeAreaView>
  );
}
