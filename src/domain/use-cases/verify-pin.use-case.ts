import { PinRepository } from '@domain/repositories/pin.repository';

export class VerifyPinUseCase {
  constructor(private pinRepository: PinRepository) {}

  async execute(pin: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!pin || pin.length !== 6) {
        return {
          success: false,
          message: 'PIN must be 6 digits'
        };
      }

      const isValid = await this.pinRepository.verify(pin);

      if (isValid) {
        return {
          success: true,
          message: 'PIN verified successfully'
        };
      } else {
        return {
          success: false,
          message: 'Invalid PIN'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to verify PIN'
      };
    }
  }
}
