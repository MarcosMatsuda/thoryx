export class LegacyPinService {
  static decrypt(encryptedPin: string): string {
    if (!encryptedPin || typeof encryptedPin !== "string") {
      throw new Error("Invalid encrypted PIN");
    }
    const [encoded] = encryptedPin.split(":");
    if (!encoded) {
      throw new Error("Invalid encrypted PIN format");
    }
    return decodeURIComponent(escape(atob(encoded)));
  }
}
