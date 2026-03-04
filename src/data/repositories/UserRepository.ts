import { User } from '@domain/entities/User';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { ILocalDataSource } from '@data/sources/ILocalDataSource';
import { UserDTO, UserModel } from '@data/models/UserModel';

export class UserRepository implements IUserRepository {
  private readonly STORAGE_KEY = 'users';

  constructor(private readonly localDataSource: ILocalDataSource<UserDTO>) {}

  async findById(id: string): Promise<User | null> {
    const users = await this.localDataSource.getAll();
    const userDTO = users.find(u => u.id === id);
    
    if (!userDTO) {
      return null;
    }

    return UserModel.toDomain(userDTO);
  }

  async findByEmail(email: string): Promise<User | null> {
    const users = await this.localDataSource.getAll();
    const userDTO = users.find(u => u.email === email);
    
    if (!userDTO) {
      return null;
    }

    return UserModel.toDomain(userDTO);
  }

  async save(user: User): Promise<void> {
    const userDTO = UserModel.toDTO(user);
    await this.localDataSource.set(`${this.STORAGE_KEY}_${user.id}`, userDTO);
  }

  async delete(id: string): Promise<void> {
    await this.localDataSource.remove(`${this.STORAGE_KEY}_${id}`);
  }

  async findAll(): Promise<User[]> {
    const usersDTO = await this.localDataSource.getAll();
    return usersDTO.map(dto => UserModel.toDomain(dto));
  }
}
