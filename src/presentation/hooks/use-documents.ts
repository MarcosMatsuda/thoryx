import { useEffect } from "react";
import { useDocumentsStore } from "@stores/documents.store";

export function useDocuments() {
  const { documents, isLoading, loadDocuments } = useDocumentsStore();

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  return {
    documents,
    isLoading,
    reload: loadDocuments,
  };
}
