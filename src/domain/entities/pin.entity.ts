export interface Pin {
  id: string;
  encryptedPin: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PinInput {
  pin: string;
}
