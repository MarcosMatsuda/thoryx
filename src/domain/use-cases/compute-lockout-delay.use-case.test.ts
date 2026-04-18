import { computeLockoutDelay } from "./compute-lockout-delay.use-case";

const NOW = 1_000_000_000;
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

describe("computeLockoutDelay", () => {
  it.each([0, 1, 2, 3, 4])(
    "does not lock out on attempt %i",
    (attemptCount) => {
      const result = computeLockoutDelay(attemptCount, NOW);
      expect(result.lockedUntil).toBeNull();
      expect(result.delayMs).toBe(0);
    },
  );

  it.each([
    [5, 1 * MINUTE],
    [6, 5 * MINUTE],
    [7, 15 * MINUTE],
    [8, 1 * HOUR],
    [9, 3 * HOUR],
    [10, 6 * HOUR],
    [11, 12 * HOUR],
  ])("locks attempt %i for %ims", (attemptCount, expected) => {
    const result = computeLockoutDelay(attemptCount, NOW);
    expect(result.delayMs).toBe(expected);
    expect(result.lockedUntil).toBe(NOW + expected);
  });

  it.each([12, 15, 20, 100])(
    "caps lockout at 24h starting at attempt %i",
    (attemptCount) => {
      const result = computeLockoutDelay(attemptCount, NOW);
      expect(result.delayMs).toBe(24 * HOUR);
      expect(result.lockedUntil).toBe(NOW + 24 * HOUR);
    },
  );

  it("uses the provided now as the base timestamp", () => {
    const result = computeLockoutDelay(5, 500);
    expect(result.lockedUntil).toBe(500 + 1 * MINUTE);
  });
});
