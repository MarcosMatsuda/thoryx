import cardValidator from 'card-validator';
import { CreditCardRepository } from '@domain/repositories/credit-card.repository';

interface UpdateCreditCardInput {
  cardId: string;
  cardholderName?: string;
  expiryDate?: string;
}

export class UpdateCreditCardUseCase {
  constructor(private creditCardRepository: CreditCardRepository) {}

  async execute(input: UpdateCreditCardInput): Promise<{ success: boolean; message: string }> {
    if (input.expiryDate) {
      const expirationValidation = cardValidator.expirationDate(input.expiryDate);
      if (!expirationValidation.isValid) {
        return {
          success: false,
          message: 'Invalid expiration date'
        };
      }
    }

    if (input.cardholderName) {
      const cardholderValidation = cardValidator.cardholderName(input.cardholderName);
      if (!cardholderValidation.isValid) {
        return {
          success: false,
          message: 'Invalid cardholder name'
        };
      }
    }

    try {
      const existingCard = await this.creditCardRepository.findById(input.cardId);
      if (!existingCard) {
        return {
          success: false,
          message: 'Card not found'
        };
      }

      await this.creditCardRepository.delete(input.cardId);

      const updatedCardInput = {
        cardNumber: await this.creditCardRepository.decryptCardNumber(existingCard.cardNumber),
        cardholderName: input.cardholderName || existingCard.cardholderName,
        expiryDate: input.expiryDate || existingCard.expiryDate
      };

      await this.creditCardRepository.save(updatedCardInput);

      return {
        success: true,
        message: 'Credit card updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update credit card'
      };
    }
  }
}
