import { DocumentRepositoryImpl } from "./document.repository.impl";
import { SecureStorageAdapter } from "@infrastructure/storage/secure-storage.adapter";
import { ImageProcessingService } from "@infrastructure/services/image-processing.service";
import { Document, DocumentInput } from "@domain/entities/document.entity";

jest.mock("@infrastructure/storage/secure-storage.adapter", () => {
  return {
    SecureStorageAdapter: jest.fn().mockImplementation(() => ({
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    })),
  };
});

jest.mock("@infrastructure/services/image-processing.service", () => {
  return {
    ImageProcessingService: {
      compressAndEncrypt: jest.fn(),
      decryptAndDecode: jest.fn(),
    },
  };
});

describe("DocumentRepositoryImpl", () => {
  let repository: DocumentRepositoryImpl;
  let mockStorage: any;

  const mockDocumentInput: DocumentInput = {
    typeId: "CNH",
    typeName: "CNH (Carteira Nacional de Habilitação)",
    fields: {
      fullName: "John Doe",
      registrationNumber: "12345678900",
      dateOfBirth: "01/01/1990",
      expiryDate: "01/01/2030",
    },
    photos: {
      front: "base64frontphoto",
      back: "base64backphoto",
    },
  };

  const createMockDocument = (overrides: Partial<Document> = {}): Document => ({
    id: "doc_123",
    typeId: "CNH",
    typeName: "CNH",
    fields: {
      fullName: "John Doe",
      registrationNumber: "12345678900",
      dateOfBirth: "01/01/1990",
      expiryDate: "01/01/2030",
    },
    photos: {
      front: "encrypted1",
      back: "encrypted2",
    },
    isAutoLockEnabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    const SecureStorageAdapterClass = SecureStorageAdapter as any;
    repository = new DocumentRepositoryImpl();
    mockStorage = SecureStorageAdapterClass.mock.results[0].value;
    mockStorage.get.mockResolvedValue(null);
    mockStorage.set.mockResolvedValue(undefined);
    (ImageProcessingService.compressAndEncrypt as jest.Mock).mockResolvedValue(
      "encryptedPhoto",
    );
  });

  describe("Document entity", () => {
    it("should contain isAutoLockEnabled field", async () => {
      const document = await repository.save(mockDocumentInput);
      expect(document).toHaveProperty("isAutoLockEnabled");
      expect(typeof document.isAutoLockEnabled).toBe("boolean");
    });
  });

  describe("Save new document", () => {
    it("should save new document with isAutoLockEnabled = false", async () => {
      const document = await repository.save(mockDocumentInput);
      expect(document.isAutoLockEnabled).toBe(false);
      expect(mockStorage.set).toHaveBeenCalledWith(
        "documents",
        expect.stringContaining('"isAutoLockEnabled":false'),
      );
    });

    it("should initialize all fields correctly when creating new document", async () => {
      const document = await repository.save(mockDocumentInput);
      expect(document.typeId).toBe("CNH");
      expect(document.fields.fullName).toBe("John Doe");
      expect(document.fields.registrationNumber).toBe("12345678900");
      expect(document.isAutoLockEnabled).toBe(false);
      expect(document.photos.front).toBe("encryptedPhoto");
      expect(document.photos.back).toBe("encryptedPhoto");
      expect(document.createdAt).toBeInstanceOf(Date);
      expect(document.updatedAt).toBeInstanceOf(Date);
    });

    it("should persist document to storage", async () => {
      await repository.save(mockDocumentInput);
      expect(mockStorage.set).toHaveBeenCalledWith(
        "documents",
        expect.any(String),
      );
      const savedData = JSON.parse(
        (mockStorage.set as jest.Mock).mock.calls[0][1],
      );
      expect(Array.isArray(savedData)).toBe(true);
      expect(savedData.length).toBe(1);
      expect(savedData[0].isAutoLockEnabled).toBe(false);
    });
  });

  describe("toggleAutoLock", () => {
    it("should toggle isAutoLockEnabled from false to true", async () => {
      const existing = createMockDocument({ isAutoLockEnabled: false });
      mockStorage.get.mockResolvedValue(JSON.stringify([existing]));
      const updated = await repository.toggleAutoLock("doc_123");
      expect(updated.isAutoLockEnabled).toBe(true);
    });

    it("should toggle isAutoLockEnabled from true to false", async () => {
      const existing = createMockDocument({ isAutoLockEnabled: true });
      mockStorage.get.mockResolvedValue(JSON.stringify([existing]));
      const updated = await repository.toggleAutoLock("doc_123");
      expect(updated.isAutoLockEnabled).toBe(false);
    });

    it("should persist toggled value to storage", async () => {
      const existing = createMockDocument({ isAutoLockEnabled: false });
      mockStorage.get.mockResolvedValue(JSON.stringify([existing]));
      await repository.toggleAutoLock("doc_123");
      expect(mockStorage.set).toHaveBeenCalledWith(
        "documents",
        expect.stringContaining('"isAutoLockEnabled":true'),
      );
    });

    it("should update the updatedAt timestamp when toggling", async () => {
      const existing = createMockDocument({
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-01"),
      });
      mockStorage.get.mockResolvedValue(JSON.stringify([existing]));
      const beforeToggle = new Date();
      const updated = await repository.toggleAutoLock("doc_123");
      const afterToggle = new Date();
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeToggle.getTime(),
      );
      expect(updated.updatedAt.getTime()).toBeLessThanOrEqual(
        afterToggle.getTime(),
      );
    });

    it("should throw error when document not found", async () => {
      mockStorage.get.mockResolvedValue(JSON.stringify([]));
      await expect(repository.toggleAutoLock("nonexistent_id")).rejects.toThrow(
        "Failed to toggle auto-lock",
      );
    });

    it("should preserve other document fields when toggling", async () => {
      const existing = createMockDocument();
      mockStorage.get.mockResolvedValue(JSON.stringify([existing]));
      const updated = await repository.toggleAutoLock("doc_123");
      expect(updated.id).toBe("doc_123");
      expect(updated.typeId).toBe("CNH");
      expect(updated.fields.fullName).toBe("John Doe");
    });
  });

  describe("Backward compatibility (v1 migration)", () => {
    it("should migrate v1 documents to v2 format on findAll", async () => {
      const oldDocument: any = {
        id: "doc_123",
        type: "CNH",
        documentNumber: "12345678900",
        fullName: "John Doe",
        dateOfBirth: "1990-01-01",
        expiryDate: "2030-01-01",
        frontPhotoEncrypted: "encrypted1",
        backPhotoEncrypted: "encrypted2",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      };
      mockStorage.get.mockResolvedValue(JSON.stringify([oldDocument]));
      const documents = await repository.findAll();
      expect(documents[0].typeId).toBe("CNH");
      expect(documents[0].fields.fullName).toBe("John Doe");
      expect(documents[0].fields.documentNumber).toBe("12345678900");
      expect(documents[0].photos.front).toBe("encrypted1");
      expect(documents[0].photos.back).toBe("encrypted2");
      expect(documents[0].isAutoLockEnabled).toBe(false);
    });

    it("should handle mixed v1 and v2 documents", async () => {
      const v1Doc: any = {
        id: "doc_old",
        type: "RG",
        documentNumber: "123",
        fullName: "Old",
        dateOfBirth: "1990-01-01",
        expiryDate: "2030-01-01",
        frontPhotoEncrypted: "e1",
        backPhotoEncrypted: "e2",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      };
      const v2Doc = createMockDocument({
        id: "doc_new",
        isAutoLockEnabled: true,
      });
      mockStorage.get.mockResolvedValue(JSON.stringify([v1Doc, v2Doc]));
      const documents = await repository.findAll();
      expect(documents.length).toBe(2);
      expect(documents[0].typeId).toBe("RG");
      expect(documents[0].isAutoLockEnabled).toBe(false);
      expect(documents[1].isAutoLockEnabled).toBe(true);
    });
  });

  describe("findById", () => {
    it("should find document by id", async () => {
      const document = createMockDocument();
      mockStorage.get.mockResolvedValue(JSON.stringify([document]));
      const found = await repository.findById("doc_123");
      expect(found).not.toBeNull();
      expect(found?.id).toBe("doc_123");
      expect(found?.isAutoLockEnabled).toBe(false);
    });
  });

  describe("decryptPhotos", () => {
    it("should decrypt all photo slots", async () => {
      (ImageProcessingService.decryptAndDecode as jest.Mock).mockResolvedValue(
        "decrypted_uri",
      );
      const result = await repository.decryptPhotos({
        front: "enc1",
        back: "enc2",
      });
      expect(result.front).toBe("decrypted_uri");
      expect(result.back).toBe("decrypted_uri");
      expect(ImageProcessingService.decryptAndDecode).toHaveBeenCalledTimes(2);
    });
  });
});
