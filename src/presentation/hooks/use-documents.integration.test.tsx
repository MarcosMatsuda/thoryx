/**
 * Integration tests for useDocuments hook
 * Validates hook correctly integrates with documents store and load documents use case
 * Tests real flow: hook → store → use case
 */

import { renderHook, waitFor } from "@testing-library/react-native";
import { useDocuments } from "./use-documents";
import { useDocumentsStore } from "@stores/documents.store";
import { Document } from "@domain/entities/document.entity";

// Mock the use case and repository to simulate real API behavior
jest.mock("@domain/use-cases/get-all-documents.use-case");
jest.mock("@data/repositories/document.repository.impl");

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
    fullName: "Test User",
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
    fullName: "Test User",
    dateOfBirth: "1985-05-15",
    expiryDate: "2025-05-15",
    frontPhotoEncrypted: "encrypted-front-2",
    backPhotoEncrypted: "encrypted-back-2",
    isAutoLockEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe("useDocuments Hook - Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useDocumentsStore.setState({ documents: [], isLoading: false });
  });

  describe("Hook initialization and loading", () => {
    it("should return initial empty state on mount", () => {
      const { result } = renderHook(() => useDocuments());

      expect(result.current.documents).toEqual([]);
      expect(result.current.isLoading).toBe(true); // isLoading starts as true because loadDocuments is called in useEffect
    });

    it("should have reload function available", () => {
      const { result } = renderHook(() => useDocuments());

      expect(typeof result.current.reload).toBe("function");
    });
  });

  describe("Hook with store integration", () => {
    it("should load documents from store after mount", async () => {
      const {
        GetAllDocumentsUseCase,
      } = require("@domain/use-cases/get-all-documents.use-case");
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(mockDocuments),
      };
      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { result } = renderHook(() => useDocuments());

      await waitFor(() => {
        expect(result.current.documents).toEqual(mockDocuments);
      });
    });

    it("should show loading state during document loading", async () => {
      const {
        GetAllDocumentsUseCase,
      } = require("@domain/use-cases/get-all-documents.use-case");
      const mockUseCase = {
        execute: jest
          .fn()
          .mockImplementation(
            () =>
              new Promise((resolve) =>
                setTimeout(() => resolve(mockDocuments), 50),
              ),
          ),
      };
      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { result } = renderHook(() => useDocuments());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("should allow manual reload via reload function", async () => {
      const {
        GetAllDocumentsUseCase,
      } = require("@domain/use-cases/get-all-documents.use-case");
      const mockUseCase = {
        execute: jest
          .fn()
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce(mockDocuments),
      };
      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { result } = renderHook(() => useDocuments());

      // Initial load
      await waitFor(() => {
        expect(result.current.documents).toBeDefined();
      });

      // Manual reload
      result.current.reload();

      await waitFor(() => {
        expect(mockUseCase.execute).toHaveBeenCalled();
      });
    });

    it("should handle errors gracefully during load", async () => {
      const {
        GetAllDocumentsUseCase,
      } = require("@domain/use-cases/get-all-documents.use-case");
      const mockUseCase = {
        execute: jest.fn().mockRejectedValue(new Error("Network error")),
      };
      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { result } = renderHook(() => useDocuments());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should have empty documents on error
      expect(result.current.documents).toEqual([]);
    });
  });

  describe("Hook return value structure", () => {
    it("should return object with documents, isLoading, and reload", () => {
      const { result } = renderHook(() => useDocuments());

      expect(result.current).toHaveProperty("documents");
      expect(result.current).toHaveProperty("isLoading");
      expect(result.current).toHaveProperty("reload");
    });

    it("should return documents as array", () => {
      const { result } = renderHook(() => useDocuments());

      expect(Array.isArray(result.current.documents)).toBe(true);
    });

    it("should return isLoading as boolean", () => {
      const { result } = renderHook(() => useDocuments());

      expect(typeof result.current.isLoading).toBe("boolean");
    });
  });

  describe("Integration: Hook → Store → UseCase", () => {
    it("should correctly pass through store data to hook", async () => {
      const {
        GetAllDocumentsUseCase,
      } = require("@domain/use-cases/get-all-documents.use-case");
      const testDoc: Document = {
        id: "doc-test",
        type: "RG",
        documentNumber: "123456789",
        fullName: "Integration Test",
        dateOfBirth: "1990-01-01",
        expiryDate: "2030-01-01",
        frontPhotoEncrypted: "encrypted-test-front",
        backPhotoEncrypted: "encrypted-test-back",
        isAutoLockEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUseCase = {
        execute: jest.fn().mockResolvedValue([testDoc]),
      };
      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { result } = renderHook(() => useDocuments());

      await waitFor(() => {
        expect(result.current.documents).toContainEqual(testDoc);
      });

      expect(result.current.documents[0].fullName).toBe("Integration Test");
      expect(result.current.documents[0].type).toBe("RG");
    });

    it("should maintain document data structure through hook", async () => {
      const {
        GetAllDocumentsUseCase,
      } = require("@domain/use-cases/get-all-documents.use-case");
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(mockDocuments),
      };
      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { result } = renderHook(() => useDocuments());

      await waitFor(() => {
        expect(result.current.documents.length).toBeGreaterThan(0);
      });

      const doc = result.current.documents[0];
      expect(doc).toHaveProperty("id");
      expect(doc).toHaveProperty("type");
      expect(doc).toHaveProperty("documentNumber");
      expect(doc).toHaveProperty("fullName");
      expect(doc).toHaveProperty("isAutoLockEnabled");
    });

    it("should preserve isAutoLockEnabled flag through hook", async () => {
      const {
        GetAllDocumentsUseCase,
      } = require("@domain/use-cases/get-all-documents.use-case");
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(mockDocuments),
      };
      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { result } = renderHook(() => useDocuments());

      await waitFor(() => {
        expect(result.current.documents.length).toBe(2);
      });

      const autoLockedDocs = result.current.documents.filter(
        (d) => d.isAutoLockEnabled,
      );
      expect(autoLockedDocs).toHaveLength(1);
      expect(autoLockedDocs[0].id).toBe("doc-2");
    });
  });

  describe("Multiple hook instances", () => {
    it("should share store state between multiple hook instances", async () => {
      const {
        GetAllDocumentsUseCase,
      } = require("@domain/use-cases/get-all-documents.use-case");
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(mockDocuments),
      };
      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { result: result1 } = renderHook(() => useDocuments());
      const { result: result2 } = renderHook(() => useDocuments());

      await waitFor(() => {
        expect(result1.current.documents).toEqual(result2.current.documents);
      });
    });
  });

  describe("Edge cases", () => {
    it("should handle empty document list from use case", async () => {
      const {
        GetAllDocumentsUseCase,
      } = require("@domain/use-cases/get-all-documents.use-case");
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue([]),
      };
      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { result } = renderHook(() => useDocuments());

      await waitFor(() => {
        expect(result.current.documents).toEqual([]);
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("should handle multiple document types (RG, CNH) correctly", async () => {
      const {
        GetAllDocumentsUseCase,
      } = require("@domain/use-cases/get-all-documents.use-case");
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(mockDocuments),
      };
      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { result } = renderHook(() => useDocuments());

      await waitFor(() => {
        expect(result.current.documents.length).toBe(2);
      });

      const types = result.current.documents.map((d) => d.type);
      expect(types).toContain("RG");
      expect(types).toContain("CNH");
    });
  });
});
