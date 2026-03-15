export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export class UserEntity implements User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly createdAt: Date
  ) {}

  static create(props: Omit<User, 'id' | 'createdAt'>): UserEntity {
    return new UserEntity(
      crypto.randomUUID(),
      props.name,
      props.email,
      new Date()
    );
  }

  isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }
}
