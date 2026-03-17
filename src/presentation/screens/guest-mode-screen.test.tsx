import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { GuestModeScreen } from "./guest-mode-screen";

// Mock das dependências com factories explícitas para evitar carregamento dos módulos reais
// (que importam expo-image-manipulator → expo/src/winter → falha no Jest)
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

// Override do mock de expo-router para ter controle sobre os mocks
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(() => ({})),
  useFocusEffect: jest.fn(),
}));

// Mock para CountdownTimer para evitar timers reais e dependências pesadas
jest.mock("@presentation/components/countdown-timer", () => ({
  CountdownTimer: ({ onExpire }: { onExpire?: () => void }) => {
    const { Text } = require("react-native");
    return <Text testID="countdown-timer">05:00</Text>;
  },
}));

// Mock para DocumentCard para simplificar asserções
jest.mock("@presentation/components/document-card", () => ({
  DocumentCard: ({
    title,
    subtitle,
  }: {
    title: string;
    subtitle: string;
  }) => {
    const { View, Text } = require("react-native");
    return (
      <View>
        <Text>{title}</Text>
        <Text>{subtitle}</Text>
      </View>
    );
  },
}));

import { useRouter } from "expo-router";
import { DocumentRepositoryImpl } from "@data/repositories/document.repository.impl";
import { SecureStorageAdapter } from "@infrastructure/storage/secure-storage.adapter";

describe("GuestModeScreen", () => {
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
  });

  it("should display loading state initially", () => {
    // Promise que nunca resolve → mantém estado de loading
    mockFindAll.mockReturnValue(new Promise(() => {}));
    mockStorageGet.mockReturnValue(new Promise(() => {}));

    render(<GuestModeScreen />);

    expect(screen.getByText("Loading...")).toBeTruthy();
  });

  it("should load and display documents with auto-lock enabled", async () => {
    const mockDocuments = [
      {
        id: "doc1",
        type: "RG",
        documentNumber: "123456789",
        fullName: "John Doe",
        expiryDate: "2030-12-31",
        isAutoLockEnabled: true,
      },
      {
        id: "doc2",
        type: "CNH",
        documentNumber: "987654321",
        fullName: "Jane Smith",
        expiryDate: "2031-06-30",
        isAutoLockEnabled: false, // Não deve aparecer
      },
      {
        id: "doc3",
        type: "RG",
        documentNumber: "555555555",
        fullName: "Bob Johnson",
        expiryDate: "2029-03-15",
        isAutoLockEnabled: true,
      },
    ];

    mockFindAll.mockResolvedValue(mockDocuments);
    mockStorageGet.mockResolvedValue("10");

    render(<GuestModeScreen />);

    await waitFor(() => {
      // Deve mostrar apenas documentos com isAutoLockEnabled: true
      expect(screen.getByText("John Doe")).toBeTruthy();
      expect(screen.getByText("Bob Johnson")).toBeTruthy();
      expect(screen.queryByText("Jane Smith")).toBeNull();
    });

    // Deve mostrar o cabeçalho correto
    expect(screen.getByText("Shared Documents")).toBeTruthy();
    expect(screen.getByText("Access expires in")).toBeTruthy();
  });

  it("should display empty state when no documents have auto-lock enabled", async () => {
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
      expect(
        screen.getByText(
          "The timer will still expire and redirect to the lock screen.",
        ),
      ).toBeTruthy();
    });
  });

  it("should use fallback timeout of 5 minutes when storage returns null", async () => {
    mockFindAll.mockResolvedValue([]);
    mockStorageGet.mockResolvedValue(null); // Valor nulo → fallback

    render(<GuestModeScreen />);

    await waitFor(() => {
      expect(screen.getByText("No documents shared")).toBeTruthy();
    });

    // Timer deve estar presente (pode haver mais de um — header + empty state)
    expect(screen.getAllByTestId("countdown-timer").length).toBeGreaterThan(0);
  });

  it("should navigate to document details with guestMode parameter when document is pressed", async () => {
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

    // Simula pressionar no documento
    fireEvent.press(screen.getByText("John Doe"));

    expect(mockPush).toHaveBeenCalledWith(
      "/document-details?documentId=doc1&guestMode=true",
    );
  });

  it("should handle errors when loading documents and show empty state", async () => {
    mockFindAll.mockRejectedValue(new Error("Database error"));
    mockStorageGet.mockResolvedValue("5");

    render(<GuestModeScreen />);

    await waitFor(() => {
      // Deve mostrar estado vazio em caso de erro
      expect(screen.getByText("No documents shared")).toBeTruthy();
    });
  });

  it("should display header with shared documents title and countdown timer", async () => {
    mockFindAll.mockResolvedValue([]);
    mockStorageGet.mockResolvedValue("5");

    render(<GuestModeScreen />);

    await waitFor(() => {
      expect(screen.getByText("Shared Documents")).toBeTruthy();
      expect(screen.getByText("Access expires in")).toBeTruthy();
    });

    // Header timer deve estar visível
    expect(screen.getAllByTestId("countdown-timer").length).toBeGreaterThan(0);
  });
});
