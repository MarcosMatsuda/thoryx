import * as SecureStore from 'expo-secure-store';

let MMKV: any = null;

try {
  MMKV = require('react-native-mmkv').MMKV;
  console.log('MMKV available - using high-performance storage');
} catch (error) {
  console.log('MMKV not available - using SecureStore fallback');
}

export class SecureStorageAdapter {
  private mmkvInstance: any = null;
  private readonly storageId: string;

  constructor(storageId: string, encryptionKey?: string) {
    this.storageId = storageId;
    
    if (MMKV) {
      try {
        this.mmkvInstance = new MMKV({
          id: storageId,
          encryptionKey: encryptionKey
        });
      } catch (error) {
        console.log('Failed to initialize MMKV, falling back to SecureStore:', error);
        this.mmkvInstance = null;
      }
    }
  }

  private sanitizeKeyForSecureStore(key: string): string {
    // SecureStore requires keys to contain only alphanumeric characters, ".", "-", and "_"
    // Replace any invalid characters with "_"
    return key.replace(/[^a-zA-Z0-9._-]/g, '_');
  }

  private getSecureStoreKeys(key: string): { original: string; sanitized: string } {
    const storageKey = `${this.storageId}_${key}`;
    const sanitizedKey = this.sanitizeKeyForSecureStore(storageKey);
    return { original: storageKey, sanitized: sanitizedKey };
  }

  async set(key: string, value: string): Promise<void> {
    if (this.mmkvInstance) {
      this.mmkvInstance.set(key, value);
    } else {
      const { sanitized } = this.getSecureStoreKeys(key);
      await SecureStore.setItemAsync(sanitized, value);
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.mmkvInstance) {
      return this.mmkvInstance.getString(key) || null;
    } else {
      const { original, sanitized } = this.getSecureStoreKeys(key);
      
      // Try sanitized key first (new format)
      let value = await SecureStore.getItemAsync(sanitized);
      
      // If not found and keys are different, try original key for backward compatibility
      if (value === null && original !== sanitized) {
        try {
          value = await SecureStore.getItemAsync(original);
          // If found with original key, migrate to sanitized key
          if (value !== null) {
            await SecureStore.setItemAsync(sanitized, value);
            await SecureStore.deleteItemAsync(original);
          }
        } catch (error) {
          // Original key might be invalid for SecureStore, ignore and return null
          console.debug('Failed to read with original key, likely invalid characters:', error);
        }
      }
      
      return value;
    }
  }

  async delete(key: string): Promise<void> {
    if (this.mmkvInstance) {
      this.mmkvInstance.delete(key);
    } else {
      const { original, sanitized } = this.getSecureStoreKeys(key);
      
      // Try to delete with both keys to ensure cleanup
      try {
        await SecureStore.deleteItemAsync(sanitized);
      } catch (error) {
        console.debug('Failed to delete with sanitized key:', error);
      }
      
      // Also try original key for backward compatibility
      if (original !== sanitized) {
        try {
          await SecureStore.deleteItemAsync(original);
        } catch (error) {
          // Original key might be invalid for SecureStore, ignore
          console.debug('Failed to delete with original key, likely invalid characters:', error);
        }
      }
    }
  }

  async clear(): Promise<void> {
    if (this.mmkvInstance) {
      this.mmkvInstance.clearAll();
    }
  }
}
