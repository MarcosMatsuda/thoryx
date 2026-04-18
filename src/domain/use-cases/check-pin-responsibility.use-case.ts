import { PinResponsibilityRepository } from "@domain/repositories/pin-responsibility.repository";

export class CheckPinResponsibilityUseCase {
  constructor(private repository: PinResponsibilityRepository) {}

  async execute(): Promise<boolean> {
    return this.repository.isAccepted();
  }
}
