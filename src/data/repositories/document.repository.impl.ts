import { Document, DocumentInput } from "@domain/entities/document.entity";
import { DocumentRepository } from "@domain/repositories/document.repository";
import { SecureStorageAdapter } from "@infrastructure/storage/secure-storage.adapter";
import { ImageProcessingService } from "@infrastructure/services/image-processing.service";

export class DocumentRepositoryImpl implements DocumentRepository {
  private storage: SecureStorageAdapter;
  private readonly DOCUMENTS_KEY = "documents";

  constructor() {
    this.storage = new SecureStorageAdapter(
      "documents-storage",
      "thoryx-documents-encryption-key-2026",
    );
  }

  async save(documentInput: DocumentInput): Promise<Document> {
    try {
      const encryptedFrontPhoto =
        await ImageProcessingService.compressAndEncrypt(
          documentInput.frontPhoto,
        );
      const encryptedBackPhoto =
        await ImageProcessingService.compressAndEncrypt(
          documentInput.backPhoto,
        );

      const id = `doc_${Date.now()}`;

      const document: Document = {
        id,
        type: documentInput.type,
        documentNumber: documentInput.documentNumber,
        fullName: documentInput.fullName,
        dateOfBirth: documentInput.dateOfBirth,
        expiryDate: documentInput.expiryDate,
        frontPhotoEncrypted: encryptedFrontPhoto,
        backPhotoEncrypted: encryptedBackPhoto,
        isAutoLockEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const documents = await this.findAll();
      documents.push(document);

      await this.storage.set(this.DOCUMENTS_KEY, JSON.stringify(documents));

      return document;
    } catch (error) {
      console.error("Error saving document:", error);
      throw new Error("Failed to save document");
    }
  }

  async findById(id: string): Promise<Document | null> {
    try {
      const documents = await this.findAll();
      return documents.find((doc) => doc.id === id) || null;
    } catch (error) {
      console.error("Error finding document:", error);
      return null;
    }
  }

  async findAll(): Promise<Document[]> {
    try {
      const documentsJson = await this.storage.get(this.DOCUMENTS_KEY);
      if (!documentsJson) {
        return [];
      }

      const documents = JSON.parse(documentsJson);
      return documents.map((doc: any) => ({
        ...doc,
        dateOfBirth: doc.dateOfBirth,
        expiryDate: doc.expiryDate,
        isAutoLockEnabled: doc.isAutoLockEnabled ?? false,
        createdAt: new Date(doc.createdAt),
        updatedAt: new Date(doc.updatedAt),
      }));
    } catch (error) {
      console.error("Error loading documents:", error);
      return [];
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const documents = await this.findAll();
      const filteredDocuments = documents.filter((doc) => doc.id !== id);
      await this.storage.set(
        this.DOCUMENTS_KEY,
        JSON.stringify(filteredDocuments),
      );
    } catch (error) {
      console.error("Error deleting document:", error);
      throw new Error("Failed to delete document");
    }
  }

  async decryptPhoto(encryptedPhoto: string): Promise<string> {
    try {
      return await ImageProcessingService.decryptAndDecode(encryptedPhoto);
    } catch (error) {
      console.error("Error decrypting photo:", error);
      throw new Error("Failed to decrypt photo");
    }
  }

  async toggleAutoLock(id: string): Promise<Document> {
    try {
      const documents = await this.findAll();
      const documentIndex = documents.findIndex((doc) => doc.id === id);
      
      if (documentIndex === -1) {
        throw new Error(`Document with id ${id} not found`);
      }

      const document = documents[documentIndex];
      const updatedDocument = {
        ...document,
        isAutoLockEnabled: !document.isAutoLockEnabled,
        updatedAt: new Date(),
      };

      documents[documentIndex] = updatedDocument;
      await this.storage.set(this.DOCUMENTS_KEY, JSON.stringify(documents));

      return updatedDocument;
    } catch (error) {
      console.error("Error toggling auto-lock:", error);
      throw new Error("Failed to toggle auto-lock");
    }
  }
}
