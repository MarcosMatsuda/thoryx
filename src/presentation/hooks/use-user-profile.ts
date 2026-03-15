import { useState, useEffect, useCallback } from "react";
import {
  UserProfile,
  UserProfileInput,
} from "@domain/entities/user-profile.entity";
import { UserProfileRepositoryImpl } from "@data/repositories/user-profile.repository.impl";
import { GetUserProfileUseCase } from "@domain/use-cases/get-user-profile.use-case";
import { SaveUserProfileUseCase } from "@domain/use-cases/save-user-profile.use-case";

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const repository = new UserProfileRepositoryImpl();
  const getUserProfileUseCase = new GetUserProfileUseCase(repository);
  const saveUserProfileUseCase = new SaveUserProfileUseCase(repository);

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userProfile = await getUserProfileUseCase.execute();
      setProfile(userProfile);
    } catch (err) {
      setError("Failed to load profile");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveProfile = useCallback(async (input: UserProfileInput) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await saveUserProfileUseCase.execute(input);

      if (result.success && result.profile) {
        setProfile(result.profile);
        return { success: true, message: result.message };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      const errorMessage = "Failed to save profile";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    profile,
    isLoading,
    error,
    saveProfile,
    reloadProfile: loadProfile,
  };
}
