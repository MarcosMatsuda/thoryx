import { DocumentTypeDefinition } from "./document-type-definition.entity";
import i18n from "@shared/i18n";

function t(key: string): string {
  return i18n.t(key);
}

export function getBuiltInDocumentTypes(): DocumentTypeDefinition[] {
  return [
    {
      id: "CNH",
      label: t("documentTypes.CNH.label"),
      icon: "🚗",
      builtIn: true,
      photoSlots: ["front", "back"],
      fields: [
        {
          key: "fullName",
          label: t("documentTypes.CNH.fields.fullName"),
          type: "text",
          required: true,
        },
        {
          key: "registrationNumber",
          label: t("documentTypes.CNH.fields.registrationNumber"),
          type: "text",
          required: true,
          placeholder: "00123456789",
        },
        {
          key: "cpf",
          label: t("documentTypes.CNH.fields.cpf"),
          type: "text",
          required: true,
          placeholder: "000.000.000-00",
        },
        {
          key: "dateOfBirth",
          label: t("documentTypes.CNH.fields.dateOfBirth"),
          type: "date",
          required: true,
        },
        {
          key: "expiryDate",
          label: t("documentTypes.CNH.fields.expiryDate"),
          type: "date",
          required: true,
        },
        {
          key: "category",
          label: t("documentTypes.CNH.fields.category"),
          type: "select",
          required: true,
          options: ["A", "B", "AB", "C", "D", "E", "AC", "AD", "AE"],
        },
      ],
    },
    {
      id: "RG",
      label: t("documentTypes.RG.label"),
      icon: "🆔",
      builtIn: true,
      photoSlots: ["front", "back"],
      fields: [
        {
          key: "fullName",
          label: t("documentTypes.RG.fields.fullName"),
          type: "text",
          required: true,
        },
        {
          key: "rgNumber",
          label: t("documentTypes.RG.fields.rgNumber"),
          type: "text",
          required: true,
          placeholder: "00.000.000-0",
        },
        {
          key: "issuingAuthority",
          label: t("documentTypes.RG.fields.issuingAuthority"),
          type: "text",
          required: true,
          placeholder: "SSP/SP",
        },
        {
          key: "issueDate",
          label: t("documentTypes.RG.fields.issueDate"),
          type: "date",
          required: true,
        },
        {
          key: "dateOfBirth",
          label: t("documentTypes.RG.fields.dateOfBirth"),
          type: "date",
          required: true,
        },
        {
          key: "filiation",
          label: t("documentTypes.RG.fields.filiation"),
          type: "text",
          required: false,
        },
        {
          key: "birthPlace",
          label: t("documentTypes.RG.fields.birthPlace"),
          type: "text",
          required: false,
        },
      ],
    },
    {
      id: "CPF",
      label: t("documentTypes.CPF.label"),
      icon: "📋",
      builtIn: true,
      photoSlots: ["front"],
      fields: [
        {
          key: "fullName",
          label: t("documentTypes.CPF.fields.fullName"),
          type: "text",
          required: true,
        },
        {
          key: "cpfNumber",
          label: t("documentTypes.CPF.fields.cpfNumber"),
          type: "text",
          required: true,
          placeholder: "000.000.000-00",
        },
        {
          key: "dateOfBirth",
          label: t("documentTypes.CPF.fields.dateOfBirth"),
          type: "date",
          required: true,
        },
      ],
    },
    {
      id: "PASSPORT",
      label: t("documentTypes.PASSPORT.label"),
      icon: "✈️",
      builtIn: true,
      photoSlots: ["dataPage"],
      fields: [
        {
          key: "fullName",
          label: t("documentTypes.PASSPORT.fields.fullName"),
          type: "text",
          required: true,
        },
        {
          key: "passportNumber",
          label: t("documentTypes.PASSPORT.fields.passportNumber"),
          type: "text",
          required: true,
          placeholder: "XX000000",
        },
        {
          key: "nationality",
          label: t("documentTypes.PASSPORT.fields.nationality"),
          type: "text",
          required: true,
        },
        {
          key: "dateOfBirth",
          label: t("documentTypes.PASSPORT.fields.dateOfBirth"),
          type: "date",
          required: true,
        },
        {
          key: "expiryDate",
          label: t("documentTypes.PASSPORT.fields.expiryDate"),
          type: "date",
          required: true,
        },
      ],
    },
    {
      id: "VOTER_ID",
      label: t("documentTypes.VOTER_ID.label"),
      icon: "🗳️",
      builtIn: true,
      photoSlots: ["front"],
      fields: [
        {
          key: "fullName",
          label: t("documentTypes.VOTER_ID.fields.fullName"),
          type: "text",
          required: true,
        },
        {
          key: "voterNumber",
          label: t("documentTypes.VOTER_ID.fields.voterNumber"),
          type: "text",
          required: true,
        },
        {
          key: "zone",
          label: t("documentTypes.VOTER_ID.fields.zone"),
          type: "text",
          required: true,
        },
        {
          key: "section",
          label: t("documentTypes.VOTER_ID.fields.section"),
          type: "text",
          required: true,
        },
        {
          key: "city",
          label: t("documentTypes.VOTER_ID.fields.city"),
          type: "text",
          required: true,
        },
        {
          key: "uf",
          label: t("documentTypes.VOTER_ID.fields.uf"),
          type: "text",
          required: true,
          placeholder: "SP",
        },
      ],
    },
    {
      id: "MILITARY_CERT",
      label: t("documentTypes.MILITARY_CERT.label"),
      icon: "🎖️",
      builtIn: true,
      photoSlots: ["front"],
      fields: [
        {
          key: "fullName",
          label: t("documentTypes.MILITARY_CERT.fields.fullName"),
          type: "text",
          required: true,
        },
        {
          key: "certificateNumber",
          label: t("documentTypes.MILITARY_CERT.fields.certificateNumber"),
          type: "text",
          required: true,
        },
        {
          key: "ra",
          label: t("documentTypes.MILITARY_CERT.fields.ra"),
          type: "text",
          required: true,
        },
        {
          key: "militaryCategory",
          label: t("documentTypes.MILITARY_CERT.fields.militaryCategory"),
          type: "select",
          required: true,
          options: ["1a Categoria", "2a Categoria", "3a Categoria"],
        },
        {
          key: "situation",
          label: t("documentTypes.MILITARY_CERT.fields.situation"),
          type: "select",
          required: true,
          options: ["Licenciado", "Reservista", "Excluido", "Refratario"],
        },
      ],
    },
  ];
}

/** @deprecated Use getBuiltInDocumentTypes() for i18n support */
export const BUILT_IN_DOCUMENT_TYPES: DocumentTypeDefinition[] = [];

export function getPhotoSlotLabels(): Record<string, string> {
  return {
    front: t("photoSlots.front"),
    back: t("photoSlots.back"),
    dataPage: t("photoSlots.dataPage"),
  };
}

export const PHOTO_SLOT_LABELS: Record<string, string> = new Proxy(
  {} as Record<string, string>,
  {
    get(_target, prop: string) {
      const labels: Record<string, string> = {
        front: t("photoSlots.front"),
        back: t("photoSlots.back"),
        dataPage: t("photoSlots.dataPage"),
      };
      return labels[prop] ?? prop;
    },
  },
);

export function getDocumentTypeById(
  id: string,
  customTypes: DocumentTypeDefinition[] = [],
): DocumentTypeDefinition | undefined {
  return (
    getBuiltInDocumentTypes().find((dt) => dt.id === id) ||
    customTypes.find((dt) => dt.id === id)
  );
}

export function getAllDocumentTypes(
  customTypes: DocumentTypeDefinition[] = [],
): DocumentTypeDefinition[] {
  return [...getBuiltInDocumentTypes(), ...customTypes];
}
