import { View, Text, TextInput } from 'react-native';

interface TextInputFieldProps {
  label: string;
  value?: string;
  placeholder?: string;
  onChangeText?: (text: string) => void;
  keyboardType?: 'default' | 'numeric' | 'email-address';
}

export function TextInputField({ 
  label, 
  value, 
  placeholder,
  onChangeText,
  keyboardType = 'default'
}: TextInputFieldProps) {
  return (
    <View className="mb-4">
      <Text className="text-sm text-text-secondary mb-2">{label}</Text>
      <TextInput
        className="bg-background-secondary rounded-xl px-4 py-4 text-text-primary"
        placeholder={placeholder}
        placeholderTextColor="#64748B"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />
    </View>
  );
}
