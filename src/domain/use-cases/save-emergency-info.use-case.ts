import { EmergencyInfoRepository } from '@domain/repositories/emergency-info.repository';
import { EmergencyInfoInput } from '@domain/entities/emergency-info.entity';

export class SaveEmergencyInfoUseCase {
  constructor(private emergencyInfoRepository: EmergencyInfoRepository) {}

  async execute(emergencyInfoInput: EmergencyInfoInput): Promise<{ success: boolean; message: string }> {
    try {
      // Validate at least one contact
      if (emergencyInfoInput.contacts.length === 0) {
        return {
          success: false,
          message: 'At least one emergency contact is required'
        };
      }

      // Validate primary contact exists
      const hasPrimaryContact = emergencyInfoInput.contacts.some(c => c.isPrimary);
      if (!hasPrimaryContact) {
        return {
          success: false,
          message: 'A primary emergency contact is required'
        };
      }

      await this.emergencyInfoRepository.save(emergencyInfoInput);

      return {
        success: true,
        message: 'Emergency information saved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to save emergency information'
      };
    }
  }
}
