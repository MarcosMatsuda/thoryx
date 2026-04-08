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

export function SelectDocumentsScreen() {
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
        "Selecione pelo menos um documento",
        "Você precisa selecionar pelo menos um documento para entrar no Modo Convidado.",
        [{ text: "OK" }],
      );
      return;
    }

    router.push(`/guest-mode?docIds=${selectedDocIds.join(",")}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary" edges={["top"]}>
      <View className="flex-1">
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-ui-border">
          <Pressable onPress={() => router.back()}>
            <Text className="text-2xl text-text-primary">✕</Text>
          </Pressable>
          <Text className="text-lg md:text-xl font-bold text-text-primary">
            Selecionar Documentos
          </Text>
          <Pressable>
            <Text className="text-base md:text-lg font-semibold text-primary-main">
              Ajuda
            </Text>
          </Pressable>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 py-6">
            <Text className="text-2xl md:text-3xl font-bold text-text-primary mb-3 leading-tight">
              Quais documentos deseja compartilhar?
            </Text>
            <Text className="text-sm md:text-base text-text-secondary mb-6 leading-5">
              O app entrará em modo restrito mostrando apenas os documentos
              selecionados para verificação.
            </Text>

            <View className="mb-6">
              {isLoading ? (
                <Text className="text-text-secondary text-center py-8">
                  Carregando documentos...
                </Text>
              ) : documents.length === 0 ? (
                <View className="items-center justify-center py-12">
                  <Text className="text-6xl mb-4">📄</Text>
                  <Text className="text-base md:text-lg text-text-secondary mb-6 text-center">
                    Nenhum documento cadastrado. Adicione documentos primeiro.
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
                  <Text className="text-sm md:text-base font-bold text-text-primary mb-2">
                    Modo de Bloqueio Seguro:
                  </Text>
                  <Text className="text-xs md:text-sm text-text-secondary leading-5">
                    Após confirmar, seu dispositivo ficará bloqueado nesta tela.
                    Autenticação por PIN será necessária para sair e acessar o
                    restante do app.
                  </Text>
                </View>
              </View>
            </View>

            <View className="bg-background-secondary rounded-2xl p-4 md:p-5 mb-6 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Text className="text-xl md:text-2xl mr-2">🛡️</Text>
                <Text className="text-base md:text-lg font-semibold text-text-primary">
                  Compartilhando{" "}
                  <Text className="text-primary-main">
                    {selectedDocIds.length}
                  </Text>{" "}
                  documento{selectedDocIds.length !== 1 ? "s" : ""}
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
              Confirmar e Bloquear App
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
