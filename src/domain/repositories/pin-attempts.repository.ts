import { PinAttempts } from "@domain/entities/pin-attempts.entity";

export interface PinAttemptsRepository {
  get(): Promise<PinAttempts>;
  save(attempts: PinAttempts): Promise<void>;
  reset(): Promise<void>;
}
