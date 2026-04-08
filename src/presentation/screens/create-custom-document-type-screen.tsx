import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInputField } from "@presentation/components/text-input-field";
import { DropdownInput } from "@presentation/components/dropdown-input";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useMemo } from "react";
import { DocumentTypeRepositoryImpl } from "@data/repositories/document-type.repository.impl";
import {
  FieldDefinition,
  FieldType,
  PhotoSlot,
  DocumentTypeDefinition,
} from "@domain/entities/document-type-definition.entity";
import { useDocumentsStore } from "@stores/documents.store";
import { useTranslation } from "react-i18next";

const ICON_OPTIONS = [
  "📄",
  "📋",
  "🏥",
  "🎖️",
  "⚖️",
  "🎓",
  "🏢",
  "🚗",
  "✈️",
  "💼",
  "🆔",
  "📜",
  "🛡️",
  "⭐",
  "🔑",
  "📝",
  "🏠",
  "💳",
  "🎫",
  "📌",
];

// These will be populated with t() inside the component
let FIELD_TYPE_OPTIONS: { label: string; value: FieldType }[] = [];
let PHOTO_SLOT_OPTIONS: { label: string; value: string }[] = [];

interface FieldDraft {
  label: string;
  type: FieldType;
  required: boolean;
  options: string;
}

function photoSlotsToMode(slots: PhotoSlot[]): string {
  if (slots.length === 1 && slots[0] === "front") return "front-only";
  if (slots.length === 1 && slots[0] === "dataPage") return "data-page";
  return "front-back";
}

function fieldDefToDraft(f: FieldDefinition): FieldDraft {
  return {
    label: f.label,
    type: f.type,
    required: f.required,
    options: f.options?.join(", ") ?? "",
  };
}

export function CreateCustomDocumentTypeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { typeId } = params as { typeId?: string };
  const { customDocumentTypes, documents, loadCustomTypes } =
    useDocumentsStore();

  FIELD_TYPE_OPTIONS = [
    { label: t("customDocType.fieldTypeText"), value: "text" as FieldType },
    { label: t("customDocType.fieldTypeDate"), value: "date" as FieldType },
    { label: t("customDocType.fieldTypeSelect"), value: "select" as FieldType },
  ];

  PHOTO_SLOT_OPTIONS = [
    { label: t("customDocType.photoFrontOnly"), value: "front-only" },
    { label: t("customDocType.photoFrontBack"), value: "front-back" },
    { label: t("customDocType.photoDataPage"), value: "data-page" },
  ];

  const isEditMode = !!typeId;
  const existingType = useMemo(
    () => customDocumentTypes.find((t) => t.id === typeId),
    [typeId, customDocumentTypes],
  );

  const documentsUsingType = useMemo(
    () => (typeId ? documents.filter((d) => d.typeId === typeId).length : 0),
    [typeId, documents],
  );

  const [typeName, setTypeName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("📄");
  const [photoMode, setPhotoMode] = useState("front-back");
  const [fields, setFields] = useState<FieldDraft[]>([
    { label: "Nome Completo", type: "text", required: true, options: "" },
  ]);
  const [isSaving, setIsSaving] = useState(false);

  // Pre-fill when editing
  useEffect(() => {
    if (existingType) {
      setTypeName(existingType.label);
      setSelectedIcon(existingType.icon);
      setPhotoMode(photoSlotsToMode(existingType.photoSlots));
      setFields(existingType.fields.map(fieldDefToDraft));
    }
  }, [existingType]);

  const addField = () => {
    setFields((prev) => [
      ...prev,
      { label: "", type: "text", required: false, options: "" },
    ]);
  };

  const removeField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const updateField = (index: number, updates: Partial<FieldDraft>) => {
    setFields((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...updates } : f)),
    );
  };

  const getPhotoSlots = (): PhotoSlot[] => {
    switch (photoMode) {
      case "front-only":
        return ["front"];
      case "front-back":
        return ["front", "back"];
      case "data-page":
        return ["dataPage"];
      default:
        return ["front", "back"];
    }
  };

  const handleSave = async () => {
    if (!typeName.trim()) {
      Alert.alert(t("common.error"), t("customDocType.typeNameRequired"));
      return;
    }

    const validFields = fields.filter((f) => f.label.trim());
    if (validFields.length === 0) {
      Alert.alert(t("common.error"), t("customDocType.fieldsRequired"));
      return;
    }

    setIsSaving(true);
    try {
      const id = isEditMode && typeId ? typeId : `custom_${Date.now()}`;

      const fieldDefinitions: FieldDefinition[] = validFields.map((f, i) => ({
        key:
          isEditMode && existingType?.fields[i]
            ? existingType.fields[i].key
            : `field_${i}_${f.label.toLowerCase().replace(/\s+/g, "_")}`,
        label: f.label.trim(),
        type: f.type,
        required: f.required,
        options:
          f.type === "select" && f.options
            ? f.options
                .split(",")
                .map((o) => o.trim())
                .filter(Boolean)
            : undefined,
      }));

      const repo = new DocumentTypeRepositoryImpl();
      await repo.saveCustomType({
        id,
        label: typeName.trim(),
        icon: selectedIcon,
        builtIn: false,
        fields: fieldDefinitions,
        photoSlots: getPhotoSlots(),
      });

      await loadCustomTypes();

      Alert.alert(
        t("common.success"),
        isEditMode
          ? t("customDocType.updatedSuccess")
          : t("customDocType.createdSuccess"),
        [{ text: t("common.ok"), onPress: () => router.back() }],
      );
    } catch {
      Alert.alert(t("common.error"), t("customDocType.saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!typeId) return;

    if (documentsUsingType > 0) {
      Alert.alert(
        t("customDocType.deleteBlocked"),
        t("customDocType.deleteBlockedMsg", { count: documentsUsingType }),
      );
      return;
    }

    Alert.alert(
      t("customDocType.deleteTitle"),
      t("customDocType.deleteConfirm", { name: existingType?.label }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.remove"),
          style: "destructive",
          onPress: async () => {
            try {
              const repo = new DocumentTypeRepositoryImpl();
              await repo.deleteCustomType(typeId);
              await loadCustomTypes();
              router.back();
            } catch {
              Alert.alert(t("common.error"), t("customDocType.deleteError"));
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView
      className="flex-1 bg-light-bg dark:bg-background-primary"
      edges={["top"]}
    >
      <View className="flex-1">
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-light-border dark:border-ui-border">
          <Pressable
            className="w-10 h-10 items-center justify-center"
            onPress={() => router.back()}
          >
            <Text className="text-2xl text-light-text dark:text-text-primary">
              ←
            </Text>
          </Pressable>
          <Text className="text-lg font-bold text-light-text dark:text-text-primary">
            {isEditMode
              ? t("customDocType.editTitle")
              : t("customDocType.createTitle")}
          </Text>
          {isEditMode ? (
            <Pressable
              className="w-10 h-10 items-center justify-center active:opacity-60"
              onPress={handleDelete}
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
          {/* Type name */}
          <TextInputField
            label={t("customDocType.typeName")}
            placeholder={t("customDocType.typeNamePlaceholder")}
            value={typeName}
            onChangeText={setTypeName}
          />

          {/* Icon selector */}
          <Text className="text-xs font-semibold text-light-textSecondary dark:text-text-secondary tracking-wider mb-2">
            {t("customDocType.icon")}
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-6">
            {ICON_OPTIONS.map((icon) => (
              <Pressable
                key={icon}
                onPress={() => setSelectedIcon(icon)}
                className={`w-12 h-12 rounded-xl items-center justify-center ${
                  selectedIcon === icon
                    ? "bg-primary-main/20 border-2 border-primary-main"
                    : "bg-light-bgSecondary dark:bg-background-secondary"
                }`}
              >
                <Text className="text-2xl">{icon}</Text>
              </Pressable>
            ))}
          </View>

          {/* Photo slots */}
          <DropdownInput
            label={t("customDocType.photos")}
            placeholder="Selecione"
            value={photoMode}
            options={PHOTO_SLOT_OPTIONS}
            onSelect={setPhotoMode}
          />

          {/* Fields */}
          <Text className="text-xs font-semibold text-light-textSecondary dark:text-text-secondary tracking-wider mb-3">
            {t("customDocType.fields")}
          </Text>

          {fields.map((field, index) => (
            <View
              key={index}
              className="bg-light-bgSecondary dark:bg-background-secondary rounded-xl p-4 mb-3"
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-semibold text-light-text dark:text-text-primary">
                  {t("customDocType.field")} {index + 1}
                </Text>
                {fields.length > 1 && (
                  <Pressable onPress={() => removeField(index)}>
                    <Text className="text-status-error text-sm">
                      {t("common.remove")}
                    </Text>
                  </Pressable>
                )}
              </View>

              <TextInputField
                label={t("customDocType.fieldName")}
                placeholder={t("customDocType.fieldNamePlaceholder")}
                value={field.label}
                onChangeText={(text) => updateField(index, { label: text })}
              />

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <DropdownInput
                    label={t("customDocType.fieldType")}
                    placeholder={t("customDocType.fieldType")}
                    value={field.type}
                    options={FIELD_TYPE_OPTIONS}
                    onSelect={(v) =>
                      updateField(index, { type: v as FieldType })
                    }
                  />
                </View>
                <View className="flex-1 justify-end pb-4">
                  <Pressable
                    onPress={() =>
                      updateField(index, { required: !field.required })
                    }
                    className={`rounded-xl py-3 items-center border ${
                      field.required
                        ? "border-primary-main bg-primary-main/10"
                        : "border-light-border dark:border-ui-border bg-light-bgSecondary dark:bg-background-secondary"
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        field.required
                          ? "text-primary-main"
                          : "text-light-textSecondary dark:text-text-secondary"
                      }`}
                    >
                      {field.required
                        ? t("customDocType.fieldRequired")
                        : t("customDocType.fieldOptional")}
                    </Text>
                  </Pressable>
                </View>
              </View>

              {field.type === "select" && (
                <TextInputField
                  label={t("customDocType.fieldOptions")}
                  placeholder={t("customDocType.fieldOptionsPlaceholder")}
                  value={field.options}
                  onChangeText={(text) => updateField(index, { options: text })}
                />
              )}
            </View>
          ))}

          <Pressable
            onPress={addField}
            className="bg-primary-main/10 border-2 border-primary-main border-dashed rounded-xl py-3 items-center mb-6"
          >
            <Text className="text-primary-main font-semibold">
              {t("customDocType.addField")}
            </Text>
          </Pressable>

          {/* Save button */}
          <Pressable
            className={`rounded-xl py-4 items-center mb-6 ${
              isSaving
                ? "bg-primary-main/50 opacity-50"
                : "bg-primary-main active:bg-primary-dark"
            }`}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text className="text-base font-bold text-light-text dark:text-text-primary">
              {isSaving
                ? t("common.saving")
                : isEditMode
                  ? t("customDocType.saveChanges")
                  : t("customDocType.createType")}
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
