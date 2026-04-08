import { Document, DocumentInput } from "@domain/entities/document.entity";

export interface DocumentRepository {
  save(document: DocumentInput): Promise<Document>;
  findById(id: string): Promise<Document | null>;
  findAll(): Promise<Document[]>;
  delete(id: string): Promise<void>;
  decryptPhoto(encryptedPhoto: string): Promise<string>;
  decryptPhotos(photos: Record<string, string>): Promise<Record<string, string>>;
  toggleAutoLock(id: string): Promise<Document>;
}
