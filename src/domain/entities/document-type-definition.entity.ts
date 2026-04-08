export type FieldType = "text" | "date" | "select";

export interface FieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export type PhotoSlot = "front" | "back" | "dataPage";

export interface DocumentTypeDefinition {
  id: string;
  label: string;
  icon: string;
  builtIn: boolean;
  fields: FieldDefinition[];
  photoSlots: PhotoSlot[];
}
