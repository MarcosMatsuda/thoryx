import {
  getDocumentTypeById,
  PHOTO_SLOT_LABELS,
} from "@domain/entities/document-type-registry";
import { DocumentTypeDefinition } from "@domain/entities/document-type-definition.entity";

export function getDocumentIcon(
  typeId: string,
  customTypes: DocumentTypeDefinition[] = [],
): string {
  return getDocumentTypeById(typeId, customTypes)?.icon ?? "📄";
}

export function getDocumentLabel(
  typeId: string,
  customTypes: DocumentTypeDefinition[] = [],
): string {
  return getDocumentTypeById(typeId, customTypes)?.label ?? "Document";
}

export function getPhotoSlotLabel(slot: string): string {
  return PHOTO_SLOT_LABELS[slot] ?? slot;
}
