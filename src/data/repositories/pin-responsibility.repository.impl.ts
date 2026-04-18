import * as SecureStore from "expo-secure-store";
import { PinResponsibilityRepository } from "@domain/repositories/pin-responsibility.repository";

const RESPONSIBILITY_KEY = "thoryx_pin_responsibility_accepted_at";

export class PinResponsibilityRepositoryImpl implements PinResponsibilityRepository {
  async accept(timestamp: number): Promise<void> {
    await SecureStore.setItemAsync(RESPONSIBILITY_KEY, String(timestamp));
  }

  async isAccepted(): Promise<boolean> {
    const value = await SecureStore.getItemAsync(RESPONSIBILITY_KEY);
    return value !== null && value !== "";
  }

  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(RESPONSIBILITY_KEY);
  }
}
