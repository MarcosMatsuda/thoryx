import { SavePinUseCase } from "./save-pin.use-case";
import { PinRepository } from "@domain/repositories/pin.repository";
import { PinInput, Pin } from "@domain/entities/pin.entity";

describe("SavePinUseCase", () => {
  let useCase: SavePinUseCase;
  let mockRepository: jest.Mocked<PinRepository>;

  const mockPin: Pin = {
    id: "test-id",
    encryptedPin: "encrypted-value",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockRepository = {
      verify: jest.fn(),
      save: jest.fn(),
      exists: jest.fn(),
      delete: jest.fn(),
    } as any;

    useCase = new SavePinUseCase(mockRepository);
  });

  describe("PIN validation", () => {
    it("rejects empty PIN", async () => {
      const input: PinInput = { pin: "" };

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      expect(result.message).toBe("PIN must be 6 digits");
    });

    it("rejects null PIN", async () => {
      const input: PinInput = { pin: null as any };

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      expect(result.message).toBe("PIN must be 6 digits");
    });

    it("rejects undefined PIN", async () => {
      const input: PinInput = { pin: undefined as any };

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      expect(result.message).toBe("PIN must be 6 digits");
    });

    it("rejects PIN shorter than 6 digits", async () => {
      const input: PinInput = { pin: "12345" };

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      expect(result.message).toBe("PIN must be 6 digits");
    });

    it("rejects PIN longer than 6 digits", async () => {
      const input: PinInput = { pin: "1234567" };

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      expect(result.message).toBe("PIN must be 6 digits");
    });

    it("rejects non-numeric PIN", async () => {
      const input: PinInput = { pin: "12345a" };

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      expect(result.message).toBe("PIN must contain only numbers");
    });

    it("rejects PIN with spaces", async () => {
      const input: PinInput = { pin: "123 45" };

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      expect(result.message).toBe("PIN must contain only numbers");
    });

    it("rejects PIN with special characters", async () => {
      const input: PinInput = { pin: "12345!" };

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      expect(result.message).toBe("PIN must contain only numbers");
    });
  });

  describe("PIN format validation", () => {
    it("accepts valid 6-digit numeric PIN", async () => {
      mockRepository.save.mockResolvedValue(mockPin);
      const input: PinInput = { pin: "123456" };

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
    });

    it("accepts PIN with all zeros", async () => {
      mockRepository.save.mockResolvedValue(mockPin);
      const input: PinInput = { pin: "000000" };

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
    });

    it("accepts PIN with all nines", async () => {
      mockRepository.save.mockResolvedValue(mockPin);
      const input: PinInput = { pin: "999999" };

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
    });

    it("accepts PIN with mixed digits", async () => {
      mockRepository.save.mockResolvedValue(mockPin);
      const input: PinInput = { pin: "050505" };

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
    });
  });

  describe("PIN persistence", () => {
    it("calls repository save with provided PIN input", async () => {
      mockRepository.save.mockResolvedValue(mockPin);
      const input: PinInput = { pin: "123456" };

      await useCase.execute(input);

      expect(mockRepository.save).toHaveBeenCalledWith(input);
    });

    it("returns success when repository saves PIN", async () => {
      mockRepository.save.mockResolvedValue(mockPin);
      const input: PinInput = { pin: "123456" };

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      expect(result.message).toBe("PIN saved successfully");
    });

    it("returns failure when repository throws error", async () => {
      mockRepository.save.mockRejectedValue(new Error("Storage unavailable"));
      const input: PinInput = { pin: "123456" };

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Failed to save PIN");
    });

    it("handles permission denied error gracefully", async () => {
      mockRepository.save.mockRejectedValue(new Error("Permission denied"));
      const input: PinInput = { pin: "123456" };

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Failed to save PIN");
    });
  });

  describe("Edge cases", () => {
    it("handles repository returning Pin object after save", async () => {
      mockRepository.save.mockResolvedValue(mockPin);
      const input: PinInput = { pin: "123456" };

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
    });

    it("validates format before calling repository", async () => {
      const input: PinInput = { pin: "12345a" };

      await useCase.execute(input);

      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it("does not save invalid PIN", async () => {
      const input: PinInput = { pin: "123" };

      await useCase.execute(input);

      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe("Return shape", () => {
    it("always returns object with success and message properties", async () => {
      mockRepository.save.mockResolvedValue(mockPin);
      const input: PinInput = { pin: "123456" };

      const result = await useCase.execute(input);

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("message");
      expect(typeof result.success).toBe("boolean");
      expect(typeof result.message).toBe("string");
    });

    it("success is true when PIN saved", async () => {
      mockRepository.save.mockResolvedValue(mockPin);
      const input: PinInput = { pin: "123456" };

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
    });

    it("success is false on validation error", async () => {
      const input: PinInput = { pin: "123" };

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
    });

    it("success is false on save error", async () => {
      mockRepository.save.mockRejectedValue(new Error("Save failed"));
      const input: PinInput = { pin: "123456" };

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
    });
  });
});
