export interface LockoutDecision {
  lockedUntil: number | null;
  delayMs: number;
}

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

const LOCKOUT_SCHEDULE_MS: Record<number, number> = {
  5: 1 * MINUTE,
  6: 5 * MINUTE,
  7: 15 * MINUTE,
  8: 1 * HOUR,
  9: 3 * HOUR,
  10: 6 * HOUR,
  11: 12 * HOUR,
};

const MAX_LOCKOUT_MS = 24 * HOUR;

export function computeLockoutDelay(
  attemptCount: number,
  now: number,
): LockoutDecision {
  if (attemptCount < 5) {
    return { lockedUntil: null, delayMs: 0 };
  }
  const scheduled = LOCKOUT_SCHEDULE_MS[attemptCount];
  const delayMs = scheduled ?? MAX_LOCKOUT_MS;
  return { lockedUntil: now + delayMs, delayMs };
}
