import { PinRepository } from '@domain/repositories/pin.repository';

export class CheckPinExistsUseCase {
  constructor(private pinRepository: PinRepository) {}

  async execute(): Promise<boolean> {
    try {
      return await this.pinRepository.exists();
    } catch (error) {
      console.error('Error checking PIN existence:', error);
      return false;
    }
  }
}
