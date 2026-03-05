import { CreditCardRepository } from '@domain/repositories/credit-card.repository';

export class DeleteCreditCardUseCase {
  constructor(private creditCardRepository: CreditCardRepository) {}

  async execute(cardId: string): Promise<{ success: boolean; message: string }> {
    try {
      await this.creditCardRepository.delete(cardId);
      return {
        success: true,
        message: 'Credit card deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting credit card:', error);
      return {
        success: false,
        message: 'Failed to delete credit card'
      };
    }
  }
}
