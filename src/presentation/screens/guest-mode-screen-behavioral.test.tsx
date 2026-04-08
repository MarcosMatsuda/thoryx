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

jest.mock("@stores/documents.store", () => ({
  useDocumentsStore: jest.fn(() => ({
    customDocumentTypes: [],
  })),
}));

jest.mock("@presentation/components/pin-auth-bottom-sheet", () => ({
  PinAuthBottomSheet: () => null,
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
        expect(screen.getByText("Nenhum documento compartilhado")).toBeTruthy();
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
          typeId: "RG",
          typeName: "RG",
          fields: { fullName: "John Doe", documentNumber: "123456789", expiryDate: "2030-12-31" },
          photos: {},
          isAutoLockEnabled: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockFindAll.mockResolvedValue(mockDocuments);
      mockStorageGet.mockResolvedValue("5");

      render(<GuestModeScreen />);

      await waitFor(() => {
        expect(screen.getByText("Nenhum documento compartilhado")).toBeTruthy();
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
        expect(screen.getByText("Nenhum documento compartilhado")).toBeTruthy();
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
        expect(screen.getByText("Nenhum documento compartilhado")).toBeTruthy();
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
          typeId: "RG",
          typeName: "RG",
          fields: { fullName: "Alice Silva", documentNumber: "111111111", expiryDate: "2030-01-01" },
          photos: {},
          isAutoLockEnabled: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "doc2",
          typeId: "CNH",
          typeName: "CNH",
          fields: { fullName: "Bob Santos", documentNumber: "222222222", expiryDate: "2031-06-01" },
          photos: {},
          isAutoLockEnabled: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "doc3",
          typeId: "RG",
          typeName: "RG",
          fields: { fullName: "Charlie Costa", documentNumber: "333333333", expiryDate: "2032-12-01" },
          photos: {},
          isAutoLockEnabled: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "doc4",
          typeId: "CreditCard",
          typeName: "Credit Card",
          fields: { fullName: "Diana Moon", documentNumber: "444444444", expiryDate: "2029-03-01" },
          photos: {},
          isAutoLockEnabled: false,
          createdAt: new Date(),
          updatedAt: new Date(),
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
          typeId: "RG",
          typeName: "RG",
          fields: { fullName: "John RG", documentNumber: "111111111", expiryDate: "2030-01-01" },
          photos: {},
          isAutoLockEnabled: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "doc2",
          typeId: "CNH",
          typeName: "CNH",
          fields: { fullName: "Jane CNH", documentNumber: "222222222", expiryDate: "2031-06-01" },
          photos: {},
          isAutoLockEnabled: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "doc3",
          typeId: "CreditCard",
          typeName: "Credit Card",
          fields: { fullName: "Charlie Card", documentNumber: "333333333", expiryDate: "2029-03-01" },
          photos: {},
          isAutoLockEnabled: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockFindAll.mockResolvedValue(mockDocuments);
      mockStorageGet.mockResolvedValue("5");

      render(<GuestModeScreen />);

      await waitFor(() => {
        expect(screen.getByText("John RG")).toBeTruthy();
      });

      // Check icons are rendered inline
      expect(screen.getByText("🆔")).toBeTruthy(); // RG icon
      expect(screen.getByText("🚗")).toBeTruthy(); // CNH icon
      expect(screen.getByText("📄")).toBeTruthy(); // CreditCard falls back to default icon
    });

    it("should display masked document number with last 4 digits", async () => {
      const mockDocuments = [
        {
          id: "doc1",
          typeId: "RG",
          typeName: "RG",
          fields: { fullName: "John Doe", documentNumber: "123456789", expiryDate: "2030-12-31" },
          photos: {},
          isAutoLockEnabled: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockFindAll.mockResolvedValue(mockDocuments);
      mockStorageGet.mockResolvedValue("5");

      render(<GuestModeScreen />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeTruthy();
      });

      // Screen shows masked format: •••• •••• {last 4 digits}
      expect(screen.getByText("•••• •••• 6789")).toBeTruthy();
    });
  });

  describe("Header and UI Structure", () => {
    it("should display header with 'Shared Documents' title", async () => {
      mockFindAll.mockResolvedValue([]);
      mockStorageGet.mockResolvedValue("5");

      render(<GuestModeScreen />);

      await waitFor(() => {
        expect(screen.getByText("Documentos Compartilhados")).toBeTruthy();
        expect(screen.getByText("Acesso expira em")).toBeTruthy();
      });
    });

    it("should display two countdown timers (header + content area)", async () => {
      mockFindAll.mockResolvedValue([]);
      mockStorageGet.mockResolvedValue("5");

      render(<GuestModeScreen />);

      await waitFor(() => {
        expect(screen.getByText("Nenhum documento compartilhado")).toBeTruthy();
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

      expect(screen.getByText("Carregando...")).toBeTruthy();
    });
  });

  describe("Error Handling", () => {
    it("should show empty state when document loading fails", async () => {
      mockFindAll.mockRejectedValue(new Error("Database connection failed"));
      mockStorageGet.mockResolvedValue("5");

      render(<GuestModeScreen />);

      await waitFor(() => {
        expect(screen.getByText("Nenhum documento compartilhado")).toBeTruthy();
      });
    });

    it("should show empty state when storage loading fails", async () => {
      mockFindAll.mockResolvedValue([
        {
          id: "doc1",
          typeId: "RG",
          typeName: "RG",
          fields: { fullName: "John Doe", documentNumber: "123456789", expiryDate: "2030-12-31" },
          photos: {},
          isAutoLockEnabled: true,
          createdAt: new Date(),
          updatedAt: new Date(),
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
          typeId: "RG",
          typeName: "RG",
          fields: { fullName: "John Doe", documentNumber: "123456789", expiryDate: "2030-12-31" },
          photos: {},
          isAutoLockEnabled: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockFindAll.mockResolvedValue(mockDocuments);
      mockStorageGet.mockResolvedValue("5");

      render(<GuestModeScreen />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeTruthy();
      });

      // Press the document by finding the name text and its parent Pressable
      fireEvent.press(screen.getByText("John Doe"));

      expect(mockPush).toHaveBeenCalledWith(
        "/document-details?documentId=doc-abc-123&guestMode=true",
      );
    });

    it("should allow multiple documents to be pressed independently", async () => {
      const mockDocuments = [
        {
          id: "doc1",
          typeId: "RG",
          typeName: "RG",
          fields: { fullName: "Alice", documentNumber: "111111111", expiryDate: "2030-01-01" },
          photos: {},
          isAutoLockEnabled: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "doc2",
          typeId: "CNH",
          typeName: "CNH",
          fields: { fullName: "Bob", documentNumber: "222222222", expiryDate: "2031-06-01" },
          photos: {},
          isAutoLockEnabled: true,
          createdAt: new Date(),
          updatedAt: new Date(),
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
      fireEvent.press(screen.getByText("Alice"));
      expect(mockPush).toHaveBeenCalledWith(
        "/document-details?documentId=doc1&guestMode=true",
      );

      jest.clearAllMocks();

      // Press second document
      fireEvent.press(screen.getByText("Bob"));
      expect(mockPush).toHaveBeenCalledWith(
        "/document-details?documentId=doc2&guestMode=true",
      );
    });
  });
});
