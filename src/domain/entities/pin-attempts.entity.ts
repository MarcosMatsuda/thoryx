export interface PinAttempts {
  count: number;
  lastAttemptAt: number;
  lockedUntil: number | null;
}

export const INITIAL_PIN_ATTEMPTS: PinAttempts = {
  count: 0,
  lastAttemptAt: 0,
  lockedUntil: null,
};
