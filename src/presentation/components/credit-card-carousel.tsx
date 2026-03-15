import {
  View,
  ScrollView,
  Pressable,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { FakeCreditCard, CARD_COLORS } from "./fake-credit-card";
import { CreditCard } from "@domain/entities/credit-card.entity";
import { useRef, useEffect } from "react";

interface CreditCardCarouselProps {
  cards: CreditCard[];
  onCardSelect: (card: CreditCard, index: number) => void;
  selectedIndex: number;
}

export function CreditCardCarousel({
  cards,
  onCardSelect,
  selectedIndex,
}: CreditCardCarouselProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const cardWidth = 320;
  const screenWidth = Dimensions.get("window").width;
  const cardSpacing = 20;
  const sideCardPeek = 40;

  useEffect(() => {
    if (scrollViewRef.current && selectedIndex >= 0) {
      const offset = selectedIndex * (cardWidth + cardSpacing);
      scrollViewRef.current.scrollTo({ x: offset, animated: true });
    }
  }, [selectedIndex]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (cardWidth + cardSpacing));

    if (index !== selectedIndex && index >= 0 && index < cards.length) {
      onCardSelect(cards[index], index);
    }
  };

  if (cards.length === 0) {
    return null;
  }

  return (
    <View className="mb-6">
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + cardSpacing}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScroll}
        contentContainerStyle={{
          paddingHorizontal: (screenWidth - cardWidth) / 2,
        }}
      >
        {cards.map((card, index) => (
          <View
            key={card.id}
            style={{
              width: cardWidth,
              marginRight: index < cards.length - 1 ? cardSpacing : 0,
              opacity: selectedIndex === index ? 1 : 0.4,
            }}
          >
            <FakeCreditCard
              cardNumber={`**** **** **** ${card.lastFourDigits}`}
              cardholderName={card.cardholderName}
              expiryDate={card.expiryDate}
              backgroundColor={CARD_COLORS[index % CARD_COLORS.length]}
            />
          </View>
        ))}
      </ScrollView>

      {cards.length > 1 && (
        <View className="flex-row justify-center gap-2 -mt-4">
          {cards.map((_, index) => (
            <View
              key={index}
              className={`w-2 h-2 rounded-full ${
                selectedIndex === index ? "bg-primary-main" : "bg-ui-border"
              }`}
            />
          ))}
        </View>
      )}
    </View>
  );
}
