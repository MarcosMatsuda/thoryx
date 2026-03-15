import { View, Text } from "react-native";

interface CreditCardPreviewProps {
  cardNumber?: string;
  cardholderName?: string;
  expiryDate?: string;
}

export function CreditCardPreview({
  cardNumber = "**** **** **** 4242",
  cardholderName = "JONATHAN DOE",
  expiryDate = "12/28",
}: CreditCardPreviewProps) {
  return (
    <View className="bg-gradient-to-br from-primary-main to-primary-dark rounded-2xl p-6 mb-6">
      <View className="mb-8">
        <Text className="text-3xl mb-2">📡</Text>
      </View>

      <View className="mb-6">
        <Text className="text-2xl font-bold text-text-primary tracking-wider">
          {cardNumber}
        </Text>
      </View>

      <View className="flex-row justify-between items-end">
        <View>
          <Text className="text-xs text-text-primary/70 mb-1">
            Cardholder Name
          </Text>
          <Text className="text-base font-bold text-text-primary">
            {cardholderName}
          </Text>
        </View>
        <View>
          <Text className="text-xs text-text-primary/70 mb-1">Expires</Text>
          <Text className="text-base font-bold text-text-primary">
            {expiryDate}
          </Text>
        </View>
      </View>
    </View>
  );
}
