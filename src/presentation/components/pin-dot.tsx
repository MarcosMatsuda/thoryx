import { View } from 'react-native';

interface PinDotProps {
  filled: boolean;
  error?: boolean;
}

export function PinDot({ filled, error = false }: PinDotProps) {
  return (
    <View 
      className={`w-4 h-4 rounded-full border-2 ${
        error
          ? 'bg-status-error border-status-error'
          : filled 
            ? 'bg-primary-main border-primary-main' 
            : 'bg-transparent border-ui-border'
      }`}
    />
  );
}
