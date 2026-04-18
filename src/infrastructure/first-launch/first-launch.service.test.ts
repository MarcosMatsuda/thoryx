import * as SecureStore from "expo-secure-store";
import { FirstLaunchService } from "./first-launch.service";

describe("FirstLaunchService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (FirstLaunchService as unknown as { instance: null }).instance = null;
  });

  describe("when MMKV is available", () => {
    it("handleIfFresh wipes SecureStore on first launch and marks launched", async () => {
      const wiped = await FirstLaunchService.handleIfFresh();

      // MMKV mock returns null for getString so the service treats this as fresh
      expect(wiped).toBe(true);
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

    it("wipeResidualSecureStore swallows individual delete errors", async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockRejectedValueOnce(
        new Error("not present"),
      );

      await expect(
        FirstLaunchService.wipeResidualSecureStore(),
      ).resolves.toBeUndefined();
    });
  });
});
