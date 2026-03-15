import {
  BiometryService,
  BiometryResult,
} from "@infrastructure/biometry/biometry.service";

export class AuthenticateWithBiometryUseCase {
  async execute(promptMessage?: string): Promise<BiometryResult> {
    const isAvailable = await BiometryService.isAvailable();

    if (!isAvailable) {
      return {
        success: false,
        error: "Biometric authentication not available",
      };
    }

    return await BiometryService.authenticate(promptMessage);
  }
}
