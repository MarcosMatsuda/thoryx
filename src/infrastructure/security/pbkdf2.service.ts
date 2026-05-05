import { pbkdf2 } from "react-native-quick-crypto";
import * as Crypto from "expo-crypto";

// Native PBKDF2 via JSI/OpenSSL (react-native-quick-crypto). Verify on a
// modern device runs in well under 300ms even at 200k iterations, so we
// can hold a security margin closer to the OWASP recommendation without
// the multi-second JS-thread stalls the pure-JS implementation produced.
// The lockout schedule (capped at 24h) plus a hardware-bound salt remain
// the primary defense against online brute force; the iteration count
// raises the cost of an offline attack against a leaked hash.
export const PBKDF2_ITERATIONS = 200_000;
const SALT_BYTES = 16;
const KEY_BYTES = 32;
const DIGEST = "sha256";

function toHex(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i += 1) {
    out += bytes[i].toString(16).padStart(2, "0");
  }
  return out;
}

function fromHex(hex: string): Uint8Array {
  const clean = hex.length % 2 === 0 ? hex : `0${hex}`;
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function pbkdf2Async(
  password: string,
  salt: Uint8Array,
  iterations: number,
  keylen: number,
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    pbkdf2(password, salt, iterations, keylen, DIGEST, (err, derived) => {
      if (err || !derived) {
        reject(err ?? new Error("pbkdf2 returned no derived key"));
        return;
      }
      resolve(new Uint8Array(derived.buffer, derived.byteOffset, derived.byteLength));
    });
  });
}

export class Pbkdf2Service {
  static async generateSalt(): Promise<string> {
    const bytes = await Crypto.getRandomBytesAsync(SALT_BYTES);
    return toHex(bytes);
  }

  static async derivePinHash(
    pin: string,
    saltHex: string,
    iterations: number = PBKDF2_ITERATIONS,
  ): Promise<string> {
    const salt = fromHex(saltHex);
    const derived = await pbkdf2Async(pin, salt, iterations, KEY_BYTES);
    return toHex(derived);
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
