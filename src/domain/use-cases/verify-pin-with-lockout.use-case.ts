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
// How long to wait before running the opportunistic re-hash. The save
// runs PBKDF2 again (~200-800ms on Hermes) on the same JS thread as the
// UI, so firing it immediately after a successful verify competes with
// navigation and the wallet-home first render. A short delay lets the
// unlock flow settle before CPU gets hogged in the background.
const REHASH_DEFER_MS = 2000;

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
        ? await this.pinRepository.verifyLegacy(pin, stored)
        : await this.pinRepository.verify(pin, stored);

      if (isValid) {
        let migrated = false;
        if (isLegacyPin(stored)) {
          await this.pinRepository.save({ pin });
          migrated = true;
        } else if (stored.iterations !== PBKDF2_ITERATIONS) {
          // Opportunistically re-hash with the current iteration count so
          // future unlocks are faster. Defer by a couple of seconds so
          // the PBKDF2 work doesn't fight the wallet-home first render
          // for the JS thread. Log failures in dev so we notice if the
          // re-hash ever silently stops updating and leaves users stuck
          // on the slower iteration count forever.
          setTimeout(() => {
            this.pinRepository.save({ pin }).catch((err) => {
              if (__DEV__) {
                console.warn("[PinVerify] opportunistic re-hash failed", err);
              }
            });
          }, REHASH_DEFER_MS);
        }
        // Avoid a redundant SecureStore round-trip when the counter is
        // already at zero (the common case — most unlocks are clean).
        if (
          currentAttempts.count !== 0 ||
          currentAttempts.lockedUntil !== null
        ) {
          await this.attemptsRepository.reset();
        }
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
