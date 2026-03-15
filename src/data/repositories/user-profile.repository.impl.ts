import { UserProfile, UserProfileInput } from '@domain/entities/user-profile.entity';
import { UserProfileRepository } from '@domain/repositories/user-profile.repository';
import { SecureStorageAdapter } from '@infrastructure/storage/secure-storage.adapter';

export class UserProfileRepositoryImpl implements UserProfileRepository {
  private storage: SecureStorageAdapter;
  private readonly PROFILE_KEY = 'user_profile';

  constructor() {
    this.storage = new SecureStorageAdapter(
      'user-profile-storage',
      'thoryx-mmkv-encryption-key-2026'
    );
  }

  async save(profileInput: UserProfileInput): Promise<UserProfile> {
    try {
      const existingProfile = await this.get();
      
      const profile: UserProfile = {
        name: profileInput.name,
        photoUri: profileInput.photoUri ?? existingProfile?.photoUri ?? null,
        createdAt: existingProfile?.createdAt || new Date(),
        updatedAt: new Date()
      };

      await this.storage.set(this.PROFILE_KEY, JSON.stringify(profile));
      return profile;
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw new Error('Failed to save user profile');
    }
  }

  async get(): Promise<UserProfile | null> {
    try {
      const profileJson = await this.storage.get(this.PROFILE_KEY);
      if (!profileJson) {
        return null;
      }

      const profile = JSON.parse(profileJson);
      return {
        ...profile,
        createdAt: new Date(profile.createdAt),
        updatedAt: new Date(profile.updatedAt)
      };
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  }

  async exists(): Promise<boolean> {
    try {
      const profile = await this.get();
      return profile !== null;
    } catch (error) {
      return false;
    }
  }
}
