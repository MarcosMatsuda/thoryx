import { pbkdf2Async } from "@noble/hashes/pbkdf2";
import { sha256 } from "@noble/hashes/sha256";
import * as Crypto from "expo-crypto";

// 50k iterations on a pure-JS PBKDF2 implementation is the pragmatic ceiling
// for Hermes debug builds where every verify runs interpreted. Combined with
// our persistent lockout schedule (capped at 24h) and hardware-bound salt in
// the Keychain/Keystore, the iteration count is not the limiting defense
// against a realistic attacker — the lockout is. Higher values (100k–210k)
// made the unlock overlay sit for seconds in dev builds without adding a
// meaningful security margin for a 6-digit PIN.
export const PBKDF2_ITERATIONS = 50_000;
const SALT_BYTES = 16;
const KEY_BYTES = 32;

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
    const derived = await pbkdf2Async(sha256, pin, salt, {
      c: iterations,
      dkLen: KEY_BYTES,
      // Yield to the JS event loop every 10ms so UI re-renders and touch
      // events stay responsive during the ~1-2s key derivation.
      asyncTick: 10,
    });
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
