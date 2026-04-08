import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { DocumentDetailsScreen } from "./document-details-screen";

import { useRouter, useLocalSearchParams } from "expo-router";
import { DocumentRepositoryImpl } from "@data/repositories/document.repository.impl";

// Mock com factory explícita para evitar carregar o módulo real
// (que importa ImageProcessingService → expo-image-manipulator → expo/src/winter → falha no Jest)
jest.mock("@data/repositories/document.repository.impl", () => ({
  DocumentRepositoryImpl: jest.fn().mockImplementation(() => ({
    findAll: jest.fn(),
    findById: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    toggleAutoLock: jest.fn(),
    decryptPhoto: jest.fn(),
    decryptPhotos: jest.fn(),
  })),
}));

// Override do mock de expo-router para ter controle total
const mockBack = jest.fn();
const mockReplace = jest.fn();
const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
  useFocusEffect: jest.fn(),
}));

jest.mock("@stores/documents.store", () => ({
  useDocumentsStore: jest.fn(() => ({
    customDocumentTypes: [],
    loadCustomTypes: jest.fn(),
  })),
}));

const mockDocument = {
  id: "doc1",
  typeId: "RG",
  typeName: "RG",
  fields: {
    fullName: "John Doe",
    documentNumber: "123456789",
    dateOfBirth: "1990-01-01",
    expiryDate: "2030-12-31",
  },
  photos: { front: "encrypted-front", back: "encrypted-back" },
  isAutoLockEnabled: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("DocumentDetailsScreen - Guest Mode Integration", () => {
  let mockFindById: jest.Mock;
  let mockDecryptPhoto: jest.Mock;
  let mockToggleAutoLock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Configura router
    (useRouter as jest.Mock).mockReturnValue({
      back: mockBack,
      replace: mockReplace,
      push: mockPush,
      navigate: jest.fn(),
    });

    // Configura mocks do repository
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
      decryptPhotos: jest.fn().mockResolvedValue({
        front: "data:image/png;base64,test",
        back: "data:image/png;base64,test",
      }),
    }));
  });

  it("should hide edit button when in guest mode", async () => {
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

    // Botão de editar NÃO deve estar visível no guest mode
    expect(screen.queryByText("✏️")).toBeNull();
  });

  it("should show edit button when NOT in guest mode", async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      documentId: "doc1",
    });

    mockFindById.mockResolvedValue(mockDocument);
    mockDecryptPhoto.mockResolvedValue("data:image/png;base64,test");

    render(<DocumentDetailsScreen />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeTruthy();
    });

    // Botão de editar DEVE estar visível no modo normal
    expect(screen.getByTestId("lucide-Pencil")).toBeTruthy();
  });

  it("should hide auto-lock toggle when in guest mode", async () => {
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

    // Toggle "Incluir no Auto-lock" NÃO deve estar visível
    expect(screen.queryByText("Incluir no Auto-lock")).toBeNull();
  });

  it("should show auto-lock toggle when NOT in guest mode", async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      documentId: "doc1",
    });

    mockFindById.mockResolvedValue(mockDocument);
    mockDecryptPhoto.mockResolvedValue("data:image/png;base64,test");

    render(<DocumentDetailsScreen />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeTruthy();
    });

    // Toggle "Incluir no Auto-lock" DEVE estar visível no modo normal
    expect(screen.getByText("Incluir no Auto-lock")).toBeTruthy();
  });

  it("should navigate back to guest-mode screen when back button is pressed in guest mode", async () => {
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

    // Pressionar o botão de voltar
    fireEvent.press(screen.getByTestId("lucide-ChevronLeft"));

    // No guest mode: usa replace para /guest-mode sem poder voltar
    expect(mockReplace).toHaveBeenCalledWith("/guest-mode");
    expect(mockBack).not.toHaveBeenCalled();
  });

  it("should navigate back normally when NOT in guest mode", async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      documentId: "doc1",
    });

    mockFindById.mockResolvedValue(mockDocument);
    mockDecryptPhoto.mockResolvedValue("data:image/png;base64,test");

    render(<DocumentDetailsScreen />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeTruthy();
    });

    // Pressionar o botão de voltar
    fireEvent.press(screen.getByTestId("lucide-ChevronLeft"));

    // No modo normal: usa router.back()
    expect(mockBack).toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("should handle credit card documents correctly in guest mode", async () => {
    const creditCardDocument = {
      ...mockDocument,
      typeId: "CreditCard",
      typeName: "Credit Card",
      isAutoLockEnabled: true,
    };

    (useLocalSearchParams as jest.Mock).mockReturnValue({
      documentId: "doc1",
      guestMode: "true",
    });

    mockFindById.mockResolvedValue(creditCardDocument);
    mockDecryptPhoto.mockResolvedValue("data:image/png;base64,test");

    render(<DocumentDetailsScreen />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeTruthy();
    });

    // In guest mode, auto-lock toggle is hidden for all document types
    expect(screen.queryByText("Incluir no Auto-lock")).toBeNull();
  });
});
