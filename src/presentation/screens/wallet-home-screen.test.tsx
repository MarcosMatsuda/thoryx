/**
 * Unit tests for WalletHomeScreen (post TASK-4)
 * Auto-lock button has been removed. Tests reflect current component state.
 */

import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useDocuments } from "@presentation/hooks/use-documents";
import { useCreditCards } from "@presentation/hooks/use-credit-cards";
import { useUserProfile } from "@presentation/hooks/use-user-profile";
import { WalletHomeScreen } from "./wallet-home-screen";

// Mock dependencies
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  useFocusEffect: jest.fn(),
}));

jest.mock("@presentation/hooks/use-documents", () => ({
  useDocuments: jest.fn(),
}));

jest.mock("@presentation/hooks/use-credit-cards", () => ({
  useCreditCards: jest.fn(),
}));

jest.mock("@presentation/hooks/use-user-profile", () => ({
  useUserProfile: jest.fn(),
}));

jest.mock("@presentation/components/user-avatar", () => ({
  UserAvatar: () => null,
}));

jest.mock("@presentation/components/action-card", () => ({
  ActionCard: () => null,
}));

jest.mock("@presentation/components/svg-icon", () => ({
  SvgIcon: () => null,
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));

jest.mock("@stores/documents.store", () => ({
  useDocumentsStore: jest.fn(() => ({
    customDocumentTypes: [],
  })),
}));

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
};

