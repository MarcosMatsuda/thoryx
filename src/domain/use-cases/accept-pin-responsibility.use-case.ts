import { PinResponsibilityRepository } from "@domain/repositories/pin-responsibility.repository";

export class AcceptPinResponsibilityUseCase {
  constructor(
    private repository: PinResponsibilityRepository,
    private now: () => number = () => Date.now(),
  ) {}

  async execute(): Promise<void> {
    await this.repository.accept(this.now());
  }
}
