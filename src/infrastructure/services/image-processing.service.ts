import * as ImageManipulator from "expo-image-manipulator";
import { EncryptionService } from "@infrastructure/security/encryption.service";

export class ImageProcessingService {
  static async compressAndEncrypt(imageUri: string): Promise<string> {
    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 1200 } }],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
        },
      );

      const base64Image = await this.imageToBase64(manipulatedImage.uri);

      const encryptedImage = await EncryptionService.encrypt(base64Image);

      return encryptedImage;
    } catch (error) {
      console.error("Error compressing and encrypting image:", error);
      throw new Error("Failed to process image");
    }
  }

  static async decryptAndDecode(encryptedImage: string): Promise<string> {
    try {
      const base64Image = await EncryptionService.decrypt(encryptedImage);

      return `data:image/jpeg;base64,${base64Image}`;
    } catch (error) {
      console.error("Error decrypting image:", error);
      throw new Error("Failed to decrypt image");
    }
  }

  private static async imageToBase64(uri: string): Promise<string> {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error converting image to base64:", error);
      throw new Error("Failed to convert image");
    }
  }
}
