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

export const useCardsStore = create<CardsState>((set, get) => ({
  cards: [],
  isLoading: false,

  loadCards: async () => {
    if (get().isLoading) return;
    try {
      set({ isLoading: true });
      const repository = new CreditCardRepositoryImpl();
      const getAllCreditCardsUseCase = new GetAllCreditCardsUseCase(repository);
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
}));
