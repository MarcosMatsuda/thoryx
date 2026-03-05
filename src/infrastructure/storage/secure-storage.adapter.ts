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

  async set(key: string, value: string): Promise<void> {
    const storageKey = `${this.storageId}_${key}`;
    
    if (this.mmkvInstance) {
      this.mmkvInstance.set(key, value);
    } else {
      await SecureStore.setItemAsync(storageKey, value);
    }
  }

  async get(key: string): Promise<string | null> {
    const storageKey = `${this.storageId}_${key}`;
    
    if (this.mmkvInstance) {
      return this.mmkvInstance.getString(key) || null;
    } else {
      return await SecureStore.getItemAsync(storageKey);
    }
  }

  async delete(key: string): Promise<void> {
    const storageKey = `${this.storageId}_${key}`;
    
    if (this.mmkvInstance) {
      this.mmkvInstance.delete(key);
    } else {
      await SecureStore.deleteItemAsync(storageKey);
    }
  }

  async clear(): Promise<void> {
    if (this.mmkvInstance) {
      this.mmkvInstance.clearAll();
    }
  }
}
