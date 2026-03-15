import { Document } from "@domain/entities/document.entity";
import { DocumentRepository } from "@domain/repositories/document.repository";

export class GetAllDocumentsUseCase {
  constructor(private documentRepository: DocumentRepository) {}

  async execute(): Promise<Document[]> {
    try {
      return await this.documentRepository.findAll();
    } catch (error) {
      console.error("Error getting documents:", error);
      return [];
    }
  }
}
