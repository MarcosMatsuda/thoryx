import { DocumentTypeDefinition } from "./document-type-definition.entity";

export const BUILT_IN_DOCUMENT_TYPES: DocumentTypeDefinition[] = [
  {
    id: "CNH",
    label: "CNH (Carteira Nacional de Habilitação)",
    icon: "🚗",
    builtIn: true,
    photoSlots: ["front", "back"],
    fields: [
      { key: "fullName", label: "Nome Completo", type: "text", required: true },
      {
        key: "registrationNumber",
        label: "Nº Registro",
        type: "text",
        required: true,
        placeholder: "00123456789",
      },
      {
        key: "cpf",
        label: "CPF",
        type: "text",
        required: true,
        placeholder: "000.000.000-00",
      },
      { key: "dateOfBirth", label: "Data de Nascimento", type: "date", required: true },
      { key: "expiryDate", label: "Validade", type: "date", required: true },
      {
        key: "category",
        label: "Categoria",
        type: "select",
        required: true,
        options: ["A", "B", "AB", "C", "D", "E", "AC", "AD", "AE"],
      },
    ],
  },
  {
    id: "RG",
    label: "RG (Registro Geral)",
    icon: "🆔",
    builtIn: true,
    photoSlots: ["front", "back"],
    fields: [
      { key: "fullName", label: "Nome Completo", type: "text", required: true },
      {
        key: "rgNumber",
        label: "Nº RG",
        type: "text",
        required: true,
        placeholder: "00.000.000-0",
      },
      {
        key: "issuingAuthority",
        label: "Órgão Emissor",
        type: "text",
        required: true,
        placeholder: "SSP/SP",
      },
      { key: "issueDate", label: "Data de Emissão", type: "date", required: true },
      { key: "dateOfBirth", label: "Data de Nascimento", type: "date", required: true },
      { key: "filiation", label: "Filiação", type: "text", required: false, placeholder: "Nome dos pais" },
      { key: "birthPlace", label: "Naturalidade", type: "text", required: false, placeholder: "Cidade/UF" },
    ],
  },
  {
    id: "CPF",
    label: "CPF",
    icon: "📋",
    builtIn: true,
    photoSlots: ["front"],
    fields: [
      { key: "fullName", label: "Nome Completo", type: "text", required: true },
      {
        key: "cpfNumber",
        label: "Nº CPF",
        type: "text",
        required: true,
        placeholder: "000.000.000-00",
      },
      { key: "dateOfBirth", label: "Data de Nascimento", type: "date", required: true },
    ],
  },
  {
    id: "PASSPORT",
    label: "Passaporte",
    icon: "✈️",
    builtIn: true,
    photoSlots: ["dataPage"],
    fields: [
      { key: "fullName", label: "Nome Completo", type: "text", required: true },
      {
        key: "passportNumber",
        label: "Nº Passaporte",
        type: "text",
        required: true,
        placeholder: "XX000000",
      },
      { key: "nationality", label: "Nacionalidade", type: "text", required: true, placeholder: "Brasileira" },
      { key: "dateOfBirth", label: "Data de Nascimento", type: "date", required: true },
      { key: "expiryDate", label: "Validade", type: "date", required: true },
    ],
  },
  {
    id: "VOTER_ID",
    label: "Título de Eleitor",
    icon: "🗳️",
    builtIn: true,
    photoSlots: ["front"],
    fields: [
      { key: "fullName", label: "Nome Completo", type: "text", required: true },
      { key: "voterNumber", label: "Nº Título", type: "text", required: true },
      { key: "zone", label: "Zona", type: "text", required: true },
      { key: "section", label: "Seção", type: "text", required: true },
      { key: "city", label: "Município", type: "text", required: true },
      { key: "uf", label: "UF", type: "text", required: true, placeholder: "SP" },
    ],
  },
  {
    id: "MILITARY_CERT",
    label: "Certificado Militar",
    icon: "🎖️",
    builtIn: true,
    photoSlots: ["front"],
    fields: [
      { key: "fullName", label: "Nome Completo", type: "text", required: true },
      { key: "certificateNumber", label: "Nº Certificado", type: "text", required: true },
      { key: "ra", label: "RA", type: "text", required: true },
      {
        key: "militaryCategory",
        label: "Categoria",
        type: "select",
        required: true,
        options: ["1ª Categoria", "2ª Categoria", "3ª Categoria"],
      },
      {
        key: "situation",
        label: "Situação",
        type: "select",
        required: true,
        options: ["Licenciado", "Reservista", "Excluído", "Refratário"],
      },
    ],
  },
];

export const PHOTO_SLOT_LABELS: Record<string, string> = {
  front: "Foto Frente",
  back: "Foto Verso",
  dataPage: "Página de Dados",
};

export function getDocumentTypeById(
  id: string,
  customTypes: DocumentTypeDefinition[] = [],
): DocumentTypeDefinition | undefined {
  return (
    BUILT_IN_DOCUMENT_TYPES.find((t) => t.id === id) ||
    customTypes.find((t) => t.id === id)
  );
}

export function getAllDocumentTypes(
  customTypes: DocumentTypeDefinition[] = [],
): DocumentTypeDefinition[] {
  return [...BUILT_IN_DOCUMENT_TYPES, ...customTypes];
}
