import { User } from '@domain/entities/User';
import { IUserRepository } from '@domain/repositories/IUserRepository';

export class GetUserByIdUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<User | null> {
    if (!userId || userId.trim() === '') {
      throw new Error('User ID is required');
    }

    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      return null;
    }

    return user;
  }
}
