import { View, Text, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertBanner } from '@presentation/components/alert-banner';
import { SectionHeader } from '@presentation/components/section-header';
import { BloodTypeSelector } from '@presentation/components/blood-type-selector';
import { TextInputField } from '@presentation/components/text-input-field';
import { ContactCard } from '@presentation/components/contact-card';
import { AddContactBottomSheet } from '@presentation/components/add-contact-bottom-sheet';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { EmergencyContact } from '@domain/entities/emergency-info.entity';
import { EmergencyInfoRepositoryImpl } from '@data/repositories/emergency-info.repository.impl';
import { SaveEmergencyInfoUseCase } from '@domain/use-cases/save-emergency-info.use-case';
import { useEmergencyInfo } from '@presentation/hooks/use-emergency-info';

export function EmergencySetupScreen() {
  const router = useRouter();
  const { emergencyInfo, isLoading: isLoadingInfo, refresh } = useEmergencyInfo();
  
  const [lockScreenVisible, setLockScreenVisible] = useState(false);
  const [healthPlan, setHealthPlan] = useState('');
  const [bloodType, setBloodType] = useState<string>();
  const [allergies, setAllergies] = useState('');
  const [healthConditions, setHealthConditions] = useState('');
  const [medicationInputs, setMedicationInputs] = useState<string[]>(['']);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showContactSheet, setShowContactSheet] = useState(false);
  const [isAddingPrimaryContact, setIsAddingPrimaryContact] = useState(false);

  useEffect(() => {
    if (emergencyInfo) {
      setLockScreenVisible(emergencyInfo.lockScreenVisible);
      setHealthPlan(emergencyInfo.healthPlan || '');
      setBloodType(emergencyInfo.bloodType);
      setAllergies(emergencyInfo.allergies || '');
      setHealthConditions(emergencyInfo.healthConditions || '');
      
      if (emergencyInfo.medications.length > 0) {
        setMedicationInputs(emergencyInfo.medications);
      }
      
      setContacts(emergencyInfo.contacts);
    }
  }, [emergencyInfo]);

  const handleAddMedicationField = () => {
    setMedicationInputs([...medicationInputs, '']);
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
      setMedicationInputs(['']);
    }
  };

  const handleAddContact = (contact: EmergencyContact) => {
    setContacts([...contacts, contact]);
  };

  const handleRemoveContact = (contactId: string) => {
    setContacts(contacts.filter(c => c.id !== contactId));
  };

  const openAddContactSheet = (isPrimary: boolean) => {
    setIsAddingPrimaryContact(isPrimary);
    setShowContactSheet(true);
  };

  const handleSave = async () => {
    if (contacts.length === 0) {
      Alert.alert('Error', 'Please add at least one emergency contact');
      return;
    }

    setIsSaving(true);

    try {
      const repository = new EmergencyInfoRepositoryImpl();
      const saveEmergencyInfoUseCase = new SaveEmergencyInfoUseCase(repository);

      // Filter out empty medications
      const validMedications = medicationInputs
        .map(m => m.trim())
        .filter(m => m.length > 0);

      const result = await saveEmergencyInfoUseCase.execute({
        lockScreenVisible,
        healthPlan: healthPlan.trim() || undefined,
        bloodType,
        allergies: allergies.trim() || undefined,
        healthConditions: healthConditions.trim() || undefined,
        medications: validMedications,
        contacts
      });

      if (result.success) {
        Alert.alert(
          'Success',
          'Emergency information saved securely',
          [
            {
              text: 'OK',
              onPress: () => {
                refresh();
                router.back();
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Error saving emergency info:', error);
      Alert.alert('Error', 'Failed to save emergency information');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingInfo) {
    return (
      <SafeAreaView className="flex-1 bg-background-primary items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-primary" edges={['top']}>
      <View className="flex-1">
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-ui-border">
          <Pressable 
            className="w-10 h-10 items-center justify-center"
            onPress={() => router.back()}
            disabled={isSaving}
          >
            <Text className="text-2xl text-text-primary">←</Text>
          </Pressable>
          <Text className="text-lg font-bold text-text-primary">
            Emergency Information
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
            title="CRITICAL ACCESS"
            message="These emergency details will be accessible even when the device is locked in case of emergency."
            icon="⚠️"
            toggleLabel="Visible on lock screen"
            toggleEnabled={lockScreenVisible}
            onToggle={() => setLockScreenVisible(!lockScreenVisible)}
          />

          <View className="mb-6">
            <SectionHeader 
              icon="🏥" 
              title="Vital Medical Info"
              iconBg="#3B82F6"
            />

            <TextInputField
              label="Health Plan"
              placeholder="e.g. Blue Shield Gold"
              value={healthPlan}
              onChangeText={setHealthPlan}
            />

            <View className="mb-4">
              <Text className="text-sm text-text-secondary mb-3">Blood Type</Text>
              <BloodTypeSelector 
                selectedType={bloodType}
                onSelect={setBloodType}
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm text-text-secondary mb-2">Serious Allergies</Text>
              <TextInput
                className="bg-background-secondary rounded-xl px-4 py-3 text-text-primary min-h-[80px]"
                placeholder="List any life-threatening allergies..."
                placeholderTextColor="#64748B"
                multiline
                textAlignVertical="top"
                value={allergies}
                onChangeText={setAllergies}
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm text-text-secondary mb-2">Health Conditions</Text>
              <TextInput
                className="bg-background-secondary rounded-xl px-4 py-3 text-text-primary min-h-[80px]"
                placeholder="Diabetes, Hypertension, etc."
                placeholderTextColor="#64748B"
                multiline
                textAlignVertical="top"
                value={healthConditions}
                onChangeText={setHealthConditions}
              />
            </View>

            <View className="mb-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm text-text-secondary">Chronic Medications</Text>
                <Pressable 
                  className="w-8 h-8 bg-primary-main rounded-full items-center justify-center active:opacity-80"
                  onPress={handleAddMedicationField}
                >
                  <Text className="text-xl text-text-primary font-bold">+</Text>
                </Pressable>
              </View>
              
              {medicationInputs.map((medication, index) => (
                <View key={index} className="flex-row items-center mb-2">
                  <TextInput
                    className="flex-1 bg-background-secondary rounded-xl px-4 py-3 text-text-primary"
                    placeholder="Add medication"
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
              title="Emergency Contacts (ICE)"
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
              className="bg-background-secondary rounded-xl p-4 flex-row items-center justify-center border-2 border-dashed border-ui-border active:bg-background-tertiary"
              onPress={() => openAddContactSheet(contacts.length === 0)}
            >
              <Text className="text-xl mr-2">👥</Text>
              <Text className="text-sm font-medium text-text-secondary">
                {contacts.length === 0 
                  ? 'Add your first emergency contact'
                  : 'Add a secondary emergency contact'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>

        <View className="px-6 py-4 bg-background-primary border-t border-ui-border">
          <Pressable 
            className={`rounded-xl py-4 items-center ${
              contacts.length > 0
                ? 'bg-primary-main active:bg-primary-dark' 
                : 'bg-ui-border'
            }`}
            disabled={contacts.length === 0 || isSaving}
            onPress={handleSave}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className={`text-base font-bold ${
                contacts.length > 0 ? 'text-text-primary' : 'text-text-secondary'
              }`}>
                Save Emergency Information
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

        <View className="flex-row bg-background-secondary border-t border-ui-border">
          <Pressable className="flex-1 items-center py-3">
            <Text className="text-2xl mb-1">💼</Text>
            <Text className="text-xs font-medium text-text-secondary">Wallet</Text>
          </Pressable>
          <Pressable className="flex-1 items-center py-3">
            <Text className="text-2xl mb-1">❤️</Text>
            <Text className="text-xs font-medium text-text-secondary">Health</Text>
          </Pressable>
          <Pressable className="flex-1 items-center py-3">
            <Text className="text-2xl mb-1">🚨</Text>
            <Text className="text-xs font-medium text-primary-main">Emergency</Text>
          </Pressable>
          <Pressable className="flex-1 items-center py-3">
            <Text className="text-2xl mb-1">⚙️</Text>
            <Text className="text-xs font-medium text-text-secondary">Settings</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
