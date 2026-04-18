import { Pbkdf2Service } from "./pbkdf2.service";

describe("Pbkdf2Service", () => {
  const SALT = "0123456789abcdef0123456789abcdef";
  const ITERATIONS = 1000;

  describe("derivePinHash", () => {
    it("is deterministic for the same pin, salt, and iterations", async () => {
      const a = await Pbkdf2Service.derivePinHash("123456", SALT, ITERATIONS);
      const b = await Pbkdf2Service.derivePinHash("123456", SALT, ITERATIONS);
      expect(a).toBe(b);
    });

    it("returns a 64-character hex string", async () => {
      const hash = await Pbkdf2Service.derivePinHash(
        "123456",
        SALT,
        ITERATIONS,
      );
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it("produces different hashes for different pins with the same salt", async () => {
      const a = await Pbkdf2Service.derivePinHash("111111", SALT, ITERATIONS);
      const b = await Pbkdf2Service.derivePinHash("222222", SALT, ITERATIONS);
      expect(a).not.toBe(b);
    });

    it("produces different hashes for different salts with the same pin", async () => {
      const saltA = "a".repeat(32);
      const saltB = "b".repeat(32);
      const a = await Pbkdf2Service.derivePinHash("123456", saltA, ITERATIONS);
      const b = await Pbkdf2Service.derivePinHash("123456", saltB, ITERATIONS);
      expect(a).not.toBe(b);
    });

    it("produces different hashes for different iteration counts", async () => {
      const a = await Pbkdf2Service.derivePinHash("123456", SALT, 1000);
      const b = await Pbkdf2Service.derivePinHash("123456", SALT, 2000);
      expect(a).not.toBe(b);
    });
  });

  describe("generateSalt", () => {
    it("returns a 32-character hex string (16 bytes)", async () => {
      const salt = await Pbkdf2Service.generateSalt();
      expect(salt).toMatch(/^[0-9a-f]{32}$/);
    });
  });

  describe("timingSafeEqual", () => {
    it("returns true for identical strings", () => {
      expect(Pbkdf2Service.timingSafeEqual("abc123", "abc123")).toBe(true);
    });

    it("returns false for different strings of same length", () => {
      expect(Pbkdf2Service.timingSafeEqual("abc123", "abc124")).toBe(false);
    });

    it("returns false for strings of different lengths", () => {
      expect(Pbkdf2Service.timingSafeEqual("abc", "abc123")).toBe(false);
    });

    it("returns true for empty strings", () => {
      expect(Pbkdf2Service.timingSafeEqual("", "")).toBe(true);
    });
  });
});
