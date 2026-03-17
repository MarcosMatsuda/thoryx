import { create } from "zustand";
import {
  UserProfile,
  UserProfileInput,
} from "@domain/entities/user-profile.entity";
import { UserProfileRepositoryImpl } from "@data/repositories/user-profile.repository.impl";
import { GetUserProfileUseCase } from "@domain/use-cases/get-user-profile.use-case";
import { SaveUserProfileUseCase } from "@domain/use-cases/save-user-profile.use-case";

interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  loadProfile: () => Promise<void>;
  saveProfile: (
    input: UserProfileInput,
  ) => Promise<{ success: boolean; message: string }>;
  reset: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => {
  const repository = new UserProfileRepositoryImpl();
  const getUserProfileUseCase = new GetUserProfileUseCase(repository);
  const saveUserProfileUseCase = new SaveUserProfileUseCase(repository);

  return {
    profile: null,
    isLoading: false,
    error: null,

    loadProfile: async () => {
      try {
        set({ isLoading: true, error: null });
        const profile = await getUserProfileUseCase.execute();
        set({ profile, isLoading: false });
      } catch (error) {
        console.error("Error loading profile:", error);
        set({ error: "Failed to load profile", isLoading: false });
      }
    },

    saveProfile: async (input: UserProfileInput) => {
      try {
        set({ isLoading: true, error: null });
        const result = await saveUserProfileUseCase.execute(input);

        if (result.success && result.profile) {
          set({ profile: result.profile, isLoading: false });
          return { success: true, message: result.message };
        } else {
          set({ error: result.message, isLoading: false });
          return { success: false, message: result.message };
        }
      } catch (error) {
        console.error("Error saving profile:", error);
        const errorMessage = "Failed to save profile";
        set({ error: errorMessage, isLoading: false });
        return { success: false, message: errorMessage };
      }
    },

    reset: () => {
      set({ profile: null, isLoading: false, error: null });
    },
  };
});
