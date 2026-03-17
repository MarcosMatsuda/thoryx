import { useEffect } from "react";
import { UserProfileInput } from "@domain/entities/user-profile.entity";
import { useProfileStore } from "@stores/profile.store";

export function useUserProfile() {
  const { profile, isLoading, error, loadProfile, saveProfile } =
    useProfileStore();

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
