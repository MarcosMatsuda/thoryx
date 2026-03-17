import { useEffect } from "react";
import { useCardsStore } from "@stores/cards.store";

export function useCreditCards() {
  const { cards, isLoading, loadCards } = useCardsStore();

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  return {
    cards,
    isLoading,
    reload: loadCards,
  };
}
