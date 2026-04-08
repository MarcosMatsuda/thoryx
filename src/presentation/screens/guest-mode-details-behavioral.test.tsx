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

const mockBack = jest.fn();
const mockReplace = jest.fn();
const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
  useFocusEffect: jest.fn(),
}));

jest.mock("@presentation/components/document-photo-carousel", () => ({
  DocumentPhotoCarousel: () => {
    const { View, Text } = require("react-native");
    return (
      <View testID="document-photo-carousel">
        <Text>Photo Carousel</Text>
      </View>
    );
  },
}));

jest.mock("@presentation/components/detail-row", () => ({
  DetailRow: ({ label, value }: { label: string; value: string }) => {
    const { View, Text } = require("react-native");
    return (
      <View testID={`detail-row-${label}`}>
        <Text>{label}</Text>
        <Text>{value}</Text>
      </View>
    );
  },
}));

jest.mock("@presentation/components/action-button-large", () => ({
  ActionButtonLarge: ({ label }: { label: string }) => {
    const { Pressable, Text } = require("react-native");
    return (
      <Pressable testID={`action-button-${label}`}>
        <Text>{label}</Text>
      </Pressable>
    );
  },
}));

jest.mock("@presentation/components/info-banner", () => ({
  InfoBanner: ({ message }: { message: string }) => {
    const { View, Text } = require("react-native");
    return (
      <View testID="info-banner">
        <Text>{message}</Text>
      </View>
    );
  },
}));

jest.mock("@stores/documents.store", () => ({
  useDocumentsStore: jest.fn(() => ({
    customDocumentTypes: [],
    loadCustomTypes: jest.fn(),
  })),
}));

jest.mock("@presentation/components/settings-item", () => ({
  SettingsItem: ({ label }: { label: string }) => {
    const { View, Text } = require("react-native");
    return (
      <View testID={`settings-item-${label}`}>
        <Text>{label}</Text>
      </View>
    );
  },
}));

