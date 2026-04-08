import { DocumentInput } from "@domain/entities/document.entity";
import { DocumentRepository } from "@domain/repositories/document.repository";
import { DocumentTypeDefinition } from "@domain/entities/document-type-definition.entity";

export class SaveDocumentUseCase {
  constructor(private documentRepository: DocumentRepository) {}

  async execute(
    documentInput: DocumentInput,
    typeDefinition?: DocumentTypeDefinition,
  ): Promise<{ success: boolean; message: string; documentId?: string }> {
    // Validate required fields from schema
    if (typeDefinition) {
      for (const field of typeDefinition.fields) {
        if (field.required) {
          const value = documentInput.fields[field.key];
          if (!value || value.trim() === "") {
            return {
              success: false,
              message: `${field.label} is required`,
            };
          }
        }
      }
    }

    // Validate at least one photo
    const photoValues = Object.values(documentInput.photos);
    if (photoValues.length === 0 || !photoValues.some((p) => p)) {
      return {
        success: false,
        message: "At least one photo is required",
      };
    }

    try {
      const savedDocument = await this.documentRepository.save(documentInput);
      return {
        success: true,
        message: "Document saved successfully",
        documentId: savedDocument.id,
      };
    } catch (error) {
      console.error("Error saving document:", error);
      return {
        success: false,
        message: "Failed to save document",
      };
    }
  }
}
