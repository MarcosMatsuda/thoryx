export interface CreditCard {
  id: string;
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  lastFourDigits: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreditCardInput {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
}
