import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SelectableDocumentItem } from "@presentation/components/selectable-document-item";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { useDocuments } from "@presentation/hooks/use-documents";

export function SelectDocumentsScreen() {
  const router = useRouter();
  const { documents, isLoading } = useDocuments();
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

  useEffect(() => {
    // Documents are loaded automatically by the useDocuments hook
  }, []);

  const toggleDocument = (docId: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : [...prev, docId],
    );
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "CNH":
        return "🚗";
      case "RG":
        return "🆔";
      default:
        return "📄";
    }
  };

  const getDocumentLabel = (type: string) => {
    switch (type) {
      case "CNH":
        return "Driver's License";
      case "RG":
        return "National ID";
      default:
        return "Document";
    }
  };

  const handleConfirm = () => {
    if (selectedDocIds.length === 0) {
      Alert.alert(
        "Select at least one document",
        "You need to select at least one document to enter Guest Mode.",
        [{ text: "OK" }]
      );
      return;
    }

    router.push(`/guest-mode?docIds=${selectedDocIds.join(',')}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary" edges={["top"]}>
      <View className="flex-1">
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-ui-border">
          <Pressable onPress={() => router.back()}>
            <Text className="text-2xl text-text-primary">✕</Text>
          </Pressable>
          <Text className="text-lg md:text-xl font-bold text-text-primary">
            Select Documents
          </Text>
          <Pressable>
            <Text className="text-base md:text-lg font-semibold text-primary-main">
              Help
            </Text>
          </Pressable>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 py-6">
            <Text className="text-2xl md:text-3xl font-bold text-text-primary mb-3 leading-tight">
              Which documents do you want to share?
            </Text>
            <Text className="text-sm md:text-base text-text-secondary mb-6 leading-5">
              The app will enter a restricted &quot;Secure Mode&quot; showing
              only your selected documents for verification.
            </Text>

            <View className="mb-6">
              {isLoading ? (
                <Text className="text-text-secondary text-center py-8">
                  Loading documents...
                </Text>
              ) : documents.length === 0 ? (
                <View className="items-center justify-center py-12">
                  <Text className="text-6xl mb-4">📄</Text>
                  <Text className="text-base md:text-lg text-text-secondary mb-6 text-center">
                    No documents registered. Add documents in the main app first.
                  </Text>
                </View>
              ) : (
                documents.map((doc) => (
                  <SelectableDocumentItem
                    key={doc.id}
                    icon={getDocumentIcon(doc.type)}
                    title={doc.fullName}
                    subtitle={`${getDocumentLabel(doc.type)} • **** ${doc.documentNumber.slice(-4)}`}
                    selected={selectedDocIds.includes(doc.id)}
                    onToggle={() => toggleDocument(doc.id)}
                  />
                ))
              )}
            </View>

            <View className="bg-primary-main/10 rounded-2xl p-4 md:p-5 mb-6 border border-primary-main/20">
              <View className="flex-row items-start">
                <Text className="text-2xl mr-3">🔒</Text>
                <View className="flex-1">
                  <Text className="text-sm md:text-base font-bold text-text-primary mb-2">
                    Secure Lock Mode:
                  </Text>
                  <Text className="text-xs md:text-sm text-text-secondary leading-5">
                    Once confirmed, your device will be locked to this screen.
                    Biometric authentication will be required to exit and access
                    the rest of your app.
                  </Text>
                </View>
              </View>
            </View>

            <View className="bg-background-secondary rounded-2xl p-4 md:p-5 mb-6 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Text className="text-xl md:text-2xl mr-2">🛡️</Text>
                <Text className="text-base md:text-lg font-semibold text-text-primary">
                  You are sharing{" "}
                  <Text className="text-primary-main">
                    {selectedDocIds.length}
                  </Text>{" "}
                  documents
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View className="px-6 pb-6 pt-4 bg-background-primary border-t border-ui-border">
          <Pressable
            className="bg-primary-main rounded-xl py-4 items-center active:opacity-90"
            onPress={handleConfirm}
          >
            <Text className="text-base md:text-lg font-bold text-text-primary">
              Confirm & Lock App
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
