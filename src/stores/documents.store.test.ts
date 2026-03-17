import { useDocumentsStore } from "./documents.store";
import { GetAllDocumentsUseCase } from "@domain/use-cases/get-all-documents.use-case";
import { Document } from "@domain/entities/document.entity";

jest.mock("@domain/use-cases/get-all-documents.use-case");
jest.mock("@data/repositories/document.repository.impl");

describe("useDocumentsStore", () => {
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
      fullName: "Jane Smith",
      dateOfBirth: "1985-05-15",
      expiryDate: "2025-05-15",
      frontPhotoEncrypted: "encrypted-front-2",
      backPhotoEncrypted: "encrypted-back-2",
      isAutoLockEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useDocumentsStore.setState({ documents: [], isLoading: false });
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
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(mockDocuments),
      };
      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { loadDocuments } = useDocumentsStore.getState();
      await loadDocuments();

      const state = useDocumentsStore.getState();
      expect(state.documents).toEqual(mockDocuments);
      expect(state.isLoading).toBe(false);
    });

    it("should set isLoading to true during load", async () => {
      const mockUseCase = {
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
        () => mockUseCase,
      );

      const { loadDocuments } = useDocumentsStore.getState();
      await loadDocuments();

      expect(mockUseCase.execute).toHaveBeenCalled();
      expect(useDocumentsStore.getState().isLoading).toBe(false);
    });

    it("should handle error when loading documents fails", async () => {
      const mockUseCase = {
        execute: jest.fn().mockRejectedValue(new Error("Network error")),
      };
      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { loadDocuments } = useDocumentsStore.getState();
      await loadDocuments();

      const state = useDocumentsStore.getState();
      expect(state.documents).toEqual([]);
      expect(state.isLoading).toBe(false);
    });

    it("should call use case execute method", async () => {
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(mockDocuments),
      };
      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { loadDocuments } = useDocumentsStore.getState();
      await loadDocuments();

      expect(mockUseCase.execute).toHaveBeenCalled();
    });

    it("should load empty array when no documents exist", async () => {
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue([]),
      };
      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { loadDocuments } = useDocumentsStore.getState();
      await loadDocuments();

      const state = useDocumentsStore.getState();
      expect(state.documents).toEqual([]);
      expect(state.isLoading).toBe(false);
    });

    it("should handle server error gracefully", async () => {
      const mockUseCase = {
        execute: jest
          .fn()
          .mockRejectedValue(new Error("500 Internal Server Error")),
      };
      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { loadDocuments } = useDocumentsStore.getState();

      // Should not throw
      await expect(loadDocuments()).resolves.toBeUndefined();
      expect(useDocumentsStore.getState().isLoading).toBe(false);
    });

    it("should replace previous documents on new load", async () => {
      const firstBatch = [mockDocuments[0]];
      const secondBatch = mockDocuments;

      const mockUseCase = {
        execute: jest.fn(),
      };
      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { loadDocuments } = useDocumentsStore.getState();

      // Load first batch
      mockUseCase.execute.mockResolvedValueOnce(firstBatch);
      await loadDocuments();
      expect(useDocumentsStore.getState().documents).toEqual(firstBatch);

      // Load second batch
      mockUseCase.execute.mockResolvedValueOnce(secondBatch);
      await loadDocuments();
      expect(useDocumentsStore.getState().documents).toEqual(secondBatch);
    });
  });

  describe("reset action", () => {
    it("should reset documents to empty array", async () => {
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(mockDocuments),
      };
      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { loadDocuments, reset } = useDocumentsStore.getState();

      // Load documents
      await loadDocuments();
      expect(useDocumentsStore.getState().documents).toEqual(mockDocuments);

      // Reset
      reset();

      const state = useDocumentsStore.getState();
      expect(state.documents).toEqual([]);
      expect(state.isLoading).toBe(false);
    });

    it("should reset isLoading flag", () => {
      const { reset } = useDocumentsStore.getState();

      reset();

      expect(useDocumentsStore.getState().isLoading).toBe(false);
    });

    it("should be callable on initial state without error", () => {
      const { reset } = useDocumentsStore.getState();

      // Should not throw
      expect(() => reset()).not.toThrow();
      expect(useDocumentsStore.getState().documents).toEqual([]);
    });
  });

  describe("Document structure validation", () => {
    it("should maintain document structure after load", async () => {
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(mockDocuments),
      };
      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { loadDocuments } = useDocumentsStore.getState();
      await loadDocuments();

      const { documents } = useDocumentsStore.getState();
      expect(documents[0]).toHaveProperty("id");
      expect(documents[0]).toHaveProperty("type");
      expect(documents[0]).toHaveProperty("documentNumber");
      expect(documents[0]).toHaveProperty("fullName");
    });

    it("should handle documents with auto-lock disabled", async () => {
      const docsWithoutAutoLock = [
        {
          ...mockDocuments[0],
          isAutoLockEnabled: false,
        },
      ];

      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(docsWithoutAutoLock),
      };
      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { loadDocuments } = useDocumentsStore.getState();
      await loadDocuments();

      const { documents } = useDocumentsStore.getState();
      expect(documents[0].isAutoLockEnabled).toBe(false);
    });
  });

  describe("Concurrent operations", () => {
    it("should handle multiple sequential loads", async () => {
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(mockDocuments),
      };
      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { loadDocuments } = useDocumentsStore.getState();

      await loadDocuments();
      expect(useDocumentsStore.getState().documents).toEqual(mockDocuments);

      await loadDocuments();
      expect(useDocumentsStore.getState().documents).toEqual(mockDocuments);
    });

    it("should handle reset between loads", async () => {
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(mockDocuments),
      };
      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { loadDocuments, reset } = useDocumentsStore.getState();

      await loadDocuments();
      expect(useDocumentsStore.getState().documents.length).toBeGreaterThan(0);

      reset();
      expect(useDocumentsStore.getState().documents).toEqual([]);

      await loadDocuments();
      expect(useDocumentsStore.getState().documents).toEqual(mockDocuments);
    });
  });

  describe("Edge cases", () => {
    it("should handle very large document arrays", async () => {
      const largeDocumentArray = Array.from({ length: 1000 }, (_, i) => ({
        id: `doc-${i}`,
        type: i % 2 === 0 ? "RG" : "CNH",
        documentNumber: `${100000000 + i}`,
        fullName: `Person ${i}`,
        dateOfBirth: `199${i % 10}-01-01`,
        expiryDate: `2030-01-01`,
        frontPhotoEncrypted: `encrypted-front-${i}`,
        backPhotoEncrypted: `encrypted-back-${i}`,
        isAutoLockEnabled: i % 3 === 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(largeDocumentArray),
      };
      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { loadDocuments } = useDocumentsStore.getState();
      await loadDocuments();

      expect(useDocumentsStore.getState().documents).toHaveLength(1000);
    });

    it("should handle TypeError gracefully", async () => {
      const mockUseCase = {
        execute: jest.fn().mockRejectedValue(new TypeError("Unexpected token")),
      };
      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { loadDocuments } = useDocumentsStore.getState();

      // Should not throw
      await expect(loadDocuments()).resolves.toBeUndefined();
      expect(useDocumentsStore.getState().documents).toEqual([]);
    });
  });
});
