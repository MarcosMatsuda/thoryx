import { CreditCard } from "@domain/entities/credit-card.entity";
import { CreditCardRepository } from "@domain/repositories/credit-card.repository";

export class GetAllCreditCardsUseCase {
  constructor(private creditCardRepository: CreditCardRepository) {}

  async execute(): Promise<CreditCard[]> {
    try {
      return await this.creditCardRepository.findAll();
    } catch (error) {
      console.error("Error getting credit cards:", error);
      return [];
    }
  }
}
