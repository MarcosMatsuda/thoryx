import * as SecureStore from "expo-secure-store";
import {
  Pin,
  PinInput,
  StoredPin,
  isLegacyPin,
} from "@domain/entities/pin.entity";
import { PinRepository } from "@domain/repositories/pin.repository";
import {
  Pbkdf2Service,
  PBKDF2_ITERATIONS,
} from "@infrastructure/security/pbkdf2.service";
import { LegacyPinService } from "@infrastructure/security/legacy-pin.service";
import { SecureStorageAdapter } from "@infrastructure/storage/secure-storage.adapter";

const PIN_STORAGE_KEY = "thoryx_user_pin_v2";
const PIN_ATTEMPTS_KEY = "thoryx_pin_attempts_v2";
const LEGACY_MMKV_SCOPE = "pin-storage";
const LEGACY_MMKV_KEY = "user_pin";
const LEGACY_MMKV_ENCRYPTION_KEY = "thoryx-pin-encryption-key-2026-v1";

interface SerializedPin {
  id: string;
  version?: number;
  salt?: string;
  iterations?: number;
  hash?: string;
  encryptedPin?: string;
  createdAt: string;
  updatedAt: string;
}

function deserialize(raw: string): StoredPin {
  const parsed = JSON.parse(raw) as SerializedPin;
  const base = {
    id: parsed.id,
    createdAt: new Date(parsed.createdAt),
    updatedAt: new Date(parsed.updatedAt),
  };

  if (parsed.version === 2 && parsed.salt && parsed.hash && parsed.iterations) {
    return {
      ...base,
      version: 2,
      salt: parsed.salt,
      iterations: parsed.iterations,
      hash: parsed.hash,
    };
  }

  if (parsed.encryptedPin) {
    return {
      ...base,
      version: 1,
      encryptedPin: parsed.encryptedPin,
    };
  }

  throw new Error("Unrecognized PIN schema");
}

function serialize(pin: Pin): string {
  return JSON.stringify({
    id: pin.id,
    version: pin.version,
    salt: pin.salt,
    iterations: pin.iterations,
    hash: pin.hash,
    createdAt: pin.createdAt.toISOString(),
    updatedAt: pin.updatedAt.toISOString(),
  });
}

export class PinRepositoryImpl implements PinRepository {
  private getLegacyStorage(): SecureStorageAdapter {
    return new SecureStorageAdapter(
      LEGACY_MMKV_SCOPE,
      LEGACY_MMKV_ENCRYPTION_KEY,
    );
  }

  async save(pinInput: PinInput): Promise<Pin> {
    const salt = await Pbkdf2Service.generateSalt();
    const hash = await Pbkdf2Service.derivePinHash(
      pinInput.pin,
      salt,
      PBKDF2_ITERATIONS,
    );
    const now = new Date();
    const pin: Pin = {
      id: "user_pin",
      version: 2,
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash,
      createdAt: now,
      updatedAt: now,
    };
    await SecureStore.setItemAsync(PIN_STORAGE_KEY, serialize(pin));
    await this.deleteLegacy();
    return pin;
  }

  async verify(pin: string, stored?: StoredPin | null): Promise<boolean> {
    const resolved = stored ?? (await this.readStored());
    if (!resolved || isLegacyPin(resolved)) {
      return false;
    }
    const derived = await Pbkdf2Service.derivePinHash(
      pin,
      resolved.salt,
      resolved.iterations,
    );
    return Pbkdf2Service.timingSafeEqual(derived, resolved.hash);
  }

  async verifyLegacy(pin: string, stored?: StoredPin | null): Promise<boolean> {
    const resolved = stored ?? (await this.readStored());
    if (!resolved || !isLegacyPin(resolved)) {
      return false;
    }
    try {
      const decrypted = LegacyPinService.decrypt(resolved.encryptedPin);
      return decrypted === pin;
    } catch {
      return false;
    }
  }

  async readStored(): Promise<StoredPin | null> {
    const current = await SecureStore.getItemAsync(PIN_STORAGE_KEY);
    if (current) {
      try {
        return deserialize(current);
      } catch {
        await SecureStore.deleteItemAsync(PIN_STORAGE_KEY);
      }
    }

    const legacyRaw = await this.getLegacyStorage().get(LEGACY_MMKV_KEY);
    if (!legacyRaw) {
      return null;
    }
    try {
      return deserialize(legacyRaw);
    } catch {
      return null;
    }
  }

  async exists(): Promise<boolean> {
    const stored = await this.readStored();
    return stored !== null;
  }

  async delete(): Promise<void> {
    await SecureStore.deleteItemAsync(PIN_STORAGE_KEY);
    await SecureStore.deleteItemAsync(PIN_ATTEMPTS_KEY);
    await this.deleteLegacy();
  }

  private async deleteLegacy(): Promise<void> {
    try {
      await this.getLegacyStorage().delete(LEGACY_MMKV_KEY);
    } catch {
      // ignore — legacy storage may be unavailable
    }
  }
}
