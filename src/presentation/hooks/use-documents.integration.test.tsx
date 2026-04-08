import { renderHook, waitFor } from "@testing-library/react-native";
import { useDocuments } from "./use-documents";
import { useDocumentsStore } from "@stores/documents.store";
import { Document } from "@domain/entities/document.entity";

jest.mock("@domain/use-cases/get-all-documents.use-case");
jest.mock("@data/repositories/document.repository.impl");
jest.mock("@data/repositories/document-type.repository.impl");

jest.mock("expo-image-manipulator", () => ({
  manipulateAsync: jest.fn(() => Promise.resolve({ uri: "test-uri" })),
  SaveFormat: { JPEG: "jpeg", PNG: "png" },
}));

const mockDocuments: Document[] = [
  {
    id: "doc-1",
    typeId: "RG",
    typeName: "RG",
    fields: { fullName: "Test User", rgNumber: "123456789" },
    photos: { front: "encrypted-front-1", back: "encrypted-back-1" },
    isAutoLockEnabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "doc-2",
    typeId: "CNH",
    typeName: "CNH",
    fields: { fullName: "Test User", registrationNumber: "987654321" },
    photos: { front: "encrypted-front-2", back: "encrypted-back-2" },
    isAutoLockEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe("useDocuments Hook - Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useDocumentsStore.setState({
      documents: [],
      customDocumentTypes: [],
      isLoading: false,
    });
  });

  describe("Hook initialization and loading", () => {
    it("should return initial empty state on mount", () => {
      const { result } = renderHook(() => useDocuments());
      expect(result.current.documents).toEqual([]);
      expect(result.current.isLoading).toBe(true);
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
  });

  describe("Integration: Hook → Store → UseCase", () => {
    it("should correctly pass through store data to hook", async () => {
      const {
        GetAllDocumentsUseCase,
      } = require("@domain/use-cases/get-all-documents.use-case");
      const testDoc: Document = {
        id: "doc-test",
        typeId: "RG",
        typeName: "RG",
        fields: { fullName: "Integration Test", rgNumber: "123456789" },
        photos: { front: "encrypted-test-front", back: "encrypted-test-back" },
        isAutoLockEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUseCase = { execute: jest.fn().mockResolvedValue([testDoc]) };
      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { result } = renderHook(() => useDocuments());

      await waitFor(() => {
        expect(result.current.documents).toContainEqual(testDoc);
      });

      expect(result.current.documents[0].fields.fullName).toBe(
        "Integration Test",
      );
      expect(result.current.documents[0].typeId).toBe("RG");
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
      expect(doc).toHaveProperty("typeId");
      expect(doc).toHaveProperty("fields");
      expect(doc).toHaveProperty("photos");
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

  describe("Edge cases", () => {
    it("should handle multiple document types correctly", async () => {
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

      const types = result.current.documents.map((d) => d.typeId);
      expect(types).toContain("RG");
      expect(types).toContain("CNH");
    });
  });
});
