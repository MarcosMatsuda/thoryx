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
  // `hasLoaded` flips to true once loadProfile has resolved at least
  // once (success OR error). Screens that redirect on a missing profile
  // (e.g. wallet-home → /profile-setup) must gate on this flag so they
  // don't fire before the load has even started.
  hasLoaded: boolean;
  error: string | null;
  loadProfile: () => Promise<void>;
  saveProfile: (
    input: UserProfileInput,
  ) => Promise<{ success: boolean; message: string }>;
  reset: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  isLoading: false,
  hasLoaded: false,
  error: null,

  loadProfile: async () => {
    if (get().isLoading) return;
    try {
      set({ isLoading: true, error: null });
      const repository = new UserProfileRepositoryImpl();
      const getUserProfileUseCase = new GetUserProfileUseCase(repository);
      const profile = await getUserProfileUseCase.execute();
      set({ profile, isLoading: false, hasLoaded: true });
    } catch (error) {
      console.error("Error loading profile:", error);
      set({
        error: "Failed to load profile",
        isLoading: false,
        hasLoaded: true,
      });
    }
  },

  saveProfile: async (input: UserProfileInput) => {
    try {
      set({ isLoading: true, error: null });
      const repository = new UserProfileRepositoryImpl();
      const saveUserProfileUseCase = new SaveUserProfileUseCase(repository);
      const result = await saveUserProfileUseCase.execute(input);

      if (result.success && result.profile) {
        set({
          profile: result.profile,
          isLoading: false,
          hasLoaded: true,
        });
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
    set({ profile: null, isLoading: false, hasLoaded: false, error: null });
  },
}));
