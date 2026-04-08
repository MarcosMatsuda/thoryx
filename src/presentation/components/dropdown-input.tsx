import { View, Text, Pressable, Modal } from "react-native";
import { useState } from "react";

interface DropdownOption {
  label: string;
  value: string;
  editable?: boolean;
}

interface DropdownInputProps {
  label: string;
  value?: string;
  placeholder?: string;
  options?: DropdownOption[];
  onSelect?: (value: string) => void;
  onEditOption?: (value: string) => void;
}

export function DropdownInput({
  label,
  value,
  placeholder = "Select type",
  options = [],
  onSelect,
  onEditOption,
}: DropdownInputProps) {
  const [showOptions, setShowOptions] = useState(false);

  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  return (
    <View className="mb-4">
      <Text className="text-sm text-text-secondary mb-2">{label}</Text>
      <Pressable
        className="bg-background-secondary rounded-xl px-4 py-4 flex-row items-center justify-between active:bg-background-tertiary"
        onPress={() => setShowOptions(true)}
      >
        <Text className={value ? "text-text-primary" : "text-text-secondary"}>
          {selectedLabel || placeholder}
        </Text>
        <Text className="text-text-secondary text-xl">›</Text>
      </Pressable>

      <Modal visible={showOptions} transparent animationType="slide">
        <Pressable
          className="flex-1 bg-black/70 justify-end"
          onPress={() => setShowOptions(false)}
        >
          <Pressable
            className="bg-background-primary rounded-t-3xl p-6"
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="text-lg font-bold text-text-primary mb-4">
              {label}
            </Text>
            {options.map((option) => (
              <View
                key={option.value}
                className="flex-row items-center border-b border-ui-border"
              >
                <Pressable
                  className="flex-1 py-4 active:opacity-70"
                  onPress={() => {
                    onSelect?.(option.value);
                    setShowOptions(false);
                  }}
                >
                  <Text
                    className={`text-base ${
                      value === option.value
                        ? "text-primary-main font-bold"
                        : "text-text-primary"
                    }`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
                {option.editable && onEditOption && (
                  <Pressable
                    className="px-3 py-4 active:opacity-60"
                    onPress={() => {
                      setShowOptions(false);
                      onEditOption(option.value);
                    }}
                  >
                    <Text className="text-primary-main text-sm">✏️</Text>
                  </Pressable>
                )}
              </View>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
