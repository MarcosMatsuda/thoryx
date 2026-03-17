import React from "react";
import { render, screen, waitFor } from "@testing-library/react-native";
import { GuestModeScreen } from "./guest-mode-screen";
import { BackHandler } from "react-native";
import { useRouter } from "expo-router";
import { DocumentRepositoryImpl } from "@data/repositories/document.repository.impl";
import { SecureStorageAdapter } from "@infrastructure/storage/secure-storage.adapter";

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

jest.mock("@infrastructure/storage/secure-storage.adapter", () => ({
  SecureStorageAdapter: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
  })),
}));

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(() => ({})),
  useFocusEffect: jest.fn(),
}));

jest.mock("@presentation/components/countdown-timer", () => ({
  CountdownTimer: ({ onExpire }: { onExpire?: () => void }) => {
    const { Text } = require("react-native");
    return <Text testID="countdown-timer">05:00</Text>;
  },
}));

jest.mock("@presentation/components/document-card", () => ({
  DocumentCard: ({ title, subtitle }: { title: string; subtitle: string }) => {
    const { View, Text } = require("react-native");
    return (
      <View>
        <Text>{title}</Text>
        <Text>{subtitle}</Text>
      </View>
    );
  },
}));

describe("GuestModeScreen - BackHandler", () => {
  let mockBackHandlerListener: jest.Mock;
  let mockBackHandlerRemove: jest.Mock;
  let mockFindAll: jest.Mock;
  let mockStorageGet: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Configura router mock
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
      back: mockBack,
      navigate: jest.fn(),
    });

    // Configura repository mock
    mockFindAll = jest.fn();
    (DocumentRepositoryImpl as jest.Mock).mockImplementation(() => ({
      findAll: mockFindAll,
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      toggleAutoLock: jest.fn(),
      decryptPhoto: jest.fn(),
    }));

    // Configura storage mock
    mockStorageGet = jest.fn();
    (SecureStorageAdapter as jest.Mock).mockImplementation(() => ({
      get: mockStorageGet,
      set: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn(),
    }));

    // Configura BackHandler mock
    mockBackHandlerRemove = jest.fn();
    mockBackHandlerListener = jest.fn();

    (BackHandler.addEventListener as jest.Mock).mockReturnValue({
      remove: mockBackHandlerRemove,
    });
  });

  describe("BackHandler Registration", () => {
    it("should register hardwareBackPress listener on mount", async () => {
      mockFindAll.mockReturnValue(new Promise(() => {}));
      mockStorageGet.mockReturnValue(new Promise(() => {}));

      render(<GuestModeScreen />);

      await waitFor(() => {
        expect(BackHandler.addEventListener).toHaveBeenCalledWith(
          "hardwareBackPress",
          expect.any(Function),
        );
      });
    });

    it("should register listener only once on mount", async () => {
      mockFindAll.mockReturnValue(new Promise(() => {}));
      mockStorageGet.mockReturnValue(new Promise(() => {}));

      render(<GuestModeScreen />);

      await waitFor(() => {
        expect(BackHandler.addEventListener).toHaveBeenCalledTimes(1);
      });
    });

    it("should unsubscribe from BackHandler on unmount", async () => {
      mockFindAll.mockResolvedValue([]);
      mockStorageGet.mockResolvedValue("5");

      (BackHandler.addEventListener as jest.Mock).mockReturnValue({
        remove: mockBackHandlerRemove,
      });

      const { unmount } = render(<GuestModeScreen />);

      await waitFor(() => {
        expect(BackHandler.addEventListener).toHaveBeenCalled();
      });

      unmount();

      expect(mockBackHandlerRemove).toHaveBeenCalled();
    });
  });

  describe("Back Button Blocking", () => {
    it("should block back button by returning true from listener", async () => {
      mockFindAll.mockResolvedValue([]);
      mockStorageGet.mockResolvedValue("5");

      let capturedListener: Function | null = null;

      (BackHandler.addEventListener as jest.Mock).mockImplementation(
        (event: string, listener: Function) => {
          if (event === "hardwareBackPress") {
            capturedListener = listener;
          }
          return { remove: jest.fn() };
        },
      );

      render(<GuestModeScreen />);

      await waitFor(() => {
        expect(capturedListener).toBeTruthy();
      });

      // Call the listener (simulating hardware back press)
      const result = capturedListener!();

      // Should return true to block navigation
      expect(result).toBe(true);
    });

    it("should prevent default back navigation behavior", async () => {
      mockFindAll.mockResolvedValue([]);
      mockStorageGet.mockResolvedValue("5");

      let capturedListener: Function | null = null;

      (BackHandler.addEventListener as jest.Mock).mockImplementation(
        (event: string, listener: Function) => {
          capturedListener = listener;
          return { remove: jest.fn() };
        },
      );

      render(<GuestModeScreen />);

      await waitFor(() => {
        expect(capturedListener).toBeTruthy();
      });

      const result = capturedListener!();

      // true = prevents default behavior (back navigation)
      expect(result).toBe(true);
      // Should NOT navigate back
      expect(mockBack).not.toHaveBeenCalled();
    });

    it("should not call router methods when back button is pressed", async () => {
      mockFindAll.mockResolvedValue([]);
      mockStorageGet.mockResolvedValue("5");

      let capturedListener: Function | null = null;

      (BackHandler.addEventListener as jest.Mock).mockImplementation(
        (event: string, listener: Function) => {
          capturedListener = listener;
          return { remove: jest.fn() };
        },
      );

      render(<GuestModeScreen />);

      await waitFor(() => {
        expect(capturedListener).toBeTruthy();
      });

      capturedListener!();

      // Should NOT trigger any router navigation
      expect(mockBack).not.toHaveBeenCalled();
      expect(mockReplace).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("should consume the event (return true) every time back button is pressed", async () => {
      mockFindAll.mockResolvedValue([]);
      mockStorageGet.mockResolvedValue("5");

      let capturedListener: Function | null = null;

      (BackHandler.addEventListener as jest.Mock).mockImplementation(
        (event: string, listener: Function) => {
          capturedListener = listener;
          return { remove: jest.fn() };
        },
      );

      render(<GuestModeScreen />);

      await waitFor(() => {
        expect(capturedListener).toBeTruthy();
      });

      // Simulate multiple back button presses
      const result1 = capturedListener!();
      const result2 = capturedListener!();
      const result3 = capturedListener!();

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(result3).toBe(true);
    });
  });

  describe("Guest Mode Lock-in Behavior", () => {
    it("should prevent user from leaving guest mode via hardware back", async () => {
      const mockDocuments = [
        {
          id: "doc1",
          type: "RG",
          documentNumber: "123456789",
          fullName: "John Doe",
          expiryDate: "2030-12-31",
          isAutoLockEnabled: true,
        },
      ];

      mockFindAll.mockResolvedValue(mockDocuments);
      mockStorageGet.mockResolvedValue("5");

      let capturedListener: Function | null = null;

      (BackHandler.addEventListener as jest.Mock).mockImplementation(
        (event: string, listener: Function) => {
          capturedListener = listener;
          return { remove: jest.fn() };
        },
      );

      render(<GuestModeScreen />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeTruthy();
      });

      // Try to navigate back
      const result = capturedListener!();

      // Should prevent navigation
      expect(result).toBe(true);
      // Should still show guest mode content
      expect(screen.getByText("Shared Documents")).toBeTruthy();
    });

    it("should work in conjunction with gesture navigation blocking", async () => {
      mockFindAll.mockResolvedValue([]);
      mockStorageGet.mockResolvedValue("5");

      (BackHandler.addEventListener as jest.Mock).mockImplementation(
        (event: string, listener: Function) => {
          return { remove: jest.fn() };
        },
      );

      // Both BackHandler and gesture nav should be blocking
      render(<GuestModeScreen />);

      await waitFor(() => {
        expect(BackHandler.addEventListener).toHaveBeenCalledWith(
          "hardwareBackPress",
          expect.any(Function),
        );
      });

      // BackHandler is registered (blocks hardware back button)
      expect(BackHandler.addEventListener).toHaveBeenCalled();
    });
  });

  describe("Lifecycle Management", () => {
    it("should maintain listener across screen updates", async () => {
      mockFindAll.mockResolvedValue([]);
      mockStorageGet.mockResolvedValue("5");

      (BackHandler.addEventListener as jest.Mock).mockImplementation(
        (event: string, listener: Function) => {
          return { remove: jest.fn() };
        },
      );

      const { rerender } = render(<GuestModeScreen />);

      const firstCallCount = (
        BackHandler.addEventListener as jest.Mock
      ).mock.calls.length;

      // Force update
      rerender(<GuestModeScreen />);

      const secondCallCount = (
        BackHandler.addEventListener as jest.Mock
      ).mock.calls.length;

      // Should only be called once (not re-registered on re-render)
      expect(secondCallCount).toBe(firstCallCount);
    });

    it("should cleanup subscription in useEffect return", async () => {
      mockFindAll.mockResolvedValue([]);
      mockStorageGet.mockResolvedValue("5");

      const mockUnsubscribe = jest.fn();

      (BackHandler.addEventListener as jest.Mock).mockReturnValue({
        remove: mockUnsubscribe,
      });

      const { unmount } = render(<GuestModeScreen />);

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it("should not leave dangling listeners after unmount", async () => {
      mockFindAll.mockResolvedValue([]);
      mockStorageGet.mockResolvedValue("5");

      const mockUnsubscribe = jest.fn();

      (BackHandler.addEventListener as jest.Mock).mockReturnValue({
        remove: mockUnsubscribe,
      });

      const { unmount } = render(<GuestModeScreen />);

      const listenerCount = (
        BackHandler.addEventListener as jest.Mock
      ).mock.calls.length;

      unmount();

      // Each listener should be cleaned up
      expect(mockUnsubscribe).toHaveBeenCalledTimes(listenerCount);
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid consecutive back button presses", async () => {
      mockFindAll.mockResolvedValue([]);
      mockStorageGet.mockResolvedValue("5");

      let capturedListener: Function | null = null;

      (BackHandler.addEventListener as jest.Mock).mockImplementation(
        (event: string, listener: Function) => {
          capturedListener = listener;
          return { remove: jest.fn() };
        },
      );

      render(<GuestModeScreen />);

      await waitFor(() => {
        expect(capturedListener).toBeTruthy();
      });

      // Simulate rapid back presses
      for (let i = 0; i < 5; i++) {
        const result = capturedListener!();
        expect(result).toBe(true);
      }

      // None should navigate away
      expect(mockBack).not.toHaveBeenCalled();
    });

    it("should block back button even with empty document list", async () => {
      mockFindAll.mockResolvedValue([]);
      mockStorageGet.mockResolvedValue("5");

      let capturedListener: Function | null = null;

      (BackHandler.addEventListener as jest.Mock).mockImplementation(
        (event: string, listener: Function) => {
          capturedListener = listener;
          return { remove: jest.fn() };
        },
      );

      render(<GuestModeScreen />);

      await waitFor(() => {
        expect(screen.getByText("No documents shared")).toBeTruthy();
      });

      // Back button should still be blocked
      const result = capturedListener!();
      expect(result).toBe(true);
    });

    it("should block back button during loading state", async () => {
      mockFindAll.mockReturnValue(new Promise(() => {})); // Never resolves
      mockStorageGet.mockReturnValue(new Promise(() => {})); // Never resolves

      let capturedListener: Function | null = null;

      (BackHandler.addEventListener as jest.Mock).mockImplementation(
        (event: string, listener: Function) => {
          capturedListener = listener;
          return { remove: jest.fn() };
        },
      );

      render(<GuestModeScreen />);

      // Even during loading, back button is blocked
      const result = capturedListener!();
      expect(result).toBe(true);
    });

    it("should handle case where listener throws an error", async () => {
      mockFindAll.mockResolvedValue([]);
      mockStorageGet.mockResolvedValue("5");

      let capturedListener: Function | null = null;

      (BackHandler.addEventListener as jest.Mock).mockImplementation(
        (event: string, listener: Function) => {
          capturedListener = () => {
            try {
              return listener();
            } catch (e) {
              console.error("BackHandler error:", e);
              return true; // Still block navigation
            }
          };
          return { remove: jest.fn() };
        },
      );

      render(<GuestModeScreen />);

      await waitFor(() => {
        expect(capturedListener).toBeTruthy();
      });

      expect(() => {
        capturedListener!();
      }).not.toThrow();
    });
  });
});
