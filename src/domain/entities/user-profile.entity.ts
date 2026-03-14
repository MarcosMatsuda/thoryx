export interface UserProfile {
  name: string;
  photoUri: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfileInput {
  name: string;
  photoUri?: string;
}
