import * as LocalAuthentication from "expo-local-authentication";

export interface BiometryResult {
  success: boolean;
  error?: string;
  biometryType?: "fingerprint" | "facial" | "iris" | "none";
}

export class BiometryService {
  /**
   * Check if device supports biometric authentication
   */
  static async isAvailable(): Promise<boolean> {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) return false;

      const enrolled = await LocalAuthentication.isEnrolledAsync();
      return enrolled;
    } catch (error) {
      console.error("Error checking biometry availability:", error);
      return false;
    }
  }

  /**
   * Get the type of biometry available on device
   */
  static async getBiometryType(): Promise<
    "fingerprint" | "facial" | "iris" | "none"
  > {
    try {
      const types =
        await LocalAuthentication.supportedAuthenticationTypesAsync();

      if (
        types.includes(
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
        )
      ) {
        return "facial";
      }
      if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        return "fingerprint";
      }
      if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        return "iris";
      }

      return "none";
    } catch (error) {
      console.error("Error getting biometry type:", error);
      return "none";
    }
  }

  /**
   * Authenticate user with biometrics
   */
  static async authenticate(promptMessage?: string): Promise<BiometryResult> {
    try {
      const isAvailable = await this.isAvailable();

      if (!isAvailable) {
        return {
          success: false,
          error: "Biometric authentication is not available on this device",
        };
      }

      const biometryType = await this.getBiometryType();

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: promptMessage || "Authenticate to access your wallet",
        fallbackLabel: "Use PIN",
        disableDeviceFallback: true, // Disable device password fallback
        cancelLabel: "Cancel",
      });

      if (result.success) {
        return {
          success: true,
          biometryType,
        };
      } else {
        return {
          success: false,
          error: result.error || "Authentication failed",
          biometryType,
        };
      }
    } catch (error) {
      console.error("Biometry authentication error:", error);
      return {
        success: false,
        error: "An unexpected error occurred",
      };
    }
  }

  /**
   * Get user-friendly name for biometry type
   */
  static getBiometryName(
    type: "fingerprint" | "facial" | "iris" | "none",
  ): string {
    switch (type) {
      case "fingerprint":
        return "Touch ID / Fingerprint";
      case "facial":
        return "Face ID";
      case "iris":
        return "Iris Recognition";
      default:
        return "Biometric Authentication";
    }
  }
}
