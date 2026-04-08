import { useDocumentsStore } from "./documents.store";
import { GetAllDocumentsUseCase } from "@domain/use-cases/get-all-documents.use-case";
import { Document } from "@domain/entities/document.entity";

jest.mock("@domain/use-cases/get-all-documents.use-case");
jest.mock("@data/repositories/document.repository.impl");
jest.mock("@data/repositories/document-type.repository.impl");

describe("useDocumentsStore", () => {
  const mockDocuments: Document[] = [
    {
      id: "doc-1",
      typeId: "RG",
      typeName: "RG",
      fields: { fullName: "John Doe", rgNumber: "123456789" },
      photos: { front: "encrypted-front-1", back: "encrypted-back-1" },
      isAutoLockEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "doc-2",
      typeId: "CNH",
      typeName: "CNH",
      fields: { fullName: "Jane Smith", registrationNumber: "987654321" },
      photos: { front: "encrypted-front-2", back: "encrypted-back-2" },
      isAutoLockEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useDocumentsStore.setState({ documents: [], customDocumentTypes: [], isLoading: false });
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
      expect(store).toHaveProperty("customDocumentTypes");
      expect(store).toHaveProperty("isLoading");
      expect(store).toHaveProperty("loadDocuments");
      expect(store).toHaveProperty("loadCustomTypes");
      expect(store).toHaveProperty("reset");
    });
  });

  describe("loadDocuments action", () => {
    it("should load documents successfully", async () => {
      const mockUseCase = { execute: jest.fn().mockResolvedValue(mockDocuments) };
      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(() => mockUseCase);

      const { loadDocuments } = useDocumentsStore.getState();
      await loadDocuments();

      const state = useDocumentsStore.getState();
      expect(state.documents).toEqual(mockDocuments);
      expect(state.isLoading).toBe(false);
    });

    it("should handle error when loading documents fails", async () => {
      const mockUseCase = { execute: jest.fn().mockRejectedValue(new Error("Network error")) };
      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(() => mockUseCase);

      const { loadDocuments } = useDocumentsStore.getState();
      await loadDocuments();

      const state = useDocumentsStore.getState();
      expect(state.documents).toEqual([]);
      expect(state.isLoading).toBe(false);
    });

    it("should load empty array when no documents exist", async () => {
      const mockUseCase = { execute: jest.fn().mockResolvedValue([]) };
      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(() => mockUseCase);

      const { loadDocuments } = useDocumentsStore.getState();
      await loadDocuments();

      expect(useDocumentsStore.getState().documents).toEqual([]);
    });

    it("should replace previous documents on new load", async () => {
      const mockUseCase = { execute: jest.fn() };
      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(() => mockUseCase);

      const { loadDocuments } = useDocumentsStore.getState();

      mockUseCase.execute.mockResolvedValueOnce([mockDocuments[0]]);
      await loadDocuments();
      expect(useDocumentsStore.getState().documents).toEqual([mockDocuments[0]]);

      mockUseCase.execute.mockResolvedValueOnce(mockDocuments);
      await loadDocuments();
      expect(useDocumentsStore.getState().documents).toEqual(mockDocuments);
    });
  });

  describe("reset action", () => {
    it("should reset documents to empty array", async () => {
      const mockUseCase = { execute: jest.fn().mockResolvedValue(mockDocuments) };
      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(() => mockUseCase);

      const { loadDocuments, reset } = useDocumentsStore.getState();
      await loadDocuments();
      expect(useDocumentsStore.getState().documents).toEqual(mockDocuments);

      reset();
      const state = useDocumentsStore.getState();
      expect(state.documents).toEqual([]);
      expect(state.customDocumentTypes).toEqual([]);
      expect(state.isLoading).toBe(false);
    });
  });

  describe("Document structure validation", () => {
    it("should maintain document structure after load", async () => {
      const mockUseCase = { execute: jest.fn().mockResolvedValue(mockDocuments) };
      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(() => mockUseCase);

      const { loadDocuments } = useDocumentsStore.getState();
      await loadDocuments();

      const { documents } = useDocumentsStore.getState();
      expect(documents[0]).toHaveProperty("id");
      expect(documents[0]).toHaveProperty("typeId");
      expect(documents[0]).toHaveProperty("fields");
      expect(documents[0]).toHaveProperty("photos");
    });

    it("should handle documents with auto-lock disabled", async () => {
      const docsWithoutAutoLock = [{ ...mockDocuments[0], isAutoLockEnabled: false }];
      const mockUseCase = { execute: jest.fn().mockResolvedValue(docsWithoutAutoLock) };
      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(() => mockUseCase);

      const { loadDocuments } = useDocumentsStore.getState();
      await loadDocuments();

      expect(useDocumentsStore.getState().documents[0].isAutoLockEnabled).toBe(false);
    });
  });

  describe("Edge cases", () => {
    it("should handle very large document arrays", async () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => ({
        id: `doc-${i}`,
        typeId: i % 2 === 0 ? "RG" : "CNH",
        typeName: i % 2 === 0 ? "RG" : "CNH",
        fields: { fullName: `Person ${i}` },
        photos: { front: `enc-${i}` },
        isAutoLockEnabled: i % 3 === 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const mockUseCase = { execute: jest.fn().mockResolvedValue(largeArray) };
      (GetAllDocumentsUseCase as jest.Mock).mockImplementation(() => mockUseCase);

      const { loadDocuments } = useDocumentsStore.getState();
      await loadDocuments();

      expect(useDocumentsStore.getState().documents).toHaveLength(1000);
    });
  });
});
