import { HttpClient } from "@infrastructure/http/HttpClient";
import { API_ENDPOINTS, STORAGE_KEYS } from "@shared/constants/app";
import { SecureStorageAdapter } from "@infrastructure/storage/secure-storage.adapter";
import { PinRepositoryImpl } from "@data/repositories/pin.repository.impl";
import { PinResponsibilityRepositoryImpl } from "@data/repositories/pin-responsibility.repository.impl";

export class AuthService {
  private httpClient: HttpClient;
  private tokenStorage: SecureStorageAdapter;
  private userDataStorage: SecureStorageAdapter;

  constructor() {
    this.httpClient = new HttpClient({
      baseURL: API_ENDPOINTS.BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.tokenStorage = new SecureStorageAdapter(
      "auth-storage",
      "thoryx-mmkv-encryption-key-2026",
    );
    this.userDataStorage = new SecureStorageAdapter(
      "user-data-storage",
      "thoryx-mmkv-encryption-key-2026",
    );
  }

  async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      // Try to call logout endpoint
      try {
        await this.httpClient.post(API_ENDPOINTS.AUTH.LOGOUT);
      } catch (apiError) {
        console.warn(
          "Logout API call failed, proceeding with local logout:",
          apiError,
        );
        // Continue with local logout even if API fails
      }

      // Clear local authentication data
      await this.clearAuthData();

      return { success: true };
    } catch (error) {
      console.error("Error during logout:", error);
      // Even if there's an error clearing auth data, we should still try to navigate
      // But return error so UI can show it
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error during logout",
      };
    }
  }

  async deleteAccount(
    userId?: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Try to call delete account endpoint if we have a userId
      if (userId) {
        try {
          await this.httpClient.delete(API_ENDPOINTS.USERS.DELETE(userId));
        } catch (apiError) {
          console.warn("Delete account API call failed:", apiError);
          // API failed - don't clear local data, let user try again
          throw new Error(
            "Failed to delete account on server. Please check your connection and try again.",
          );
        }
      }

      // Clear all local data
      await this.clearAllData();

      return { success: true };
    } catch (error) {
      console.error("Error deleting account:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error deleting account",
      };
    }
  }

  async getToken(): Promise<string | null> {
    return await this.tokenStorage.get(STORAGE_KEYS.USER_TOKEN);
  }

  async setToken(token: string): Promise<void> {
    await this.tokenStorage.set(STORAGE_KEYS.USER_TOKEN, token);
  }

  async clearAuthData(): Promise<void> {
    // Clear token
    await this.tokenStorage.delete(STORAGE_KEYS.USER_TOKEN);

    // Clear user data
    await this.userDataStorage.clear();
  }

  async clearAllData(): Promise<void> {
    // Clear auth data
    await this.clearAuthData();

    // Storage scopes/keys below MUST match the corresponding repository
    // constructors exactly — MMKV partitions data by both the scope id and
    // the encryption key, so a mismatch here silently clears nothing.
    const creditCardStorage = new SecureStorageAdapter(
      "credit-cards-storage",
      "thoryx-mmkv-encryption-key-2026",
    );
    const documentStorage = new SecureStorageAdapter(
      "documents-storage",
      "thoryx-documents-encryption-key-2026",
    );
    const documentTypesStorage = new SecureStorageAdapter(
      "document-types-storage",
      "thoryx-doc-types-key-2026",
    );
    const emergencyStorage = new SecureStorageAdapter(
      "emergency-storage",
      "thoryx-emergency-encryption-key-2026-v1",
    );
    const profileStorage = new SecureStorageAdapter(
      "user-profile-storage",
      "thoryx-mmkv-encryption-key-2026",
    );
    const settingsStorage = new SecureStorageAdapter(
      "settings-storage",
      "thoryx-mmkv-encryption-key-2026",
    );

    await Promise.all([
      creditCardStorage.clear(),
      documentStorage.clear(),
      documentTypesStorage.clear(),
      emergencyStorage.clear(),
      profileStorage.clear(),
      settingsStorage.clear(),
      // Owns its own SecureStore keys (pin, attempts, legacy MMKV).
      new PinRepositoryImpl().delete(),
      new PinResponsibilityRepositoryImpl().clear(),
    ]);
  }
}
