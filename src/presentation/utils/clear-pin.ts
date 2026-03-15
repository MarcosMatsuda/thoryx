import { PinRepositoryImpl } from "@data/repositories/pin.repository.impl";

/**
 * Utility function to clear corrupted PIN from storage
 * Use this if you encounter PIN verification errors
 */
export async function clearPin(): Promise<void> {
  try {
    const repository = new PinRepositoryImpl();
    await repository.delete();
    console.log("✅ PIN cleared successfully");
  } catch (error) {
    console.error("❌ Error clearing PIN:", error);
  }
}
