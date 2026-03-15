import {
  UserProfile,
  UserProfileInput,
} from "@domain/entities/user-profile.entity";

export interface UserProfileRepository {
  save(profile: UserProfileInput): Promise<UserProfile>;
  get(): Promise<UserProfile | null>;
  exists(): Promise<boolean>;
}
