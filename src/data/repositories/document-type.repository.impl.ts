import { DocumentTypeDefinition } from "@domain/entities/document-type-definition.entity";
import { DocumentTypeRepository } from "@domain/repositories/document-type.repository";
import { SecureStorageAdapter } from "@infrastructure/storage/secure-storage.adapter";

export class DocumentTypeRepositoryImpl implements DocumentTypeRepository {
  private storage: SecureStorageAdapter;
  private readonly KEY = "custom-document-types";

  constructor() {
    this.storage = new SecureStorageAdapter(
      "document-types-storage",
      "thoryx-doc-types-key-2026",
    );
  }

  async saveCustomType(definition: DocumentTypeDefinition): Promise<void> {
    const types = await this.getAllCustomTypes();
    const idx = types.findIndex((t) => t.id === definition.id);
    if (idx >= 0) {
      types[idx] = definition;
    } else {
      types.push(definition);
    }
    await this.storage.set(this.KEY, JSON.stringify(types));
  }

  async getAllCustomTypes(): Promise<DocumentTypeDefinition[]> {
    try {
      const json = await this.storage.get(this.KEY);
      if (!json) return [];
      return JSON.parse(json);
    } catch {
      return [];
    }
  }

  async deleteCustomType(id: string): Promise<void> {
    const types = await this.getAllCustomTypes();
    const filtered = types.filter((t) => t.id !== id);
    await this.storage.set(this.KEY, JSON.stringify(filtered));
  }
}
