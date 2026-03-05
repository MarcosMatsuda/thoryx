import { useState, useEffect } from 'react';
import { CreditCard } from '@domain/entities/credit-card.entity';
import { CreditCardRepositoryImpl } from '@data/repositories/credit-card.repository.impl';
import { GetAllCreditCardsUseCase } from '@domain/use-cases/get-all-credit-cards.use-case';

export function useCreditCards() {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCards = async () => {
    try {
      setIsLoading(true);
      const repository = new CreditCardRepositoryImpl();
      const getAllCardsUseCase = new GetAllCreditCardsUseCase(repository);
      const loadedCards = await getAllCardsUseCase.execute();
      setCards(loadedCards);
    } catch (error) {
      console.error('Error loading cards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  return {
    cards,
    isLoading,
    reload: loadCards
  };
}
