import { DocumentRepository } from '@domain/repositories/document.repository';

export class DeleteDocumentUseCase {
  constructor(private documentRepository: DocumentRepository) {}

  async execute(documentId: string): Promise<{ success: boolean; message: string }> {
    try {
      await this.documentRepository.delete(documentId);
      return {
        success: true,
        message: 'Document deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting document:', error);
      return {
        success: false,
        message: 'Failed to delete document'
      };
    }
  }
}
