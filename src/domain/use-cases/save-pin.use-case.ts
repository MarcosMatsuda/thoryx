import { PinRepository } from '@domain/repositories/pin.repository';
import { PinInput } from '@domain/entities/pin.entity';

export class SavePinUseCase {
  constructor(private pinRepository: PinRepository) {}

  async execute(pinInput: PinInput): Promise<{ success: boolean; message: string }> {
    try {
      if (!pinInput.pin || pinInput.pin.length !== 6) {
        return {
          success: false,
          message: 'PIN must be 6 digits'
        };
      }

      if (!/^\d{6}$/.test(pinInput.pin)) {
        return {
          success: false,
          message: 'PIN must contain only numbers'
        };
      }

      await this.pinRepository.save(pinInput);

      return {
        success: true,
        message: 'PIN saved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to save PIN'
      };
    }
  }
}
