import { CreditCard, CreditCardInput } from '@domain/entities/credit-card.entity';

export interface CreditCardRepository {
  save(card: CreditCardInput): Promise<CreditCard>;
  findById(id: string): Promise<CreditCard | null>;
  findAll(): Promise<CreditCard[]>;
  delete(id: string): Promise<void>;
  decryptCardNumber(encryptedCardNumber: string): Promise<string>;
}
