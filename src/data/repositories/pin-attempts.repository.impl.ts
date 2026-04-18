import * as SecureStore from "expo-secure-store";
import {
  PinAttempts,
  INITIAL_PIN_ATTEMPTS,
} from "@domain/entities/pin-attempts.entity";
import { PinAttemptsRepository } from "@domain/repositories/pin-attempts.repository";

const ATTEMPTS_KEY = "thoryx_pin_attempts_v2";

export class PinAttemptsRepositoryImpl implements PinAttemptsRepository {
  async get(): Promise<PinAttempts> {
    const raw = await SecureStore.getItemAsync(ATTEMPTS_KEY);
    if (!raw) {
      return { ...INITIAL_PIN_ATTEMPTS };
    }
    try {
      const parsed = JSON.parse(raw) as PinAttempts;
      return {
        count: Number(parsed.count) || 0,
        lastAttemptAt: Number(parsed.lastAttemptAt) || 0,
        lockedUntil:
          parsed.lockedUntil === null || parsed.lockedUntil === undefined
            ? null
            : Number(parsed.lockedUntil),
      };
    } catch {
      return { ...INITIAL_PIN_ATTEMPTS };
    }
  }

  async save(attempts: PinAttempts): Promise<void> {
    await SecureStore.setItemAsync(ATTEMPTS_KEY, JSON.stringify(attempts));
  }

  async reset(): Promise<void> {
    await SecureStore.deleteItemAsync(ATTEMPTS_KEY);
  }
}
