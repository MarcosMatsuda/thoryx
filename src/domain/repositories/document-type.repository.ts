import { DocumentTypeDefinition } from "@domain/entities/document-type-definition.entity";

export interface DocumentTypeRepository {
  saveCustomType(definition: DocumentTypeDefinition): Promise<void>;
  getAllCustomTypes(): Promise<DocumentTypeDefinition[]>;
  deleteCustomType(id: string): Promise<void>;
}
