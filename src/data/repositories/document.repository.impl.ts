import { Document, DocumentInput } from "@domain/entities/document.entity";
import { DocumentRepository } from "@domain/repositories/document.repository";
import { SecureStorageAdapter } from "@infrastructure/storage/secure-storage.adapter";
import { ImageProcessingService } from "@infrastructure/services/image-processing.service";

/**
 * Migrates v1 documents (fixed fields) to v2 (dynamic fields/photos).
 * Detection: v1 docs have `documentNumber` at top level, no `fields` property.
 */
function migrateV1(raw: any): any {
  if (raw.fields !== undefined || raw.documentNumber === undefined) return raw;
  return {
    id: raw.id,
    typeId: raw.type ?? "CNH",
    typeName: raw.type === "RG" ? "RG" : "CNH",
    fields: {
      fullName: raw.fullName ?? "",
      documentNumber: raw.documentNumber ?? "",
      dateOfBirth: raw.dateOfBirth ?? "",
      expiryDate: raw.expiryDate ?? "",
    },
    photos: {
      front: raw.frontPhotoEncrypted ?? "",
      back: raw.backPhotoEncrypted ?? "",
    },
    isAutoLockEnabled: raw.isAutoLockEnabled ?? false,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export class DocumentRepositoryImpl implements DocumentRepository {
  private storage: SecureStorageAdapter;
  private readonly DOCUMENTS_KEY = "documents";

  constructor() {
    this.storage = new SecureStorageAdapter(
      "documents-storage",
      "thoryx-documents-encryption-key-2026",
    );
  }

  async save(input: DocumentInput): Promise<Document> {
    try {
      const encryptedPhotos: Record<string, string> = {};
      for (const [slot, uri] of Object.entries(input.photos)) {
        if (uri) {
          encryptedPhotos[slot] =
            await ImageProcessingService.compressAndEncrypt(uri);
        }
      }

      const id = `doc_${Date.now()}`;

      const document: Document = {
        id,
        typeId: input.typeId,
        typeName: input.typeName,
        fields: { ...input.fields },
        photos: encryptedPhotos,
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
      if (!documentsJson) return [];

      const raw = JSON.parse(documentsJson);
      return raw.map((doc: any) => {
        const migrated = migrateV1(doc);
        return {
          ...migrated,
          isAutoLockEnabled: migrated.isAutoLockEnabled ?? false,
          createdAt: new Date(migrated.createdAt),
          updatedAt: new Date(migrated.updatedAt),
        };
      });
    } catch (error) {
      console.error("Error loading documents:", error);
      return [];
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const documents = await this.findAll();
      const filtered = documents.filter((doc) => doc.id !== id);
      await this.storage.set(this.DOCUMENTS_KEY, JSON.stringify(filtered));
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

  async decryptPhotos(
    photos: Record<string, string>,
  ): Promise<Record<string, string>> {
    const decrypted: Record<string, string> = {};
    for (const [slot, encrypted] of Object.entries(photos)) {
      if (encrypted) {
        decrypted[slot] = await this.decryptPhoto(encrypted);
      }
    }
    return decrypted;
  }

  async toggleAutoLock(id: string): Promise<Document> {
    try {
      const documents = await this.findAll();
      const idx = documents.findIndex((doc) => doc.id === id);
      if (idx === -1) throw new Error(`Document with id ${id} not found`);

      const updated = {
        ...documents[idx],
        isAutoLockEnabled: !documents[idx].isAutoLockEnabled,
        updatedAt: new Date(),
      };

      documents[idx] = updated;
      await this.storage.set(this.DOCUMENTS_KEY, JSON.stringify(documents));
      return updated;
    } catch (error) {
      console.error("Error toggling auto-lock:", error);
      throw new Error("Failed to toggle auto-lock");
    }
  }
}
