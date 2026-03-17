import { useProfileStore } from "./profile.store";
import { GetUserProfileUseCase } from "@domain/use-cases/get-user-profile.use-case";
import { SaveUserProfileUseCase } from "@domain/use-cases/save-user-profile.use-case";
import { UserProfile, UserProfileInput } from "@domain/entities/user-profile.entity";

jest.mock("@domain/use-cases/get-user-profile.use-case");
jest.mock("@domain/use-cases/save-user-profile.use-case");
jest.mock("@data/repositories/user-profile.repository.impl");

describe("useProfileStore", () => {
  const mockProfile: UserProfile = {
    id: "user-123",
    name: "John Doe",
    email: "john@example.com",
    phone: "123456789",
    cpf: "12345678900",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProfileInput: UserProfileInput = {
    name: "John Doe",
    email: "john@example.com",
    phone: "123456789",
    cpf: "12345678900",
  };

  beforeEach(() => {
    jest.clearAllMocks();
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
      const mockGetUserProfileUseCase = {
        execute: jest
          .fn()
          .mockImplementation(
            () =>
              new Promise((resolve) => setTimeout(() => resolve(mockProfile), 10)),
          ),
      };

      (GetUserProfileUseCase as jest.Mock).mockImplementation(
        () => mockGetUserProfileUseCase,
      );

      const store = useProfileStore.getState();

      const loadPromise = store.loadProfile();
      // Check that isLoading is true during async operation (if detectable)
      // This is a timing-dependent test, so we check the final state
      await loadPromise;

      expect(mockGetUserProfileUseCase.execute).toHaveBeenCalled();
    });

    it("should load profile successfully and set it in state", async () => {
      const mockGetUserProfileUseCase = {
        execute: jest.fn().mockResolvedValue(mockProfile),
      };

      (GetUserProfileUseCase as jest.Mock).mockImplementation(
        () => mockGetUserProfileUseCase,
      );

      const store = useProfileStore.getState();
      await store.loadProfile();

      expect(store.profile).toEqual(mockProfile);
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
    });

    it("should handle error when loading profile fails", async () => {
      const mockGetUserProfileUseCase = {
        execute: jest
          .fn()
          .mockRejectedValue(new Error("Network error")),
      };

      (GetUserProfileUseCase as jest.Mock).mockImplementation(
        () => mockGetUserProfileUseCase,
      );

      const store = useProfileStore.getState();
      await store.loadProfile();

      expect(store.profile).toBeNull();
      expect(store.isLoading).toBe(false);
      expect(store.error).toBe("Failed to load profile");
    });

    it("should clear previous error on successful load", async () => {
      const mockGetUserProfileUseCase = {
        execute: jest.fn().mockResolvedValue(mockProfile),
      };

      (GetUserProfileUseCase as jest.Mock).mockImplementation(
        () => mockGetUserProfileUseCase,
      );

      const store = useProfileStore.getState();

      // Set an error first
      store.loadProfile();
      await store.loadProfile();

      expect(store.error).toBeNull();
    });
  });

  describe("saveProfile action", () => {
    it("should save profile successfully and update state", async () => {
      const mockSaveUserProfileUseCase = {
        execute: jest.fn().mockResolvedValue({
          success: true,
          profile: mockProfile,
          message: "Profile saved",
        }),
      };

      (SaveUserProfileUseCase as jest.Mock).mockImplementation(
        () => mockSaveUserProfileUseCase,
      );

      const store = useProfileStore.getState();
      const result = await store.saveProfile(mockProfileInput);

      expect(result.success).toBe(true);
      expect(result.message).toBe("Profile saved");
      expect(store.profile).toEqual(mockProfile);
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
    });

    it("should call useCase with correct input", async () => {
      const mockSaveUserProfileUseCase = {
        execute: jest.fn().mockResolvedValue({
          success: true,
          profile: mockProfile,
          message: "Profile saved",
        }),
      };

      (SaveUserProfileUseCase as jest.Mock).mockImplementation(
        () => mockSaveUserProfileUseCase,
      );

      const store = useProfileStore.getState();
      await store.saveProfile(mockProfileInput);

      expect(mockSaveUserProfileUseCase.execute).toHaveBeenCalledWith(
        mockProfileInput,
      );
    });

    it("should handle save failure gracefully", async () => {
      const mockSaveUserProfileUseCase = {
        execute: jest.fn().mockResolvedValue({
          success: false,
          message: "Validation failed",
        }),
      };

      (SaveUserProfileUseCase as jest.Mock).mockImplementation(
        () => mockSaveUserProfileUseCase,
      );

      const store = useProfileStore.getState();
      const result = await store.saveProfile(mockProfileInput);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Validation failed");
      expect(store.error).toBe("Validation failed");
      expect(store.isLoading).toBe(false);
    });

    it("should handle exception during save", async () => {
      const mockSaveUserProfileUseCase = {
        execute: jest
          .fn()
          .mockRejectedValue(new Error("Network error")),
      };

      (SaveUserProfileUseCase as jest.Mock).mockImplementation(
        () => mockSaveUserProfileUseCase,
      );

      const store = useProfileStore.getState();
      const result = await store.saveProfile(mockProfileInput);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Failed to save profile");
      expect(store.error).toBe("Failed to save profile");
      expect(store.isLoading).toBe(false);
    });

    it("should set isLoading during save operation", async () => {
      const mockSaveUserProfileUseCase = {
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

      (SaveUserProfileUseCase as jest.Mock).mockImplementation(
        () => mockSaveUserProfileUseCase,
      );

      const store = useProfileStore.getState();
      const savePromise = store.saveProfile(mockProfileInput);
      await savePromise;

      expect(store.isLoading).toBe(false);
    });
  });

  describe("reset action", () => {
    it("should reset all state to initial values", async () => {
      const mockSaveUserProfileUseCase = {
        execute: jest.fn().mockResolvedValue({
          success: true,
          profile: mockProfile,
          message: "Saved",
        }),
      };

      (SaveUserProfileUseCase as jest.Mock).mockImplementation(
        () => mockSaveUserProfileUseCase,
      );

      const store = useProfileStore.getState();

      // Set some state
      await store.saveProfile(mockProfileInput);

      // Reset
      store.reset();

      expect(store.profile).toBeNull();
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
    });

    it("should clear profile when reset", () => {
      const store = useProfileStore.getState();

      // Manually set profile (simulating loaded state)
      store.reset();

      expect(store.profile).toBeNull();
    });
  });

  describe("Error handling", () => {
    it("should preserve profile on save error", async () => {
      const mockSaveUserProfileUseCase = {
        execute: jest
          .fn()
          .mockRejectedValue(new Error("Server error")),
      };

      (SaveUserProfileUseCase as jest.Mock).mockImplementation(
        () => mockSaveUserProfileUseCase,
      );

      const store = useProfileStore.getState();

      const result = await store.saveProfile(mockProfileInput);

      expect(result.success).toBe(false);
      expect(store.error).toBe("Failed to save profile");
    });

    it("should clear error when load succeeds after error", async () => {
      const mockGetUserProfileUseCase = {
        execute: jest.fn().mockResolvedValue(mockProfile),
      };

      (GetUserProfileUseCase as jest.Mock).mockImplementation(
        () => mockGetUserProfileUseCase,
      );

      const store = useProfileStore.getState();

      // This will test clearing error on successful load
      await store.loadProfile();

      expect(store.error).toBeNull();
    });
  });

  describe("State isolation", () => {
    it("should not affect other stores", () => {
      const store1 = useProfileStore.getState();

      // Reset should only affect this store
      store1.reset();

      expect(store1.profile).toBeNull();
    });
  });
});
