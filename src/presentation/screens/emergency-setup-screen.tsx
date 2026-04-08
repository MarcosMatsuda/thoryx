import { EmergencyInfoRepositoryImpl } from "@data/repositories/emergency-info.repository.impl";
import { EmergencyContact } from "@domain/entities/emergency-info.entity";
import { SaveEmergencyInfoUseCase } from "@domain/use-cases/save-emergency-info.use-case";
import { AddContactBottomSheet } from "@presentation/components/add-contact-bottom-sheet";
import { AlertBanner } from "@presentation/components/alert-banner";
import { BloodTypeSelector } from "@presentation/components/blood-type-selector";
import { ContactCard } from "@presentation/components/contact-card";
import { SectionHeader } from "@presentation/components/section-header";
import { TextInputField } from "@presentation/components/text-input-field";
import { useEmergencyInfo } from "@presentation/hooks/use-emergency-info";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

export function EmergencySetupScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    emergencyInfo,
    isLoading: isLoadingInfo,
    refresh,
  } = useEmergencyInfo();

  const [lockScreenVisible, setLockScreenVisible] = useState(false);
  const [healthPlan, setHealthPlan] = useState("");
  const [bloodType, setBloodType] = useState<string>();
  const [allergies, setAllergies] = useState("");
  const [healthConditions, setHealthConditions] = useState("");
  const [medicationInputs, setMedicationInputs] = useState<string[]>([""]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showContactSheet, setShowContactSheet] = useState(false);
  const [isAddingPrimaryContact, setIsAddingPrimaryContact] = useState(false);

  useEffect(() => {
    if (emergencyInfo) {
      setLockScreenVisible(emergencyInfo.lockScreenVisible);
      setHealthPlan(emergencyInfo.healthPlan || "");
      setBloodType(emergencyInfo.bloodType);
      setAllergies(emergencyInfo.allergies || "");
      setHealthConditions(emergencyInfo.healthConditions || "");

      if (emergencyInfo.medications.length > 0) {
        setMedicationInputs(emergencyInfo.medications);
      }

      setContacts(emergencyInfo.contacts);
    }
  }, [emergencyInfo]);

  const handleAddMedicationField = () => {
    setMedicationInputs([...medicationInputs, ""]);
  };

  const handleMedicationChange = (index: number, value: string) => {
    const updated = [...medicationInputs];
    updated[index] = value;
    setMedicationInputs(updated);
  };

  const handleRemoveMedicationField = (index: number) => {
    if (medicationInputs.length > 1) {
      setMedicationInputs(medicationInputs.filter((_, i) => i !== index));
    } else {
      setMedicationInputs([""]);
    }
  };

  const handleAddContact = (contact: EmergencyContact) => {
    setContacts([...contacts, contact]);
  };

  const handleRemoveContact = (contactId: string) => {
    setContacts(contacts.filter((c) => c.id !== contactId));
  };

  const openAddContactSheet = (isPrimary: boolean) => {
    setIsAddingPrimaryContact(isPrimary);
    setShowContactSheet(true);
  };

  const handleSave = async () => {
    if (contacts.length === 0) {
      Alert.alert(t("common.error"), t("emergencySetup.contactRequired"));
      return;
    }

    setIsSaving(true);

    try {
      const repository = new EmergencyInfoRepositoryImpl();
      const saveEmergencyInfoUseCase = new SaveEmergencyInfoUseCase(repository);

      // Filter out empty medications
      const validMedications = medicationInputs
        .map((m) => m.trim())
        .filter((m) => m.length > 0);

      const result = await saveEmergencyInfoUseCase.execute({
        lockScreenVisible,
        healthPlan: healthPlan.trim() || undefined,
        bloodType,
        allergies: allergies.trim() || undefined,
        healthConditions: healthConditions.trim() || undefined,
        medications: validMedications,
        contacts,
      });

      if (result.success) {
        Alert.alert(t("common.success"), t("emergencySetup.savedSuccess"), [
          {
            text: t("common.ok"),
            onPress: () => {
              refresh();
              router.back();
            },
          },
        ]);
      } else {
        Alert.alert(t("common.error"), result.message);
      }
    } catch (error) {
      console.error("Error saving emergency info:", error);
      Alert.alert(t("common.error"), t("emergencySetup.saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingInfo) {
    return (
      <SafeAreaView className="flex-1 bg-light-bg dark:bg-background-primary items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-light-bg dark:bg-background-primary" edges={["top"]}>
      <View className="flex-1">
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-light-border dark:border-ui-border">
          <Pressable
            className="w-10 h-10 items-center justify-center"
            onPress={() => router.back()}
            disabled={isSaving}
          >
            <Text className="text-2xl text-light-text dark:text-text-primary">←</Text>
          </Pressable>
          <Text className="text-lg font-bold text-light-text dark:text-text-primary">
            {t("emergencySetup.title")}
          </Text>
          <Pressable
            className="w-10 h-10 items-center justify-center"
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#3B82F6" />
            ) : (
              <Text className="text-xl text-primary-main">✓</Text>
            )}
          </Pressable>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-6 py-6"
        >
          <AlertBanner
            title={t("emergencySetup.criticalAccess")}
            message={t("emergencySetup.criticalAccessDesc")}
            icon="⚠️"
            toggleLabel={t("emergencySetup.lockScreenVisible")}
            toggleEnabled={lockScreenVisible}
            onToggle={() => setLockScreenVisible(!lockScreenVisible)}
          />

          <View className="mb-6">
            <SectionHeader
              icon="🏥"
              title={t("emergency.vitalInfo")}
              iconBg="#3B82F6"
            />

            <TextInputField
              label={t("emergencySetup.healthPlan")}
              placeholder="e.g. Blue Shield Gold"
              value={healthPlan}
              onChangeText={setHealthPlan}
            />

            <View className="mb-4">
              <Text className="text-sm text-light-textSecondary dark:text-text-secondary mb-3">
                {t("emergencySetup.bloodType")}
              </Text>
              <BloodTypeSelector
                selectedType={bloodType}
                onSelect={setBloodType}
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm text-light-textSecondary dark:text-text-secondary mb-2">
                {t("emergencySetup.allergies")}
              </Text>
              <TextInput
                className="bg-light-bgSecondary dark:bg-background-secondary rounded-xl px-4 py-3 text-light-text dark:text-text-primary min-h-[80px]"
                placeholder={t("emergencySetup.allergiesPlaceholder")}
                placeholderTextColor="#64748B"
                multiline
                textAlignVertical="top"
                value={allergies}
                onChangeText={setAllergies}
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm text-light-textSecondary dark:text-text-secondary mb-2">
                {t("emergencySetup.healthConditions")}
              </Text>
              <TextInput
                className="bg-light-bgSecondary dark:bg-background-secondary rounded-xl px-4 py-3 text-light-text dark:text-text-primary min-h-[80px]"
                placeholder={t("emergencySetup.healthConditionsPlaceholder")}
                placeholderTextColor="#64748B"
                multiline
                textAlignVertical="top"
                value={healthConditions}
                onChangeText={setHealthConditions}
              />
            </View>

            <View className="mb-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm text-light-textSecondary dark:text-text-secondary">
                  {t("emergencySetup.medications")}
                </Text>
                <Pressable
                  className="w-8 h-8 bg-primary-main rounded-full items-center justify-center active:opacity-80"
                  onPress={handleAddMedicationField}
                >
                  <Text className="text-xl text-light-text dark:text-text-primary font-bold">+</Text>
                </Pressable>
              </View>

              {medicationInputs.map((medication, index) => (
                <View key={index} className="flex-row items-center mb-2">
                  <TextInput
                    className="flex-1 bg-light-bgSecondary dark:bg-background-secondary rounded-xl px-4 py-3 text-light-text dark:text-text-primary"
                    placeholder={t("emergencySetup.medicationPlaceholder")}
                    placeholderTextColor="#64748B"
                    value={medication}
                    onChangeText={(text) => handleMedicationChange(index, text)}
                  />
                  {medicationInputs.length > 1 && (
                    <Pressable
                      className="ml-2 w-10 h-10 items-center justify-center"
                      onPress={() => handleRemoveMedicationField(index)}
                    >
                      <Text className="text-xl text-status-error">✕</Text>
                    </Pressable>
                  )}
                </View>
              ))}
            </View>
          </View>

          <View className="mb-6">
            <SectionHeader
              icon="🚨"
              title={t("emergencySetup.contacts")}
              iconBg="#EF4444"
            />

            {contacts.map((contact) => (
              <View key={contact.id} className="mb-3">
                <ContactCard
                  fullName={contact.fullName}
                  relationship={contact.relationship}
                  phoneNumber={contact.phoneNumber}
                  onRemove={() => handleRemoveContact(contact.id)}
                  isPrimary={contact.isPrimary}
                />
              </View>
            ))}

            <Pressable
              className="bg-light-bgSecondary dark:bg-background-secondary rounded-xl p-4 flex-row items-center justify-center border-2 border-dashed border-light-border dark:border-ui-border active:bg-light-bgTertiary dark:active:bg-background-tertiary"
              onPress={() => openAddContactSheet(contacts.length === 0)}
            >
              <Text className="text-xl mr-2">👥</Text>
              <Text className="text-sm font-medium text-light-textSecondary dark:text-text-secondary">
                {contacts.length === 0
                  ? t("emergencySetup.addContact")
                  : t("emergencySetup.addContact")}
              </Text>
            </Pressable>
          </View>
        </ScrollView>

        <View className="px-6 py-4 bg-light-bg dark:bg-background-primary border-t border-light-border dark:border-ui-border">
          <Pressable
            className={`rounded-xl py-4 items-center ${
              contacts.length > 0
                ? "bg-primary-main active:bg-primary-dark"
                : "bg-light-border dark:bg-ui-border"
            }`}
            disabled={contacts.length === 0 || isSaving}
            onPress={handleSave}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text
                className={`text-base font-bold ${
                  contacts.length > 0
                    ? "text-light-text dark:text-text-primary"
                    : "text-light-textSecondary dark:text-text-secondary"
                }`}
              >
                {t("emergencySetup.saveProfile")}
              </Text>
            )}
          </Pressable>
        </View>

        <AddContactBottomSheet
          visible={showContactSheet}
          onClose={() => setShowContactSheet(false)}
          onSave={handleAddContact}
          isPrimary={isAddingPrimaryContact}
        />
      </View>
    </SafeAreaView>
  );
}
