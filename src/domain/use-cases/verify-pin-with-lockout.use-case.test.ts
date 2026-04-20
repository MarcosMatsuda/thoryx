import { VerifyPinWithLockoutUseCase } from "./verify-pin-with-lockout.use-case";
import { PinRepository } from "@domain/repositories/pin.repository";
import { PinAttemptsRepository } from "@domain/repositories/pin-attempts.repository";
import { StoredPin, Pin, LegacyPin } from "@domain/entities/pin.entity";
import { PBKDF2_ITERATIONS } from "@infrastructure/security/pbkdf2.service";

const V2_PIN: Pin = {
  id: "user_pin",
  version: 2,
  salt: "deadbeef",
  iterations: PBKDF2_ITERATIONS,
  hash: "cafebabe",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const V2_PIN_OLD: Pin = {
  ...V2_PIN,
  iterations: 999_999,
};

const LEGACY_PIN: LegacyPin = {
  id: "user_pin",
  encryptedPin: "abc:def",
  createdAt: new Date(),
  updatedAt: new Date(),
};

function mockPinRepository(
  stored: StoredPin | null,
): jest.Mocked<PinRepository> {
  return {
    save: jest.fn().mockResolvedValue(V2_PIN),
    verify: jest.fn().mockResolvedValue(false),
    verifyLegacy: jest.fn().mockResolvedValue(false),
    readStored: jest.fn().mockResolvedValue(stored),
    exists: jest.fn().mockResolvedValue(stored !== null),
    delete: jest.fn().mockResolvedValue(undefined),
  };
}

function mockAttemptsRepository(
  initial = { count: 0, lastAttemptAt: 0, lockedUntil: null as number | null },
): jest.Mocked<PinAttemptsRepository> {
  let state = { ...initial };
  return {
    get: jest.fn().mockImplementation(() => Promise.resolve({ ...state })),
    save: jest.fn().mockImplementation((next) => {
      state = { ...next };
      return Promise.resolve();
    }),
    reset: jest.fn().mockImplementation(() => {
      state = { count: 0, lastAttemptAt: 0, lockedUntil: null };
      return Promise.resolve();
    }),
  };
}

describe("VerifyPinWithLockoutUseCase", () => {
  const NOW = 1_700_000_000_000;
  const now = () => NOW;

  it("returns success and resets attempts when there were previous bad tries", async () => {
    const pinRepo = mockPinRepository(V2_PIN);
    pinRepo.verify.mockResolvedValue(true);
    const attemptsRepo = mockAttemptsRepository({
      count: 3,
      lastAttemptAt: 0,
      lockedUntil: null,
    });

    const useCase = new VerifyPinWithLockoutUseCase(pinRepo, attemptsRepo, now);
    const result = await useCase.execute("123456");

    expect(result.success).toBe(true);
    expect(result.migrated).toBe(false);
    expect(attemptsRepo.reset).toHaveBeenCalled();
  });

  it("skips the reset round-trip on a clean success (count already 0)", async () => {
    const pinRepo = mockPinRepository(V2_PIN);
    pinRepo.verify.mockResolvedValue(true);
    const attemptsRepo = mockAttemptsRepository({
      count: 0,
      lastAttemptAt: 0,
      lockedUntil: null,
    });

    const useCase = new VerifyPinWithLockoutUseCase(pinRepo, attemptsRepo, now);
    const result = await useCase.execute("123456");

    expect(result.success).toBe(true);
    expect(attemptsRepo.reset).not.toHaveBeenCalled();
  });

  it("migrates legacy PIN to v2 on successful verification", async () => {
    const pinRepo = mockPinRepository(LEGACY_PIN);
    pinRepo.verifyLegacy.mockResolvedValue(true);
    const attemptsRepo = mockAttemptsRepository({
      count: 2,
      lastAttemptAt: 0,
      lockedUntil: null,
    });

    const useCase = new VerifyPinWithLockoutUseCase(pinRepo, attemptsRepo, now);
    const result = await useCase.execute("123456");

    expect(result.success).toBe(true);
    expect(result.migrated).toBe(true);
    expect(pinRepo.save).toHaveBeenCalledWith({ pin: "123456" });
    expect(attemptsRepo.reset).toHaveBeenCalled();
  });

  it("blocks verification while lockedUntil is in the future", async () => {
    const pinRepo = mockPinRepository(V2_PIN);
    const attemptsRepo = mockAttemptsRepository({
      count: 5,
      lastAttemptAt: NOW - 1000,
      lockedUntil: NOW + 60_000,
    });

    const useCase = new VerifyPinWithLockoutUseCase(pinRepo, attemptsRepo, now);
    const result = await useCase.execute("123456");

    expect(result.success).toBe(false);
    expect(result.reason).toBe("locked");
    expect(result.lockedUntil).toBe(NOW + 60_000);
    expect(pinRepo.verify).not.toHaveBeenCalled();
  });

  it("allows verification after lockout has expired", async () => {
    const pinRepo = mockPinRepository(V2_PIN);
    pinRepo.verify.mockResolvedValue(true);
    const attemptsRepo = mockAttemptsRepository({
      count: 5,
      lastAttemptAt: 0,
      lockedUntil: NOW - 1,
    });

    const useCase = new VerifyPinWithLockoutUseCase(pinRepo, attemptsRepo, now);
    const result = await useCase.execute("123456");

    expect(result.success).toBe(true);
    expect(attemptsRepo.reset).toHaveBeenCalled();
  });

  it("increments attempt count and sets lockout on wrong PIN at threshold", async () => {
    const pinRepo = mockPinRepository(V2_PIN);
    pinRepo.verify.mockResolvedValue(false);
    const attemptsRepo = mockAttemptsRepository({
      count: 4,
      lastAttemptAt: 0,
      lockedUntil: null,
    });

    const useCase = new VerifyPinWithLockoutUseCase(pinRepo, attemptsRepo, now);
    const result = await useCase.execute("000000");

    expect(result.success).toBe(false);
    expect(result.reason).toBe("wrong-pin");
    expect(result.attemptCount).toBe(5);
    expect(result.lockedUntil).toBe(NOW + 60_000);
    expect(attemptsRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ count: 5, lockedUntil: NOW + 60_000 }),
    );
  });

  it("does not set lockout for early wrong attempts", async () => {
    const pinRepo = mockPinRepository(V2_PIN);
    pinRepo.verify.mockResolvedValue(false);
    const attemptsRepo = mockAttemptsRepository();

    const useCase = new VerifyPinWithLockoutUseCase(pinRepo, attemptsRepo, now);
    const result = await useCase.execute("000000");

    expect(result.attemptCount).toBe(1);
    expect(result.lockedUntil).toBeNull();
  });

  it("rejects PIN with invalid format without incrementing attempts", async () => {
    const pinRepo = mockPinRepository(V2_PIN);
    const attemptsRepo = mockAttemptsRepository();

    const useCase = new VerifyPinWithLockoutUseCase(pinRepo, attemptsRepo, now);
    const result = await useCase.execute("12a456");

    expect(result.success).toBe(false);
    expect(result.reason).toBe("invalid-format");
    expect(attemptsRepo.save).not.toHaveBeenCalled();
  });

  it("returns no-pin when storage is empty", async () => {
    const pinRepo = mockPinRepository(null);
    const attemptsRepo = mockAttemptsRepository();

    const useCase = new VerifyPinWithLockoutUseCase(pinRepo, attemptsRepo, now);
    const result = await useCase.execute("123456");

    expect(result.success).toBe(false);
    expect(result.reason).toBe("no-pin");
  });

  it("does not re-hash when stored iterations match the current default", async () => {
    const pinRepo = mockPinRepository(V2_PIN);
    pinRepo.verify.mockResolvedValue(true);
    const attemptsRepo = mockAttemptsRepository();

    const useCase = new VerifyPinWithLockoutUseCase(pinRepo, attemptsRepo, now);
    await useCase.execute("123456");

    expect(pinRepo.save).not.toHaveBeenCalled();
  });

  it("defers the background re-hash so it doesn't compete with the post-unlock render", async () => {
    jest.useFakeTimers();
    const pinRepo = mockPinRepository(V2_PIN_OLD);
    pinRepo.verify.mockResolvedValue(true);
    const attemptsRepo = mockAttemptsRepository();

    const useCase = new VerifyPinWithLockoutUseCase(pinRepo, attemptsRepo, now);
    const result = await useCase.execute("123456");

    // The success return comes back immediately; the save is queued but
    // hasn't fired yet, so the caller is free to navigate.
    expect(result.success).toBe(true);
    expect(pinRepo.save).not.toHaveBeenCalled();

    jest.advanceTimersByTime(2000);
    expect(pinRepo.save).toHaveBeenCalledWith({ pin: "123456" });
    jest.useRealTimers();
  });
});
