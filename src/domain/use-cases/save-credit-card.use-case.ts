import cardValidator from "card-validator";
import { CreditCardInput } from "@domain/entities/credit-card.entity";
import { CreditCardRepository } from "@domain/repositories/credit-card.repository";

export class SaveCreditCardUseCase {
  constructor(private creditCardRepository: CreditCardRepository) {}

  async execute(
    cardInput: CreditCardInput,
  ): Promise<{ success: boolean; message: string; cardId?: string }> {
    const cardNumberValidation = cardValidator.number(cardInput.cardNumber);
    if (!cardNumberValidation.isValid) {
      return {
        success: false,
        message: "Invalid card number",
      };
    }

    const expirationValidation = cardValidator.expirationDate(
      cardInput.expiryDate,
    );
    if (!expirationValidation.isValid) {
      return {
        success: false,
        message: "Invalid expiration date",
      };
    }

    const cardholderValidation = cardValidator.cardholderName(
      cardInput.cardholderName,
    );
    if (!cardholderValidation.isValid) {
      return {
        success: false,
        message: "Invalid cardholder name",
      };
    }

    try {
      const savedCard = await this.creditCardRepository.save(cardInput);
      return {
        success: true,
        message: "Credit card saved successfully",
        cardId: savedCard.id,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to save credit card",
      };
    }
  }
}
