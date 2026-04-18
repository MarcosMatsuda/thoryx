import * as SecureStore from "expo-secure-store";
import { PinAttemptsRepositoryImpl } from "./pin-attempts.repository.impl";

describe("PinAttemptsRepositoryImpl", () => {
  const repository = new PinAttemptsRepositoryImpl();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("get", () => {
    it("returns initial state when nothing is stored", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);
      const result = await repository.get();
      expect(result).toEqual({
        count: 0,
        lastAttemptAt: 0,
        lockedUntil: null,
      });
    });

    it("returns parsed state when a value is stored", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(
        JSON.stringify({
          count: 3,
          lastAttemptAt: 1000,
          lockedUntil: 5000,
        }),
      );
      const result = await repository.get();
      expect(result).toEqual({
        count: 3,
        lastAttemptAt: 1000,
        lockedUntil: 5000,
      });
    });

    it("falls back to initial state when stored value is corrupted", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(
        "not-json",
      );
      const result = await repository.get();
      expect(result.count).toBe(0);
      expect(result.lockedUntil).toBeNull();
    });

    it("normalises missing lockedUntil to null", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(
        JSON.stringify({ count: 1, lastAttemptAt: 1000 }),
      );
      const result = await repository.get();
      expect(result.lockedUntil).toBeNull();
    });
  });

  describe("save", () => {
    it("serialises state to SecureStore", async () => {
      await repository.save({
        count: 2,
        lastAttemptAt: 100,
        lockedUntil: null,
      });
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        "thoryx_pin_attempts_v2",
        JSON.stringify({
          count: 2,
          lastAttemptAt: 100,
          lockedUntil: null,
        }),
      );
    });
  });

  describe("reset", () => {
    it("deletes the stored state", async () => {
      await repository.reset();
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        "thoryx_pin_attempts_v2",
      );
    });
  });
});
