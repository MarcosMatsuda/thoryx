import { ActionCard } from "@presentation/components/action-card";
import { SvgIcon } from "@presentation/components/svg-icon";
import { UserAvatar } from "@presentation/components/user-avatar";
import { useCreditCards } from "@presentation/hooks/use-credit-cards";
import { useDocuments } from "@presentation/hooks/use-documents";
import { useUserProfile } from "@presentation/hooks/use-user-profile";
import {
  getDocumentIcon,
  getDocumentLabel,
} from "@presentation/utils/document-display";
import { useDocumentsStore } from "@stores/documents.store";
import { useRouter, useFocusEffect } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

export function WalletHomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    documents,
    isLoading: documentsLoading,
    reload: loadDocuments,
  } = useDocuments();
  const { cards, isLoading: cardsLoading } = useCreditCards();
  const {
    profile,
    isLoading: profileLoading,
    reloadProfile,
  } = useUserProfile();
  const { customDocumentTypes } = useDocumentsStore();

  useEffect(() => {
    if (!profileLoading && !profile) {
      router.push("/profile-setup");
    }
  }, [profile, profileLoading, router]);

  useFocusEffect(
    React.useCallback(() => {
      loadDocuments();
      reloadProfile();
    }, [reloadProfile, loadDocuments]),
  );

  const getCardLabel = () => {
    if (cards.length === 0) return t("wallet.newCard");
    if (cards.length === 1) return t("wallet.card");
    return t("wallet.cards");
  };

  const getMainFieldValue = (doc: any): string => {
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

  return (
    <SafeAreaView className="flex-1 bg-light-bg dark:bg-background-primary" edges={["top"]}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-4">
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center">
              <UserAvatar photoUri={profile?.photoUri} size={48} />
              <View className="ml-3">
                <Text className="text-xs md:text-sm text-light-textSecondary dark:text-text-secondary mb-1">
                  {t("wallet.welcome")}
                </Text>
                {profileLoading ? (
                  <ActivityIndicator size="small" color="#3B82F6" />
                ) : (
                  <Text className="text-lg md:text-xl font-bold text-light-text dark:text-text-primary">
                    {profile?.name || t("wallet.guest")}
                  </Text>
                )}
              </View>
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-xs md:text-sm font-semibold text-light-textSecondary dark:text-text-secondary mb-3 tracking-wider">
              {t("wallet.quickActions")}
            </Text>
            <View className="flex-row gap-3 md:gap-4 justify-between md:justify-start">
              <ActionCard
                icon={<SvgIcon name="new-card" width={28} height={28} />}
                label={getCardLabel()}
                variant="primary"
                onPress={() => router.push("/add-credit-card")}
              />
              <ActionCard
                icon={
                  <SvgIcon name="triangle-allergies" width={28} height={28} />
                }
                label={t("wallet.emergency")}
                variant="danger"
                onPress={() => router.push("/emergency")}
              />
              <ActionCard
                icon={<SvgIcon name="add-doc" width={28} height={28} />}
                label={t("wallet.addDoc")}
                variant="secondary"
                onPress={() => router.push("/add-document")}
              />
            </View>
          </View>

          <View className="bg-primary-main rounded-2xl p-5 md:p-6 mb-6">
            <View className="flex-row items-center mb-3">
              <View className="mr-2">
                <SvgIcon name="verified-shield" width={24} height={24} />
              </View>
              <Text className="text-lg md:text-xl font-bold text-text-primary">
                {t("wallet.secureSharingTitle")}
              </Text>
            </View>
            <Text className="text-sm md:text-base text-text-primary/80 mb-5 leading-5">
              {t("wallet.secureSharingDesc")}
            </Text>
            <Pressable
              className="bg-white rounded-xl py-3.5 items-center active:opacity-90"
              onPress={() => router.push("/select-documents")}
            >
              <Text className="text-base md:text-lg font-bold text-primary-main">
                {t("wallet.startSharing")}
              </Text>
            </Pressable>
          </View>

          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xs md:text-sm font-semibold text-light-textSecondary dark:text-text-secondary tracking-wider">
                {t("wallet.myDocuments")}
              </Text>
              <Pressable onPress={() => router.push("/(tabs)/documents")}>
                <Text className="text-sm md:text-base font-semibold text-primary-main">
                  {t("wallet.seeAll")}
                </Text>
              </Pressable>
            </View>

            <View className="gap-3">
              {documentsLoading ? (
                <View className="bg-light-bgSecondary dark:bg-background-secondary rounded-2xl p-6 items-center justify-center">
                  <ActivityIndicator size="large" color="#3B82F6" />
                  <Text className="text-light-textSecondary dark:text-text-secondary mt-3">
                    {t("wallet.loadingDocuments")}
                  </Text>
                </View>
              ) : !documents || documents.length === 0 ? (
                <View className="bg-light-bgSecondary dark:bg-background-secondary rounded-2xl p-6 items-center">
                  <Text className="text-4xl mb-3">📄</Text>
                  <Text className="text-light-textSecondary dark:text-text-secondary text-center">
                    {t("wallet.noDocuments")}
                  </Text>
                </View>
              ) : (
                documents.map((doc) => {
                  const mainField = getMainFieldValue(doc);
                  return (
                    <Pressable
                      key={doc.id}
                      className="bg-light-bgSecondary dark:bg-background-secondary rounded-2xl p-4 active:opacity-80"
                      onPress={() =>
                        router.push({
                          pathname: "/document-details",
                          params: { documentId: doc.id },
                        })
                      }
                    >
                      <View className="flex-row items-start justify-between">
                        <View className="flex-row flex-1">
                          <View className="w-12 h-12 md:w-14 md:h-14 bg-primary-main/10 rounded-xl items-center justify-center mr-3">
                            <Text className="text-2xl md:text-3xl">
                              {getDocumentIcon(doc.typeId, customDocumentTypes)}
                            </Text>
                          </View>
                          <View className="flex-1">
                            <Text className="text-base md:text-lg font-bold text-light-text dark:text-text-primary mb-1">
                              {doc.typeName ??
                                getDocumentLabel(
                                  doc.typeId,
                                  customDocumentTypes,
                                )}
                            </Text>
                            <Text className="text-sm md:text-base font-semibold text-light-text dark:text-text-primary mb-1">
                              {doc.fields.fullName ?? ""}
                            </Text>
                            {mainField ? (
                              <>
                                <View className="flex-row items-center">
                                  <Text className="text-xs md:text-sm text-light-textSecondary dark:text-text-secondary">
                                    {t("wallet.documentNumber")}
                                  </Text>
                                </View>
                                <Text className="text-sm md:text-base text-light-textSecondary dark:text-text-secondary">
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
                })
              )}
            </View>
          </View>

          <View className="pb-6" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
