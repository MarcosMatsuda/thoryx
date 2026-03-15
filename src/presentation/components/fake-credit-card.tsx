import { View, Text } from "react-native";

interface FakeCreditCardProps {
  cardNumber?: string;
  cardholderName?: string;
  expiryDate?: string;
  backgroundColor?: string;
}

const CARD_COLORS = [
  "#1E40AF",
  "#7C3AED",
  "#DB2777",
  "#DC2626",
  "#EA580C",
  "#059669",
  "#0891B2",
];

export function FakeCreditCard({
  cardNumber = "",
  cardholderName = "",
  expiryDate = "",
  backgroundColor,
}: FakeCreditCardProps) {
  const formatCardNumber = (number: string) => {
    const cleaned = number.replace(/\s/g, "");
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks
      .map((chunk, index) => {
        if (index < chunks.length - 1 || chunk.length === 4) {
          return chunk;
        }
        return chunk + "•".repeat(4 - chunk.length);
      })
      .join(" ");
  };

  const displayCardNumber = cardNumber
    ? formatCardNumber(cardNumber)
    : "•••• •••• •••• ••••";

  const displayName = cardholderName || "CARDHOLDER NAME";
  const displayExpiry = expiryDate || "MM/YY";

  return (
    <View className="w-full items-center mb-6">
      <View
        className="rounded-xl overflow-hidden p-4 justify-between"
        style={{
          backgroundColor: backgroundColor || CARD_COLORS[0],
          width: "100%",
          maxWidth: 320,
          height: 200,
        }}
      >
        <View className="flex-row justify-between items-start">
          <View className="w-8 h-6 bg-text-primary/20 rounded" />
        </View>

        <View>
          <Text className="text-base font-bold text-text-primary tracking-wider mb-3">
            {displayCardNumber}
          </Text>

          <View className="flex-row justify-between items-end">
            <View className="flex-1 mr-3">
              <Text className="text-[9px] text-text-primary/60 mb-0.5">
                Cardholder Name
              </Text>
              <Text className="text-xs font-semibold text-text-primary">
                {displayName}
              </Text>
            </View>
            <View>
              <Text className="text-[9px] text-text-primary/60 mb-0.5">
                Expires
              </Text>
              <Text className="text-xs font-semibold text-text-primary">
                {displayExpiry}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

export { CARD_COLORS };
