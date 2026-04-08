import {
  getDocumentTypeById,
  PHOTO_SLOT_LABELS,
} from "@domain/entities/document-type-registry";
import { DocumentTypeDefinition } from "@domain/entities/document-type-definition.entity";
import i18n from "@shared/i18n";

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
  return getDocumentTypeById(typeId, customTypes)?.label ?? i18n.t("documents.title");
}

export function getPhotoSlotLabel(slot: string): string {
  return PHOTO_SLOT_LABELS[slot] ?? slot;
}
