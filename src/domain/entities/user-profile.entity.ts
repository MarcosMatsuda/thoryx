export interface UserProfile {
  name: string;
  photoUri?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfileInput {
  name: string;
  photoUri?: string;
}
