export const PIN_SCHEMA_VERSION = 2;

export interface Pin {
  id: string;
  version: 2;
  salt: string;
  iterations: number;
  hash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PinInput {
  pin: string;
}

export interface LegacyPin {
  id: string;
  version?: 1;
  encryptedPin: string;
  createdAt: Date;
  updatedAt: Date;
}

export type StoredPin = Pin | LegacyPin;

export function isLegacyPin(pin: StoredPin): pin is LegacyPin {
  return (pin as Pin).version !== 2;
}
