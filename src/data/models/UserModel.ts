import { User } from "@domain/entities/User";

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export class UserModel {
  static toDomain(dto: UserDTO): User {
    return {
      id: dto.id,
      name: dto.name,
      email: dto.email,
      createdAt: new Date(dto.created_at),
    };
  }

  static toDTO(user: User): UserDTO {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.createdAt.toISOString(),
    };
  }
}
