import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DocumentsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-4xl mb-4">📄</Text>
        <Text className="text-2xl font-bold text-text-primary mb-2">
          Documents
        </Text>
        <Text className="text-base text-text-secondary text-center">
          View and manage your documents
        </Text>
      </View>
    </SafeAreaView>
  );
}
