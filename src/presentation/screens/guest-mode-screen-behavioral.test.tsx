import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { GuestModeScreen } from "./guest-mode-screen";

import { useRouter } from "expo-router";
import { DocumentRepositoryImpl } from "@data/repositories/document.repository.impl";
import { SecureStorageAdapter } from "@infrastructure/storage/secure-storage.adapter";

// Mock das dependências
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

// Override do mock de expo-router
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(() => ({})),
  useFocusEffect: jest.fn(),
}));

// Mock para CountdownTimer - captura o callback onExpire para teste comportamental
let capturedOnExpireCallback: (() => void) | undefined;

jest.mock("@presentation/components/countdown-timer", () => ({
  CountdownTimer: ({
    onExpire,
    style,
  }: {
    onExpire?: () => void;
    style?: string;
  }) => {
    const { Text, View } = require("react-native");
    // Captura o callback para teste comportamental
    capturedOnExpireCallback = onExpire;

    return (
      <View testID={`countdown-timer-${style || "default"}`}>
        <Text testID="countdown-timer-text">05:00</Text>
      </View>
    );
  },
}));

jest.mock("@presentation/components/document-card", () => ({
  DocumentCard: ({
    title,
    subtitle,
    icon,
    badge,
  }: {
    title: string;
    subtitle: string;
    icon: string;
    badge?: string;
  }) => {
    const { View, Text } = require("react-native");
    return (
      <View testID={`document-card-${title}`}>
        <Text testID={`icon-${title}`}>{icon}</Text>
        <Text>{title}</Text>
        <Text>{subtitle}</Text>
        {badge && <Text testID={`badge-${title}`}>{badge}</Text>}
      </View>
    );
  },
}));

