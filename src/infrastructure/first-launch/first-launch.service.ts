import * as SecureStore from "expo-secure-store";

// MMKV data lives in the app sandbox and is cleared by the OS on app uninstall,
// so it is the correct place to persist "has this install ever launched?".
// SecureStore (Keychain on iOS) survives uninstall and is unsuitable for this flag.
let MMKV: any = null;
try {
  MMKV = require("react-native-mmkv").MMKV;
} catch {
  MMKV = null;
}

const STORAGE_ID = "thoryx-first-launch";
const FLAG_KEY = "first_launch_completed_at";

const SECURE_KEYS_TO_WIPE = [
  "thoryx_user_pin_v2",
  "thoryx_pin_attempts_v2",
  "thoryx_pin_responsibility_accepted_at",
];

export class FirstLaunchService {
  private static instance: any = null;

  private static getInstance(): any {
    if (!MMKV) {
      return null;
    }
    if (!FirstLaunchService.instance) {
      FirstLaunchService.instance = new MMKV({ id: STORAGE_ID });
    }
    return FirstLaunchService.instance;
  }

  static isFirstLaunch(): boolean {
    const instance = FirstLaunchService.getInstance();
    if (!instance) {
      return false;
    }
    const value = instance.getString(FLAG_KEY);
    return !value;
  }

  static markLaunched(): void {
    const instance = FirstLaunchService.getInstance();
    if (!instance) {
      return;
    }
    instance.set(FLAG_KEY, String(Date.now()));
  }

  static async wipeResidualSecureStore(): Promise<void> {
    await Promise.all(
      SECURE_KEYS_TO_WIPE.map(async (key) => {
        try {
          await SecureStore.deleteItemAsync(key);
        } catch {
          // ignore — nothing to clean if key doesn't exist
        }
      }),
    );
  }

  static async handleIfFresh(): Promise<boolean> {
    if (!FirstLaunchService.isFirstLaunch()) {
      return false;
    }
    await FirstLaunchService.wipeResidualSecureStore();
    FirstLaunchService.markLaunched();
    return true;
  }
}
