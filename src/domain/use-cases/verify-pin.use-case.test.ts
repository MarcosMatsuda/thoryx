import { VerifyPinUseCase } from "./verify-pin.use-case";
import { PinRepository } from "@domain/repositories/pin.repository";

describe("VerifyPinUseCase", () => {
  let useCase: VerifyPinUseCase;
  let mockRepository: jest.Mocked<PinRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRepository = {
      verify: jest.fn(),
      verifyLegacy: jest.fn(),
      readStored: jest.fn(),
      save: jest.fn(),
      exists: jest.fn(),
      delete: jest.fn(),
    } as any;

    useCase = new VerifyPinUseCase(mockRepository);
  });

  describe("PIN validation", () => {
    it("rejects empty PIN", async () => {
      const result = await useCase.execute("");

      expect(result.success).toBe(false);
      expect(result.message).toBe("PIN must be 6 digits");
    });

    it("rejects null PIN", async () => {
      const result = await useCase.execute(null as any);

      expect(result.success).toBe(false);
      expect(result.message).toBe("PIN must be 6 digits");
    });

    it("rejects undefined PIN", async () => {
      const result = await useCase.execute(undefined as any);

      expect(result.success).toBe(false);
      expect(result.message).toBe("PIN must be 6 digits");
    });

    it("rejects PIN shorter than 6 digits", async () => {
      const result = await useCase.execute("12345");

      expect(result.success).toBe(false);
      expect(result.message).toBe("PIN must be 6 digits");
    });

    it("rejects PIN longer than 6 digits", async () => {
      const result = await useCase.execute("1234567");

      expect(result.success).toBe(false);
      expect(result.message).toBe("PIN must be 6 digits");
    });
  });

  describe("PIN verification", () => {
    it("returns success when repository verifies PIN", async () => {
      mockRepository.verify.mockResolvedValue(true);

      const result = await useCase.execute("123456");

      expect(result.success).toBe(true);
      expect(result.message).toBe("PIN verified successfully");
    });

    it("calls repository verify with the provided PIN", async () => {
      mockRepository.verify.mockResolvedValue(true);

      const pin = "654321";
      await useCase.execute(pin);

      expect(mockRepository.verify).toHaveBeenCalledWith(pin);
    });

    it("returns failure when repository verification fails", async () => {
      mockRepository.verify.mockResolvedValue(false);

      const result = await useCase.execute("123456");

      expect(result.success).toBe(false);
      expect(result.message).toBe("Invalid PIN");
    });

    it("returns failure when repository throws error", async () => {
      mockRepository.verify.mockRejectedValue(new Error("Storage error"));

      const result = await useCase.execute("123456");

      expect(result.success).toBe(false);
      expect(result.message).toBe("Failed to verify PIN");
    });
  });

  describe("Edge cases", () => {
    it("accepts exactly 6-digit PIN", async () => {
      mockRepository.verify.mockResolvedValue(true);

      const result = await useCase.execute("123456");

      expect(result.success).toBe(true);
    });

    it("verifies PIN with all zeros", async () => {
      mockRepository.verify.mockResolvedValue(true);

      const result = await useCase.execute("000000");

      expect(result.success).toBe(true);
      expect(mockRepository.verify).toHaveBeenCalledWith("000000");
    });

    it("verifies PIN with all nines", async () => {
      mockRepository.verify.mockResolvedValue(true);

      const result = await useCase.execute("999999");

      expect(result.success).toBe(true);
    });

    it("handles repository returning false without throwing", async () => {
      mockRepository.verify.mockResolvedValue(false);

      expect(async () => {
        await useCase.execute("123456");
      }).not.toThrow();
    });

    it("handles network timeout as repository error", async () => {
      mockRepository.verify.mockRejectedValue(new Error("Request timeout"));

      const result = await useCase.execute("123456");

      expect(result.success).toBe(false);
      expect(result.message).toBe("Failed to verify PIN");
    });
  });

  describe("Return shape", () => {
    it("always returns object with success and message properties", async () => {
      mockRepository.verify.mockResolvedValue(true);

      const result = await useCase.execute("123456");

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("message");
      expect(typeof result.success).toBe("boolean");
      expect(typeof result.message).toBe("string");
    });

    it("success is true when PIN verified", async () => {
      mockRepository.verify.mockResolvedValue(true);

      const result = await useCase.execute("123456");

      expect(result.success).toBe(true);
    });

    it("success is false when PIN not verified", async () => {
      mockRepository.verify.mockResolvedValue(false);

      const result = await useCase.execute("123456");

      expect(result.success).toBe(false);
    });
  });
});
