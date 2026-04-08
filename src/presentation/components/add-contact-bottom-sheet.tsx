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
import { useState } from "react";
import { EmergencyContact } from "@domain/entities/emergency-info.entity";

interface AddContactBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSave: (contact: EmergencyContact) => void;
  isPrimary: boolean;
}

export function AddContactBottomSheet({
  visible,
  onClose,
  onSave,
  isPrimary,
}: AddContactBottomSheetProps) {
  const [fullName, setFullName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSave = () => {
    if (!fullName.trim() || !relationship.trim() || !phoneNumber.trim()) {
      return;
    }

    const newContact: EmergencyContact = {
      id: `contact_${Date.now()}`,
      fullName: fullName.trim(),
      relationship: relationship.trim(),
      phoneNumber: phoneNumber.trim(),
      isPrimary,
    };

    onSave(newContact);

    // Reset fields
    setFullName("");
    setRelationship("");
    setPhoneNumber("");
    onClose();
  };

  const handleClose = () => {
    setFullName("");
    setRelationship("");
    setPhoneNumber("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable
        className="flex-1 bg-black/70 justify-end"
        onPress={handleClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <Pressable
            className="bg-light-bg dark:bg-background-primary rounded-t-3xl"
            onPress={(e) => e.stopPropagation()}
          >
            <ScrollView
              className="w-full max-w-[500px] self-center"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              <View className="items-center pt-4 pb-2">
                <View className="w-12 h-1 bg-light-border dark:bg-ui-border rounded-full mb-4" />
                <Pressable
                  className="absolute left-6 top-4 w-10 h-10 items-center justify-center"
                  onPress={handleClose}
                >
                  <Text className="text-2xl text-light-text dark:text-text-primary">←</Text>
                </Pressable>
                <Text className="text-base text-light-textSecondary dark:text-text-secondary">
                  {isPrimary ? "Add Primary Contact" : "Add Emergency Contact"}
                </Text>
              </View>

              <View className="px-6 py-6">
                <Text className="text-2xl font-bold text-light-text dark:text-text-primary mb-6">
                  Contact Information
                </Text>

                <View className="mb-4">
                  <Text className="text-sm text-light-textSecondary dark:text-text-secondary mb-2">
                    Full Name
                  </Text>
                  <TextInput
                    className="bg-light-bgSecondary dark:bg-background-secondary rounded-xl px-4 py-3 text-light-text dark:text-text-primary"
                    placeholder="Enter full name"
                    placeholderTextColor="#64748B"
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-sm text-light-textSecondary dark:text-text-secondary mb-2">
                    Relationship
                  </Text>
                  <TextInput
                    className="bg-light-bgSecondary dark:bg-background-secondary rounded-xl px-4 py-3 text-light-text dark:text-text-primary"
                    placeholder="e.g. Spouse, Parent, Sibling"
                    placeholderTextColor="#64748B"
                    value={relationship}
                    onChangeText={setRelationship}
                  />
                </View>

                <View className="mb-6">
                  <Text className="text-sm text-light-textSecondary dark:text-text-secondary mb-2">
                    Phone Number
                  </Text>
                  <TextInput
                    className="bg-light-bgSecondary dark:bg-background-secondary rounded-xl px-4 py-3 text-light-text dark:text-text-primary"
                    placeholder="+1 (555) 0123"
                    placeholderTextColor="#64748B"
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                  />
                </View>

                <Pressable
                  className={`rounded-xl py-4 items-center ${
                    fullName.trim() && relationship.trim() && phoneNumber.trim()
                      ? "bg-primary-main active:bg-primary-dark"
                      : "bg-light-border dark:bg-ui-border"
                  }`}
                  disabled={
                    !fullName.trim() ||
                    !relationship.trim() ||
                    !phoneNumber.trim()
                  }
                  onPress={handleSave}
                >
                  <Text
                    className={`text-base font-bold ${
                      fullName.trim() &&
                      relationship.trim() &&
                      phoneNumber.trim()
                        ? "text-light-text dark:text-text-primary"
                        : "text-light-textSecondary dark:text-text-secondary"
                    }`}
                  >
                    Save Contact
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