const mockDocuments = [
  {
    id: "1",
    typeId: "CNH",
    typeName: "CNH",
    fields: { fullName: "John Doe", documentNumber: "12345678901" },
    photos: {},
    isAutoLockEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    typeId: "RG",
    typeName: "RG",
    fields: { fullName: "John Doe", documentNumber: "98765432100" },
    photos: {},
    isAutoLockEnabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockCards = [
  {
    id: "1",
    number: "1234",
    holderName: "John Doe",
  },
];

const mockProfile = {
  id: "1",
  name: "John Doe",
  photoUri: "https://example.com/photo.jpg",
};

describe("WalletHomeScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useFocusEffect as jest.Mock).mockImplementation((cb) => {
      cb();
    });

    (useDocuments as jest.Mock).mockReturnValue({
      documents: mockDocuments,
      isLoading: false,
      reload: jest.fn(),
    });

    (useCreditCards as jest.Mock).mockReturnValue({
      cards: mockCards,
      isLoading: false,
    });

    (useUserProfile as jest.Mock).mockReturnValue({
      profile: mockProfile,
      isLoading: false,
      reloadProfile: jest.fn(),
    });
  });

  describe("Auto-lock Button Removal (TASK-4)", () => {
    it("should NOT render auto-lock button regardless of isAutoLockEnabled", () => {
      const { queryByText } = render(<WalletHomeScreen />);
      expect(queryByText("Iniciar Auto-lock")).toBeNull();
    });

    it("should NOT render auto-lock subtitle text", () => {
      const { queryByText } = render(<WalletHomeScreen />);
      expect(queryByText("Compartilhar documentos selecionados")).toBeNull();
    });

    it("should NOT render guest mode button from auto-lock flow", () => {
      const { queryByText } = render(<WalletHomeScreen />);
      expect(queryByText("Iniciar Modo Convidado")).toBeNull();
    });

    it("should NOT render auto-lock lock icon emoji", () => {
      const { queryByText } = render(<WalletHomeScreen />);
      expect(queryByText("🔒")).toBeNull();
    });

    it("should NOT render auto-lock button even when all documents have isAutoLockEnabled: true", () => {
      (useDocuments as jest.Mock).mockReturnValue({
        documents: [
          {
            id: "1",
            typeId: "CNH",
            typeName: "CNH",
            fields: { fullName: "John Doe", documentNumber: "12345678901" },
            photos: {},
            isAutoLockEnabled: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "2",
            typeId: "RG",
            typeName: "RG",
            fields: { fullName: "John Doe", documentNumber: "98765432100" },
            photos: {},
            isAutoLockEnabled: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        isLoading: false,
        reload: jest.fn(),
      });

      const { queryByText } = render(<WalletHomeScreen />);
      expect(queryByText("Iniciar Auto-lock")).toBeNull();
    });
  });

  describe("Secure Sharing Mode Section", () => {
    it("should render Secure Sharing Mode title", () => {
      const { getByText } = render(<WalletHomeScreen />);
      expect(getByText("Modo Compartilhamento Seguro")).toBeTruthy();
    });

    it("should render Start Sharing button", () => {
      const { getByText } = render(<WalletHomeScreen />);
      expect(getByText("Iniciar Compartilhamento")).toBeTruthy();
    });

    it("should navigate to /select-documents when Start Sharing is pressed", () => {
      const { getByText } = render(<WalletHomeScreen />);
      fireEvent.press(getByText("Iniciar Compartilhamento"));
      expect(mockRouter.push).toHaveBeenCalledWith("/select-documents");
    });

    it("should NOT navigate to /guest-mode from Secure Sharing button", () => {
      const { getByText } = render(<WalletHomeScreen />);
      fireEvent.press(getByText("Iniciar Compartilhamento"));
      expect(mockRouter.replace).not.toHaveBeenCalledWith("/guest-mode");
      expect(mockRouter.push).not.toHaveBeenCalledWith("/guest-mode");
    });
  });

  describe("Quick Actions Section", () => {
    it("should render QUICK ACTIONS section header", () => {
      const { getByText } = render(<WalletHomeScreen />);
      expect(getByText("AÇÕES RÁPIDAS")).toBeTruthy();
    });
  });

  describe("Profile Display", () => {
    it("should render welcome back text", () => {
      const { getByText } = render(<WalletHomeScreen />);
      expect(getByText("Bem-vindo,")).toBeTruthy();
    });

    it("should render user name from profile", () => {
      const { getAllByText } = render(<WalletHomeScreen />);
      // "John Doe" appears in profile header and also in document list fullName
      expect(getAllByText("John Doe").length).toBeGreaterThan(0);
    });

    it("should handle null profile without crashing", () => {
      (useUserProfile as jest.Mock).mockReturnValue({
        profile: null,
        isLoading: false,
        reloadProfile: jest.fn(),
      });

      expect(() => render(<WalletHomeScreen />)).not.toThrow();
    });
  });

  describe("Documents Section", () => {
    it("should render MY DOCUMENTS section header", () => {
      const { getByText } = render(<WalletHomeScreen />);
      expect(getByText("MEUS DOCUMENTOS")).toBeTruthy();
    });

    it("should render See All link", () => {
      const { getByText } = render(<WalletHomeScreen />);
      expect(getByText("Ver Todos")).toBeTruthy();
    });

    it("should render documents list", () => {
      const { getByText } = render(<WalletHomeScreen />);
      expect(getByText("CNH")).toBeTruthy();
    });

    it("should show empty state when no documents", () => {
      (useDocuments as jest.Mock).mockReturnValue({
        documents: [],
        isLoading: false,
        reload: jest.fn(),
      });

      const { getByText } = render(<WalletHomeScreen />);
      expect(
        getByText("Nenhum documento ainda. Adicione seu primeiro!"),
      ).toBeTruthy();
    });

    it("should handle undefined documents gracefully", () => {
      (useDocuments as jest.Mock).mockReturnValue({
        documents: undefined,
        isLoading: false,
        reload: jest.fn(),
      });

      expect(() => render(<WalletHomeScreen />)).not.toThrow();
    });
  });

  describe("Focus Effect and Data Reload", () => {
    it("should call useFocusEffect with a callback", () => {
      render(<WalletHomeScreen />);
      expect(useFocusEffect).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should reload documents on screen focus", () => {
      const mockLoadDocuments = jest.fn();
      (useDocuments as jest.Mock).mockReturnValue({
        documents: mockDocuments,
        isLoading: false,
        reload: mockLoadDocuments,
      });

      (useFocusEffect as jest.Mock).mockImplementation((cb) => {
        cb();
      });

      render(<WalletHomeScreen />);
      expect(mockLoadDocuments).toHaveBeenCalled();
    });

    it("should reload profile on screen focus", () => {
      const mockReloadProfile = jest.fn();
      (useUserProfile as jest.Mock).mockReturnValue({
        profile: mockProfile,
        isLoading: false,
        reloadProfile: mockReloadProfile,
      });

      (useFocusEffect as jest.Mock).mockImplementation((cb) => {
        cb();
      });

      render(<WalletHomeScreen />);
      expect(mockReloadProfile).toHaveBeenCalled();
    });

    it("should call both reloadProfile and loadDocuments on focus", () => {
      const mockReloadProfile = jest.fn();
      const mockLoadDocuments = jest.fn();

      (useUserProfile as jest.Mock).mockReturnValue({
        profile: mockProfile,
        isLoading: false,
        reloadProfile: mockReloadProfile,
      });

      (useDocuments as jest.Mock).mockReturnValue({
        documents: mockDocuments,
        isLoading: false,
        reload: mockLoadDocuments,
      });

      (useFocusEffect as jest.Mock).mockImplementation((cb) => {
        cb();
      });

      render(<WalletHomeScreen />);
      expect(mockReloadProfile).toHaveBeenCalled();
      expect(mockLoadDocuments).toHaveBeenCalled();
    });
  });

  describe("Integration: Complete Screen Flow", () => {
    it("should render screen without auto-lock, show secure sharing, and handle focus effect", () => {
      const mockLoadDocuments = jest.fn();
      const mockReloadProfile = jest.fn();

      (useDocuments as jest.Mock).mockReturnValue({
        documents: mockDocuments,
        isLoading: false,
        reload: mockLoadDocuments,
      });

      (useUserProfile as jest.Mock).mockReturnValue({
        profile: mockProfile,
        isLoading: false,
        reloadProfile: mockReloadProfile,
      });

      (useFocusEffect as jest.Mock).mockImplementation((cb) => {
        cb();
      });

      const { getByText, queryByText } = render(<WalletHomeScreen />);

      // 1. Auto-lock button should NOT be present
      expect(queryByText("Iniciar Auto-lock")).toBeNull();
      expect(queryByText("Iniciar Modo Convidado")).toBeNull();

      // 2. Secure Sharing section should be present
      expect(getByText("Modo Compartilhamento Seguro")).toBeTruthy();
      expect(getByText("Iniciar Compartilhamento")).toBeTruthy();

      // 3. Focus effect should reload both profile and documents
      expect(mockReloadProfile).toHaveBeenCalled();
      expect(mockLoadDocuments).toHaveBeenCalled();

      // 4. Start Sharing navigates to /select-documents
      fireEvent.press(getByText("Iniciar Compartilhamento"));
      expect(mockRouter.push).toHaveBeenCalledWith("/select-documents");
    });
  });
});
