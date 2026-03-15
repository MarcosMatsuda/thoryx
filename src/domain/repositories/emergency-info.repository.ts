import { EmergencyInfo, EmergencyInfoInput } from '@domain/entities/emergency-info.entity';

export interface EmergencyInfoRepository {
  save(emergencyInfo: EmergencyInfoInput): Promise<EmergencyInfo>;
  get(): Promise<EmergencyInfo | null>;
  delete(): Promise<void>;
}
