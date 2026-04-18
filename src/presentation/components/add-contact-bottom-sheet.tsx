import {
  View,
  Text,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft } from "lucide-react-native";
import { EmergencyContact } from "@domain/entities/emergency-info.entity";
import { TextInputField } from "@presentation/components/text-input-field";
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
      // Without overFullScreen, Modal on iPad defaults to `pageSheet` —
      // a centered floating card instead of a true bottom sheet.
      presentationStyle="overFullScreen"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <Pressable
        className="flex-1 bg-black/70 justify-end"
        onPress={handleClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable
            className="w-full bg-light-bg dark:bg-background-primary rounded-t-3xl"
            onPress={(e) => e?.stopPropagation?.()}
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

            <View className="px-6 py-6">
              <Text className="text-2xl font-bold text-light-text dark:text-text-primary mb-6">
                {t("emergencySetup.contactSheetTitle")}
              </Text>

              <TextInputField
                label={t("emergencySetup.contactFullName")}
                placeholder={t("emergencySetup.contactFullNamePlaceholder")}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                returnKeyType="next"
              />

              <TextInputField
                label={t("emergencySetup.contactRelationship")}
                placeholder={t("emergencySetup.contactRelationshipPlaceholder")}
                value={relationship}
                onChangeText={setRelationship}
                autoCapitalize="words"
                returnKeyType="next"
              />

              <TextInputField
                label={t("emergencySetup.contactPhoneNumber")}
                placeholder={t("emergencySetup.contactPhoneNumberPlaceholder")}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                returnKeyType="done"
                onSubmitEditing={canSubmit ? handleSave : undefined}
              />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("emergencySetup.saveContact")}
                accessibilityState={{ disabled: !canSubmit }}
                className={`rounded-xl py-4 items-center mt-2 ${
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
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
