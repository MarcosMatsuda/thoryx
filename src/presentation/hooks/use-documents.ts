import { useState, useEffect } from 'react';
import { Document } from '@domain/entities/document.entity';
import { DocumentRepositoryImpl } from '@data/repositories/document.repository.impl';
import { GetAllDocumentsUseCase } from '@domain/use-cases/get-all-documents.use-case';

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const repository = new DocumentRepositoryImpl();
      const getAllDocumentsUseCase = new GetAllDocumentsUseCase(repository);
      const loadedDocuments = await getAllDocumentsUseCase.execute();
      setDocuments(loadedDocuments);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  return {
    documents,
    isLoading,
    reload: loadDocuments
  };
}
