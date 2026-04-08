/** @deprecated Use typeId string instead. Kept for migration compatibility. */
export type DocumentType = "CNH" | "RG";

export interface Document {
  id: string;
  typeId: string;
  typeName: string;
  fields: Record<string, string>;
  photos: Record<string, string>;
  isAutoLockEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentInput {
  typeId: string;
  typeName: string;
  fields: Record<string, string>;
  photos: Record<string, string>;
}
