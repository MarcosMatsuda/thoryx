import { pbkdf2 } from "pbkdf2";
import { Buffer } from "buffer";
import * as Crypto from "expo-crypto";

export const PBKDF2_ITERATIONS = 210_000;
const SALT_BYTES = 16;
const KEY_BYTES = 32;
const DIGEST = "sha256";

export class Pbkdf2Service {
  static async generateSalt(): Promise<string> {
    const bytes = await Crypto.getRandomBytesAsync(SALT_BYTES);
    return Buffer.from(bytes).toString("hex");
  }

  static derivePinHash(
    pin: string,
    saltHex: string,
    iterations: number = PBKDF2_ITERATIONS,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const saltBuffer = Buffer.from(saltHex, "hex");
      pbkdf2(pin, saltBuffer, iterations, KEY_BYTES, DIGEST, (err, derived) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(derived.toString("hex"));
      });
    });
  }

  static timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    let diff = 0;
    for (let i = 0; i < a.length; i += 1) {
      diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return diff === 0;
  }
}
