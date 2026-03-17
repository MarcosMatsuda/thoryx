import { create } from "zustand";
import { Document } from "@domain/entities/document.entity";
import { DocumentRepositoryImpl } from "@data/repositories/document.repository.impl";
import { GetAllDocumentsUseCase } from "@domain/use-cases/get-all-documents.use-case";

interface DocumentsState {
  documents: Document[];
  isLoading: boolean;
  loadDocuments: () => Promise<void>;
  reset: () => void;
}

export const useDocumentsStore = create<DocumentsState>((set) => ({
  documents: [],
  isLoading: false,

  loadDocuments: async () => {
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

  reset: () => {
    set({ documents: [], isLoading: false });
  },
}));
