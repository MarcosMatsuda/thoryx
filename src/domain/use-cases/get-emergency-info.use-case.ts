import { EmergencyInfoRepository } from '@domain/repositories/emergency-info.repository';
import { EmergencyInfo } from '@domain/entities/emergency-info.entity';

export class GetEmergencyInfoUseCase {
  constructor(private emergencyInfoRepository: EmergencyInfoRepository) {}

  async execute(): Promise<EmergencyInfo | null> {
    try {
      return await this.emergencyInfoRepository.get();
    } catch (error) {
      console.error('Error getting emergency info:', error);
      return null;
    }
  }
}
