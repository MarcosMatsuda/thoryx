import {
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft } from "lucide-react-native";
import { EmergencyContact } from "@domain/entities/emergency-info.entity";
import { tokens } from "@presentation/theme/design-tokens";

interface AddContactBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSave: (contact: EmergencyContact) => void;
  isPrimary: boolean;
  initialContact?: EmergencyContact | null;
}

export function AddContactBottomSheet({
  visible,
  onClose,
  onSave,
  isPrimary,
  initialContact = null,
}: AddContactBottomSheetProps) {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const isEditing = initialContact !== null;

  useEffect(() => {
    if (!visible) {
      return;
    }
    setFullName(initialContact?.fullName ?? "");
    setRelationship(initialContact?.relationship ?? "");
    setPhoneNumber(initialContact?.phoneNumber ?? "");
  }, [visible, initialContact]);

  const resetFields = () => {
    setFullName("");
    setRelationship("");
    setPhoneNumber("");
  };

  const handleSave = () => {
    if (!fullName.trim() || !relationship.trim() || !phoneNumber.trim()) {
      return;
    }

    const contact: EmergencyContact = {
      id: initialContact?.id ?? `contact_${Date.now()}`,
      fullName: fullName.trim(),
      relationship: relationship.trim(),
      phoneNumber: phoneNumber.trim(),
      isPrimary: initialContact?.isPrimary ?? isPrimary,
    };

    onSave(contact);
    resetFields();
    onClose();
  };

  const handleClose = () => {
    resetFields();
    onClose();
  };

  const headerLabel = isEditing
    ? t("emergencySetup.editContactHeader")
    : isPrimary
      ? t("emergencySetup.addPrimaryContactHeader")
      : t("emergencySetup.addContactHeader");

  const canSubmit =
    fullName.trim().length > 0 &&
    relationship.trim().length > 0 &&
    phoneNumber.trim().length > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      // iPad defaults Modal to `pageSheet` (a floating centered card) unless
      // `overFullScreen` is set explicitly — that's what was making the sheet
      // look detached from the bottom and centered on iPad. `statusBarTranslucent`
      // mirrors the same full-screen behavior on Android.
      presentationStyle="overFullScreen"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable
          className="flex-1 bg-black/70 justify-end"
          onPress={handleClose}
        >
          <View
            className="w-full bg-light-bg dark:bg-background-primary rounded-t-3xl max-h-[92%]"
            onStartShouldSetResponder={() => true}
          >
            <View className="items-center pt-3 pb-2">
              <View className="w-12 h-1 bg-light-border dark:bg-ui-border rounded-full" />
            </View>

            <View className="flex-row items-center justify-between px-4 pt-2 pb-4 border-b border-light-border dark:border-ui-border">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("common.back")}
                className="w-10 h-10 items-center justify-center"
                onPress={handleClose}
              >
                <ChevronLeft size={24} color={tokens.colors.text.secondary} />
              </Pressable>
              <Text className="text-base font-semibold text-light-text dark:text-text-primary">
                {headerLabel}
              </Text>
              <View className="w-10" />
            </View>

            <ScrollView
              className="w-full"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              <View className="w-full max-w-[500px] self-center px-6 py-6">
                <Text className="text-2xl font-bold text-light-text dark:text-text-primary mb-6">
                  {t("emergencySetup.contactSheetTitle")}
                </Text>

                <View className="mb-4">
                  <Text className="text-sm text-light-textSecondary dark:text-text-secondary mb-2">
                    {t("emergencySetup.contactFullName")}
                  </Text>
                  <TextInput
                    className="bg-light-bgSecondary dark:bg-background-secondary rounded-xl px-4 py-3 text-light-text dark:text-text-primary"
                    placeholder={t("emergencySetup.contactFullNamePlaceholder")}
                    placeholderTextColor={tokens.colors.text.tertiary}
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-sm text-light-textSecondary dark:text-text-secondary mb-2">
                    {t("emergencySetup.contactRelationship")}
                  </Text>
                  <TextInput
                    className="bg-light-bgSecondary dark:bg-background-secondary rounded-xl px-4 py-3 text-light-text dark:text-text-primary"
                    placeholder={t(
                      "emergencySetup.contactRelationshipPlaceholder",
                    )}
                    placeholderTextColor={tokens.colors.text.tertiary}
                    value={relationship}
                    onChangeText={setRelationship}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>

                <View className="mb-6">
                  <Text className="text-sm text-light-textSecondary dark:text-text-secondary mb-2">
                    {t("emergencySetup.contactPhoneNumber")}
                  </Text>
                  <TextInput
                    className="bg-light-bgSecondary dark:bg-background-secondary rounded-xl px-4 py-3 text-light-text dark:text-text-primary"
                    placeholder={t(
                      "emergencySetup.contactPhoneNumberPlaceholder",
                    )}
                    placeholderTextColor={tokens.colors.text.tertiary}
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    returnKeyType="done"
                    onSubmitEditing={canSubmit ? handleSave : undefined}
                  />
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !canSubmit }}
                  className={`rounded-xl py-4 items-center ${
                    canSubmit
                      ? "bg-primary-main active:bg-primary-dark"
                      : "bg-light-border dark:bg-ui-border"
                  }`}
                  disabled={!canSubmit}
                  onPress={handleSave}
                >
                  <Text
                    className={`text-base font-bold ${
                      canSubmit
                        ? "text-light-text dark:text-text-primary"
                        : "text-light-textSecondary dark:text-text-secondary"
                    }`}
                  >
                    {t("emergencySetup.saveContact")}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
