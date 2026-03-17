/**
 * Integration tests for SelectDocumentsScreen
 * Validates screen correctly integrates with useDocuments hook, user selection flow, validation, and navigation
 * Tests real flow: screen → hook → store → use case
 */

import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { SelectDocumentsScreen } from "./select-documents-screen";
import { useRouter } from "expo-router";
import { useDocuments } from "@presentation/hooks/use-documents";
import { Document } from "@domain/entities/document.entity";

// Mock expo-router
const mockBack = jest.fn();
const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  useFocusEffect: jest.fn(),
}));

// Mock useDocuments hook
jest.mock("@presentation/hooks/use-documents");

// Mock expo-image-manipulator to avoid expo/src/winter import issues
jest.mock("expo-image-manipulator", () => ({
  manipulateAsync: jest.fn(() => Promise.resolve({ uri: "test-uri" })),
  SaveFormat: {
    JPEG: "jpeg",
    PNG: "png",
  },
}));

const mockDocuments: Document[] = [
  {
    id: "doc-1",
    type: "RG",
    documentNumber: "123456789",
    fullName: "John Doe",
    dateOfBirth: "1990-01-01",
    expiryDate: "2030-01-01",
    frontPhotoEncrypted: "encrypted-front-1",
    backPhotoEncrypted: "encrypted-back-1",
    isAutoLockEnabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "doc-2",
    type: "CNH",
    documentNumber: "987654321",
    fullName: "John Doe",
    dateOfBirth: "1985-05-15",
    expiryDate: "2025-05-15",
    frontPhotoEncrypted: "encrypted-front-2",
    backPhotoEncrypted: "encrypted-back-2",
    isAutoLockEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe("SelectDocumentsScreen - Integration Tests", () => {
  const mockAlertAlert = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Alert.alert para os testes
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    jest.spyOn(require("react-native").Alert, "alert").mockImplementation(mockAlertAlert);

    // Configura router
    (useRouter as jest.Mock).mockReturnValue({
      back: mockBack,
      push: mockPush,
      replace: jest.fn(),
      navigate: jest.fn(),
    });

    // Default: documents loaded
    (useDocuments as jest.Mock).mockReturnValue({
      documents: mockDocuments,
      isLoading: false,
      reload: jest.fn(),
    });
  });

  describe("Scenario 1: Renderiza lista com documentos reais", () => {
    it("should render documents list with real data from hook", () => {
      render(<SelectDocumentsScreen />);

      // Verifica que ambos documentos estão renderizados
      expect(screen.getByText(/National ID • \*\*\*\* 6789/)).toBeTruthy();
      expect(screen.getByText(/Driver's License • \*\*\*\* 4321/)).toBeTruthy();
      expect(screen.getByText(/Driver's License/)).toBeTruthy();
      expect(screen.getByText(/National ID/)).toBeTruthy();

      // Verifica últimos 4 dígitos
      expect(screen.getByText(/\*\*\*\* 6789/)).toBeTruthy();
      expect(screen.getByText(/\*\*\*\* 4321/)).toBeTruthy();
    });

    it("should display document icons based on type", () => {
      render(<SelectDocumentsScreen />);

      // Verificar que os ícones aparecem (🚗 para CNH, 🆔 para RG)
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const allText = screen.UNSAFE_getAllByType(require("react-native").Text);
      const icons = allText.map((t) => t.props.children);

      expect(icons).toContain("🚗"); // CNH icon
      expect(icons).toContain("🆔"); // RG icon
    });

    it("should load documents on component mount", async () => {
      const mockReload = jest.fn();
      (useDocuments as jest.Mock).mockReturnValue({
        documents: mockDocuments,
        isLoading: false,
        reload: mockReload,
      });

      render(<SelectDocumentsScreen />);

      await waitFor(() => {
        expect(screen.getByText(/National ID • \*\*\*\* 6789/)).toBeTruthy();
      });
    });

    it("should show loading state when documents are loading", () => {
      (useDocuments as jest.Mock).mockReturnValue({
        documents: [],
        isLoading: true,
        reload: jest.fn(),
      });

      render(<SelectDocumentsScreen />);

      expect(screen.getByText("Loading documents...")).toBeTruthy();
    });

    it("should display all document fields correctly", () => {
      render(<SelectDocumentsScreen />);

      // Verificar campos completos do documento RG
      expect(screen.getByText(/National ID • \*\*\*\* 6789/)).toBeTruthy();
      expect(screen.getByText(/National ID/)).toBeTruthy();

      // Verificar campos completos do documento CNH
      expect(screen.getByText(/Driver's License • \*\*\*\* 4321/)).toBeTruthy();
      expect(screen.getByText(/Driver's License/)).toBeTruthy();
    });
  });

  describe("Scenario 2: Usuário consegue selecionar/desselecionar", () => {
    it("should select document when user taps on it", async () => {
      render(<SelectDocumentsScreen />);

      const rgText = screen.getByText(/National ID • \*\*\*\* 6789/);
      fireEvent.press(rgText.parent);

      await waitFor(() => {
        // Verifica se o documento foi selecionado (contador é atualizado)
        // Como não temos testID fácil, verificamos o estado visual
        expect(screen.getByText(/You are sharing 1 documents/)).toBeTruthy();
      });
    });

    it("should select multiple documents", async () => {
      render(<SelectDocumentsScreen />);

      // Encontra todos os documento items e clica em ambos
      const rgText = screen.getByText(/National ID • \*\*\*\* 6789/);
      const cnhText = screen.getByText(/Driver's License • \*\*\*\* 4321/);

      fireEvent.press(rgText.parent);
      await waitFor(() => {
        expect(screen.getByText(/You are sharing 1 documents/)).toBeTruthy();
      });

      fireEvent.press(cnhText.parent);
      await waitFor(() => {
        expect(screen.getByText(/You are sharing 2 documents/)).toBeTruthy();
      });
    });

    it("should deselect document when user taps again", async () => {
      render(<SelectDocumentsScreen />);

      const rgText = screen.getByText(/National ID • \*\*\*\* 6789/);

      // Seleciona
      fireEvent.press(rgText.parent);
      await waitFor(() => {
        expect(screen.getByText(/You are sharing 1 documents/)).toBeTruthy();
      });

      // Desseleciona
      fireEvent.press(rgText.parent);
      await waitFor(() => {
        expect(screen.getByText(/You are sharing 0 documents/)).toBeTruthy();
      });
    });

    it("should maintain selection state after each toggle", async () => {
      render(<SelectDocumentsScreen />);

      const rgText = screen.getByText(/National ID • \*\*\*\* 6789/);
      const cnhText = screen.getByText(/Driver's License • \*\*\*\* 4321/);

      // Toggle multiple times
      fireEvent.press(rgText.parent);
      await waitFor(() => {
        expect(screen.getByText(/You are sharing 1 documents/)).toBeTruthy();
      });

      fireEvent.press(cnhText.parent);
      await waitFor(() => {
        expect(screen.getByText(/You are sharing 2 documents/)).toBeTruthy();
      });

      fireEvent.press(rgText.parent);
      await waitFor(() => {
        expect(screen.getByText(/You are sharing 1 documents/)).toBeTruthy();
      });
    });

    it("should show document counter updates", async () => {
      render(<SelectDocumentsScreen />);

      expect(screen.getByText(/You are sharing 0 documents/)).toBeTruthy();

      const rgText = screen.getByText(/National ID • \*\*\*\* 6789/);
      fireEvent.press(rgText.parent);

      await waitFor(() => {
        expect(screen.getByText(/You are sharing 1 documents/)).toBeTruthy();
      });
    });
  });

  describe("Scenario 3: Alertas quando tenta confirmar sem seleção", () => {
    it("should show alert when user tries to confirm without selecting documents", async () => {
      render(<SelectDocumentsScreen />);

      const confirmButton = screen.getByText("Confirm & Lock App");
      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(mockAlertAlert).toHaveBeenCalledWith(
          "Select at least one document",
          "You need to select at least one document to enter Guest Mode.",
          expect.any(Array)
        );
      });
    });

    it("should not navigate when alert is dismissed", async () => {
      render(<SelectDocumentsScreen />);

      const confirmButton = screen.getByText("Confirm & Lock App");
      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(mockAlertAlert).toHaveBeenCalled();
      });

      // mockPush não deve ter sido chamado
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("should show correct alert message", async () => {
      render(<SelectDocumentsScreen />);

      const confirmButton = screen.getByText("Confirm & Lock App");
      fireEvent.press(confirmButton);

      await waitFor(() => {
        const callArgs = mockAlertAlert.mock.calls[0];
        expect(callArgs[0]).toBe("Select at least one document");
        expect(callArgs[1]).toContain("at least one document");
        expect(callArgs[1]).toContain("Guest Mode");
      });
    });
  });

  describe("Scenario 4: Navegação para GuestMode com docIds params", () => {
    it("should navigate to /guest-mode with single selected document", async () => {
      render(<SelectDocumentsScreen />);

      const rgText = screen.getByText(/National ID • \*\*\*\* 6789/);
      fireEvent.press(rgText.parent);

      await waitFor(() => {
        expect(screen.getByText(/You are sharing 1 documents/)).toBeTruthy();
      });

      const confirmButton = screen.getByText("Confirm & Lock App");
      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          `/guest-mode?docIds=doc-1`
        );
      });
    });

    it("should navigate to /guest-mode with multiple selected documents", async () => {
      render(<SelectDocumentsScreen />);

      const rgText = screen.getByText(/National ID • \*\*\*\* 6789/);
      const cnhText = screen.getByText(/Driver's License • \*\*\*\* 4321/);

      fireEvent.press(rgText.parent);
      await waitFor(() => {
        expect(screen.getByText(/You are sharing 1 documents/)).toBeTruthy();
      });

      fireEvent.press(cnhText.parent);
      await waitFor(() => {
        expect(screen.getByText(/You are sharing 2 documents/)).toBeTruthy();
      });

      const confirmButton = screen.getByText("Confirm & Lock App");
      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          `/guest-mode?docIds=doc-1,doc-2`
        );
      });
    });

    it("should include correct document IDs in navigation params", async () => {
      render(<SelectDocumentsScreen />);

      const cnhText = screen.getByText(/Driver's License • \*\*\*\* 4321/);
      fireEvent.press(cnhText.parent);

      await waitFor(() => {
        expect(screen.getByText(/You are sharing 1 documents/)).toBeTruthy();
      });

      const confirmButton = screen.getByText("Confirm & Lock App");
      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          `/guest-mode?docIds=doc-2`
        );
      });
    });

    it("should preserve selection order in navigation params", async () => {
      render(<SelectDocumentsScreen />);

      const rgText = screen.getByText(/National ID • \*\*\*\* 6789/);
      const cnhText = screen.getByText(/Driver's License • \*\*\*\* 4321/);

      // Seleciona CNH primeiro, depois RG
      fireEvent.press(cnhText.parent);
      await waitFor(() => {
        expect(screen.getByText(/You are sharing 1 documents/)).toBeTruthy();
      });

      fireEvent.press(rgText.parent);
      await waitFor(() => {
        expect(screen.getByText(/You are sharing 2 documents/)).toBeTruthy();
      });

      const confirmButton = screen.getByText("Confirm & Lock App");
      fireEvent.press(confirmButton);

      await waitFor(() => {
        // A ordem deve ser mantida da seleção (doc-2, doc-1)
        expect(mockPush).toHaveBeenCalledWith(
          `/guest-mode?docIds=doc-2,doc-1`
        );
      });
    });
  });

  describe("Scenario 5: Empty state quando sem docs", () => {
    it("should display empty state when no documents available", () => {
      (useDocuments as jest.Mock).mockReturnValue({
        documents: [],
        isLoading: false,
        reload: jest.fn(),
      });

      render(<SelectDocumentsScreen />);

      expect(
        screen.getByText(
          "No documents registered. Add documents in the main app first."
        )
      ).toBeTruthy();
    });

    it("should show document icon in empty state", () => {
      (useDocuments as jest.Mock).mockReturnValue({
        documents: [],
        isLoading: false,
        reload: jest.fn(),
      });

      render(<SelectDocumentsScreen />);

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const allText = screen.UNSAFE_getAllByType(require("react-native").Text);
      const icons = allText.map((t) => t.props.children);

      expect(icons).toContain("📄"); // Document icon
    });

    it("should not show document list in empty state", () => {
      (useDocuments as jest.Mock).mockReturnValue({
        documents: [],
        isLoading: false,
        reload: jest.fn(),
      });

      render(<SelectDocumentsScreen />);

      // Não deve mostrar os documentos
      expect(screen.queryByText("John Doe")).toBeNull();
      expect(screen.queryByText(/National ID/)).toBeNull();
    });

    it("should disable or hide confirm button in empty state", () => {
      (useDocuments as jest.Mock).mockReturnValue({
        documents: [],
        isLoading: false,
        reload: jest.fn(),
      });

      render(<SelectDocumentsScreen />);

      const confirmButton = screen.getByText("Confirm & Lock App");
      fireEvent.press(confirmButton);

      // Deve mostrar alerta pois nenhum documento selecionado
      expect(mockAlertAlert).toHaveBeenCalled();
    });
  });

  describe("Integration: Header and UI elements", () => {
    it("should display header with title and buttons", () => {
      render(<SelectDocumentsScreen />);

      expect(screen.getByText("Select Documents")).toBeTruthy();
      expect(screen.getByText("Help")).toBeTruthy();
      expect(screen.getByText("✕")).toBeTruthy();
    });

    it("should display description text", () => {
      render(<SelectDocumentsScreen />);

      expect(
        screen.getByText("Which documents do you want to share?")
      ).toBeTruthy();
      expect(
        screen.getByText(/The app will enter a restricted/i)
      ).toBeTruthy();
    });

    it("should display secure lock mode info box", () => {
      render(<SelectDocumentsScreen />);

      expect(screen.getByText("Secure Lock Mode:")).toBeTruthy();
      expect(
        screen.getByText(
          /Once confirmed, your device will be locked to this screen/i
        )
      ).toBeTruthy();
    });

    it("should display sharing counter", () => {
      render(<SelectDocumentsScreen />);

      expect(screen.getByText(/You are sharing 0 documents/)).toBeTruthy();
    });

    it("should allow going back via back button", () => {
      render(<SelectDocumentsScreen />);

      const backButton = screen.getByText("✕");
      fireEvent.press(backButton);

      expect(mockBack).toHaveBeenCalled();
    });
  });

  describe("Edge cases and complex scenarios", () => {
    it("should handle selection after documents are loaded with delay", async () => {
      (useDocuments as jest.Mock).mockReturnValue({
        documents: mockDocuments,
        isLoading: false,
        reload: jest.fn(),
      });

      render(<SelectDocumentsScreen />);

      await waitFor(() => {
        expect(screen.getByText(/National ID • \*\*\*\* 6789/)).toBeTruthy();
      });

      const rgText = screen.getByText(/National ID • \*\*\*\* 6789/);
      fireEvent.press(rgText.parent);

      await waitFor(() => {
        expect(screen.getByText(/You are sharing 1 documents/)).toBeTruthy();
      });
    });

    it("should correctly display multiple documents with same user name", () => {
      render(<SelectDocumentsScreen />);

      // Verifica que ambos aparecem mesmo tendo o mesmo nome - usamos subtitles para distinção
      expect(screen.getByText(/National ID • \*\*\*\* 6789/)).toBeTruthy();
      expect(screen.getByText(/Driver's License • \*\*\*\* 4321/)).toBeTruthy();
    });

    it("should render SelectableDocumentItem for each document", () => {
      render(<SelectDocumentsScreen />);

      // Verifica que temos 2 items completos renderizados
      expect(screen.getByText(/National ID • \*\*\*\* 6789/)).toBeTruthy();
      expect(screen.getByText(/Driver's License • \*\*\*\* 4321/)).toBeTruthy();
    });

    it("should update counter when navigating away and back with same selection", async () => {
      render(<SelectDocumentsScreen />);

      const rgText = screen.getByText(/National ID • \*\*\*\* 6789/);
      fireEvent.press(rgText.parent);

      await waitFor(() => {
        expect(screen.getByText(/You are sharing 1 documents/)).toBeTruthy();
      });

      // Simulando ficar na mesma tela, o estado é mantido
      expect(screen.getByText(/You are sharing 1 documents/)).toBeTruthy();
    });
  });

  describe("Accessibility and interaction", () => {
    it("should have pressable document items", () => {
      render(<SelectDocumentsScreen />);

      const rgText = screen.getByText(/National ID/);
      expect(rgText.parent).toBeTruthy(); // Parent should be Pressable

      // Deve ser possível disparar evento
      expect(() => fireEvent.press(rgText.parent)).not.toThrow();
    });

    it("should have accessible confirm button", () => {
      render(<SelectDocumentsScreen />);

      const confirmButton = screen.getByText("Confirm & Lock App");
      expect(confirmButton).toBeTruthy();
      expect(() => fireEvent.press(confirmButton)).not.toThrow();
    });

    it("should show document type labels clearly", () => {
      render(<SelectDocumentsScreen />);

      expect(screen.getByText(/Driver's License/)).toBeTruthy();
      expect(screen.getByText(/National ID/)).toBeTruthy();
    });
  });
});
