import { View, Text } from "react-native";
import { useState } from "react";
import { TextInputField } from "@presentation/components/text-input-field";
import { DateInput } from "@presentation/components/date-input";
import { DropdownInput } from "@presentation/components/dropdown-input";
import { CalendarPickerBottomSheet } from "@presentation/components/calendar-picker-bottom-sheet";
import {
  FieldDefinition,
  DocumentTypeDefinition,
} from "@domain/entities/document-type-definition.entity";
import { PHOTO_SLOT_LABELS } from "@domain/entities/document-type-registry";
import { PhotoUpload } from "@presentation/components/photo-upload";

interface Props {
  typeDefinition: DocumentTypeDefinition;
  fields: Record<string, string>;
  photos: Record<string, string>;
  onFieldChange: (key: string, value: string) => void;
  onTakePhoto: (slot: string) => void;
}

export function DynamicDocumentForm({
  typeDefinition,
  fields,
  photos,
  onFieldChange,
  onTakePhoto,
}: Props) {
  const [calendarKey, setCalendarKey] = useState<string | null>(null);

  const formatDateInput = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    const limited = cleaned.substring(0, 8);
    if (limited.length >= 4)
      return `${limited.substring(0, 2)}/${limited.substring(2, 4)}/${limited.substring(4)}`;
    if (limited.length >= 2)
      return `${limited.substring(0, 2)}/${limited.substring(2)}`;
    return limited;
  };

  const handleDateTextChange = (key: string, text: string) => {
    const formatted = formatDateInput(text);
    onFieldChange(key, formatted);
  };

  const handleCalendarSelect = (date: Date) => {
    if (!calendarKey) return;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    onFieldChange(calendarKey, `${day}/${month}/${year}`);
    setCalendarKey(null);
  };

  const parseDateValue = (dateStr: string): Date | undefined => {
    if (!dateStr || dateStr.length !== 10) return undefined;
    const [day, month, year] = dateStr.split("/");
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return isNaN(d.getTime()) ? undefined : d;
  };

  const renderField = (field: FieldDefinition) => {
    const value = fields[field.key] ?? "";

    switch (field.type) {
      case "text":
        return (
          <TextInputField
            key={field.key}
            label={field.label}
            placeholder={field.placeholder ?? ""}
            value={value}
            onChangeText={(text) => onFieldChange(field.key, text)}
          />
        );

      case "date":
        return (
          <View key={field.key} className="mb-4">
            <DateInput
              label={field.label}
              placeholder="DD/MM/AAAA"
              value={value}
              onChangeText={(text) => handleDateTextChange(field.key, text)}
              onPress={() => setCalendarKey(field.key)}
            />
          </View>
        );

      case "select":
        return (
          <DropdownInput
            key={field.key}
            label={field.label}
            placeholder={`Selecione ${field.label.toLowerCase()}`}
            value={value}
            options={(field.options ?? []).map((opt) => ({
              label: opt,
              value: opt,
            }))}
            onSelect={(v) => onFieldChange(field.key, v)}
          />
        );

      default:
        return null;
    }
  };

  // Group date fields in pairs for side-by-side layout
  const dateFields = typeDefinition.fields.filter((f) => f.type === "date");
  const nonDateFields = typeDefinition.fields.filter((f) => f.type !== "date");

  return (
    <View>
      {/* Non-date fields */}
      {nonDateFields.map(renderField)}

      {/* Date fields — side by side if 2, stacked otherwise */}
      {dateFields.length === 2 ? (
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1">
            <DateInput
              label={dateFields[0].label}
              placeholder="DD/MM/AAAA"
              value={fields[dateFields[0].key] ?? ""}
              onChangeText={(text) =>
                handleDateTextChange(dateFields[0].key, text)
              }
              onPress={() => setCalendarKey(dateFields[0].key)}
            />
          </View>
          <View className="flex-1">
            <DateInput
              label={dateFields[1].label}
              placeholder="DD/MM/AAAA"
              value={fields[dateFields[1].key] ?? ""}
              onChangeText={(text) =>
                handleDateTextChange(dateFields[1].key, text)
              }
              onPress={() => setCalendarKey(dateFields[1].key)}
            />
          </View>
        </View>
      ) : (
        dateFields.map(renderField)
      )}

      {/* Photos */}
      <View className="mb-6">
        <Text className="text-xs font-semibold text-text-secondary tracking-wider mb-4">
          FOTOS DO DOCUMENTO
        </Text>
        {typeDefinition.photoSlots.map((slot) => (
          <PhotoUpload
            key={slot}
            title={PHOTO_SLOT_LABELS[slot] ?? slot}
            subtitle="Toque para tirar foto"
            imageUri={photos[slot] ?? null}
            onPress={() => onTakePhoto(slot)}
          />
        ))}
      </View>

      {/* Calendar bottom sheet */}
      <CalendarPickerBottomSheet
        visible={calendarKey !== null}
        onClose={() => setCalendarKey(null)}
        onSelectDate={handleCalendarSelect}
        selectedDate={
          calendarKey ? parseDateValue(fields[calendarKey] ?? "") : undefined
        }
      />
    </View>
  );
}
