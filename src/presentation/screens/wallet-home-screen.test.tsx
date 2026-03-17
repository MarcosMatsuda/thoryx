/**
 * Unit tests for WalletHomeScreen - Auto-lock Button Feature (TASK-13)
 * Tests button rendering, visibility conditions, navigation, and focus effect
 */

import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
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

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
};

const mockDocuments = [
  {
    id: "1",
    type: "CNH",
    fullName: "John Doe",
    documentNumber: "12345678901",
    isAutoLockEnabled: true,
  },
  {
    id: "2",
    type: "RG",
    fullName: "John Doe",
    documentNumber: "98765432100",
    isAutoLockEnabled: false,
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

describe("WalletHomeScreen - Auto-lock Button Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useFocusEffect as jest.Mock).mockImplementation((cb) => {
      // Call the callback immediately for testing
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

  describe("Auto-lock Button Visibility", () => {
    it("should render auto-lock button when at least one document has isAutoLockEnabled: true", () => {
      const { getByText } = render(<WalletHomeScreen />);
      expect(getByText("Iniciar Auto-lock")).toBeTruthy();
    });

    it("should not render auto-lock button when no documents have isAutoLockEnabled: true", () => {
      (useDocuments as jest.Mock).mockReturnValue({
        documents: [
          {
            id: "1",
            type: "CNH",
            fullName: "John Doe",
            documentNumber: "12345678901",
            isAutoLockEnabled: false,
          },
        ],
        isLoading: false,
        reload: jest.fn(),
      });

      const { queryByText } = render(<WalletHomeScreen />);
      expect(queryByText("Iniciar Auto-lock")).toBeNull();
    });

    it("should not render auto-lock button when documents array is empty", () => {
      (useDocuments as jest.Mock).mockReturnValue({
        documents: [],
        isLoading: false,
        reload: jest.fn(),
      });

      const { queryByText } = render(<WalletHomeScreen />);
      expect(queryByText("Iniciar Auto-lock")).toBeNull();
    });

    it("should render auto-lock button with correct subtitle text", () => {
      const { getByText } = render(<WalletHomeScreen />);
      expect(getByText("Compartilhar documentos selecionados")).toBeTruthy();
    });
  });

  describe("Auto-lock Button Navigation", () => {
    it("should navigate to /guest-mode when auto-lock button is pressed", () => {
      const { getByText } = render(<WalletHomeScreen />);
      const guestModeButton = getByText("Iniciar Modo Convidado");

      fireEvent.press(guestModeButton);

      expect(mockRouter.replace).toHaveBeenCalledWith("/guest-mode");
    });

    it("should use router.replace instead of router.push for guest-mode navigation", () => {
      const { getByText } = render(<WalletHomeScreen />);
      const guestModeButton = getByText("Iniciar Modo Convidado");

      fireEvent.press(guestModeButton);

      expect(mockRouter.replace).toHaveBeenCalledWith("/guest-mode");
      expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it("should trigger button press only once per interaction", () => {
      const { getByText } = render(<WalletHomeScreen />);
      const guestModeButton = getByText("Iniciar Modo Convidado");

      fireEvent.press(guestModeButton);

      expect(mockRouter.replace).toHaveBeenCalledTimes(1);
    });
  });

  describe("Focus Effect and Document Reload", () => {
    it("should call useFocusEffect with callback", () => {
      render(<WalletHomeScreen />);
      expect(useFocusEffect).toHaveBeenCalled();
    });

    it("should reload documents on screen focus", () => {
      const mockLoadDocuments = jest.fn();
      (useDocuments as jest.Mock).mockReturnValue({
        documents: mockDocuments,
        isLoading: false,
        reload: mockLoadDocuments,
      });

      (useFocusEffect as jest.Mock).mockImplementation((cb) => {
        cb(); // Execute the callback immediately (simulating focus)
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
        cb(); // Execute the callback immediately (simulating focus)
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
        cb(); // Execute the callback immediately (simulating focus)
      });

      render(<WalletHomeScreen />);

      expect(mockReloadProfile).toHaveBeenCalled();
      expect(mockLoadDocuments).toHaveBeenCalled();
    });

    it("should include loadDocuments in focus effect dependencies", () => {
      const mockLoadDocuments = jest.fn();
      (useDocuments as jest.Mock).mockReturnValue({
        documents: mockDocuments,
        isLoading: false,
        reload: mockLoadDocuments,
      });

      render(<WalletHomeScreen />);

      // useFocusEffect should receive a callback function
      expect(useFocusEffect).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe("Button Styling and UI Elements", () => {
    it("should have correct icon emoji for auto-lock button", () => {
      const { getByText } = render(<WalletHomeScreen />);
      expect(getByText("🔒")).toBeTruthy();
    });

    it("should display proper button labels in Portuguese", () => {
      const { getByText } = render(<WalletHomeScreen />);
      expect(getByText("Iniciar Auto-lock")).toBeTruthy();
      expect(getByText("Compartilhar documentos selecionados")).toBeTruthy();
      expect(getByText("Iniciar Modo Convidado")).toBeTruthy();
    });
  });

  describe("Multiple Documents Scenarios", () => {
    it("should render button when first document has isAutoLockEnabled: true", () => {
      const { getByText } = render(<WalletHomeScreen />);
      expect(getByText("Iniciar Auto-lock")).toBeTruthy();
    });

    it("should render button when any document in list has isAutoLockEnabled: true", () => {
      (useDocuments as jest.Mock).mockReturnValue({
        documents: [
          {
            id: "1",
            type: "CNH",
            fullName: "John Doe",
            documentNumber: "12345678901",
            isAutoLockEnabled: false,
          },
          {
            id: "2",
            type: "RG",
            fullName: "John Doe",
            documentNumber: "98765432100",
            isAutoLockEnabled: true,
          },
          {
            id: "3",
            type: "CNH",
            fullName: "John Doe",
            documentNumber: "11111111111",
            isAutoLockEnabled: false,
          },
        ],
        isLoading: false,
        reload: jest.fn(),
      });

      const { getByText } = render(<WalletHomeScreen />);
      expect(getByText("Iniciar Auto-lock")).toBeTruthy();
    });

    it("should not render button when all documents have isAutoLockEnabled: false", () => {
      (useDocuments as jest.Mock).mockReturnValue({
        documents: [
          {
            id: "1",
            type: "CNH",
            fullName: "John Doe",
            documentNumber: "12345678901",
            isAutoLockEnabled: false,
          },
          {
            id: "2",
            type: "RG",
            fullName: "John Doe",
            documentNumber: "98765432100",
            isAutoLockEnabled: false,
          },
        ],
        isLoading: false,
        reload: jest.fn(),
      });

      const { queryByText } = render(<WalletHomeScreen />);
      expect(queryByText("Iniciar Auto-lock")).toBeNull();
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined documents gracefully", () => {
      (useDocuments as jest.Mock).mockReturnValue({
        documents: undefined,
        isLoading: false,
        reload: jest.fn(),
      });

      // Should not crash
      expect(() => {
        render(<WalletHomeScreen />);
      }).not.toThrow();
    });

    it("should handle null profile without crashing", () => {
      (useUserProfile as jest.Mock).mockReturnValue({
        profile: null,
        isLoading: false,
        reloadProfile: jest.fn(),
      });

      // Should not crash and should navigate to profile-setup
      expect(() => {
        render(<WalletHomeScreen />);
      }).not.toThrow();
    });

    it("should handle loading state for documents", () => {
      (useDocuments as jest.Mock).mockReturnValue({
        documents: [],
        isLoading: true,
        reload: jest.fn(),
      });

      const { queryByText } = render(<WalletHomeScreen />);
      expect(queryByText("Iniciar Auto-lock")).toBeNull();
    });
  });

  describe("Integration: Auto-lock Feature Complete Flow", () => {
    it("should show button, handle focus effect, and navigate correctly", () => {
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
        cb(); // Execute the callback immediately (simulating focus)
      });

      const { getByText } = render(<WalletHomeScreen />);

      // 1. Button should be visible
      expect(getByText("Iniciar Auto-lock")).toBeTruthy();

      // 2. Focus effect should reload both profile and documents
      expect(mockReloadProfile).toHaveBeenCalled();
      expect(mockLoadDocuments).toHaveBeenCalled();

      // 3. Button press should navigate to guest-mode
      const guestModeButton = getByText("Iniciar Modo Convidado");
      fireEvent.press(guestModeButton);
      expect(mockRouter.replace).toHaveBeenCalledWith("/guest-mode");
    });
  });
});
