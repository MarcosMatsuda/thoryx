import { DocumentInput } from "@domain/entities/document.entity";
import { DocumentRepository } from "@domain/repositories/document.repository";

export class SaveDocumentUseCase {
  constructor(private documentRepository: DocumentRepository) {}

  async execute(
    documentInput: DocumentInput,
  ): Promise<{ success: boolean; message: string; documentId?: string }> {
    if (
      !documentInput.documentNumber ||
      documentInput.documentNumber.trim() === ""
    ) {
      return {
        success: false,
        message: "Document number is required",
      };
    }

    if (!documentInput.fullName || documentInput.fullName.trim() === "") {
      return {
        success: false,
        message: "Full name is required",
      };
    }

    if (!documentInput.frontPhoto) {
      return {
        success: false,
        message: "Front photo is required",
      };
    }

    if (!documentInput.backPhoto) {
      return {
        success: false,
        message: "Back photo is required",
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
