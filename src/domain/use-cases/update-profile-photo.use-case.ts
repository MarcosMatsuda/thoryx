import { UserProfile, UserProfileInput } from '@domain/entities/user-profile.entity';
import { UserProfileRepository } from '@domain/repositories/user-profile.repository';

export class UpdateProfilePhotoUseCase {
  constructor(private userProfileRepository: UserProfileRepository) {}

  async execute(photoUri: string | null): Promise<{ success: boolean; message: string; profile?: UserProfile }> {
    try {
      const existingProfile = await this.userProfileRepository.get();
      
      if (!existingProfile) {
        return {
          success: false,
          message: 'Profile not found. Please set up your profile first.'
        };
      }

      const profileInput: UserProfileInput = {
        name: existingProfile.name,
        photoUri: photoUri || undefined
      };

      const profile = await this.userProfileRepository.save(profileInput);
      return {
        success: true,
        message: photoUri ? 'Profile photo updated successfully' : 'Profile photo removed successfully',
        profile
      };
    } catch (error) {
      console.error('Error updating profile photo:', error);
      return {
        success: false,
        message: 'Failed to update profile photo'
      };
    }
  }
}