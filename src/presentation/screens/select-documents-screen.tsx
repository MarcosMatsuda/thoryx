import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SelectableDocumentItem } from "@presentation/components/selectable-document-item";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { useDocuments } from "@presentation/hooks/use-documents";
import {
  getDocumentIcon,
  getDocumentLabel,
} from "@presentation/utils/document-display";
import { useDocumentsStore } from "@stores/documents.store";
import { useTranslation } from "react-i18next";

export function SelectDocumentsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { documents, isLoading } = useDocuments();
  const { customDocumentTypes } = useDocumentsStore();
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

  // Pre-select documents that have auto-lock enabled
  useEffect(() => {
    if (documents.length > 0) {
      const autoLocked = documents
        .filter((doc) => doc.isAutoLockEnabled)
        .map((doc) => doc.id);
      if (autoLocked.length > 0) {
        setSelectedDocIds(autoLocked);
      }
    }
  }, [documents]);

  const toggleDocument = (docId: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : [...prev, docId],
    );
  };

  const getMainFieldValue = (doc: any): string => {
    // Try common field keys for the document number display
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

  const handleConfirm = () => {
    if (selectedDocIds.length === 0) {
      Alert.alert(
        t("selectDocuments.selectAtLeastOne"),
        t("selectDocuments.selectAtLeastOneMsg"),
        [{ text: t("common.ok") }],
      );
      return;
    }

    router.push(`/guest-mode?docIds=${selectedDocIds.join(",")}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-light-bg dark:bg-background-primary" edges={["top"]}>
      <View className="flex-1">
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-light-border dark:border-ui-border">
          <Pressable onPress={() => router.back()}>
            <Text className="text-2xl text-light-text dark:text-text-primary">✕</Text>
          </Pressable>
          <Text className="text-lg md:text-xl font-bold text-light-text dark:text-text-primary">
            {t("selectDocuments.title")}
          </Text>
          <Pressable>
            <Text className="text-base md:text-lg font-semibold text-primary-main">
              {t("common.help")}
            </Text>
          </Pressable>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 py-6">
            <Text className="text-2xl md:text-3xl font-bold text-light-text dark:text-text-primary mb-3 leading-tight">
              {t("selectDocuments.heading")}
            </Text>
            <Text className="text-sm md:text-base text-light-textSecondary dark:text-text-secondary mb-6 leading-5">
              {t("selectDocuments.description")}
            </Text>

            <View className="mb-6">
              {isLoading ? (
                <Text className="text-light-textSecondary dark:text-text-secondary text-center py-8">
                  {t("selectDocuments.loadingDocuments")}
                </Text>
              ) : documents.length === 0 ? (
                <View className="items-center justify-center py-12">
                  <Text className="text-6xl mb-4">📄</Text>
                  <Text className="text-base md:text-lg text-light-textSecondary dark:text-text-secondary mb-6 text-center">
                    {t("selectDocuments.noDocuments")}
                  </Text>
                </View>
              ) : (
                documents.map((doc) => {
                  const mainField = getMainFieldValue(doc);
                  return (
                    <SelectableDocumentItem
                      key={doc.id}
                      icon={getDocumentIcon(doc.typeId, customDocumentTypes)}
                      title={doc.fields.fullName ?? ""}
                      subtitle={`${doc.typeName ?? getDocumentLabel(doc.typeId, customDocumentTypes)}${mainField ? ` • **** ${mainField.slice(-4)}` : ""}`}
                      selected={selectedDocIds.includes(doc.id)}
                      onToggle={() => toggleDocument(doc.id)}
                    />
                  );
                })
              )}
            </View>

            <View className="bg-primary-main/10 rounded-2xl p-4 md:p-5 mb-6 border border-primary-main/20">
              <View className="flex-row items-start">
                <Text className="text-2xl mr-3">🔒</Text>
                <View className="flex-1">
                  <Text className="text-sm md:text-base font-bold text-light-text dark:text-text-primary mb-2">
                    {t("selectDocuments.secureLockTitle")}
                  </Text>
                  <Text className="text-xs md:text-sm text-light-textSecondary dark:text-text-secondary leading-5">
                    {t("selectDocuments.secureLockDesc")}
                  </Text>
                </View>
              </View>
            </View>

            <View className="bg-light-bgSecondary dark:bg-background-secondary rounded-2xl p-4 md:p-5 mb-6 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Text className="text-xl md:text-2xl mr-2">🛡️</Text>
                <Text className="text-base md:text-lg font-semibold text-light-text dark:text-text-primary">
                  {t("selectDocuments.sharingCount")}{" "}
                  <Text className="text-primary-main">
                    {selectedDocIds.length}
                  </Text>{" "}
                  {selectedDocIds.length !== 1
                    ? t("selectDocuments.sharingDocumentsPlural")
                    : t("selectDocuments.sharingDocuments")}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View className="px-6 pb-6 pt-4 bg-light-bg dark:bg-background-primary border-t border-light-border dark:border-ui-border">
          <Pressable
            className="bg-primary-main rounded-xl py-4 items-center active:opacity-90"
            onPress={handleConfirm}
          >
            <Text className="text-base md:text-lg font-bold text-light-text dark:text-text-primary">
              {t("selectDocuments.confirmLock")}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
