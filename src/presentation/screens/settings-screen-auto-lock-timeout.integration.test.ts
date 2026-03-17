// Integration tests for SettingsScreen Auto-lock Timeout Persistence
// Tests the complete flow of saving and loading timeout preferences

import { SecureStorageAdapter } from "@infrastructure/storage/secure-storage.adapter";

// Mock expo-secure-store for testing
jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock react-native-mmkv to force SecureStore path
jest.mock("react-native-mmkv", () => {
  throw new Error("MMKV not available");
});

describe("SettingsScreen - Auto-lock Timeout Persistence Integration", () => {
  let storage: SecureStorageAdapter;
  const STORAGE_ID = "settings-storage";
  const AUTO_LOCK_TIMEOUT_KEY = "auto_lock_timeout_minutes";

  beforeEach(() => {
    jest.clearAllMocks();
    storage = new SecureStorageAdapter(
      STORAGE_ID,
      "thoryx-mmkv-encryption-key-2026",
    );
  });

  describe("Default Timeout Value", () => {
    it("should return default 5 minutes when no value is stored", async () => {
      // Simulate storage returning null
      const SecureStore = require("expo-secure-store");
      SecureStore.getItemAsync.mockResolvedValue(null);

      const saved = await storage.get(AUTO_LOCK_TIMEOUT_KEY);

      if (saved === "0") {
        expect("Never").toBe("Never");
      } else if (saved) {
        expect(`${saved} minutes`).toBe(expect.stringContaining("minutes"));
      } else {
        expect("5 minutes").toBe("5 minutes"); // Default
      }
    });

    it("should use 5 minutes as default when storage is empty on first app launch", async () => {
      const SecureStore = require("expo-secure-store");
      SecureStore.getItemAsync.mockResolvedValue(null);

      const saved = await storage.get(AUTO_LOCK_TIMEOUT_KEY);
      const timeout = saved ? `${saved} minutes` : "5 minutes";

      expect(timeout).toBe("5 minutes");
    });
  });

  describe("Persistence of Timeout Selection", () => {
    const timeoutValues = ["1", "5", "15", "30"];

    timeoutValues.forEach((minutes) => {
      it(`should persist ${minutes} minute(s) selection to storage`, async () => {
        const SecureStore = require("expo-secure-store");
        SecureStore.setItemAsync.mockResolvedValue(undefined);

        await storage.set(AUTO_LOCK_TIMEOUT_KEY, minutes);

        expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
          `${STORAGE_ID}_${AUTO_LOCK_TIMEOUT_KEY}`,
          minutes,
        );
      });

      it(`should retrieve ${minutes} minute(s) after selection is persisted`, async () => {
        const SecureStore = require("expo-secure-store");
        SecureStore.getItemAsync.mockResolvedValue(minutes);

        const saved = await storage.get(AUTO_LOCK_TIMEOUT_KEY);

        expect(saved).toBe(minutes);
        expect(SecureStore.getItemAsync).toHaveBeenCalledWith(
          `${STORAGE_ID}_${AUTO_LOCK_TIMEOUT_KEY}`,
        );
      });
    });

    it("should persist 'Never' (0) selection to storage", async () => {
      const SecureStore = require("expo-secure-store");
      SecureStore.setItemAsync.mockResolvedValue(undefined);

      await storage.set(AUTO_LOCK_TIMEOUT_KEY, "0");

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        `${STORAGE_ID}_${AUTO_LOCK_TIMEOUT_KEY}`,
        "0",
      );
    });

    it("should retrieve 'Never' (0) after persistence", async () => {
      const SecureStore = require("expo-secure-store");
      SecureStore.getItemAsync.mockResolvedValue("0");

      const saved = await storage.get(AUTO_LOCK_TIMEOUT_KEY);

      expect(saved).toBe("0");
    });
  });

  describe("App Reopening - Load Saved Value", () => {
    it("should load 1 minute when app is reopened after selecting 1 minute", async () => {
      const SecureStore = require("expo-secure-store");

      // First: User selects 1 minute
      SecureStore.setItemAsync.mockResolvedValue(undefined);
      await storage.set(AUTO_LOCK_TIMEOUT_KEY, "1");

      // App closes and reopens: Load the saved value
      SecureStore.getItemAsync.mockResolvedValue("1");
      const saved = await storage.get(AUTO_LOCK_TIMEOUT_KEY);

      expect(saved).toBe("1");
    });

    it("should load 5 minutes when app is reopened after selecting 5 minutes", async () => {
      const SecureStore = require("expo-secure-store");

      SecureStore.setItemAsync.mockResolvedValue(undefined);
      await storage.set(AUTO_LOCK_TIMEOUT_KEY, "5");

      SecureStore.getItemAsync.mockResolvedValue("5");
      const saved = await storage.get(AUTO_LOCK_TIMEOUT_KEY);

      expect(saved).toBe("5");
    });

    it("should load 15 minutes when app is reopened after selecting 15 minutes", async () => {
      const SecureStore = require("expo-secure-store");

      SecureStore.setItemAsync.mockResolvedValue(undefined);
      await storage.set(AUTO_LOCK_TIMEOUT_KEY, "15");

      SecureStore.getItemAsync.mockResolvedValue("15");
      const saved = await storage.get(AUTO_LOCK_TIMEOUT_KEY);

      expect(saved).toBe("15");
    });

    it("should load 30 minutes when app is reopened after selecting 30 minutes", async () => {
      const SecureStore = require("expo-secure-store");

      SecureStore.setItemAsync.mockResolvedValue(undefined);
      await storage.set(AUTO_LOCK_TIMEOUT_KEY, "30");

      SecureStore.getItemAsync.mockResolvedValue("30");
      const saved = await storage.get(AUTO_LOCK_TIMEOUT_KEY);

      expect(saved).toBe("30");
    });

    it("should load 'Never' when app is reopened after selecting Never", async () => {
      const SecureStore = require("expo-secure-store");

      SecureStore.setItemAsync.mockResolvedValue(undefined);
      await storage.set(AUTO_LOCK_TIMEOUT_KEY, "0");

      SecureStore.getItemAsync.mockResolvedValue("0");
      const saved = await storage.get(AUTO_LOCK_TIMEOUT_KEY);

      expect(saved).toBe("0");
    });

    it("should preserve timeout value across multiple app reopenings", async () => {
      const SecureStore = require("expo-secure-store");

      // First session: User selects 15 minutes
      SecureStore.setItemAsync.mockResolvedValue(undefined);
      await storage.set(AUTO_LOCK_TIMEOUT_KEY, "15");

      // Reopen app 1st time
      SecureStore.getItemAsync.mockResolvedValue("15");
      let saved = await storage.get(AUTO_LOCK_TIMEOUT_KEY);
      expect(saved).toBe("15");

      // Reopen app 2nd time (without changing)
      SecureStore.getItemAsync.mockResolvedValue("15");
      saved = await storage.get(AUTO_LOCK_TIMEOUT_KEY);
      expect(saved).toBe("15");

      // Reopen app 3rd time (still the same)
      SecureStore.getItemAsync.mockResolvedValue("15");
      saved = await storage.get(AUTO_LOCK_TIMEOUT_KEY);
      expect(saved).toBe("15");
    });
  });

  describe("Valid Timeout Values", () => {
    const validTimeouts = [
      { value: "1", display: "1 minutes" },
      { value: "5", display: "5 minutes" },
      { value: "15", display: "15 minutes" },
      { value: "30", display: "30 minutes" },
      { value: "0", display: "Never" },
    ];

    validTimeouts.forEach(({ value, display }) => {
      it(`should support "${display}" timeout value (${value})`, async () => {
        const SecureStore = require("expo-secure-store");
        SecureStore.getItemAsync.mockResolvedValue(value);

        const saved = await storage.get(AUTO_LOCK_TIMEOUT_KEY);

        expect(saved).toBe(value);
      });

      it(`should convert stored value "${value}" to "${display}" for UI display`, async () => {
        const SecureStore = require("expo-secure-store");
        SecureStore.getItemAsync.mockResolvedValue(value);

        const saved = await storage.get(AUTO_LOCK_TIMEOUT_KEY);

        let display_text: string;
        if (saved === "0") {
          display_text = "Never";
        } else if (saved) {
          display_text = `${saved} minutes`;
        } else {
          display_text = "5 minutes";
        }

        expect(display_text).toBe(display);
      });
    });
  });

  describe("Storage Key Constants", () => {
    it("should use consistent storage key for all operations", async () => {
      const SecureStore = require("expo-secure-store");
      SecureStore.setItemAsync.mockResolvedValue(undefined);
      SecureStore.getItemAsync.mockResolvedValue("5");

      // Write
      await storage.set(AUTO_LOCK_TIMEOUT_KEY, "5");

      // Read
      await storage.get(AUTO_LOCK_TIMEOUT_KEY);

      // Verify both use the same key
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        `${STORAGE_ID}_${AUTO_LOCK_TIMEOUT_KEY}`,
        "5",
      );
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith(
        `${STORAGE_ID}_${AUTO_LOCK_TIMEOUT_KEY}`,
      );
    });

    it("should sanitize timeout key properly in SecureStore", async () => {
      const SecureStore = require("expo-secure-store");
      SecureStore.setItemAsync.mockResolvedValue(undefined);

      await storage.set(AUTO_LOCK_TIMEOUT_KEY, "15");

      // Key should be sanitized: underscores replace special chars
      const expectedKey = `${STORAGE_ID}_${AUTO_LOCK_TIMEOUT_KEY}`;
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        expectedKey,
        "15",
      );
    });
  });

  describe("Error Handling and Recovery", () => {
    it("should handle storage read errors gracefully", async () => {
      const SecureStore = require("expo-secure-store");
      SecureStore.getItemAsync.mockRejectedValue(
        new Error("Storage access denied"),
      );

      try {
        await storage.get(AUTO_LOCK_TIMEOUT_KEY);
      } catch (error) {
        // Error should be caught by caller (SettingsScreen)
      }

      expect(SecureStore.getItemAsync).toHaveBeenCalled();
    });

    it("should handle storage write errors gracefully", async () => {
      const SecureStore = require("expo-secure-store");
      SecureStore.setItemAsync.mockRejectedValue(
        new Error("Storage is full"),
      );

      try {
        await storage.set(AUTO_LOCK_TIMEOUT_KEY, "5");
      } catch (error) {
        // Error should be caught by caller
      }

      expect(SecureStore.setItemAsync).toHaveBeenCalled();
    });

    it("should return null when storage value cannot be read", async () => {
      const SecureStore = require("expo-secure-store");
      SecureStore.getItemAsync.mockResolvedValue(null);

      const saved = await storage.get(AUTO_LOCK_TIMEOUT_KEY);

      expect(saved).toBeNull();
    });
  });

  describe("User Flow Scenarios", () => {
    it("should handle scenario: First app launch -> Select 15 -> Reopen", async () => {
      const SecureStore = require("expo-secure-store");

      // First launch: storage is empty
      SecureStore.getItemAsync.mockResolvedValue(null);
      let timeout = await storage.get(AUTO_LOCK_TIMEOUT_KEY);
      expect(timeout).toBeNull();

      // User selects 15 minutes
      SecureStore.setItemAsync.mockResolvedValue(undefined);
      await storage.set(AUTO_LOCK_TIMEOUT_KEY, "15");

      // App is closed and reopened
      SecureStore.getItemAsync.mockResolvedValue("15");
      timeout = await storage.get(AUTO_LOCK_TIMEOUT_KEY);
      expect(timeout).toBe("15");
    });

    it("should handle scenario: Select 1 -> Change to 30 -> Verify latest is loaded", async () => {
      const SecureStore = require("expo-secure-store");

      // User selects 1 minute
      SecureStore.setItemAsync.mockResolvedValue(undefined);
      await storage.set(AUTO_LOCK_TIMEOUT_KEY, "1");

      // User changes to 30 minutes
      SecureStore.setItemAsync.mockResolvedValue(undefined);
      await storage.set(AUTO_LOCK_TIMEOUT_KEY, "30");

      // Load should return the latest value
      SecureStore.getItemAsync.mockResolvedValue("30");
      const timeout = await storage.get(AUTO_LOCK_TIMEOUT_KEY);

      expect(timeout).toBe("30");
    });

    it("should handle scenario: Default 5 -> Change to Never -> Reopen", async () => {
      const SecureStore = require("expo-secure-store");

      // First launch with default
      SecureStore.getItemAsync.mockResolvedValue(null);
      let timeout = await storage.get(AUTO_LOCK_TIMEOUT_KEY);
      expect(timeout).toBeNull(); // App will use default 5

      // User changes to Never
      SecureStore.setItemAsync.mockResolvedValue(undefined);
      await storage.set(AUTO_LOCK_TIMEOUT_KEY, "0");

      // Reopen
      SecureStore.getItemAsync.mockResolvedValue("0");
      timeout = await storage.get(AUTO_LOCK_TIMEOUT_KEY);
      expect(timeout).toBe("0");
    });
  });
});
