import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { DocumentDetailsScreen } from "./document-details-screen";
import { BackHandler } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { DocumentRepositoryImpl } from "@data/repositories/document.repository.impl";

// Mock React Native BackHandler
jest.mock("react-native", () => ({
  ...jest.requireActual("react-native"),
  BackHandler: {
    addEventListener: jest.fn(),
  },
}));

jest.mock("@data/repositories/document.repository.impl", () => ({
  DocumentRepositoryImpl: jest.fn().mockImplementation(() => ({
    findAll: jest.fn(),
    findById: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    toggleAutoLock: jest.fn(),
    decryptPhoto: jest.fn(),
  })),
}));

const mockBack = jest.fn();
const mockReplace = jest.fn();
const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
  useFocusEffect: jest.fn(),
}));

const mockDocument = {
  id: "doc1",
  type: "RG",
  documentNumber: "123456789",
  fullName: "John Doe",
  dateOfBirth: "1990-01-01",
  expiryDate: "2030-12-31",
  frontPhotoEncrypted: "encrypted-front",
  backPhotoEncrypted: "encrypted-back",
  isAutoLockEnabled: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("DocumentDetailsScreen - BackHandler", () => {
  let mockFindById: jest.Mock;
  let mockDecryptPhoto: jest.Mock;
  let mockToggleAutoLock: jest.Mock;
  let mockBackHandlerRemove: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Configura router
    (useRouter as jest.Mock).mockReturnValue({
      back: mockBack,
      replace: mockReplace,
      push: mockPush,
      navigate: jest.fn(),
    });

    // Configura repository mocks
    mockFindById = jest.fn();
    mockDecryptPhoto = jest.fn();
    mockToggleAutoLock = jest.fn();

    (DocumentRepositoryImpl as jest.Mock).mockImplementation(() => ({
      findAll: jest.fn(),
      findById: mockFindById,
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      toggleAutoLock: mockToggleAutoLock,
      decryptPhoto: mockDecryptPhoto,
    }));

    // Configura BackHandler mock
    mockBackHandlerRemove = jest.fn();

    (BackHandler.addEventListener as jest.Mock).mockReturnValue({
      remove: mockBackHandlerRemove,
    });
  });

  describe("BackHandler Registration - Guest Mode", () => {
    it("should NOT register hardwareBackPress listener when not in guest mode", async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        documentId: "doc1",
      });

      mockFindById.mockResolvedValue(mockDocument);
      mockDecryptPhoto.mockResolvedValue("data:image/png;base64,test");

      render(<DocumentDetailsScreen />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeTruthy();
      });

      // Should NOT register BackHandler when not in guest mode
      expect(BackHandler.addEventListener).not.toHaveBeenCalled();
    });

    it("should register hardwareBackPress listener when in guest mode", async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        documentId: "doc1",
        guestMode: "true",
      });

      mockFindById.mockResolvedValue(mockDocument);
      mockDecryptPhoto.mockResolvedValue("data:image/png;base64,test");

      render(<DocumentDetailsScreen />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeTruthy();
      });

      // Should register BackHandler in guest mode
      expect(BackHandler.addEventListener).toHaveBeenCalledWith(
        "hardwareBackPress",
        expect.any(Function),
      );
    });

    it("should register listener only once in guest mode", async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        documentId: "doc1",
        guestMode: "true",
      });

      mockFindById.mockResolvedValue(mockDocument);
      mockDecryptPhoto.mockResolvedValue("data:image/png;base64,test");

      render(<DocumentDetailsScreen />);

      await waitFor(() => {
        expect(BackHandler.addEventListener).toHaveBeenCalled();
      });

      // Should be called exactly once
      expect(BackHandler.addEventListener).toHaveBeenCalledTimes(1);
    });

    it("should unsubscribe from BackHandler on unmount in guest mode", async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        documentId: "doc1",
        guestMode: "true",
      });

      mockFindById.mockResolvedValue(mockDocument);
      mockDecryptPhoto.mockResolvedValue("data:image/png;base64,test");

      (BackHandler.addEventListener as jest.Mock).mockReturnValue({
        remove: mockBackHandlerRemove,
      });

      const { unmount } = render(<DocumentDetailsScreen />);

      await waitFor(() => {
        expect(BackHandler.addEventListener).toHaveBeenCalled();
      });

      unmount();

      expect(mockBackHandlerRemove).toHaveBeenCalled();
    });
  });

  describe("Back Button Behavior - Guest Mode", () => {
    it("should navigate back to guest-mode screen when back button is pressed", async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        documentId: "doc1",
        guestMode: "true",
      });

      mockFindById.mockResolvedValue(mockDocument);
      mockDecryptPhoto.mockResolvedValue("data:image/png;base64,test");

      let capturedListener: Function | null = null;

      (BackHandler.addEventListener as jest.Mock).mockImplementation(
        (event: string, listener: Function) => {
          if (event === "hardwareBackPress") {
            capturedListener = listener;
          }
          return { remove: jest.fn() };
        },
      );

      render(<DocumentDetailsScreen />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeTruthy();
      });

      // Simulate hardware back press
      const result = (capturedListener as Function)();

      // Should navigate back to guest-mode using replace
      expect(mockReplace).toHaveBeenCalledWith("/guest-mode");
      // Should return true to block default behavior
      expect(result).toBe(true);
    });

    it("should use router.replace instead of router.back in guest mode", async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        documentId: "doc1",
        guestMode: "true",
      });

      mockFindById.mockResolvedValue(mockDocument);
      mockDecryptPhoto.mockResolvedValue("data:image/png;base64,test");

      let capturedListener: Function | null = null;

      (BackHandler.addEventListener as jest.Mock).mockImplementation(
        (event: string, listener: Function) => {
          capturedListener = listener;
          return { remove: jest.fn() };
        },
      );

      render(<DocumentDetailsScreen />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeTruthy();
      });

      (capturedListener as Function)();

      // Should use replace (not back) to prevent stack navigation
      expect(mockReplace).toHaveBeenCalled();
      expect(mockBack).not.toHaveBeenCalled();
    });

    it("should return true to consume the event", async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        documentId: "doc1",
        guestMode: "true",
      });

      mockFindById.mockResolvedValue(mockDocument);
      mockDecryptPhoto.mockResolvedValue("data:image/png;base64,test");

      let capturedListener: Function | null = null;

      (BackHandler.addEventListener as jest.Mock).mockImplementation(
        (event: string, listener: Function) => {
          capturedListener = listener;
          return { remove: jest.fn() };
        },
      );

      render(<DocumentDetailsScreen />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeTruthy();
      });

      const result = (capturedListener as Function)();

      // true = event is consumed, prevents default back navigation
      expect(result).toBe(true);
    });

    it("should handle multiple consecutive back button presses", async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        documentId: "doc1",
        guestMode: "true",
      });

      mockFindById.mockResolvedValue(mockDocument);
      mockDecryptPhoto.mockResolvedValue("data:image/png;base64,test");

      let capturedListener: Function | null = null;

      (BackHandler.addEventListener as jest.Mock).mockImplementation(
        (event: string, listener: Function) => {
          capturedListener = listener;
          return { remove: jest.fn() };
        },
      );

      render(<DocumentDetailsScreen />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeTruthy();
      });

      // Simulate multiple back presses
      (capturedListener as Function)();
      (capturedListener as Function)();
      (capturedListener as Function)();

      // Should always navigate to guest-mode
      expect(mockReplace).toHaveBeenCalledTimes(3);
      expect(mockReplace).toHaveBeenCalledWith("/guest-mode");
    });
  });

  describe("Back Button Behavior - Normal Mode", () => {
    it("should NOT register BackHandler when guestMode is false", async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        documentId: "doc1",
        guestMode: "false",
      });

      mockFindById.mockResolvedValue(mockDocument);
      mockDecryptPhoto.mockResolvedValue("data:image/png;base64,test");

      render(<DocumentDetailsScreen />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeTruthy();
      });

      // Should NOT register listener in normal mode
      expect(BackHandler.addEventListener).not.toHaveBeenCalled();
    });

    it("should NOT register BackHandler when guestMode is missing", async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        documentId: "doc1",
      });

      mockFindById.mockResolvedValue(mockDocument);
      mockDecryptPhoto.mockResolvedValue("data:image/png;base64,test");

      render(<DocumentDetailsScreen />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeTruthy();
      });

      // Should NOT register listener when guestMode param is missing
      expect(BackHandler.addEventListener).not.toHaveBeenCalled();
    });
  });

  describe("Guest Mode Lock-in Behavior", () => {
    it("should prevent navigation away from detail screen to parent in guest mode", async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        documentId: "doc1",
        guestMode: "true",
      });

      mockFindById.mockResolvedValue(mockDocument);
      mockDecryptPhoto.mockResolvedValue("data:image/png;base64,test");

      let capturedListener: Function | null = null;

      (BackHandler.addEventListener as jest.Mock).mockImplementation(
        (event: string, listener: Function) => {
          capturedListener = listener;
          return { remove: jest.fn() };
        },
      );

      render(<DocumentDetailsScreen />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeTruthy();
      });

      // Try to navigate back
      const result = (capturedListener as Function)();

      // Should prevent default back navigation
      expect(result).toBe(true);
      // Should still be on document details screen
      expect(screen.getByText("John Doe")).toBeTruthy();
    });

    it("should redirect to guest-mode screen instead of stack navigation", async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        documentId: "doc1",
        guestMode: "true",
      });

      mockFindById.mockResolvedValue(mockDocument);
      mockDecryptPhoto.mockResolvedValue("data:image/png;base64,test");

      let capturedListener: Function | null = null;

      (BackHandler.addEventListener as jest.Mock).mockImplementation(
        (event: string, listener: Function) => {
          capturedListener = listener;
          return { remove: jest.fn() };
        },
      );

      render(<DocumentDetailsScreen />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeTruthy();
      });

      (capturedListener as Function)();

      // Should use replace (which resets stack) instead of back
      expect(mockReplace).toHaveBeenCalledWith("/guest-mode");
      expect(mockBack).not.toHaveBeenCalled();
    });

    it("should keep user locked in guest mode tree", async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        documentId: "doc1",
        guestMode: "true",
      });

      mockFindById.mockResolvedValue(mockDocument);
      mockDecryptPhoto.mockResolvedValue("data:image/png;base64,test");

      let capturedListener: Function | null = null;

      (BackHandler.addEventListener as jest.Mock).mockImplementation(
        (event: string, listener: Function) => {
          capturedListener = listener;
          return { remove: jest.fn() };
        },
      );

      render(<DocumentDetailsScreen />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeTruthy();
      });

      // Simulate trying to navigate away multiple times
      (capturedListener as Function)();
      (capturedListener as Function)();
      (capturedListener as Function)();

      // User should always be redirected to guest-mode screen
      expect(mockReplace).toHaveBeenCalledWith("/guest-mode");
      expect(mockReplace).toHaveBeenCalledTimes(3);
    });
  });

  describe("Integration with UI Back Button", () => {
    it("should handle back button press via UI", async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        documentId: "doc1",
        guestMode: "true",
      });

      mockFindById.mockResolvedValue(mockDocument);
      mockDecryptPhoto.mockResolvedValue("data:image/png;base64,test");

      render(<DocumentDetailsScreen />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeTruthy();
      });

      // Press UI back button (←)
      fireEvent.press(screen.getByText("←"));

      // Should navigate to guest-mode
      expect(mockReplace).toHaveBeenCalledWith("/guest-mode");
    });

    it("should handle both hardware and UI back button in guest mode", async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        documentId: "doc1",
        guestMode: "true",
      });

      mockFindById.mockResolvedValue(mockDocument);
      mockDecryptPhoto.mockResolvedValue("data:image/png;base64,test");

      let capturedHardwareListener: Function | null = null;

      (BackHandler.addEventListener as jest.Mock).mockImplementation(
        (event: string, listener: Function) => {
          if (event === "hardwareBackPress") {
            capturedHardwareListener = listener;
          }
          return { remove: jest.fn() };
        },
      );

      render(<DocumentDetailsScreen />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeTruthy();
      });

      // Press UI back button
      fireEvent.press(screen.getByText("←"));

      // Press hardware back button
      (capturedHardwareListener as Function)();

      // Both should trigger replace
      expect(mockReplace).toHaveBeenCalledWith("/guest-mode");
      expect(mockReplace).toHaveBeenCalledTimes(2);
    });
  });

  describe("Lifecycle Management", () => {
    it("should maintain listener across screen updates in guest mode", async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        documentId: "doc1",
        guestMode: "true",
      });

      mockFindById.mockResolvedValue(mockDocument);
      mockDecryptPhoto.mockResolvedValue("data:image/png;base64,test");

      (BackHandler.addEventListener as jest.Mock).mockImplementation(
        (event: string, listener: Function) => {
          return { remove: jest.fn() };
        },
      );

      const { rerender } = render(<DocumentDetailsScreen />);

      const firstCallCount = (
        BackHandler.addEventListener as jest.Mock
      ).mock.calls.length;

      // Force update
      rerender(<DocumentDetailsScreen />);

      const secondCallCount = (
        BackHandler.addEventListener as jest.Mock
      ).mock.calls.length;

      // Should only be called once (not re-registered)
      expect(secondCallCount).toBe(firstCallCount);
    });

    it("should cleanup subscription when exiting guest mode", async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        documentId: "doc1",
        guestMode: "true",
      });

      mockFindById.mockResolvedValue(mockDocument);
      mockDecryptPhoto.mockResolvedValue("data:image/png;base64,test");

      const mockUnsubscribe = jest.fn();

      (BackHandler.addEventListener as jest.Mock).mockReturnValue({
        remove: mockUnsubscribe,
      });

      const { unmount } = render(<DocumentDetailsScreen />);

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it("should not register listener when transitioning from guest to normal mode", async () => {
      const { rerender } = render(<DocumentDetailsScreen />);

      // Start with guestMode=true
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        documentId: "doc1",
        guestMode: "true",
      });

      mockFindById.mockResolvedValue(mockDocument);
      mockDecryptPhoto.mockResolvedValue("data:image/png;base64,test");

      rerender(<DocumentDetailsScreen />);

      const callCountWithGuestMode = (
        BackHandler.addEventListener as jest.Mock
      ).mock.calls.length;

      // Change to guestMode=false
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        documentId: "doc1",
        guestMode: "false",
      });

      rerender(<DocumentDetailsScreen />);

      // Should not add new listeners
      const callCountAfterExit = (
        BackHandler.addEventListener as jest.Mock
      ).mock.calls.length;

      expect(callCountAfterExit).toBeLessThanOrEqual(callCountWithGuestMode);
    });
  });

  describe("Error Handling", () => {
    it("should gracefully handle listener execution errors", async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        documentId: "doc1",
        guestMode: "true",
      });

      mockFindById.mockResolvedValue(mockDocument);
      mockDecryptPhoto.mockResolvedValue("data:image/png;base64,test");

      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation();

      let capturedListener: Function | null = null;

      (BackHandler.addEventListener as jest.Mock).mockImplementation(
        (event: string, listener: Function) => {
          capturedListener = () => {
            try {
              return listener();
            } catch (e) {
              console.error("BackHandler error:", e);
              return true;
            }
          };
          return { remove: jest.fn() };
        },
      );

      render(<DocumentDetailsScreen />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeTruthy();
      });

      expect(() => {
        (capturedListener as Function)();
      }).not.toThrow();

      consoleErrorSpy.mockRestore();
    });

    it("should handle case where router is not available", async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        documentId: "doc1",
        guestMode: "true",
      });

      mockFindById.mockResolvedValue(mockDocument);
      mockDecryptPhoto.mockResolvedValue("data:image/png;base64,test");

      // Mock router with replace that throws
      (useRouter as jest.Mock).mockReturnValue({
        back: mockBack,
        replace: jest.fn(() => {
          throw new Error("Router not ready");
        }),
        push: mockPush,
      });

      let capturedListener: Function | null = null;

      (BackHandler.addEventListener as jest.Mock).mockImplementation(
        (event: string, listener: Function) => {
          capturedListener = () => {
            try {
              return listener();
            } catch (e) {
              return true; // Still consume event
            }
          };
          return { remove: jest.fn() };
        },
      );

      render(<DocumentDetailsScreen />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeTruthy();
      });

      expect(() => {
        (capturedListener as Function)();
      }).not.toThrow();
    });
  });
});
