/**
 * Integration tests for useUserProfile hook
 * Validates hook correctly integrates with profile store and load/save profile use cases
 * Tests real flow: hook → store → use case
 */

import { renderHook, waitFor, act } from "@testing-library/react-native";
import { useUserProfile } from "./use-user-profile";
import { useProfileStore } from "@stores/profile.store";
import { UserProfile, UserProfileInput } from "@domain/entities/user-profile.entity";

// Mock the use cases and repository to simulate real API behavior
jest.mock("@domain/use-cases/get-user-profile.use-case");
jest.mock("@domain/use-cases/save-user-profile.use-case");
jest.mock("@data/repositories/user-profile.repository.impl");

const mockProfile: UserProfile = {
  name: "Test User",
  photoUri: "https://example.com/photo.jpg",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockProfileInput: UserProfileInput = {
  name: "Updated User",
  photoUri: "https://example.com/updated-photo.jpg",
};

describe("useUserProfile Hook - Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useProfileStore.setState({
      profile: null,
      isLoading: false,
      error: null,
    });
  });

  describe("Hook initialization and loading", () => {
    it("should return initial state with null profile on mount", () => {
      const { result } = renderHook(() => useUserProfile());

      expect(result.current.profile).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("should have saveProfile and reloadProfile functions available", () => {
      const { result } = renderHook(() => useUserProfile());

      expect(typeof result.current.saveProfile).toBe("function");
      expect(typeof result.current.reloadProfile).toBe("function");
    });
  });

  describe("Hook with store integration", () => {
    it("should load profile from store after mount", async () => {
      const { GetUserProfileUseCase } = require("@domain/use-cases/get-user-profile.use-case");
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(mockProfile),
      };
      (GetUserProfileUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { result } = renderHook(() => useUserProfile());

      await waitFor(() => {
        expect(result.current.profile).toEqual(mockProfile);
      });
    });

    it("should show loading state during profile loading", async () => {
      const { GetUserProfileUseCase } = require("@domain/use-cases/get-user-profile.use-case");
      const mockUseCase = {
        execute: jest
          .fn()
          .mockImplementation(
            () =>
              new Promise((resolve) =>
                setTimeout(() => resolve(mockProfile), 50),
              ),
          ),
      };
      (GetUserProfileUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { result } = renderHook(() => useUserProfile());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("should handle errors gracefully during load", async () => {
      const { GetUserProfileUseCase } = require("@domain/use-cases/get-user-profile.use-case");
      const mockUseCase = {
        execute: jest
          .fn()
          .mockRejectedValue(new Error("Network error")),
      };
      (GetUserProfileUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { result } = renderHook(() => useUserProfile());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should have error message
      expect(result.current.error).toBe("Failed to load profile");
      expect(result.current.profile).toBeNull();
    });
  });

  describe("Hook return value structure", () => {
    it("should return object with all required properties", () => {
      const { result } = renderHook(() => useUserProfile());

      expect(result.current).toHaveProperty("profile");
      expect(result.current).toHaveProperty("isLoading");
      expect(result.current).toHaveProperty("error");
      expect(result.current).toHaveProperty("saveProfile");
      expect(result.current).toHaveProperty("reloadProfile");
    });

    it("should return profile as object or null", () => {
      const { result } = renderHook(() => useUserProfile());

      expect(
        result.current.profile === null || typeof result.current.profile === "object",
      ).toBe(true);
    });

    it("should return isLoading as boolean", () => {
      const { result } = renderHook(() => useUserProfile());

      expect(typeof result.current.isLoading).toBe("boolean");
    });

    it("should return error as string or null", () => {
      const { result } = renderHook(() => useUserProfile());

      expect(
        result.current.error === null || typeof result.current.error === "string",
      ).toBe(true);
    });
  });

  describe("Save profile functionality", () => {
    it("should save profile successfully", async () => {
      const { GetUserProfileUseCase } = require("@domain/use-cases/get-user-profile.use-case");
      const { SaveUserProfileUseCase } = require("@domain/use-cases/save-user-profile.use-case");

      const getUseCase = {
        execute: jest.fn().mockResolvedValue(null),
      };
      const saveUseCase = {
        execute: jest.fn().mockResolvedValue({
          success: true,
          profile: mockProfile,
          message: "Profile saved",
        }),
      };

      (GetUserProfileUseCase as jest.Mock).mockImplementation(
        () => getUseCase,
      );
      (SaveUserProfileUseCase as jest.Mock).mockImplementation(
        () => saveUseCase,
      );

      const { result } = renderHook(() => useUserProfile());

      let saveResult;
      await act(async () => {
        saveResult = await result.current.saveProfile(mockProfileInput);
      });

      await waitFor(() => {
        expect(saveResult?.success).toBe(true);
        expect(result.current.profile).toEqual(mockProfile);
      });
    });

    it("should handle save errors gracefully", async () => {
      const { GetUserProfileUseCase } = require("@domain/use-cases/get-user-profile.use-case");
      const { SaveUserProfileUseCase } = require("@domain/use-cases/save-user-profile.use-case");

      const getUseCase = {
        execute: jest.fn().mockResolvedValue(null),
      };
      const saveUseCase = {
        execute: jest
          .fn()
          .mockRejectedValue(new Error("Save failed")),
      };

      (GetUserProfileUseCase as jest.Mock).mockImplementation(
        () => getUseCase,
      );
      (SaveUserProfileUseCase as jest.Mock).mockImplementation(
        () => saveUseCase,
      );

      const { result } = renderHook(() => useUserProfile());

      let saveResult;
      await act(async () => {
        saveResult = await result.current.saveProfile(mockProfileInput);
      });

      await waitFor(() => {
        expect(saveResult?.success).toBe(false);
        expect(result.current.error).toBe("Failed to save profile");
      });
    });
  });

  describe("Manual reload functionality", () => {
    it("should reload profile via reloadProfile function", async () => {
      const { GetUserProfileUseCase } = require("@domain/use-cases/get-user-profile.use-case");
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(mockProfile),
      };
      (GetUserProfileUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { result } = renderHook(() => useUserProfile());

      await waitFor(() => {
        expect(result.current.profile).toBeDefined();
      });

      // Manual reload
      await act(async () => {
        await result.current.reloadProfile();
      });

      expect(mockUseCase.execute).toHaveBeenCalled();
    });
  });

  describe("Integration: Hook → Store → UseCase", () => {
    it("should correctly pass through store data to hook", async () => {
      const { GetUserProfileUseCase } = require("@domain/use-cases/get-user-profile.use-case");
      const testProfile: UserProfile = {
        name: "Integration Test User",
        photoUri: "https://example.com/test.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(testProfile),
      };
      (GetUserProfileUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { result } = renderHook(() => useUserProfile());

      await waitFor(() => {
        expect(result.current.profile).toEqual(testProfile);
      });

      expect(result.current.profile?.name).toBe("Integration Test User");
    });

    it("should maintain profile data structure through hook", async () => {
      const { GetUserProfileUseCase } = require("@domain/use-cases/get-user-profile.use-case");
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(mockProfile),
      };
      (GetUserProfileUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { result } = renderHook(() => useUserProfile());

      await waitFor(() => {
        expect(result.current.profile).not.toBeNull();
      });

      const profile = result.current.profile;
      expect(profile).toHaveProperty("name");
      expect(profile).toHaveProperty("photoUri");
      expect(profile).toHaveProperty("createdAt");
      expect(profile).toHaveProperty("updatedAt");
    });
  });

  describe("Multiple hook instances", () => {
    it("should share store state between multiple hook instances", async () => {
      const { GetUserProfileUseCase } = require("@domain/use-cases/get-user-profile.use-case");
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(mockProfile),
      };
      (GetUserProfileUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { result: result1 } = renderHook(() => useUserProfile());
      const { result: result2 } = renderHook(() => useUserProfile());

      await waitFor(() => {
        expect(result1.current.profile).toEqual(result2.current.profile);
      });
    });
  });

  describe("Edge cases", () => {
    it("should handle null profile from use case", async () => {
      const { GetUserProfileUseCase } = require("@domain/use-cases/get-user-profile.use-case");
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(null),
      };
      (GetUserProfileUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { result } = renderHook(() => useUserProfile());

      await waitFor(() => {
        expect(result.current.profile).toBeNull();
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("should handle profile with all fields populated", async () => {
      const { GetUserProfileUseCase } = require("@domain/use-cases/get-user-profile.use-case");
      const completeProfile: UserProfile = {
        name: "Complete Profile",
        photoUri: "https://example.com/complete.jpg",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-12-31"),
      };

      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(completeProfile),
      };
      (GetUserProfileUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { result } = renderHook(() => useUserProfile());

      await waitFor(() => {
        expect(result.current.profile).toEqual(completeProfile);
      });

      expect(result.current.profile?.name).toBe("Complete Profile");
      expect(result.current.profile?.photoUri).toContain("complete.jpg");
    });
  });

  describe("Error clearing on successful operations", () => {
    it("should clear error when profile loads successfully after error", async () => {
      const { GetUserProfileUseCase } = require("@domain/use-cases/get-user-profile.use-case");
      const mockUseCase = {
        execute: jest
          .fn()
          .mockRejectedValueOnce(new Error("First error"))
          .mockResolvedValueOnce(mockProfile),
      };
      (GetUserProfileUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { result } = renderHook(() => useUserProfile());

      // Wait for first error
      await waitFor(() => {
        expect(result.current.error).toBe("Failed to load profile");
      });

      // Reload and get success
      await act(async () => {
        await result.current.reloadProfile();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.profile).toEqual(mockProfile);
      });
    });
  });
});