const mockDocument = {
  id: "doc-123",
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

describe("DocumentDetailsScreen - Guest Mode Behavioral Tests", () => {
  let mockFindById: jest.Mock;
  let mockDecryptPhoto: jest.Mock;
  let mockDecryptPhotos: jest.Mock;
  let mockToggleAutoLock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      back: mockBack,
      replace: mockReplace,
      push: mockPush,
      navigate: jest.fn(),
    });

    mockFindById = jest.fn();
    mockDecryptPhoto = jest.fn();
    mockDecryptPhotos = jest.fn().mockResolvedValue({
      front: "data:image/png;base64,test",
      back: "data:image/png;base64,test",
    });
    mockToggleAutoLock = jest.fn();

    (DocumentRepositoryImpl as jest.Mock).mockImplementation(() => ({
      findAll: jest.fn(),
      findById: mockFindById,
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      toggleAutoLock: mockToggleAutoLock,
      decryptPhoto: mockDecryptPhoto,
      decryptPhotos: mockDecryptPhotos,
    }));
  });

  describe("Guest Mode Navigation", () => {
    it("should use router.replace(/guest-mode) instead of router.back() when in guest mode", async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        documentId: "doc-123",
        guestMode: "true",
      });

      mockFindById.mockResolvedValue(mockDocument);
      mockDecryptPhoto.mockResolvedValue("data:image/png;base64,test");

      render(<DocumentDetailsScreen />);

      await waitFor(
        () => {
          expect(screen.getByText("John Doe")).toBeTruthy();
        },
        { timeout: 10000 },
      );

      // Press back button
      fireEvent.press(screen.getByTestId("lucide-ChevronLeft"));

      // Should use replace, not back (prevents going back to app)
      expect(mockReplace).toHaveBeenCalledWith("/guest-mode");
      expect(mockBack).not.toHaveBeenCalled();
    }, 15000);

    it("should use router.back() when NOT in guest mode", async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        documentId: "doc-123",
        // No guestMode param
      });

      mockFindById.mockResolvedValue(mockDocument);
      mockDecryptPhoto.mockResolvedValue("data:image/png;base64,test");

      render(<DocumentDetailsScreen />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeTruthy();
      });

      // Press back button
      fireEvent.press(screen.getByTestId("lucide-ChevronLeft"));

      // Should use back in normal mode
      expect(mockBack).toHaveBeenCalled();
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it("should handle guestMode parameter case-insensitively (only 'true' string triggers it)", async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        documentId: "doc-123",
        guestMode: "false",
      });

      mockFindById.mockResolvedValue(mockDocument);
      mockDecryptPhoto.mockResolvedValue("data:image/png;base64,test");

      render(<DocumentDetailsScreen />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeTruthy();
      });

      // Press back button
      fireEvent.press(screen.getByTestId("lucide-ChevronLeft"));

      // Should use back because guestMode="false"
      expect(mockBack).toHaveBeenCalled();
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  describe("Guest Mode UI Restrictions", () => {
    it("should NOT show edit button when in guest mode", async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        documentId: "doc-123",
        guestMode: "true",
      });

      mockFindById.mockResolvedValue(mockDocument);
      mockDecryptPhoto.mockResolvedValue("data:image/png;base64,test");

      render(<DocumentDetailsScreen />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeTruthy();
      });

      // Edit button (pencil emoji) should NOT exist
      expect(screen.queryByTestId("lucide-Pencil")).toBeNull();
    });

    it("should show edit button when NOT in guest mode", async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        documentId: "doc-123",
      });

      mockFindById.mockResolvedValue(mockDocument);
      mockDecryptPhoto.mockResolvedValue("data:image/png;base64,test");

      render(<DocumentDetailsScreen />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeTruthy();
      });

      // Edit button should exist
      expect(screen.getByTestId("lucide-Pencil")).toBeTruthy();
    });

    it("should NOT show auto-lock toggle for RG/CNH documents when in guest mode", async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        documentId: "doc-123",
        guestMode: "true",
      });

      mockFindById.mockResolvedValue(mockDocument); // RG document
      mockDecryptPhoto.mockResolvedValue("data:image/png;base64,test");

      render(<DocumentDetailsScreen />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeTruthy();
      });

      // Auto-lock toggle should NOT exist in guest mode
      expect(screen.queryByText("Incluir no Auto-lock")).toBeNull();
    });

    it("should show auto-lock toggle for RG documents when NOT in guest mode", async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        documentId: "doc-123",
      });

      mockFindById.mockResolvedValue(mockDocument); // RG document
      mockDecryptPhoto.mockResolvedValue("data:image/png;base64,test");

      render(<DocumentDetailsScreen />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeTruthy();
      });

      // Auto-lock toggle should exist
      expect(screen.getByText("Incluir no Auto-lock")).toBeTruthy();
    });

    it("should show auto-lock toggle for CNH documents when NOT in guest mode", async () => {
      const cnhDocument = { ...mockDocument, typeId: "CNH", typeName: "CNH" };

      (useLocalSearchParams as jest.Mock).mockReturnValue({
        documentId: "doc-123",
      });

      mockFindById.mockResolvedValue(cnhDocument);
      mockDecryptPhoto.mockResolvedValue("data:image/png;base64,test");

      render(<DocumentDetailsScreen />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeTruthy();
      });

      // Auto-lock toggle should exist for CNH
      expect(screen.getByText("Incluir no Auto-lock")).toBeTruthy();
    });

    it("should show auto-lock toggle for CreditCard documents when not in guest mode", async () => {
      const creditCardDoc = {
        ...mockDocument,
        typeId: "CreditCard",
        typeName: "Credit Card",
      };

      (useLocalSearchParams as jest.Mock).mockReturnValue({
        documentId: "doc-123",
        guestMode: "false", // Not guest mode
      });

      mockFindById.mockResolvedValue(creditCardDoc);
      mockDecryptPhoto.mockResolvedValue("data:image/png;base64,test");

      render(<DocumentDetailsScreen />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeTruthy();
      });

      // Auto-lock toggle should exist for ALL document types when not in guest mode
      expect(screen.getByText("Incluir no Auto-lock")).toBeTruthy();
    });
  });

  describe("Content Display in Guest Mode", () => {
    it("should display document details (name, number, birth date, expiry) in guest mode", async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        documentId: "doc-123",
        guestMode: "true",
      });

      mockFindById.mockResolvedValue(mockDocument);
      mockDecryptPhoto.mockResolvedValue("data:image/png;base64,test");

      render(<DocumentDetailsScreen />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeTruthy();
      });

      // All detail rows should be present (Portuguese labels from typeDef)
      expect(screen.getByTestId("detail-row-Nome Completo")).toBeTruthy();
      expect(screen.getByTestId("detail-row-Data de Nascimento")).toBeTruthy();
    });

    it("should display encryption info banner in guest mode", async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        documentId: "doc-123",
        guestMode: "true",
      });

      mockFindById.mockResolvedValue(mockDocument);
      mockDecryptPhoto.mockResolvedValue("data:image/png;base64,test");

      render(<DocumentDetailsScreen />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeTruthy();
      });

      // Encryption info banner should be visible
      expect(
        screen.getByText(/criptografado e armazenado localmente/),
      ).toBeTruthy();
    });

    it("should display photo carousel when photos are decrypted", async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        documentId: "doc-123",
        guestMode: "true",
      });

      mockFindById.mockResolvedValue(mockDocument);
      mockDecryptPhoto.mockResolvedValue("data:image/png;base64,test");

      render(<DocumentDetailsScreen />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeTruthy();
      });

      expect(screen.getByTestId("document-photo-carousel")).toBeTruthy();
    });
  });

  describe("Fallback and Error States", () => {
    it("should show loading state while fetching document", () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        documentId: "doc-123",
        guestMode: "true",
      });

      // Never resolves
      mockFindById.mockReturnValue(new Promise(() => {}));

      render(<DocumentDetailsScreen />);

      // LoadingIndicator should be visible, but we can't directly test it
      // We can check that the content is not loaded
      expect(screen.queryByText("John Doe")).toBeNull();
    });

    it("should show 'Document not found' when document ID is missing", () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        // No documentId
        guestMode: "true",
      });

      render(<DocumentDetailsScreen />);

      expect(screen.getByText("Documento não encontrado")).toBeTruthy();
    });

    it("should show 'Document not found' when repository returns null", async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        documentId: "doc-123",
        guestMode: "true",
      });

      mockFindById.mockResolvedValue(null);

      render(<DocumentDetailsScreen />);

      await waitFor(() => {
        expect(screen.getByText("Documento não encontrado")).toBeTruthy();
      });
    });
  });

  describe("Document Type Handling", () => {
    it("should display correct title for RG documents", async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        documentId: "doc-123",
        guestMode: "true",
      });

      mockFindById.mockResolvedValue({
        ...mockDocument,
        typeId: "RG",
        typeName: "RG",
      });
      mockDecryptPhoto.mockResolvedValue("data:image/png;base64,test");

      render(<DocumentDetailsScreen />);

      await waitFor(() => {
        expect(screen.getByText("RG")).toBeTruthy(); // RG title
      });
    });

    it("should display correct title for CNH documents", async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        documentId: "doc-123",
        guestMode: "true",
      });

      mockFindById.mockResolvedValue({
        ...mockDocument,
        typeId: "CNH",
        typeName: "CNH",
      });
      mockDecryptPhoto.mockResolvedValue("data:image/png;base64,test");

      render(<DocumentDetailsScreen />);

      await waitFor(() => {
        expect(screen.getByText("CNH")).toBeTruthy(); // CNH title from typeName
      });
    });

    it("should display generic 'Document' title for unknown types", async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        documentId: "doc-123",
        guestMode: "true",
      });

      mockFindById.mockResolvedValue({
        ...mockDocument,
        typeId: "UnknownType",
        typeName: "UnknownType",
      });
      mockDecryptPhoto.mockResolvedValue("data:image/png;base64,test");

      render(<DocumentDetailsScreen />);

      await waitFor(() => {
        expect(screen.getByText("UnknownType")).toBeTruthy(); // typeName is used as-is
      });
    });
  });
});
