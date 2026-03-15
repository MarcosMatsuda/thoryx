import { UserProfile } from '@domain/entities/user-profile.entity';
import { UserProfileRepository } from '@domain/repositories/user-profile.repository';

export class GetUserProfileUseCase {
  constructor(private userProfileRepository: UserProfileRepository) {}

  async execute(): Promise<UserProfile | null> {
    try {
      return await this.userProfileRepository.get();
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }
}
