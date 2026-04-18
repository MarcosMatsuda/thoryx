import * as SecureStore from "expo-secure-store";
import { SecureStorageAdapter } from "@infrastructure/storage/secure-storage.adapter";
import { AuthService } from "./auth.service";

jest.mock("@infrastructure/storage/secure-storage.adapter");

describe("AuthService.clearAllData", () => {
  let clearSpies: Map<string, jest.Mock>;

  beforeEach(() => {
    jest.clearAllMocks();
    clearSpies = new Map();
    (SecureStorageAdapter as jest.Mock).mockImplementation(
      (storageId: string) => {
        const clearMock = jest.fn().mockResolvedValue(undefined);
        clearSpies.set(storageId, clearMock);
        return {
          clear: clearMock,
          get: jest.fn().mockResolvedValue(null),
          set: jest.fn().mockResolvedValue(undefined),
          delete: jest.fn().mockResolvedValue(undefined),
        };
      },
    );
  });

  it("clears every storage scope the app writes to", async () => {
    const service = new AuthService();
    await service.clearAllData();

    const expectedScopes = [
      "credit-cards-storage",
      "documents-storage",
      "document-types-storage",
      "emergency-storage",
      "user-profile-storage",
      "settings-storage",
      "user-data-storage", // cleared via clearAuthData
      "pin-storage", // legacy MMKV scope cleared by PinRepositoryImpl.delete
    ];

    expectedScopes.forEach((scope) => {
      expect(clearSpies.has(scope)).toBe(true);
    });
  });

  it("uses the same encryption key as EmergencyInfoRepositoryImpl", async () => {
    const service = new AuthService();
    await service.clearAllData();

    // Verify a SecureStorageAdapter was constructed with the exact scope +
    // key that EmergencyInfoRepositoryImpl writes to. Without this match,
    // the clear silently targets an empty MMKV partition.
    expect(SecureStorageAdapter).toHaveBeenCalledWith(
      "emergency-storage",
      "thoryx-emergency-encryption-key-2026-v1",
    );
  });

  it("uses the same encryption key as DocumentRepositoryImpl", async () => {
    const service = new AuthService();
    await service.clearAllData();

    expect(SecureStorageAdapter).toHaveBeenCalledWith(
      "documents-storage",
      "thoryx-documents-encryption-key-2026",
    );
  });

  it("includes the document-types storage scope", async () => {
    const service = new AuthService();
    await service.clearAllData();

    expect(SecureStorageAdapter).toHaveBeenCalledWith(
      "document-types-storage",
      "thoryx-doc-types-key-2026",
    );
  });

  it("removes the v2 PIN SecureStore keys", async () => {
    const service = new AuthService();
    await service.clearAllData();

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      "thoryx_user_pin_v2",
    );
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      "thoryx_pin_attempts_v2",
    );
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      "thoryx_pin_responsibility_accepted_at",
    );
  });
});
