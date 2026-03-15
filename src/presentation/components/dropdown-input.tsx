import { View, Text, Pressable, Modal } from "react-native";
import { useState } from "react";

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownInputProps {
  label: string;
  value?: string;
  placeholder?: string;
  options?: DropdownOption[];
  onSelect?: (value: string) => void;
}

export function DropdownInput({
  label,
  value,
  placeholder = "Select type",
  options = [],
  onSelect,
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
              <Pressable
                key={option.value}
                className="py-4 border-b border-ui-border active:opacity-70"
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
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
