import { PinRepository } from "@domain/repositories/pin.repository";
import { PinAttemptsRepository } from "@domain/repositories/pin-attempts.repository";
import { isLegacyPin } from "@domain/entities/pin.entity";
import { PBKDF2_ITERATIONS } from "@infrastructure/security/pbkdf2.service";
import { computeLockoutDelay } from "./compute-lockout-delay.use-case";

export interface VerifyPinWithLockoutResult {
  success: boolean;
  lockedUntil: number | null;
  attemptCount: number;
  nextLockoutAt: number | null;
  migrated: boolean;
  reason?: "locked" | "invalid-format" | "no-pin" | "wrong-pin" | "error";
}

const PIN_LENGTH = 6;

export class VerifyPinWithLockoutUseCase {
  constructor(
    private pinRepository: PinRepository,
    private attemptsRepository: PinAttemptsRepository,
    private now: () => number = () => Date.now(),
  ) {}

  async execute(pin: string): Promise<VerifyPinWithLockoutResult> {
    const currentAttempts = await this.attemptsRepository.get();
    const timestamp = this.now();

    if (
      currentAttempts.lockedUntil !== null &&
      currentAttempts.lockedUntil > timestamp
    ) {
      return {
        success: false,
        lockedUntil: currentAttempts.lockedUntil,
        attemptCount: currentAttempts.count,
        nextLockoutAt: currentAttempts.lockedUntil,
        migrated: false,
        reason: "locked",
      };
    }

    if (!pin || pin.length !== PIN_LENGTH || !/^\d{6}$/.test(pin)) {
      return {
        success: false,
        lockedUntil: null,
        attemptCount: currentAttempts.count,
        nextLockoutAt: null,
        migrated: false,
        reason: "invalid-format",
      };
    }

    try {
      const stored = await this.pinRepository.readStored();
      if (!stored) {
        return {
          success: false,
          lockedUntil: null,
          attemptCount: currentAttempts.count,
          nextLockoutAt: null,
          migrated: false,
          reason: "no-pin",
        };
      }

      const isValid = isLegacyPin(stored)
        ? await this.pinRepository.verifyLegacy(pin)
        : await this.pinRepository.verify(pin);

      if (isValid) {
        let migrated = false;
        if (isLegacyPin(stored)) {
          await this.pinRepository.save({ pin });
          migrated = true;
        } else if (stored.iterations !== PBKDF2_ITERATIONS) {
          // Opportunistically re-hash with the current iteration count so
          // future unlocks are faster. Fire-and-forget: don't block unlock
          // UX on this. If the save fails, the next login just retries.
          void this.pinRepository.save({ pin }).catch(() => undefined);
        }
        await this.attemptsRepository.reset();
        return {
          success: true,
          lockedUntil: null,
          attemptCount: 0,
          nextLockoutAt: null,
          migrated,
        };
      }

      const nextCount = currentAttempts.count + 1;
      const decision = computeLockoutDelay(nextCount, timestamp);
      const nextState = {
        count: nextCount,
        lastAttemptAt: timestamp,
        lockedUntil: decision.lockedUntil,
      };
      await this.attemptsRepository.save(nextState);
      return {
        success: false,
        lockedUntil: decision.lockedUntil,
        attemptCount: nextCount,
        nextLockoutAt: decision.lockedUntil,
        migrated: false,
        reason: "wrong-pin",
      };
    } catch {
      return {
        success: false,
        lockedUntil: currentAttempts.lockedUntil,
        attemptCount: currentAttempts.count,
        nextLockoutAt: null,
        migrated: false,
        reason: "error",
      };
    }
  }
}
