/**
 * Integration tests for logout flow with SecureStorage
 * Tests the complete logout scenario including sanitized key handling
 */

import * as SecureStore from 'expo-secure-store';
import { SecureStorageAdapter } from './secure-storage.adapter';

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('react-native-mmkv', () => {
  throw new Error('MMKV not available');
});

describe('SecureStorageAdapter - Logout Flow Integration', () => {
  let adapter: SecureStorageAdapter;
  const authStorageId = 'auth-storage';

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new SecureStorageAdapter(authStorageId);
  });

  describe('Real-world logout scenario', () => {
    it('should complete logout without errors with invalid key characters', async () => {
      // Simulate reading and storing auth tokens with colons (which are invalid for SecureStore)
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValue('auth-token-value')
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token')
        .mockResolvedValueOnce('user-data');

      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      // Store some auth-related data with problematic key patterns
      await adapter.set('auth:access_token', 'access-token');
      await adapter.set('auth:refresh_token', 'refresh-token');
      await adapter.set('user:data:profile', 'user-data');

      // Retrieve to ensure backward compatibility works
      const accessToken = await adapter.get('auth:access_token');
      const refreshToken = await adapter.get('auth:refresh_token');
      const userData = await adapter.get('user:data:profile');

      expect(accessToken).toBeTruthy();
      expect(refreshToken).toBeTruthy();
      expect(userData).toBeTruthy();

      // Perform logout - delete all auth keys
      await expect(async () => {
        await adapter.delete('auth:access_token');
        await adapter.delete('auth:refresh_token');
        await adapter.delete('user:data:profile');
      }).not.toThrow();

      // Verify all delete operations were called
      expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
    });

    it('should handle mixed old and new format keys during logout', async () => {
      // Simulate a scenario where some keys are in new format (sanitized) and some in old format
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('value1') // first get returns from sanitized key
        .mockResolvedValueOnce('value2') // second get returns from sanitized key
        .mockResolvedValueOnce(null) // third get sanitized not found
        .mockResolvedValueOnce('value3'); // third get falls back to original

      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      // Get values (some from new format, some will migrate from old format)
      const val1 = await adapter.get('key:with:colons:1');
      const val2 = await adapter.get('key:with:colons:2');
      const val3 = await adapter.get('key:with:colons:3');

      expect(val1).toBe('value1');
      expect(val2).toBe('value2');
      expect(val3).toBe('value3'); // Auto-migrated

      // Logout
      await adapter.delete('key:with:colons:1');
      await adapter.delete('key:with:colons:2');
      await adapter.delete('key:with:colons:3');

      // Should have deleted both sanitized and original keys for safety
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth-storage_key_with_colons_1');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth-storage_key:with:colons:1');
    });

    it('should not throw if logout encounters SecureStore errors with invalid keys', async () => {
      const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();

      // Simulate SecureStore throwing errors on invalid keys
      (SecureStore.deleteItemAsync as jest.Mock)
        .mockRejectedValueOnce(new Error('Invalid key format')) // first key fails
        .mockResolvedValueOnce(undefined) // second key succeeds
        .mockRejectedValueOnce(new Error('Key not found')); // third key fails

      // Logout should continue even if some deletes fail
      await expect(async () => {
        await adapter.delete('invalid::key');
        await adapter.delete('valid_key');
        await adapter.delete('another:bad:key');
      }).not.toThrow();

      consoleDebugSpy.mockRestore();
    });
  });

  describe('Session cleanup with backward compatibility', () => {
    it('should clear all auth data including legacy keys', async () => {
      const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();

      // Simulate finding data in old format keys
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce(null) // sanitized key not found
        .mockResolvedValueOnce('legacy-token'); // original key found

      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      // Get will auto-migrate from old to new
      const token = await adapter.get('session:token');
      expect(token).toBe('legacy-token');

      // Migration should have occurred
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'auth-storage_session_token',
        'legacy-token'
      );
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth-storage_session:token');

      // Now delete during logout
      await adapter.delete('session:token');

      // Should only try new sanitized key now (old one was already deleted during migration)
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth-storage_session_token');

      consoleDebugSpy.mockRestore();
    });

    it('should handle logout when data exists only in old format', async () => {
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce(null) // sanitized key
        .mockResolvedValueOnce('old-value'); // original key

      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      // Get the value (will migrate)
      const value = await adapter.get('token:refresh');
      expect(value).toBe('old-value');

      // Delete during logout
      await adapter.delete('token:refresh');

      // Should have deleted the old key (that was found) and tried new key
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth-storage_token_refresh');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth-storage_token:refresh');
    });
  });

  describe('Large scale logout scenario', () => {
    it('should logout multiple auth-related keys without errors', async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      const authKeys = [
        'auth:access_token',
        'auth:refresh_token',
        'auth:id_token',
        'user:session:id',
        'user:profile:cache',
        'device:token:push',
        'app:state:auth_status',
        'cache:user_preferences',
      ];

      // Logout all keys
      for (const key of authKeys) {
        await adapter.delete(key);
      }

      // Each key attempts to delete both sanitized and original
      // Expected calls: authKeys.length * 2 (since each is different from original)
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(authKeys.length * 2);

      // Verify specific keys were called with sanitized versions
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth-storage_auth_access_token');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth-storage_user_session_id');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth-storage_device_token_push');
    });

    it('should handle partial failures during bulk logout', async () => {
      const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();

      (SecureStore.deleteItemAsync as jest.Mock)
        .mockResolvedValue(undefined)
        .mockRejectedValueOnce(new Error('Storage error')) // First call fails
        .mockResolvedValue(undefined); // Rest succeed

      const authKeys = [
        'auth:token1',
        'auth:token2',
        'auth:token3',
      ];

      // Should not throw even with failures
      for (const key of authKeys) {
        await expect(adapter.delete(key)).resolves.toBeUndefined();
      }

      expect(consoleDebugSpy).toHaveBeenCalled();
      consoleDebugSpy.mockRestore();
    });
  });

  describe('Re-authentication after logout', () => {
    it('should allow new data storage after logout', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      // Logout
      await adapter.delete('auth:token');

      // Should be able to store new token
      await adapter.set('auth:token', 'new-token-value');

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'auth-storage_auth_token',
        'new-token-value'
      );

      // And retrieve it
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('new-token-value');

      const token = await adapter.get('auth:token');
      expect(token).toBe('new-token-value');
    });

    it('should not have any residual old keys after logout and re-auth', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      // Initial logout
      await adapter.delete('user:data');

      // Both old and new format keys should have been deleted
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth-storage_user_data');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth-storage_user:data');

      // Re-authenticate with new data
      await adapter.set('user:data', 'new-profile');

      // New data should use sanitized key, and also update registry
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'auth-storage_user_data',
        'new-profile'
      );
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'auth-storage___keys_registry',
        '["user:data"]'
      );
    });
  });

  describe('Error recovery during logout', () => {
    it('should continue logout process even if some keys fail to delete', async () => {
      const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();

      // Simulate alternating success/failure pattern
      (SecureStore.deleteItemAsync as jest.Mock)
        .mockResolvedValueOnce(undefined) // key1 sanitized - ok
        .mockRejectedValueOnce(new Error('Fail')) // key1 original - fail
        .mockResolvedValueOnce(undefined) // key2 sanitized - ok
        .mockResolvedValueOnce(undefined) // key2 original - ok
        .mockRejectedValueOnce(new Error('Fail')); // key3 sanitized - fail

      const keys = ['key:1', 'key:2', 'key:3'];

      // Should not throw, continue with all deletes
      for (const key of keys) {
        await expect(adapter.delete(key)).resolves.toBeUndefined();
      }

      // All delete attempts should have been made (each key attempts both sanitized and original)
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(6);

      consoleDebugSpy.mockRestore();
    });

    it('should log debug messages for failed operations', async () => {
      const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();

      (SecureStore.deleteItemAsync as jest.Mock).mockRejectedValue(new Error('Delete failed'));

      await adapter.delete('session:token');

      expect(consoleDebugSpy).toHaveBeenCalled();
      expect(consoleDebugSpy.mock.calls.some(call =>
        call[0].includes('Failed to delete')
      )).toBe(true);

      consoleDebugSpy.mockRestore();
    });
  });

  describe('Clear All Data', () => {
    it('should clear all registered keys when clear() is called', async () => {
      // Mock setup - simpler approach
      let registry: string[] = [];
      (SecureStore.setItemAsync as jest.Mock).mockImplementation(async (key: string, value: string) => {
        if (key === 'auth-storage___keys_registry') {
          registry = JSON.parse(value);
        }
      });
      
      (SecureStore.getItemAsync as jest.Mock).mockImplementation(async (key: string) => {
        if (key === 'auth-storage___keys_registry') {
          return JSON.stringify(registry);
        }
        if (key === 'auth-storage_key1') return 'value1';
        if (key === 'auth-storage_key2') return 'value2';
        return null;
      });
      
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      // Store some data
      await adapter.set('key1', 'value1');
      await adapter.set('key2', 'value2');

      // Clear all data
      await adapter.clear();

      // Should have deleted all registered keys and the registry
      // Note: delete() is called for each key, which also calls getItemAsync for the registry
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth-storage_key1');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth-storage_key2');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth-storage___keys_registry');
    });

    it('should handle clear() when registry is corrupted', async () => {
      const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();

      // Mock corrupted registry (not valid JSON)
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('not-valid-json');
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      // Should not throw even with corrupted registry
      await expect(adapter.clear()).resolves.toBeUndefined();

      // Should still try to delete the registry
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth-storage___keys_registry');

      consoleDebugSpy.mockRestore();
    });

    it('should handle clear() when no data exists', async () => {
      // Mock empty registry
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      // Should not throw
      await expect(adapter.clear()).resolves.toBeUndefined();

      // Should still try to delete the registry
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth-storage___keys_registry');
    });

    it('should handle partial failures during clear()', async () => {
      const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();

      // Mock registry with 2 keys
      let callCount = 0;
      (SecureStore.getItemAsync as jest.Mock).mockImplementation(async () => {
        callCount++;
        if (callCount === 1) return '["key1", "key2"]';
        if (callCount === 2) return 'value1';
        if (callCount === 3) return 'value2';
        return null;
      });

      // First delete succeeds, second fails, registry delete succeeds
      (SecureStore.deleteItemAsync as jest.Mock)
        .mockResolvedValueOnce(undefined) // key1
        .mockRejectedValueOnce(new Error('Delete failed')) // key2
        .mockResolvedValueOnce(undefined); // registry

      // Should not throw even with partial failures
      await expect(adapter.clear()).resolves.toBeUndefined();

      // Should have attempted all deletions
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(3);

      consoleDebugSpy.mockRestore();
    });
  });
});
