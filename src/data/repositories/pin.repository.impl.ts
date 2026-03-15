import { Pin, PinInput } from "@domain/entities/pin.entity";
import { PinRepository } from "@domain/repositories/pin.repository";
import { SecureStorageAdapter } from "@infrastructure/storage/secure-storage.adapter";
import { EncryptionService } from "@infrastructure/security/encryption.service";

export class PinRepositoryImpl implements PinRepository {
  private storage: SecureStorageAdapter;
  private readonly PIN_KEY = "user_pin";

  constructor() {
    this.storage = new SecureStorageAdapter(
      "pin-storage",
      "thoryx-pin-encryption-key-2026-v1",
    );
  }

  async save(pinInput: PinInput): Promise<Pin> {
    try {
      const encryptedPin = await EncryptionService.encrypt(pinInput.pin);

      const pin: Pin = {
        id: "user_pin",
        encryptedPin,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.storage.set(this.PIN_KEY, JSON.stringify(pin));

      return pin;
    } catch (error) {
      console.error("Error saving PIN:", error);
      throw new Error("Failed to save PIN");
    }
  }

  async verify(pin: string): Promise<boolean> {
    try {
      const pinJson = await this.storage.get(this.PIN_KEY);
      if (!pinJson) {
        console.log("No PIN found in storage");
        return false;
      }

      const savedPin: Pin = JSON.parse(pinJson);

      // Check if encryptedPin is valid
      if (!savedPin.encryptedPin || typeof savedPin.encryptedPin !== "string") {
        console.error("Invalid encrypted PIN format, clearing storage");
        await this.delete();
        return false;
      }

      const decryptedPin = await EncryptionService.decrypt(
        savedPin.encryptedPin,
      );

      return decryptedPin === pin;
    } catch (error) {
      console.error("Error verifying PIN:", error);
      // If decryption fails, clear the corrupted PIN
      try {
        await this.delete();
        console.log("Cleared corrupted PIN from storage");
      } catch (deleteError) {
        console.error("Error clearing corrupted PIN:", deleteError);
      }
      return false;
    }
  }

  async exists(): Promise<boolean> {
    try {
      const pinJson = await this.storage.get(this.PIN_KEY);
      return pinJson !== null;
    } catch (error) {
      console.error("Error checking PIN existence:", error);
      return false;
    }
  }

  async delete(): Promise<void> {
    try {
      await this.storage.delete(this.PIN_KEY);
    } catch (error) {
      console.error("Error deleting PIN:", error);
      throw new Error("Failed to delete PIN");
    }
  }
}
