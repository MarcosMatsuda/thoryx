export type DocumentType = "CNH" | "RG";

export interface Document {
  id: string;
  type: DocumentType;
  documentNumber: string;
  fullName: string;
  dateOfBirth: string;
  expiryDate: string;
  frontPhotoEncrypted: string;
  backPhotoEncrypted: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentInput {
  type: DocumentType;
  documentNumber: string;
  fullName: string;
  dateOfBirth: string;
  expiryDate: string;
  frontPhoto: string;
  backPhoto: string;
}
