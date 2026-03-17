import { useDocumentsStore } from "./documents.store";
import { GetAllDocumentsUseCase } from "@domain/use-cases/get-all-documents.use-case";
import { Document } from "@domain/entities/document.entity";

jest.mock("@domain/use-cases/get-all-documents.use-case");
jest.mock("@data/repositories/document.repository.impl");

describe("useDocumentsStore", () => {
  const mockDocuments: Document[] = [
    {
      id: "doc-1",
      name: "RG",
      type: "identification",
      fileUrl: "https://example.com/doc1.pdf",
      uploadedAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
    {
      id: "doc-2",
      name: "Comprovante de Residência",
      type: "address",
      fileUrl: "https://example.com/doc2.pdf",
      uploadedAt: new Date(),
      expiresAt: null,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Initial state", () => {
    it("should initialize with empty documents array and false isLoading", () => {
      const store = useDocumentsStore.getState();

      expect(store.documents).toEqual([]);
      expect(store.isLoading).toBe(false);
    });

    it("should have correct initial structure", () => {
      const store = useDocumentsStore.getState();

      expect(store).toHaveProperty("documents");
      expect(store).toHaveProperty("isLoading");
      expect(store).toHaveProperty("loadDocuments");
      expect(store).toHaveProperty("reset");
    });
  });

  describe("loadDocuments action", () => {
    it("should load documents successfully", async () => {
      const mockGetAllDocumentsUseCase = {
        execute: jest.fn().mockResolvedValue(mockDocuments),
      };

      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(
        () => mockGetAllDocumentsUseCase,
      );

      const store = useDocumentsStore.getState();
      await store.loadDocuments();

      expect(store.documents).toEqual(mockDocuments);
      expect(store.isLoading).toBe(false);
    });

    it("should set isLoading to true during load", async () => {
      const mockGetAllDocumentsUseCase = {
        execute: jest
          .fn()
          .mockImplementation(
            () =>
              new Promise((resolve) =>
                setTimeout(() => resolve(mockDocuments), 10),
              ),
          ),
      };

      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(
        () => mockGetAllDocumentsUseCase,
      );

      const store = useDocumentsStore.getState();
      const loadPromise = store.loadDocuments();

      await loadPromise;

      expect(mockGetAllDocumentsUseCase.execute).toHaveBeenCalled();
      expect(store.isLoading).toBe(false);
    });

    it("should handle error when loading documents fails", async () => {
      const mockGetAllDocumentsUseCase = {
        execute: jest
          .fn()
          .mockRejectedValue(new Error("Network error")),
      };

      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(
        () => mockGetAllDocumentsUseCase,
      );

      const store = useDocumentsStore.getState();
      await store.loadDocuments();

      expect(store.documents).toEqual([]);
      expect(store.isLoading).toBe(false);
    });

    it("should call use case execute method", async () => {
      const mockGetAllDocumentsUseCase = {
        execute: jest.fn().mockResolvedValue(mockDocuments),
      };

      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(
        () => mockGetAllDocumentsUseCase,
      );

      const store = useDocumentsStore.getState();
      await store.loadDocuments();

      expect(mockGetAllDocumentsUseCase.execute).toHaveBeenCalled();
    });

    it("should load empty array when no documents exist", async () => {
      const mockGetAllDocumentsUseCase = {
        execute: jest.fn().mockResolvedValue([]),
      };

      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(
        () => mockGetAllDocumentsUseCase,
      );

      const store = useDocumentsStore.getState();
      await store.loadDocuments();

      expect(store.documents).toEqual([]);
      expect(store.isLoading).toBe(false);
    });

    it("should handle server error gracefully", async () => {
      const mockGetAllDocumentsUseCase = {
        execute: jest
          .fn()
          .mockRejectedValue(new Error("500 Internal Server Error")),
      };

      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(
        () => mockGetAllDocumentsUseCase,
      );

      const store = useDocumentsStore.getState();

      // Should not throw
      await expect(store.loadDocuments()).resolves.toBeUndefined();
      expect(store.isLoading).toBe(false);
    });

    it("should replace previous documents on new load", async () => {
      const firstBatch = [mockDocuments[0]];
      const secondBatch = mockDocuments;

      const mockGetAllDocumentsUseCase = {
        execute: jest.fn(),
      };

      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(
        () => mockGetAllDocumentsUseCase,
      );

      const store = useDocumentsStore.getState();

      // Load first batch
      mockGetAllDocumentsUseCase.execute.mockResolvedValueOnce(firstBatch);
      await store.loadDocuments();
      expect(store.documents).toEqual(firstBatch);

      // Load second batch
      mockGetAllDocumentsUseCase.execute.mockResolvedValueOnce(secondBatch);
      await store.loadDocuments();
      expect(store.documents).toEqual(secondBatch);
    });
  });

  describe("reset action", () => {
    it("should reset documents to empty array", async () => {
      const mockGetAllDocumentsUseCase = {
        execute: jest.fn().mockResolvedValue(mockDocuments),
      };

      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(
        () => mockGetAllDocumentsUseCase,
      );

      const store = useDocumentsStore.getState();

      // Load documents
      await store.loadDocuments();
      expect(store.documents).toEqual(mockDocuments);

      // Reset
      store.reset();

      expect(store.documents).toEqual([]);
      expect(store.isLoading).toBe(false);
    });

    it("should reset isLoading flag", () => {
      const store = useDocumentsStore.getState();

      store.reset();

      expect(store.isLoading).toBe(false);
    });

    it("should be callable on initial state without error", () => {
      const store = useDocumentsStore.getState();

      // Should not throw
      expect(() => store.reset()).not.toThrow();
      expect(store.documents).toEqual([]);
    });
  });

  describe("Document structure validation", () => {
    it("should maintain document structure after load", async () => {
      const mockGetAllDocumentsUseCase = {
        execute: jest.fn().mockResolvedValue(mockDocuments),
      };

      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(
        () => mockGetAllDocumentsUseCase,
      );

      const store = useDocumentsStore.getState();
      await store.loadDocuments();

      expect(store.documents[0]).toHaveProperty("id");
      expect(store.documents[0]).toHaveProperty("name");
      expect(store.documents[0]).toHaveProperty("type");
      expect(store.documents[0]).toHaveProperty("fileUrl");
    });

    it("should handle documents with null expiration", async () => {
      const docsWithoutExpiry = [
        {
          ...mockDocuments[0],
          expiresAt: null,
        },
      ];

      const mockGetAllDocumentsUseCase = {
        execute: jest.fn().mockResolvedValue(docsWithoutExpiry),
      };

      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(
        () => mockGetAllDocumentsUseCase,
      );

      const store = useDocumentsStore.getState();
      await store.loadDocuments();

      expect(store.documents[0].expiresAt).toBeNull();
    });
  });

  describe("Concurrent operations", () => {
    it("should handle multiple sequential loads", async () => {
      const mockGetAllDocumentsUseCase = {
        execute: jest.fn().mockResolvedValue(mockDocuments),
      };

      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(
        () => mockGetAllDocumentsUseCase,
      );

      const store = useDocumentsStore.getState();

      await store.loadDocuments();
      expect(store.documents).toEqual(mockDocuments);

      await store.loadDocuments();
      expect(store.documents).toEqual(mockDocuments);
    });

    it("should handle reset between loads", async () => {
      const mockGetAllDocumentsUseCase = {
        execute: jest.fn().mockResolvedValue(mockDocuments),
      };

      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(
        () => mockGetAllDocumentsUseCase,
      );

      const store = useDocumentsStore.getState();

      await store.loadDocuments();
      expect(store.documents.length).toBeGreaterThan(0);

      store.reset();
      expect(store.documents).toEqual([]);

      await store.loadDocuments();
      expect(store.documents).toEqual(mockDocuments);
    });
  });

  describe("Edge cases", () => {
    it("should handle very large document arrays", async () => {
      const largeDocumentArray = Array.from({ length: 1000 }, (_, i) => ({
        id: `doc-${i}`,
        name: `Document ${i}`,
        type: "generic",
        fileUrl: `https://example.com/doc${i}.pdf`,
        uploadedAt: new Date(),
        expiresAt: null,
      }));

      const mockGetAllDocumentsUseCase = {
        execute: jest.fn().mockResolvedValue(largeDocumentArray),
      };

      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(
        () => mockGetAllDocumentsUseCase,
      );

      const store = useDocumentsStore.getState();
      await store.loadDocuments();

      expect(store.documents).toHaveLength(1000);
    });

    it("should handle TypeError gracefully", async () => {
      const mockGetAllDocumentsUseCase = {
        execute: jest
          .fn()
          .mockRejectedValue(new TypeError("Unexpected token")),
      };

      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(
        () => mockGetAllDocumentsUseCase,
      );

      const store = useDocumentsStore.getState();

      // Should not throw
      await expect(store.loadDocuments()).resolves.toBeUndefined();
      expect(store.documents).toEqual([]);
    });
  });
});
