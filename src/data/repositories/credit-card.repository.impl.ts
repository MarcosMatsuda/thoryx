import { CreditCard, CreditCardInput } from '@domain/entities/credit-card.entity';
import { CreditCardRepository } from '@domain/repositories/credit-card.repository';
import { EncryptionService } from '@infrastructure/security/encryption.service';
import { SecureStorageAdapter } from '@infrastructure/storage/secure-storage.adapter';

export class CreditCardRepositoryImpl implements CreditCardRepository {
  private storage: SecureStorageAdapter;
  private readonly CARDS_KEY = 'credit_cards';

  constructor() {
    this.storage = new SecureStorageAdapter(
      'credit-cards-storage',
      'thoryx-mmkv-encryption-key-2026'
    );
  }

  async save(cardInput: CreditCardInput): Promise<CreditCard> {
    try {
      const encryptedCardNumber = await EncryptionService.encrypt(cardInput.cardNumber);
      
      const lastFourDigits = cardInput.cardNumber.slice(-4);
      const id = `card_${Date.now()}`;
      
      const card: CreditCard = {
        id,
        cardNumber: encryptedCardNumber,
        cardholderName: cardInput.cardholderName,
        expiryDate: cardInput.expiryDate,
        lastFourDigits,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const cards = await this.findAll();
      cards.push(card);
      
      await this.storage.set(this.CARDS_KEY, JSON.stringify(cards));
      
      return card;
    } catch (error) {
      console.error('Error saving credit card:', error);
      throw new Error('Failed to save credit card');
    }
  }

  async findById(id: string): Promise<CreditCard | null> {
    try {
      const cards = await this.findAll();
      return cards.find(card => card.id === id) || null;
    } catch (error) {
      console.error('Error finding credit card:', error);
      return null;
    }
  }

  async findAll(): Promise<CreditCard[]> {
    try {
      const cardsJson = await this.storage.get(this.CARDS_KEY);
      if (!cardsJson) {
        return [];
      }
      
      const cards = JSON.parse(cardsJson);
      return cards.map((card: any) => ({
        ...card,
        createdAt: new Date(card.createdAt),
        updatedAt: new Date(card.updatedAt)
      }));
    } catch (error) {
      console.error('Error loading credit cards:', error);
      return [];
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const cards = await this.findAll();
      const filteredCards = cards.filter(card => card.id !== id);
      await this.storage.set(this.CARDS_KEY, JSON.stringify(filteredCards));
    } catch (error) {
      console.error('Error deleting credit card:', error);
      throw new Error('Failed to delete credit card');
    }
  }

  async decryptCardNumber(encryptedCardNumber: string): Promise<string> {
    try {
      return await EncryptionService.decrypt(encryptedCardNumber);
    } catch (error) {
      console.error('Error decrypting card number:', error);
      throw new Error('Failed to decrypt card number');
    }
  }
}