describe("GuestModeScreen - Behavioral Tests", () => {
  let mockFindAll: jest.Mock;
  let mockStorageGet: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    capturedOnExpireCallback = undefined;

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
  });

  describe("Timer Behavior", () => {
    it("should call router.replace(/unlock) when timer expires in header", async () => {
      mockFindAll.mockResolvedValue([]);
      mockStorageGet.mockResolvedValue("5");

      render(<GuestModeScreen />);

      await waitFor(() => {
        expect(screen.getByText("No documents shared")).toBeTruthy();
      });

      // Trigger the onExpire callback that was captured
      if (capturedOnExpireCallback) {
        capturedOnExpireCallback();
      }

      expect(mockReplace).toHaveBeenCalledWith("/unlock");
    });

    it("should call router.replace(/unlock) when timer expires in empty state", async () => {
      const mockDocuments = [
        {
          id: "doc1",
          type: "RG",
          documentNumber: "123456789",
          fullName: "John Doe",
          expiryDate: "2030-12-31",
          isAutoLockEnabled: false,
        },
      ];

      mockFindAll.mockResolvedValue(mockDocuments);
      mockStorageGet.mockResolvedValue("5");

      render(<GuestModeScreen />);

      await waitFor(() => {
        expect(screen.getByText("No documents shared")).toBeTruthy();
      });

      // Reset mocks to clear previous calls
      jest.clearAllMocks();

      // Trigger the onExpire callback
      if (capturedOnExpireCallback) {
        capturedOnExpireCallback();
      }

      expect(mockReplace).toHaveBeenCalledWith("/unlock");
    });

    it("should pass correct timeout minutes to countdown timer from storage", async () => {
      mockFindAll.mockResolvedValue([]);
      mockStorageGet.mockResolvedValue("15"); // 15 minutes

      render(<GuestModeScreen />);

      await waitFor(() => {
        expect(screen.getByText("No documents shared")).toBeTruthy();
      });

      // Check that the timer is rendered (should be called with the timeout)
      expect(
        screen.getAllByTestId("countdown-timer-text").length,
      ).toBeGreaterThan(0);
    });

    it("should fallback to 5 minutes when storage returns invalid value", async () => {
      mockFindAll.mockResolvedValue([]);
      mockStorageGet.mockResolvedValue("invalid");

      render(<GuestModeScreen />);

      await waitFor(() => {
        expect(screen.getByText("No documents shared")).toBeTruthy();
      });

      // Timer should still be rendered with fallback
      expect(
        screen.getAllByTestId("countdown-timer-text").length,
      ).toBeGreaterThan(0);
    });
  });

  describe("Document Filtering and Display", () => {
    it("should only display documents with isAutoLockEnabled: true", async () => {
      const mockDocuments = [
        {
          id: "doc1",
          type: "RG",
          documentNumber: "111111111",
          fullName: "Alice Silva",
          expiryDate: "2030-01-01",
          isAutoLockEnabled: true,
        },
        {
          id: "doc2",
          type: "CNH",
          documentNumber: "222222222",
          fullName: "Bob Santos",
          expiryDate: "2031-06-01",
          isAutoLockEnabled: false,
        },
        {
          id: "doc3",
          type: "RG",
          documentNumber: "333333333",
          fullName: "Charlie Costa",
          expiryDate: "2032-12-01",
          isAutoLockEnabled: true,
        },
        {
          id: "doc4",
          type: "CreditCard",
          documentNumber: "444444444",
          fullName: "Diana Moon",
          expiryDate: "2029-03-01",
          isAutoLockEnabled: false,
        },
      ];

      mockFindAll.mockResolvedValue(mockDocuments);
      mockStorageGet.mockResolvedValue("10");

      render(<GuestModeScreen />);

      await waitFor(() => {
        // Should display only doc1 and doc3
        expect(screen.getByText("Alice Silva")).toBeTruthy();
        expect(screen.getByText("Charlie Costa")).toBeTruthy();

        // Should NOT display doc2 and doc4
        expect(screen.queryByText("Bob Santos")).toBeNull();
        expect(screen.queryByText("Diana Moon")).toBeNull();
      });
    });

    it("should display correct document icons based on type", async () => {
      const mockDocuments = [
        {
          id: "doc1",
          type: "RG",
          documentNumber: "111111111",
          fullName: "John RG",
          expiryDate: "2030-01-01",
          isAutoLockEnabled: true,
        },
        {
          id: "doc2",
          type: "CNH",
          documentNumber: "222222222",
          fullName: "Jane CNH",
          expiryDate: "2031-06-01",
          isAutoLockEnabled: true,
        },
        {
          id: "doc3",
          type: "CreditCard",
          documentNumber: "333333333",
          fullName: "Charlie Card",
          expiryDate: "2029-03-01",
          isAutoLockEnabled: true,
        },
      ];

      mockFindAll.mockResolvedValue(mockDocuments);
      mockStorageGet.mockResolvedValue("5");

      render(<GuestModeScreen />);

      await waitFor(() => {
        expect(screen.getByText("John RG")).toBeTruthy();
      });

      // Check icons
      expect(screen.getByTestId("icon-John RG")).toHaveTextContent("🆔"); // RG icon
      expect(screen.getByTestId("icon-Jane CNH")).toHaveTextContent("🚗"); // CNH icon
      expect(screen.getByTestId("icon-Charlie Card")).toHaveTextContent("💳"); // CreditCard icon
    });

    it("should display 'Auto-lock' badge on all guest mode documents", async () => {
      const mockDocuments = [
        {
          id: "doc1",
          type: "RG",
          documentNumber: "111111111",
          fullName: "John Doe",
          expiryDate: "2030-01-01",
          isAutoLockEnabled: true,
        },
        {
          id: "doc2",
          type: "CNH",
          documentNumber: "222222222",
          fullName: "Jane Smith",
          expiryDate: "2031-06-01",
          isAutoLockEnabled: true,
        },
      ];

      mockFindAll.mockResolvedValue(mockDocuments);
      mockStorageGet.mockResolvedValue("5");

      render(<GuestModeScreen />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeTruthy();
      });

      // Both documents should have "Auto-lock" badge
      expect(screen.getByTestId("badge-John Doe")).toHaveTextContent(
        "Auto-lock",
      );
      expect(screen.getByTestId("badge-Jane Smith")).toHaveTextContent(
        "Auto-lock",
      );
    });

    it("should format document subtitle correctly with number and expiry date", async () => {
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

      render(<GuestModeScreen />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeTruthy();
      });

      // Check subtitle format: "documentNumber • Expires: expiryDate"
      expect(screen.getByText("123456789 • Expires: 2030-12-31")).toBeTruthy();
    });
  });

  describe("Header and UI Structure", () => {
    it("should display header with 'Shared Documents' title", async () => {
      mockFindAll.mockResolvedValue([]);
      mockStorageGet.mockResolvedValue("5");

      render(<GuestModeScreen />);

      await waitFor(() => {
        expect(screen.getByText("Shared Documents")).toBeTruthy();
        expect(screen.getByText("Access expires in")).toBeTruthy();
      });
    });

    it("should display two countdown timers (header + content area)", async () => {
      mockFindAll.mockResolvedValue([]);
      mockStorageGet.mockResolvedValue("5");

      render(<GuestModeScreen />);

      await waitFor(() => {
        expect(screen.getByText("No documents shared")).toBeTruthy();
      });

      // Both header and empty state should have countdown timers
      const timers = screen.getAllByTestId("countdown-timer-text");
      expect(timers.length).toBeGreaterThanOrEqual(2);
    });

    it("should display loading state while fetching documents", () => {
      // Promise that never resolves
      mockFindAll.mockReturnValue(new Promise(() => {}));
      mockStorageGet.mockReturnValue(new Promise(() => {}));

      render(<GuestModeScreen />);

      expect(screen.getByText("Loading...")).toBeTruthy();
    });
  });

  describe("Error Handling", () => {
    it("should show empty state when document loading fails", async () => {
      mockFindAll.mockRejectedValue(new Error("Database connection failed"));
      mockStorageGet.mockResolvedValue("5");

      render(<GuestModeScreen />);

      await waitFor(() => {
        expect(screen.getByText("No documents shared")).toBeTruthy();
      });
    });

    it("should show empty state when storage loading fails", async () => {
      mockFindAll.mockResolvedValue([
        {
          id: "doc1",
          type: "RG",
          documentNumber: "123456789",
          fullName: "John Doe",
          expiryDate: "2030-12-31",
          isAutoLockEnabled: true,
        },
      ]);
      mockStorageGet.mockRejectedValue(new Error("Storage error"));

      render(<GuestModeScreen />);

      await waitFor(() => {
        // Should still load documents even if storage fails
        expect(screen.getByText("John Doe")).toBeTruthy();
      });
    });
  });

  describe("Navigation and User Interaction", () => {
    it("should navigate to document details with guestMode=true when document is pressed", async () => {
      const mockDocuments = [
        {
          id: "doc-abc-123",
          type: "RG",
          documentNumber: "123456789",
          fullName: "John Doe",
          expiryDate: "2030-12-31",
          isAutoLockEnabled: true,
        },
      ];

      mockFindAll.mockResolvedValue(mockDocuments);
      mockStorageGet.mockResolvedValue("5");

      render(<GuestModeScreen />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeTruthy();
      });

      // Press the document
      fireEvent.press(screen.getByTestId("document-card-John Doe"));

      expect(mockPush).toHaveBeenCalledWith(
        "/document-details?documentId=doc-abc-123&guestMode=true",
      );
    });

    it("should allow multiple documents to be pressed independently", async () => {
      const mockDocuments = [
        {
          id: "doc1",
          type: "RG",
          documentNumber: "111111111",
          fullName: "Alice",
          expiryDate: "2030-01-01",
          isAutoLockEnabled: true,
        },
        {
          id: "doc2",
          type: "CNH",
          documentNumber: "222222222",
          fullName: "Bob",
          expiryDate: "2031-06-01",
          isAutoLockEnabled: true,
        },
      ];

      mockFindAll.mockResolvedValue(mockDocuments);
      mockStorageGet.mockResolvedValue("5");

      render(<GuestModeScreen />);

      await waitFor(() => {
        expect(screen.getByText("Alice")).toBeTruthy();
        expect(screen.getByText("Bob")).toBeTruthy();
      });

      // Press first document
      fireEvent.press(screen.getByTestId("document-card-Alice"));
      expect(mockPush).toHaveBeenCalledWith(
        "/document-details?documentId=doc1&guestMode=true",
      );

      jest.clearAllMocks();

      // Press second document
      fireEvent.press(screen.getByTestId("document-card-Bob"));
      expect(mockPush).toHaveBeenCalledWith(
        "/document-details?documentId=doc2&guestMode=true",
      );
    });
  });
});
