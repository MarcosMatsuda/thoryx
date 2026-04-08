import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DropdownInput } from "@presentation/components/dropdown-input";
import { DynamicDocumentForm } from "@presentation/components/dynamic-document-form";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useMemo } from "react";
import * as ImagePicker from "expo-image-picker";
import { DocumentRepositoryImpl } from "@data/repositories/document.repository.impl";
import { SaveDocumentUseCase } from "@domain/use-cases/save-document.use-case";
import { DeleteDocumentUseCase } from "@domain/use-cases/delete-document.use-case";
import {
  getAllDocumentTypes,
  getDocumentTypeById,
} from "@domain/entities/document-type-registry";
import { DocumentTypeDefinition } from "@domain/entities/document-type-definition.entity";
import { useDocumentsStore } from "@stores/documents.store";

export function AddDocumentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { documentId } = params as { documentId?: string };
  const { customDocumentTypes } = useDocumentsStore();

  const allTypes = useMemo(
    () => getAllDocumentTypes(customDocumentTypes),
    [customDocumentTypes],
  );

  const typeOptions = useMemo(
    () => [
      ...allTypes.map((t) => ({ label: t.label, value: t.id, editable: !t.builtIn })),
      { label: "+ Criar tipo personalizado", value: "__custom__" },
    ],
    [allTypes],
  );

  const [selectedTypeId, setSelectedTypeId] = useState(allTypes[0]?.id ?? "CNH");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const typeDefinition: DocumentTypeDefinition | undefined = useMemo(
    () => getDocumentTypeById(selectedTypeId, customDocumentTypes),
    [selectedTypeId, customDocumentTypes],
  );

  useEffect(() => {
    if (documentId) loadDocument();
  }, [documentId]);

  // Reset fields when type changes (only in create mode)
  useEffect(() => {
    if (!isEditMode) {
      setFields({});
      setPhotos({});
    }
  }, [selectedTypeId, isEditMode]);

  const loadDocument = async () => {
    if (!documentId) return;
    try {
      setIsLoading(true);
      const repository = new DocumentRepositoryImpl();
      const doc = await repository.findById(documentId);
      if (doc) {
        setSelectedTypeId(doc.typeId);
        setFields({ ...doc.fields });
        const decrypted = await repository.decryptPhotos(doc.photos);
        setPhotos(decrypted);
        setIsEditMode(true);
      }
    } catch (error) {
      console.error("Error loading document:", error);
      Alert.alert("Erro", "Não foi possível carregar o documento");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeSelect = (value: string) => {
    if (value === "__custom__") {
      router.push("/create-custom-document-type");
      return;
    }
    setSelectedTypeId(value);
  };

  const handleFieldChange = (key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleTakePhoto = async (slot: string) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Precisamos de acesso à câmera");
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotos((prev) => ({ ...prev, [slot]: result.assets[0].uri }));
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Erro", "Não foi possível tirar a foto");
    }
  };

  const handleDeleteDocument = async () => {
    if (!documentId) return;
    setIsLoading(true);
    try {
      const repository = new DocumentRepositoryImpl();
      const useCase = new DeleteDocumentUseCase(repository);
      const result = await useCase.execute(documentId);
      if (result.success) {
        router.push("/(tabs)");
      } else {
        Alert.alert("Erro", result.message);
      }
    } catch {
      Alert.alert("Erro", "Não foi possível excluir o documento");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDocument = async () => {
    if (!typeDefinition) {
      Alert.alert("Erro", "Selecione um tipo de documento");
      return;
    }

    setIsLoading(true);
    try {
      const repository = new DocumentRepositoryImpl();
      const useCase = new SaveDocumentUseCase(repository);

      const result = await useCase.execute(
        {
          typeId: selectedTypeId,
          typeName: typeDefinition.label,
          fields,
          photos,
        },
        typeDefinition,
      );

      if (result.success) {
        Alert.alert("Sucesso", "Documento salvo com segurança", [
          { text: "OK", onPress: () => router.push("/(tabs)") },
        ]);
      } else {
        Alert.alert("Erro", result.message);
      }
    } catch {
      Alert.alert("Erro", "Não foi possível salvar o documento");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary" edges={["top"]}>
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-ui-border">
          <Pressable
            className="w-10 h-10 items-center justify-center"
            onPress={() => router.back()}
          >
            <Text className="text-2xl text-text-primary">←</Text>
          </Pressable>
          <Text className="text-lg font-bold text-text-primary">
            {isEditMode ? "Editar Documento" : "Adicionar Documento"}
          </Text>
          {isEditMode && documentId ? (
            <Pressable
              className="w-10 h-10 items-center justify-center active:opacity-60"
              onPress={handleDeleteDocument}
              disabled={isLoading}
            >
              <Text className="text-xl text-status-error">🗑️</Text>
            </Pressable>
          ) : (
            <View className="w-10" />
          )}
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-6 py-6"
        >
          {/* Type selector */}
          <DropdownInput
            label="Tipo de Documento"
            placeholder="Selecione o tipo"
            value={selectedTypeId}
            options={typeOptions}
            onSelect={handleTypeSelect}
            onEditOption={(typeId) =>
              router.push({
                pathname: "/create-custom-document-type",
                params: { typeId },
              })
            }
          />

          {/* Dynamic form based on selected type */}
          {typeDefinition && (
            <DynamicDocumentForm
              typeDefinition={typeDefinition}
              fields={fields}
              photos={photos}
              onFieldChange={handleFieldChange}
              onTakePhoto={handleTakePhoto}
            />
          )}

          {/* Security notice */}
          <View className="flex-row bg-primary-main/10 rounded-xl p-4 mb-6">
            <View className="mr-3">
              <View className="w-6 h-6 bg-primary-main rounded-full items-center justify-center">
                <Text className="text-xs text-text-primary">🔒</Text>
              </View>
            </View>
            <Text className="flex-1 text-sm text-text-secondary leading-5">
              Seu documento é criptografado e armazenado localmente no
              dispositivo. Somente você pode acessar essas informações.
            </Text>
          </View>

          {/* Save button */}
          <Pressable
            className={`rounded-xl py-4 items-center ${
              isLoading
                ? "bg-primary-main/50 opacity-50"
                : "bg-primary-main active:bg-primary-dark"
            }`}
            onPress={handleSaveDocument}
            disabled={isLoading}
          >
            <Text className="text-base font-bold text-text-primary">
              {isLoading
                ? "Salvando..."
                : isEditMode
                  ? "Atualizar Documento"
                  : "Salvar Documento"}
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
