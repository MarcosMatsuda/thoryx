import { ValidationUtils } from "./validation";

describe("ValidationUtils", () => {
  describe("isValidEmail", () => {
    it("accepts a valid email address", () => {
      expect(ValidationUtils.isValidEmail("user@example.com")).toBe(true);
    });

    it("rejects email without @ symbol", () => {
      expect(ValidationUtils.isValidEmail("userexample.com")).toBe(false);
    });

    it("rejects email without domain", () => {
      expect(ValidationUtils.isValidEmail("user@")).toBe(false);
    });

    it("rejects empty string", () => {
      expect(ValidationUtils.isValidEmail("")).toBe(false);
    });
  });

  describe("isNotEmpty", () => {
    it("returns true for a non-empty string", () => {
      expect(ValidationUtils.isNotEmpty("hello")).toBe(true);
    });

    it("returns false for an empty string", () => {
      expect(ValidationUtils.isNotEmpty("")).toBe(false);
    });

    it("returns false for a whitespace-only string", () => {
      expect(ValidationUtils.isNotEmpty("   ")).toBe(false);
    });

    it("returns false for null", () => {
      expect(ValidationUtils.isNotEmpty(null)).toBe(false);
    });

    it("returns false for undefined", () => {
      expect(ValidationUtils.isNotEmpty(undefined)).toBe(false);
    });
  });

  describe("isMinLength", () => {
    it("returns true when value meets minimum length", () => {
      expect(ValidationUtils.isMinLength("123456", 6)).toBe(true);
    });

    it("returns true when value exceeds minimum length", () => {
      expect(ValidationUtils.isMinLength("1234567", 6)).toBe(true);
    });

    it("returns false when value is shorter than minimum", () => {
      expect(ValidationUtils.isMinLength("12345", 6)).toBe(false);
    });
  });

  describe("isMaxLength", () => {
    it("returns true when value is within maximum length", () => {
      expect(ValidationUtils.isMaxLength("12345", 6)).toBe(true);
    });

    it("returns true when value equals maximum length", () => {
      expect(ValidationUtils.isMaxLength("123456", 6)).toBe(true);
    });

    it("returns false when value exceeds maximum length", () => {
      expect(ValidationUtils.isMaxLength("1234567", 6)).toBe(false);
    });
  });
});
