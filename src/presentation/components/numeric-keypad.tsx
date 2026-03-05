import { View } from 'react-native';
import { NumericKey } from './numeric-key';

interface NumericKeypadProps {
  onKeyPress: (value: string) => void;
  onBackspace: () => void;
}

export function NumericKeypad({ onKeyPress, onBackspace }: NumericKeypadProps) {
  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', 'backspace'],
  ];

  return (
    <View className="w-full h-full justify-between">
      {keys.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row justify-between">
          {row.map((key, keyIndex) => {
            if (key === '') {
              return <View key={keyIndex} className="flex-1" />;
            }
            
            if (key === 'backspace') {
              return (
                <NumericKey
                  key={keyIndex}
                  value={key}
                  onPress={onBackspace}
                  isBackspace
                />
              );
            }

            return (
              <NumericKey
                key={keyIndex}
                value={key}
                onPress={onKeyPress}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}
