import { UserProfile, UserProfileInput } from '@domain/entities/user-profile.entity';
import { UserProfileRepository } from '@domain/repositories/user-profile.repository';

export class SaveUserProfileUseCase {
  constructor(private userProfileRepository: UserProfileRepository) {}

  async execute(input: UserProfileInput): Promise<{ success: boolean; message: string; profile?: UserProfile }> {
    if (!input.name || input.name.trim().length === 0) {
      return {
        success: false,
        message: 'Name is required'
      };
    }

    if (input.name.trim().length < 2) {
      return {
        success: false,
        message: 'Name must be at least 2 characters'
      };
    }

    try {
      const profile = await this.userProfileRepository.save(input);
      return {
        success: true,
        message: 'Profile saved successfully',
        profile
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to save profile'
      };
    }
  }
}
