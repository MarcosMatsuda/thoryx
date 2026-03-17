import { create } from "zustand";
import { CreditCard } from "@domain/entities/credit-card.entity";
import { CreditCardRepositoryImpl } from "@data/repositories/credit-card.repository.impl";
import { GetAllCreditCardsUseCase } from "@domain/use-cases/get-all-credit-cards.use-case";

interface CardsState {
  cards: CreditCard[];
  isLoading: boolean;
  loadCards: () => Promise<void>;
  reset: () => void;
}

export const useCardsStore = create<CardsState>((set: any) => {
  const repository = new CreditCardRepositoryImpl();
  const getAllCreditCardsUseCase = new GetAllCreditCardsUseCase(repository);

  return {
    cards: [],
    isLoading: false,

    loadCards: async () => {
      try {
        set({ isLoading: true });
        const cards = await getAllCreditCardsUseCase.execute();
        set({ cards, isLoading: false });
      } catch (error) {
        console.error("Error loading cards:", error);
        set({ isLoading: false });
      }
    },

    reset: () => {
      set({ cards: [], isLoading: false });
    },
  };
});
