import * as SecureStore from 'expo-secure-store';
import { ILocalDataSource } from '@data/sources/ILocalDataSource';

export class SecureStorageAdapter<T> implements ILocalDataSource<T> {
  async get(key: string): Promise<T | null> {
    try {
      const value = await SecureStore.getItemAsync(key);
      if (!value) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Error getting item ${key} from SecureStore:`, error);
      return null;
    }
  }

  async set(key: string, value: T): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await SecureStore.setItemAsync(key, serialized);
    } catch (error) {
      console.error(`Error setting item ${key} in SecureStore:`, error);
      throw error;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error(`Error removing item ${key} from SecureStore:`, error);
      throw error;
    }
  }

  async getAll(): Promise<T[]> {
    throw new Error('SecureStore does not support listing all keys. Consider using AsyncStorage for this use case.');
  }

  async clear(): Promise<void> {
    throw new Error('SecureStore does not support clearing all items. You must remove items individually.');
  }
}
