import { EmergencyInfo, EmergencyInfoInput } from '@domain/entities/emergency-info.entity';
import { EmergencyInfoRepository } from '@domain/repositories/emergency-info.repository';
import { SecureStorageAdapter } from '@infrastructure/storage/secure-storage.adapter';
import { EncryptionService } from '@infrastructure/security/encryption.service';

export class EmergencyInfoRepositoryImpl implements EmergencyInfoRepository {
  private storage: SecureStorageAdapter;
  private readonly EMERGENCY_INFO_KEY = 'emergency_info';

  constructor() {
    this.storage = new SecureStorageAdapter(
      'emergency-storage',
      'thoryx-emergency-encryption-key-2026-v1'
    );
  }

  async save(emergencyInfoInput: EmergencyInfoInput): Promise<EmergencyInfo> {
    try {
      // Encrypt sensitive data
      const encryptedHealthPlan = emergencyInfoInput.healthPlan 
        ? await EncryptionService.encrypt(emergencyInfoInput.healthPlan)
        : undefined;
      
      const encryptedAllergies = emergencyInfoInput.allergies
        ? await EncryptionService.encrypt(emergencyInfoInput.allergies)
        : undefined;
      
      const encryptedHealthConditions = emergencyInfoInput.healthConditions
        ? await EncryptionService.encrypt(emergencyInfoInput.healthConditions)
        : undefined;

      // Encrypt medications
      const encryptedMedications = await Promise.all(
        emergencyInfoInput.medications.map(med => EncryptionService.encrypt(med))
      );

      // Encrypt contact phone numbers
      const encryptedContacts = await Promise.all(
        emergencyInfoInput.contacts.map(async (contact) => ({
          ...contact,
          phoneNumber: await EncryptionService.encrypt(contact.phoneNumber)
        }))
      );

      const emergencyInfo: any = {
        id: 'emergency_info',
        lockScreenVisible: emergencyInfoInput.lockScreenVisible,
        healthPlan: encryptedHealthPlan,
        bloodType: emergencyInfoInput.bloodType,
        allergies: encryptedAllergies,
        healthConditions: encryptedHealthConditions,
        medications: encryptedMedications,
        contacts: encryptedContacts,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.storage.set(this.EMERGENCY_INFO_KEY, JSON.stringify(emergencyInfo));
      
      return this.mapToEmergencyInfo(emergencyInfo);
    } catch (error) {
      console.error('Error saving emergency info:', error);
      throw new Error('Failed to save emergency info');
    }
  }

  async get(): Promise<EmergencyInfo | null> {
    try {
      const emergencyInfoJson = await this.storage.get(this.EMERGENCY_INFO_KEY);
      if (!emergencyInfoJson) {
        return null;
      }

      const savedInfo = JSON.parse(emergencyInfoJson);
      
      // Decrypt sensitive data
      const decryptedHealthPlan = savedInfo.healthPlan
        ? await EncryptionService.decrypt(savedInfo.healthPlan)
        : undefined;
      
      const decryptedAllergies = savedInfo.allergies
        ? await EncryptionService.decrypt(savedInfo.allergies)
        : undefined;
      
      const decryptedHealthConditions = savedInfo.healthConditions
        ? await EncryptionService.decrypt(savedInfo.healthConditions)
        : undefined;

      // Decrypt medications
      const decryptedMedications = await Promise.all(
        (savedInfo.medications || []).map((med: string) => EncryptionService.decrypt(med))
      );

      // Decrypt contact phone numbers
      const decryptedContacts = await Promise.all(
        (savedInfo.contacts || []).map(async (contact: any) => ({
          ...contact,
          phoneNumber: await EncryptionService.decrypt(contact.phoneNumber)
        }))
      );

      return {
        id: savedInfo.id,
        lockScreenVisible: savedInfo.lockScreenVisible,
        healthPlan: decryptedHealthPlan,
        bloodType: savedInfo.bloodType,
        allergies: decryptedAllergies,
        healthConditions: decryptedHealthConditions,
        medications: decryptedMedications,
        contacts: decryptedContacts,
        createdAt: new Date(savedInfo.createdAt),
        updatedAt: new Date(savedInfo.updatedAt)
      };
    } catch (error) {
      console.error('Error loading emergency info:', error);
      return null;
    }
  }

  async delete(): Promise<void> {
    try {
      await this.storage.delete(this.EMERGENCY_INFO_KEY);
    } catch (error) {
      console.error('Error deleting emergency info:', error);
      throw new Error('Failed to delete emergency info');
    }
  }

  private mapToEmergencyInfo(data: any): EmergencyInfo {
    return {
      id: data.id,
      lockScreenVisible: data.lockScreenVisible,
      bloodType: data.bloodType,
      medications: [],
      contacts: [],
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  }
}
