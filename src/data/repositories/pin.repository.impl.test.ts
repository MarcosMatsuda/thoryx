import * as SecureStore from "expo-secure-store";
import { PinRepositoryImpl } from "./pin.repository.impl";
import { isLegacyPin } from "@domain/entities/pin.entity";

describe("PinRepositoryImpl", () => {
  const repository = new PinRepositoryImpl();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("save", () => {
    it("persists a v2 pin with salt, iterations, and pbkdf2 hash", async () => {
      const saved = await repository.save({ pin: "123456" });

      expect(saved.version).toBe(2);
      expect(saved.salt).toMatch(/^[0-9a-f]+$/);
      expect(saved.hash).toMatch(/^[0-9a-f]{64}$/);
      expect(saved.iterations).toBeGreaterThan(0);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        "thoryx_user_pin_v2",
        expect.stringContaining('"version":2'),
      );
    });
  });

  describe("verify", () => {
    it("returns true when the provided pin derives the stored hash", async () => {
      const saved = await repository.save({ pin: "654321" });
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(
        JSON.stringify({
          ...saved,
          createdAt: saved.createdAt.toISOString(),
          updatedAt: saved.updatedAt.toISOString(),
        }),
      );

      await expect(repository.verify("654321")).resolves.toBe(true);
    });

    it("returns false when the provided pin does not match", async () => {
      const saved = await repository.save({ pin: "654321" });
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(
        JSON.stringify({
          ...saved,
          createdAt: saved.createdAt.toISOString(),
          updatedAt: saved.updatedAt.toISOString(),
        }),
      );

      await expect(repository.verify("000000")).resolves.toBe(false);
    });

    it("returns false when storage is empty", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      await expect(repository.verify("000000")).resolves.toBe(false);
    });

    it("returns false for legacy pin (requires verifyLegacy instead)", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(
        JSON.stringify({
          id: "user_pin",
          encryptedPin: "MTIzNDU2:hash",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      );

      await expect(repository.verify("123456")).resolves.toBe(false);
    });
  });

  describe("verifyLegacy", () => {
    it("returns true when the legacy encrypted pin decodes to the provided pin", async () => {
      const encoded = Buffer.from("123456", "binary").toString("base64");
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(
        JSON.stringify({
          id: "user_pin",
          encryptedPin: `${encoded}:placeholderhash`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      );

      await expect(repository.verifyLegacy("123456")).resolves.toBe(true);
    });

    it("returns false when the decoded legacy pin does not match", async () => {
      const encoded = Buffer.from("123456", "binary").toString("base64");
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(
        JSON.stringify({
          id: "user_pin",
          encryptedPin: `${encoded}:placeholderhash`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      );

      await expect(repository.verifyLegacy("000000")).resolves.toBe(false);
    });

    it("returns false when stored pin is already v2", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(
        JSON.stringify({
          id: "user_pin",
          version: 2,
          salt: "a".repeat(32),
          iterations: 1000,
          hash: "b".repeat(64),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      );

      await expect(repository.verifyLegacy("123456")).resolves.toBe(false);
    });
  });

  describe("readStored", () => {
    it("returns null when neither current nor legacy storage has a pin", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      await expect(repository.readStored()).resolves.toBeNull();
    });

    it("marks stored v1 values as legacy", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(
        JSON.stringify({
          id: "user_pin",
          encryptedPin: "abc:def",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      );

      const stored = await repository.readStored();
      expect(stored).not.toBeNull();
      expect(isLegacyPin(stored!)).toBe(true);
    });
  });

  describe("exists", () => {
    it("returns true when storage holds a pin", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(
        JSON.stringify({
          id: "user_pin",
          version: 2,
          salt: "a".repeat(32),
          iterations: 1000,
          hash: "b".repeat(64),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      );

      await expect(repository.exists()).resolves.toBe(true);
    });

    it("returns false when storage is empty", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      await expect(repository.exists()).resolves.toBe(false);
    });
  });

  describe("delete", () => {
    it("removes the pin, its attempt counter, and the legacy copy", async () => {
      await repository.delete();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        "thoryx_user_pin_v2",
      );
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        "thoryx_pin_attempts_v2",
      );
    });
  });
});
