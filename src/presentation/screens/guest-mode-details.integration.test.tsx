import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { DocumentDetailsScreen } from "./document-details-screen";
import { DocumentRepositoryImpl } from "@data/repositories/document.repository.impl";

// Mock das dependências
jest.mock("@data/repositories/document.repository.impl");
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

const mockRouter = {
  back: jest.fn(),
  replace: jest.fn(),
  push: jest.fn(),
};

const mockDocumentRepository = {
  findById: jest.fn(),
  decryptPhoto: jest.fn(),
  toggleAutoLock: jest.fn(),
};

describe("DocumentDetailsScreen - Guest Mode Integration", () => {
  const { useRouter, useLocalSearchParams } = require("expo-router");
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useLocalSearchParams as jest.Mock).mockReturnValue({});
    (DocumentRepositoryImpl as jest.Mock).mockImplementation(
      () => mockDocumentRepository,
    );
  });

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

  it("should hide edit button when in guest mode", async () => {
    // Mock dos parâmetros com guestMode=true
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      documentId: "doc1",
      guestMode: "true",
    });

    mockDocumentRepository.findById.mockResolvedValue(mockDocument);
    mockDocumentRepository.decryptPhoto.mockResolvedValue(
      "data:image/png;base64,test",
    );

    render(<DocumentDetailsScreen />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeTruthy();
    });

    // Verificar que o botão de editar NÃO está visível
    expect(screen.queryByText("✏️")).toBeNull();
  });

  it("should show edit button when NOT in guest mode", async () => {
    // Mock dos parâmetros sem guestMode
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      documentId: "doc1",
    });

    mockDocumentRepository.findById.mockResolvedValue(mockDocument);
    mockDocumentRepository.decryptPhoto.mockResolvedValue(
      "data:image/png;base64,test",
    );

    render(<DocumentDetailsScreen />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeTruthy();
    });

    // Verificar que o botão de editar ESTÁ visível
    expect(screen.getByText("✏️")).toBeTruthy();
  });

  it("should hide auto-lock toggle when in guest mode", async () => {
    // Mock dos parâmetros com guestMode=true
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      documentId: "doc1",
      guestMode: "true",
    });

    mockDocumentRepository.findById.mockResolvedValue(mockDocument);
    mockDocumentRepository.decryptPhoto.mockResolvedValue(
      "data:image/png;base64,test",
    );

    render(<DocumentDetailsScreen />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeTruthy();
    });

    // Verificar que o toggle "Incluir no Auto-lock" NÃO está visível
    expect(screen.queryByText("Incluir no Auto-lock")).toBeNull();
  });

  it("should show auto-lock toggle when NOT in guest mode", async () => {
    // Mock dos parâmetros sem guestMode
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      documentId: "doc1",
    });

    mockDocumentRepository.findById.mockResolvedValue(mockDocument);
    mockDocumentRepository.decryptPhoto.mockResolvedValue(
      "data:image/png;base64,test",
    );

    render(<DocumentDetailsScreen />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeTruthy();
    });

    // Verificar que o toggle "Incluir no Auto-lock" ESTÁ visível
    expect(screen.getByText("Incluir no Auto-lock")).toBeTruthy();
  });

  it("should navigate back to guest-mode screen when back button is pressed in guest mode", async () => {
    // Mock dos parâmetros com guestMode=true
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      documentId: "doc1",
      guestMode: "true",
    });

    mockDocumentRepository.findById.mockResolvedValue(mockDocument);
    mockDocumentRepository.decryptPhoto.mockResolvedValue(
      "data:image/png;base64,test",
    );

    render(<DocumentDetailsScreen />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeTruthy();
    });

    // Pressionar o botão de voltar
    fireEvent.press(screen.getByText("←"));

    // Deve navegar para /guest-mode com replace
    expect(mockRouter.replace).toHaveBeenCalledWith("/guest-mode");
    expect(mockRouter.back).not.toHaveBeenCalled();
  });

  it("should navigate back normally when NOT in guest mode", async () => {
    // Mock dos parâmetros sem guestMode
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      documentId: "doc1",
    });

    mockDocumentRepository.findById.mockResolvedValue(mockDocument);
    mockDocumentRepository.decryptPhoto.mockResolvedValue(
      "data:image/png;base64,test",
    );

    render(<DocumentDetailsScreen />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeTruthy();
    });

    // Pressionar o botão de voltar
    fireEvent.press(screen.getByText("←"));

    // Deve usar router.back() normal
    expect(mockRouter.back).toHaveBeenCalled();
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it("should handle credit card documents correctly in guest mode", async () => {
    const creditCardDocument = {
      ...mockDocument,
      type: "CreditCard",
      isAutoLockEnabled: true,
    };

    // Mock dos parâmetros com guestMode=true
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      documentId: "doc1",
      guestMode: "true",
    });

    mockDocumentRepository.findById.mockResolvedValue(creditCardDocument);
    mockDocumentRepository.decryptPhoto.mockResolvedValue(
      "data:image/png;base64,test",
    );

    render(<DocumentDetailsScreen />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeTruthy();
    });

    // Para cartões de crédito, o toggle de auto-lock nunca deve aparecer
    // (nem mesmo em modo normal, mas especialmente em guest mode)
    expect(screen.queryByText("Incluir no Auto-lock")).toBeNull();
  });
});
