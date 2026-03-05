import { Text, Pressable, View } from 'react-native';

interface ActionButtonProps {
  icon: string;
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
}

export function ActionButton({ 
  icon, 
  label, 
  onPress,
  variant = 'secondary' 
}: ActionButtonProps) {
  const isPrimary = variant === 'primary';
  
  return (
    <Pressable
      className={`flex-1 rounded-xl p-4 items-center justify-center min-h-[100px] ${
        isPrimary 
          ? 'bg-primary-main active:bg-primary-dark' 
          : 'bg-background-secondary active:bg-background-tertiary'
      }`}
      onPress={onPress}
    >
      <View className="mb-2">
        <Text className={`text-2xl ${isPrimary ? 'text-text-primary' : 'text-primary-main'}`}>
          {icon}
        </Text>
      </View>
      <Text className={`text-sm font-medium text-center ${
        isPrimary ? 'text-text-primary' : 'text-text-primary'
      }`}>
        {label}
      </Text>
    </Pressable>
  );
}
