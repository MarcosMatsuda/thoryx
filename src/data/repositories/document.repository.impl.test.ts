import { DocumentRepositoryImpl } from "./document.repository.impl";
import { SecureStorageAdapter } from "@infrastructure/storage/secure-storage.adapter";
import { ImageProcessingService } from "@infrastructure/services/image-processing.service";
import { Document, DocumentInput } from "@domain/entities/document.entity";

// Mock SecureStorageAdapter
jest.mock("@infrastructure/storage/secure-storage.adapter", () => {
  return {
    SecureStorageAdapter: jest.fn().mockImplementation(() => ({
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    })),
  };
});

// Mock ImageProcessingService
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
    type: "CNH",
    documentNumber: "12345678900",
    fullName: "John Doe",
    dateOfBirth: "1990-01-01",
    expiryDate: "2030-01-01",
    frontPhoto: "base64frontphoto",
    backPhoto: "base64backphoto",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Get the mocked storage instance
    const SecureStorageAdapterClass = SecureStorageAdapter as any;
    repository = new DocumentRepositoryImpl();
    mockStorage = SecureStorageAdapterClass.mock.results[0].value;

    // Set default mock behavior for storage
    mockStorage.get.mockResolvedValue(null);
    mockStorage.set.mockResolvedValue(undefined);

    // Mock ImageProcessingService
    (ImageProcessingService.compressAndEncrypt as jest.Mock).mockResolvedValue(
      "encryptedPhoto",
    );
  });

  describe("Document entity", () => {
    it("should contain isAutoLockEnabled field", async () => {
      mockStorage.get.mockResolvedValue(null);
      (
        ImageProcessingService.compressAndEncrypt as jest.Mock
      ).mockResolvedValue("encryptedPhoto");

      const document = await repository.save(mockDocumentInput);

      expect(document).toHaveProperty("isAutoLockEnabled");
      expect(typeof document.isAutoLockEnabled).toBe("boolean");
    });
  });

  describe("Save new document", () => {
    it("should save new document with isAutoLockEnabled = false", async () => {
      mockStorage.get.mockResolvedValue(null);
      (
        ImageProcessingService.compressAndEncrypt as jest.Mock
      ).mockResolvedValue("encryptedPhoto");

      const document = await repository.save(mockDocumentInput);

      expect(document.isAutoLockEnabled).toBe(false);

      // Verify storage was called with the document containing isAutoLockEnabled: false
      expect(mockStorage.set).toHaveBeenCalledWith(
        "documents",
        expect.stringContaining('"isAutoLockEnabled":false'),
      );
    });

    it("should initialize all fields correctly when creating new document", async () => {
      mockStorage.get.mockResolvedValue(null);
      (
        ImageProcessingService.compressAndEncrypt as jest.Mock
      ).mockResolvedValue("encryptedPhoto");

      const document = await repository.save(mockDocumentInput);

      expect(document.type).toBe("CNH");
      expect(document.documentNumber).toBe("12345678900");
      expect(document.fullName).toBe("John Doe");
      expect(document.dateOfBirth).toBe("1990-01-01");
      expect(document.expiryDate).toBe("2030-01-01");
      expect(document.isAutoLockEnabled).toBe(false);
      expect(document.frontPhotoEncrypted).toBe("encryptedPhoto");
      expect(document.backPhotoEncrypted).toBe("encryptedPhoto");
      expect(document.createdAt).toBeInstanceOf(Date);
      expect(document.updatedAt).toBeInstanceOf(Date);
    });

    it("should persist document to storage", async () => {
      mockStorage.get.mockResolvedValue(null);
      (
        ImageProcessingService.compressAndEncrypt as jest.Mock
      ).mockResolvedValue("encryptedPhoto");

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
      const existingDocument: Document = {
        id: "doc_123",
        type: "CNH",
        documentNumber: "12345678900",
        fullName: "John Doe",
        dateOfBirth: "1990-01-01",
        expiryDate: "2030-01-01",
        frontPhotoEncrypted: "encrypted1",
        backPhotoEncrypted: "encrypted2",
        isAutoLockEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockStorage.get.mockResolvedValue(JSON.stringify([existingDocument]));

      const updatedDocument = await repository.toggleAutoLock("doc_123");

      expect(updatedDocument.isAutoLockEnabled).toBe(true);
    });

    it("should toggle isAutoLockEnabled from true to false", async () => {
      const existingDocument: Document = {
        id: "doc_123",
        type: "CNH",
        documentNumber: "12345678900",
        fullName: "John Doe",
        dateOfBirth: "1990-01-01",
        expiryDate: "2030-01-01",
        frontPhotoEncrypted: "encrypted1",
        backPhotoEncrypted: "encrypted2",
        isAutoLockEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockStorage.get.mockResolvedValue(JSON.stringify([existingDocument]));

      const updatedDocument = await repository.toggleAutoLock("doc_123");

      expect(updatedDocument.isAutoLockEnabled).toBe(false);
    });

    it("should persist toggled value to storage", async () => {
      const existingDocument: Document = {
        id: "doc_123",
        type: "CNH",
        documentNumber: "12345678900",
        fullName: "John Doe",
        dateOfBirth: "1990-01-01",
        expiryDate: "2030-01-01",
        frontPhotoEncrypted: "encrypted1",
        backPhotoEncrypted: "encrypted2",
        isAutoLockEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockStorage.get.mockResolvedValue(JSON.stringify([existingDocument]));

      await repository.toggleAutoLock("doc_123");

      // Verify storage was called with updated document
      expect(mockStorage.set).toHaveBeenCalledWith(
        "documents",
        expect.stringContaining('"isAutoLockEnabled":true'),
      );

      const savedData = JSON.parse(
        (mockStorage.set as jest.Mock).mock.calls[0][1],
      );
      expect(savedData[0].isAutoLockEnabled).toBe(true);
    });

    it("should update the updatedAt timestamp when toggling", async () => {
      const existingDocument: Document = {
        id: "doc_123",
        type: "CNH",
        documentNumber: "12345678900",
        fullName: "John Doe",
        dateOfBirth: "1990-01-01",
        expiryDate: "2030-01-01",
        frontPhotoEncrypted: "encrypted1",
        backPhotoEncrypted: "encrypted2",
        isAutoLockEnabled: false,
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-01"),
      };

      mockStorage.get.mockResolvedValue(JSON.stringify([existingDocument]));

      const beforeToggle = new Date();
      const updatedDocument = await repository.toggleAutoLock("doc_123");
      const afterToggle = new Date();

      expect(updatedDocument.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeToggle.getTime(),
      );
      expect(updatedDocument.updatedAt.getTime()).toBeLessThanOrEqual(
        afterToggle.getTime(),
      );
      expect(updatedDocument.createdAt.getTime()).toBe(
        new Date("2026-01-01").getTime(),
      );
    });

    it("should throw error when document not found", async () => {
      mockStorage.get.mockResolvedValue(JSON.stringify([]));

      await expect(repository.toggleAutoLock("nonexistent_id")).rejects.toThrow(
        "Failed to toggle auto-lock",
      );
    });

    it("should preserve other document fields when toggling", async () => {
      const existingDocument: Document = {
        id: "doc_123",
        type: "CNH",
        documentNumber: "12345678900",
        fullName: "John Doe",
        dateOfBirth: "1990-01-01",
        expiryDate: "2030-01-01",
        frontPhotoEncrypted: "encrypted1",
        backPhotoEncrypted: "encrypted2",
        isAutoLockEnabled: false,
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-01"),
      };

      mockStorage.get.mockResolvedValue(JSON.stringify([existingDocument]));

      const updatedDocument = await repository.toggleAutoLock("doc_123");

      expect(updatedDocument.id).toBe("doc_123");
      expect(updatedDocument.type).toBe("CNH");
      expect(updatedDocument.documentNumber).toBe("12345678900");
      expect(updatedDocument.fullName).toBe("John Doe");
      expect(updatedDocument.dateOfBirth).toBe("1990-01-01");
      expect(updatedDocument.expiryDate).toBe("2030-01-01");
      expect(updatedDocument.frontPhotoEncrypted).toBe("encrypted1");
      expect(updatedDocument.backPhotoEncrypted).toBe("encrypted2");
    });
  });

  describe("Backward compatibility", () => {
    it("should read old document without isAutoLockEnabled field as false", async () => {
      const oldDocument: any = {
        id: "doc_123",
        type: "CNH",
        documentNumber: "12345678900",
        fullName: "John Doe",
        dateOfBirth: "1990-01-01",
        expiryDate: "2030-01-01",
        frontPhotoEncrypted: "encrypted1",
        backPhotoEncrypted: "encrypted2",
        // isAutoLockEnabled is intentionally missing
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      };

      mockStorage.get.mockResolvedValue(JSON.stringify([oldDocument]));

      const documents = await repository.findAll();

      expect(documents[0].isAutoLockEnabled).toBe(false);
    });

    it("should handle mixed old and new documents in storage", async () => {
      const oldDocument: any = {
        id: "doc_old",
        type: "CNH",
        documentNumber: "11111111111",
        fullName: "Old Document",
        dateOfBirth: "1990-01-01",
        expiryDate: "2030-01-01",
        frontPhotoEncrypted: "encrypted1",
        backPhotoEncrypted: "encrypted2",
        // isAutoLockEnabled is missing (backward compatibility)
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      };

      const newDocument: Document = {
        id: "doc_new",
        type: "RG",
        documentNumber: "22222222222",
        fullName: "New Document",
        dateOfBirth: "1990-01-01",
        expiryDate: "2030-01-01",
        frontPhotoEncrypted: "encrypted3",
        backPhotoEncrypted: "encrypted4",
        isAutoLockEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockStorage.get.mockResolvedValue(
        JSON.stringify([oldDocument, newDocument]),
      );

      const documents = await repository.findAll();

      expect(documents.length).toBe(2);
      expect(documents[0].isAutoLockEnabled).toBe(false); // Old document defaults to false
      expect(documents[1].isAutoLockEnabled).toBe(true); // New document preserves true
    });

    it("should toggle old document correctly after reading it", async () => {
      const oldDocument: any = {
        id: "doc_123",
        type: "CNH",
        documentNumber: "12345678900",
        fullName: "John Doe",
        dateOfBirth: "1990-01-01",
        expiryDate: "2030-01-01",
        frontPhotoEncrypted: "encrypted1",
        backPhotoEncrypted: "encrypted2",
        // isAutoLockEnabled is missing
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      };

      mockStorage.get.mockResolvedValue(JSON.stringify([oldDocument]));

      const updatedDocument = await repository.toggleAutoLock("doc_123");

      expect(updatedDocument.isAutoLockEnabled).toBe(true); // false -> true
    });
  });

  describe("findById", () => {
    it("should find document by id", async () => {
      const document: Document = {
        id: "doc_123",
        type: "CNH",
        documentNumber: "12345678900",
        fullName: "John Doe",
        dateOfBirth: "1990-01-01",
        expiryDate: "2030-01-01",
        frontPhotoEncrypted: "encrypted1",
        backPhotoEncrypted: "encrypted2",
        isAutoLockEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockStorage.get.mockResolvedValue(JSON.stringify([document]));

      const found = await repository.findById("doc_123");

      expect(found).not.toBeNull();
      expect(found?.id).toBe("doc_123");
      expect(found?.isAutoLockEnabled).toBe(false);
    });
  });
});
