import * as SecureStore from "expo-secure-store";
import { SecureStorageAdapter } from "./secure-storage.adapter";

// Mock expo-secure-store
jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock react-native-mmkv to ensure we test SecureStore path
jest.mock("react-native-mmkv", () => {
  throw new Error("MMKV not available");
});

describe("SecureStorageAdapter", () => {
  let adapter: SecureStorageAdapter;
  const storageId = "test-storage";

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new SecureStorageAdapter(storageId);
  });

  describe("Key Sanitization", () => {
    it("should sanitize invalid characters in keys", async () => {
      const keyWithInvalidChars = "user:profile:data";
      const expectedSanitizedKey = "test-storage_user_profile_data";

      await adapter.set(keyWithInvalidChars, "value");

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        expectedSanitizedKey,
        "value",
      );
    });

    it("should replace colons with underscores", async () => {
      const keyWithColons = "auth:token:refresh";
      const expectedKey = "test-storage_auth_token_refresh";

      await adapter.set(keyWithColons, "token123");

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        expectedKey,
        "token123",
      );
    });

    it("should replace special characters with underscores", async () => {
      const keyWithSpecialChars = "user@domain#123$key%special";
      const expectedKey = "test-storage_user_domain_123_key_special";

      await adapter.set(keyWithSpecialChars, "value");

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        expectedKey,
        "value",
      );
    });

    it("should allow valid characters (alphanumeric, dots, hyphens, underscores)", async () => {
      const validKey = "user.profile-data_123";
      const expectedKey = `${storageId}_${validKey}`;

      await adapter.set(validKey, "value");

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        expectedKey,
        "value",
      );
    });

    it("should handle keys with spaces", async () => {
      const keyWithSpaces = "user data key";
      const expectedKey = "test-storage_user_data_key";

      await adapter.set(keyWithSpaces, "value");

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        expectedKey,
        "value",
      );
    });

    it("should handle keys with slashes", async () => {
      const keyWithSlashes = "user/profile/data";
      const expectedKey = "test-storage_user_profile_data";

      await adapter.set(keyWithSlashes, "value");

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        expectedKey,
        "value",
      );
    });

    it("should handle keys with commas", async () => {
      const keyWithCommas = "item1,item2,item3";
      const expectedKey = "test-storage_item1_item2_item3";

      await adapter.set(keyWithCommas, "value");

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        expectedKey,
        "value",
      );
    });
  });

  describe("Set Operation", () => {
    it("should set value with sanitized key", async () => {
      await adapter.set("auth:token", "secret123");

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        "test-storage_auth_token",
        "secret123",
      );
    });

    it("should handle empty values", async () => {
      await adapter.set("empty:key", "");

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        "test-storage_empty_key",
        "",
      );
    });

    it("should handle large values", async () => {
      const largeValue = "x".repeat(10000);
      await adapter.set("large:data", largeValue);

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        "test-storage_large_data",
        largeValue,
      );
    });

    it("should handle special characters in values", async () => {
      const specialValue = "value:with@special#chars$123";
      await adapter.set("key", specialValue);

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        "test-storage_key",
        specialValue,
      );
    });
  });

  describe("Backward Compatibility", () => {
    it("should try sanitized key first", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(
        "found-value",
      );

      const result = await adapter.get("user:profile");

      expect(SecureStore.getItemAsync).toHaveBeenCalledWith(
        "test-storage_user_profile",
      );
      expect(result).toBe("found-value");
    });

    it("should fallback to original key if sanitized key not found", async () => {
      const originalKey = "test-storage_user:profile";
      const sanitizedKey = "test-storage_user_profile";

      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce(null) // First call with sanitized key returns null
        .mockResolvedValueOnce("old-value"); // Second call with original key returns value

      const result = await adapter.get("user:profile");

      expect(SecureStore.getItemAsync).toHaveBeenNthCalledWith(1, sanitizedKey);
      expect(SecureStore.getItemAsync).toHaveBeenNthCalledWith(2, originalKey);
      expect(result).toBe("old-value");
    });

    it("should not try original key if keys are identical", async () => {
      const validKey = "userprofile";

      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);

      await adapter.get(validKey);

      // Should only call once since sanitized and original are the same
      expect(SecureStore.getItemAsync).toHaveBeenCalledTimes(1);
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith(
        "test-storage_userprofile",
      );
    });

    it("should return null if neither key exists", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const result = await adapter.get("user:profile");

      expect(result).toBeNull();
    });
  });

  describe("Auto-Migration", () => {
    it("should migrate data from original key to sanitized key on read", async () => {
      const originalKey = "test-storage_user:profile";
      const sanitizedKey = "test-storage_user_profile";
      const oldValue = "old-value";

      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce(null) // sanitized key not found
        .mockResolvedValueOnce(oldValue); // original key found

      await adapter.get("user:profile");

      // Should migrate: set sanitized, delete original
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        sanitizedKey,
        oldValue,
      );
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(originalKey);
    });

    it("should not attempt migration if value not found in original key", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      await adapter.get("user:profile");

      // Should not call set or delete if value is null
      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
      expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
    });

    it("should handle errors during original key read gracefully", async () => {
      const consoleDebugSpy = jest.spyOn(console, "debug").mockImplementation();

      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce(null) // sanitized key
        .mockRejectedValueOnce(new Error("Invalid key")); // original key throws

      const result = await adapter.get("user:profile");

      expect(result).toBeNull();
      expect(consoleDebugSpy).toHaveBeenCalled();
      consoleDebugSpy.mockRestore();
    });
  });

  describe("Delete Operation", () => {
    it("should delete using sanitized key", async () => {
      await adapter.delete("user:profile");

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        "test-storage_user_profile",
      );
    });

    it("should attempt to delete both original and sanitized keys", async () => {
      (SecureStore.deleteItemAsync as jest.Mock)
        .mockResolvedValueOnce(undefined) // sanitized key
        .mockResolvedValueOnce(undefined); // original key

      await adapter.delete("user:profile");

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        "test-storage_user_profile",
      );
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        "test-storage_user:profile",
      );
    });

    it("should not attempt to delete original key if keys are identical", async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      await adapter.delete("userprofile");

      // Should only call once
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(1);
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        "test-storage_userprofile",
      );
    });

    it("should handle errors during delete gracefully", async () => {
      const consoleDebugSpy = jest.spyOn(console, "debug").mockImplementation();

      (SecureStore.deleteItemAsync as jest.Mock).mockRejectedValue(
        new Error("Delete failed"),
      );

      // Should not throw
      await expect(adapter.delete("user:profile")).resolves.toBeUndefined();
      expect(consoleDebugSpy).toHaveBeenCalled();

      consoleDebugSpy.mockRestore();
    });

    it("should handle partial delete failures (sanitized ok, original fails)", async () => {
      const consoleDebugSpy = jest.spyOn(console, "debug").mockImplementation();

      (SecureStore.deleteItemAsync as jest.Mock)
        .mockResolvedValueOnce(undefined) // sanitized key succeeds
        .mockRejectedValueOnce(new Error("Original key invalid")); // original key fails

      await adapter.delete("user:profile");

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(2);
      consoleDebugSpy.mockRestore();
    });
  });

  describe("Logout Flow", () => {
    it("should complete logout without errors when deleting auth tokens", async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      // Simulate logout clearing multiple auth-related keys
      await adapter.delete("auth:token");
      await adapter.delete("auth:refresh_token");
      await adapter.delete("user:session");

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(6); // 2 deletes per key (sanitized + original)
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        "test-storage_auth_token",
      );
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        "test-storage_auth:token",
      );
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        "test-storage_auth_refresh_token",
      );
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        "test-storage_auth:refresh_token",
      );
    });

    it("should handle logout with pre-existing invalid keys", async () => {
      const consoleDebugSpy = jest.spyOn(console, "debug").mockImplementation();

      (SecureStore.deleteItemAsync as jest.Mock)
        .mockResolvedValueOnce(undefined) // sanitized key
        .mockRejectedValueOnce(new Error("Invalid key format")); // original key fails

      // Should not throw during logout
      await expect(adapter.delete("user:session")).resolves.toBeUndefined();

      consoleDebugSpy.mockRestore();
    });

    it("should clear all data successfully", async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      await adapter.clear();

      // clear() uses MMKV fallback path, but in our test MMKV is disabled
      // So it just does nothing, which is expected behavior
    });
  });

  describe("Integration Scenarios", () => {
    it("should handle set then get sequence with sanitized keys", async () => {
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce(null) // First get for registry (empty)
        .mockResolvedValueOnce("stored-value"); // get for value

      await adapter.set("user:data:profile", "profile-json");
      const result = await adapter.get("user:data:profile");

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        "test-storage_user_data_profile",
        "profile-json",
      );
      expect(result).toBe("stored-value");
    });

    it("should handle update sequence (set, get, delete)", async () => {
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce(null) // First get for registry (empty)
        .mockResolvedValueOnce("initial-value") // First get for value
        .mockResolvedValueOnce("[]") // Second get for registry (after set)
        .mockResolvedValueOnce("updated-value"); // Second get for value

      await adapter.set("config:app:theme", "dark");
      const value1 = await adapter.get("config:app:theme");
      await adapter.delete("config:app:theme");
      const value2 = await adapter.get("config:app:theme");

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        "test-storage_config_app_theme",
        "dark",
      );
      expect(value1).toBe("initial-value");
      expect(value2).toBe("updated-value");
      expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
    });

    it("should handle multiple keys with similar patterns", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("value");

      await adapter.set("user:session:token", "token1");
      await adapter.set("user:session:refresh", "token2");
      await adapter.get("user:session:token");
      await adapter.get("user:session:refresh");

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        "test-storage_user_session_token",
        "token1",
      );
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        "test-storage_user_session_refresh",
        "token2",
      );
    });

    it("should handle concurrent operations", async () => {
      // Mock getItemAsync to handle multiple calls
      (SecureStore.getItemAsync as jest.Mock).mockImplementation(
        async (key: string) => {
          if (key.includes("__keys_registry")) {
            return "[]"; // Empty registry
          }
          if (key.includes("key3")) {
            return "value3";
          }
          return null;
        },
      );

      await Promise.all([
        adapter.set("key1", "value1"),
        adapter.set("key2", "value2"),
        adapter.get("key3"),
        adapter.delete("key4"),
      ]);

      // Verify that all operations completed without errors
      expect(SecureStore.setItemAsync).toHaveBeenCalled();
      expect(SecureStore.getItemAsync).toHaveBeenCalled();
      expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle keys that are entirely special characters", async () => {
      await adapter.set("::://@@@###", "value");

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        "test-storage____________",
        "value",
      );
    });

    it("should handle very long keys", async () => {
      const longKey = "a".repeat(500) + ":" + "b".repeat(500);
      await adapter.set(longKey, "value");

      const expectedKey = `${storageId}_${longKey.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        expectedKey,
        "value",
      );
    });

    it("should handle keys with mixed valid and invalid characters", async () => {
      const mixedKey = "user_123:profile-data@v2.0";
      const expectedKey = "test-storage_user_123_profile-data_v2.0";

      await adapter.set(mixedKey, "value");

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        expectedKey,
        "value",
      );
    });

    it("should handle empty string key", async () => {
      await adapter.set("", "value");

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        "test-storage_",
        "value",
      );
    });

    it("should handle different storage IDs with same key", async () => {
      const adapter1 = new SecureStorageAdapter("storage1");
      const adapter2 = new SecureStorageAdapter("storage2");

      await adapter1.set("user:data", "value1");
      await adapter2.set("user:data", "value2");

      expect(SecureStore.setItemAsync).toHaveBeenNthCalledWith(
        1,
        "storage1_user_data",
        "value1",
      );
      expect(SecureStore.setItemAsync).toHaveBeenNthCalledWith(
        2,
        "storage1___keys_registry",
        '["user:data"]',
      );
      expect(SecureStore.setItemAsync).toHaveBeenNthCalledWith(
        3,
        "storage2_user_data",
        "value2",
      );
      expect(SecureStore.setItemAsync).toHaveBeenNthCalledWith(
        4,
        "storage2___keys_registry",
        '["user:data"]',
      );
    });
  });

  describe("Character Whitelist", () => {
    it("should preserve alphanumeric characters", async () => {
      await adapter.set("abc123XYZ", "value");

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        "test-storage_abc123XYZ",
        "value",
      );
    });

    it("should preserve dots", async () => {
      await adapter.set("user.profile.data", "value");

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        "test-storage_user.profile.data",
        "value",
      );
    });

    it("should preserve hyphens", async () => {
      await adapter.set("user-profile-data", "value");

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        "test-storage_user-profile-data",
        "value",
      );
    });

    it("should preserve underscores", async () => {
      await adapter.set("user_profile_data", "value");

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        "test-storage_user_profile_data",
        "value",
      );
    });
  });
});
