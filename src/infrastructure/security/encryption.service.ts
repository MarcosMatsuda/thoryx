import * as Crypto from "expo-crypto";

export class EncryptionService {
  private static readonly ENCRYPTION_KEY = "thoryx-secure-key-2026-v1";

  static async encrypt(data: string): Promise<string> {
    try {
      const encoded = btoa(unescape(encodeURIComponent(data)));
      const key = await this.deriveKey(this.ENCRYPTION_KEY);
      const combined = `${encoded}::${key.substring(0, 16)}`;

      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        combined,
      );

      return `${encoded}:${hash}`;
    } catch (error) {
      console.error("Encryption error:", error);
      throw new Error("Failed to encrypt data");
    }
  }

  static async decrypt(encryptedData: string): Promise<string> {
    try {
      if (!encryptedData || typeof encryptedData !== "string") {
        console.error("Invalid encrypted data:", encryptedData);
        throw new Error("Invalid encrypted data: data is not a string");
      }

      const [encoded, hash] = encryptedData.split(":");

      if (!encoded) {
        throw new Error("Invalid encrypted data format");
      }

      const decoded = decodeURIComponent(escape(atob(encoded)));
      return decoded;
    } catch (error) {
      console.error("Decryption error:", error);
      throw new Error("Failed to decrypt data");
    }
  }

  private static async deriveKey(password: string): Promise<string> {
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password,
    );
  }
}
