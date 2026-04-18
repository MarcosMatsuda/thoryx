import { create } from "zustand";
import { Document } from "@domain/entities/document.entity";
import { DocumentTypeDefinition } from "@domain/entities/document-type-definition.entity";
import { DocumentRepositoryImpl } from "@data/repositories/document.repository.impl";
import { DocumentTypeRepositoryImpl } from "@data/repositories/document-type.repository.impl";
import { GetAllDocumentsUseCase } from "@domain/use-cases/get-all-documents.use-case";

interface DocumentsState {
  documents: Document[];
  customDocumentTypes: DocumentTypeDefinition[];
  isLoading: boolean;
  loadDocuments: () => Promise<void>;
  loadCustomTypes: () => Promise<void>;
  reset: () => void;
}

export const useDocumentsStore = create<DocumentsState>((set, get) => ({
  documents: [],
  customDocumentTypes: [],
  isLoading: false,

  loadDocuments: async () => {
    if (get().isLoading) return;
    try {
      set({ isLoading: true });
      const repository = new DocumentRepositoryImpl();
      const getAllDocumentsUseCase = new GetAllDocumentsUseCase(repository);
      const documents = await getAllDocumentsUseCase.execute();
      set({ documents, isLoading: false });
    } catch (error) {
      console.error("Error loading documents:", error);
      set({ isLoading: false });
    }
  },

  loadCustomTypes: async () => {
    try {
      const typeRepo = new DocumentTypeRepositoryImpl();
      const customTypes = await typeRepo.getAllCustomTypes();
      set({ customDocumentTypes: customTypes });
    } catch (error) {
      console.error("Error loading custom types:", error);
    }
  },

  reset: () => {
    set({ documents: [], customDocumentTypes: [], isLoading: false });
  },
}));
