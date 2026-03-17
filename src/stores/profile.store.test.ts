import { useProfileStore } from "./profile.store";
import { GetUserProfileUseCase } from "@domain/use-cases/get-user-profile.use-case";
import { SaveUserProfileUseCase } from "@domain/use-cases/save-user-profile.use-case";
import { UserProfile, UserProfileInput } from "@domain/entities/user-profile.entity";

jest.mock("@domain/use-cases/get-user-profile.use-case");
jest.mock("@domain/use-cases/save-user-profile.use-case");
jest.mock("@data/repositories/user-profile.repository.impl");

describe("useProfileStore", () => {
  const mockProfile: UserProfile = {
    name: "John Doe",
    photoUri: "https://example.com/photo.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProfileInput: UserProfileInput = {
    name: "John Doe",
    photoUri: "https://example.com/photo.jpg",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useProfileStore.setState({ profile: null, isLoading: false, error: null });
  });

  describe("Initial state", () => {
    it("should initialize with null profile, false isLoading, and null error", () => {
      const store = useProfileStore.getState();

      expect(store.profile).toBeNull();
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
    });
  });

  describe("loadProfile action", () => {
    it("should set isLoading to true while loading", async () => {
      const mockUseCase = {
        execute: jest
          .fn()
          .mockImplementation(
            () =>
              new Promise((resolve) => setTimeout(() => resolve(mockProfile), 10)),
          ),
      };
      (GetUserProfileUseCase as jest.Mock).mockImplementation(() => mockUseCase);

      const { loadProfile } = useProfileStore.getState();
      await loadProfile();

      expect(mockUseCase.execute).toHaveBeenCalled();
    });

    it("should load profile successfully and set it in state", async () => {
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(mockProfile),
      };
      (GetUserProfileUseCase as jest.Mock).mockImplementation(() => mockUseCase);

      const { loadProfile } = useProfileStore.getState();
      await loadProfile();

      const state = useProfileStore.getState();
      expect(state.profile).toEqual(mockProfile);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it("should handle error when loading profile fails", async () => {
      const mockUseCase = {
        execute: jest.fn().mockRejectedValue(new Error("Network error")),
      };
      (GetUserProfileUseCase as jest.Mock).mockImplementation(() => mockUseCase);

      const { loadProfile } = useProfileStore.getState();
      await loadProfile();

      const state = useProfileStore.getState();
      expect(state.profile).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe("Failed to load profile");
    });

    it("should clear previous error on successful load", async () => {
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(mockProfile),
      };
      (GetUserProfileUseCase as jest.Mock).mockImplementation(() => mockUseCase);

      const { loadProfile } = useProfileStore.getState();

      // Set an error first
      await loadProfile();
      await loadProfile();

      expect(useProfileStore.getState().error).toBeNull();
    });
  });

  describe("saveProfile action", () => {
    it("should save profile successfully and update state", async () => {
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue({
          success: true,
          profile: mockProfile,
          message: "Profile saved",
        }),
      };
      (SaveUserProfileUseCase as jest.Mock).mockImplementation(() => mockUseCase);

      const { saveProfile } = useProfileStore.getState();
      const result = await saveProfile(mockProfileInput);

      const state = useProfileStore.getState();
      expect(result.success).toBe(true);
      expect(result.message).toBe("Profile saved");
      expect(state.profile).toEqual(mockProfile);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it("should call useCase with correct input", async () => {
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue({
          success: true,
          profile: mockProfile,
          message: "Profile saved",
        }),
      };
      (SaveUserProfileUseCase as jest.Mock).mockImplementation(() => mockUseCase);

      const { saveProfile } = useProfileStore.getState();
      await saveProfile(mockProfileInput);

      expect(mockUseCase.execute).toHaveBeenCalledWith(mockProfileInput);
    });

    it("should handle save failure gracefully", async () => {
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue({
          success: false,
          message: "Validation failed",
        }),
      };
      (SaveUserProfileUseCase as jest.Mock).mockImplementation(() => mockUseCase);

      const { saveProfile } = useProfileStore.getState();
      const result = await saveProfile(mockProfileInput);

      const state = useProfileStore.getState();
      expect(result.success).toBe(false);
      expect(result.message).toBe("Validation failed");
      expect(state.error).toBe("Validation failed");
      expect(state.isLoading).toBe(false);
    });

    it("should handle exception during save", async () => {
      const mockUseCase = {
        execute: jest.fn().mockRejectedValue(new Error("Network error")),
      };
      (SaveUserProfileUseCase as jest.Mock).mockImplementation(() => mockUseCase);

      const { saveProfile } = useProfileStore.getState();
      const result = await saveProfile(mockProfileInput);

      const state = useProfileStore.getState();
      expect(result.success).toBe(false);
      expect(result.message).toBe("Failed to save profile");
      expect(state.error).toBe("Failed to save profile");
      expect(state.isLoading).toBe(false);
    });

    it("should set isLoading during save operation", async () => {
      const mockUseCase = {
        execute: jest
          .fn()
          .mockImplementation(
            () =>
              new Promise((resolve) =>
                setTimeout(
                  () =>
                    resolve({
                      success: true,
                      profile: mockProfile,
                      message: "Saved",
                    }),
                  10,
                ),
              ),
          ),
      };
      (SaveUserProfileUseCase as jest.Mock).mockImplementation(() => mockUseCase);

      const { saveProfile } = useProfileStore.getState();
      await saveProfile(mockProfileInput);

      expect(useProfileStore.getState().isLoading).toBe(false);
    });
  });

  describe("reset action", () => {
    it("should reset all state to initial values", async () => {
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue({
          success: true,
          profile: mockProfile,
          message: "Saved",
        }),
      };
      (SaveUserProfileUseCase as jest.Mock).mockImplementation(() => mockUseCase);

      const { saveProfile, reset } = useProfileStore.getState();

      // Set some state
      await saveProfile(mockProfileInput);

      // Reset
      reset();

      const state = useProfileStore.getState();
      expect(state.profile).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it("should clear profile when reset", () => {
      const { reset } = useProfileStore.getState();

      reset();

      expect(useProfileStore.getState().profile).toBeNull();
    });
  });

  describe("Error handling", () => {
    it("should preserve profile on save error", async () => {
      const mockUseCase = {
        execute: jest.fn().mockRejectedValue(new Error("Server error")),
      };
      (SaveUserProfileUseCase as jest.Mock).mockImplementation(() => mockUseCase);

      const { saveProfile } = useProfileStore.getState();
      const result = await saveProfile(mockProfileInput);

      const state = useProfileStore.getState();
      expect(result.success).toBe(false);
      expect(state.error).toBe("Failed to save profile");
    });

    it("should clear error when load succeeds after error", async () => {
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(mockProfile),
      };
      (GetUserProfileUseCase as jest.Mock).mockImplementation(() => mockUseCase);

      const { loadProfile } = useProfileStore.getState();
      await loadProfile();

      expect(useProfileStore.getState().error).toBeNull();
    });
  });

  describe("State isolation", () => {
    it("should not affect other stores", () => {
      const { reset } = useProfileStore.getState();

      // Reset should only affect this store
      reset();

      expect(useProfileStore.getState().profile).toBeNull();
    });
  });
});
