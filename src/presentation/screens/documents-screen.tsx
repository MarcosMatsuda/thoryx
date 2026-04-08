import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useDocuments } from "@presentation/hooks/use-documents";
import { getDocumentIcon, getDocumentLabel } from "@presentation/utils/document-display";
import { useDocumentsStore } from "@stores/documents.store";
import { useTranslation } from "react-i18next";

export function DocumentsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { documents, isLoading } = useDocuments();
  const { customDocumentTypes } = useDocumentsStore();

  return (
    <SafeAreaView className="flex-1 bg-background-primary" edges={["top"]}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-4">
          <Text className="text-2xl md:text-3xl font-bold text-text-primary mb-6">
            {t("documents.title")}
          </Text>

          {documents.length === 0 ? (
            <View className="items-center justify-center py-12">
              <Text className="text-6xl mb-4">📄</Text>
              <Text className="text-base md:text-lg text-text-secondary mb-6 text-center">
                {t("documents.noDocuments")}
              </Text>
              <Pressable
                onPress={() => router.push("/add-document")}
                className="bg-primary-main px-6 py-3 rounded-xl active:opacity-80"
              >
                <Text className="text-white font-semibold text-base md:text-lg">
                  {t("documents.addDocument")}
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View className="gap-3 mb-6">
                {documents.map((doc, index) => (
                  <Pressable
                    key={index}
                    onPress={() =>
                      router.push({
                        pathname: "/document-details",
                        params: { documentId: doc.id },
                      })
                    }
                    className="bg-surface-card p-4 rounded-2xl flex-row items-center active:opacity-80"
                  >
                    <View className="w-12 h-12 md:w-14 md:h-14 bg-primary-main/10 rounded-xl items-center justify-center mr-4">
                      <Text className="text-2xl md:text-3xl">
                        {getDocumentIcon(doc.typeId, customDocumentTypes)}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-base md:text-lg font-semibold text-text-primary mb-1">
                        {doc.typeName ?? getDocumentLabel(doc.typeId, customDocumentTypes)}
                      </Text>
                      <Text className="text-sm md:text-base text-text-secondary">
                        {doc.fields.fullName ?? doc.fields.documentNumber ?? ""}
                      </Text>
                    </View>
                    <Text className="text-text-secondary text-xl">›</Text>
                  </Pressable>
                ))}
              </View>

              <Pressable
                onPress={() => router.push("/add-document")}
                className="bg-primary-main/10 border-2 border-primary-main border-dashed p-4 rounded-2xl items-center active:opacity-80"
              >
                <Text className="text-primary-main font-semibold text-base md:text-lg">
                  {t("documents.addAnother")}
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
