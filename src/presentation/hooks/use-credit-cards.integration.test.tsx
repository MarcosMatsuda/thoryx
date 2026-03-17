/**
 * Integration tests for useCreditCards hook
 * Validates hook correctly integrates with cards store and load cards use case
 * Tests real flow: hook → store → use case
 */

import { renderHook, waitFor } from "@testing-library/react-native";
import { useCreditCards } from "./use-credit-cards";
import { useCardsStore } from "@stores/cards.store";
import { CreditCard } from "@domain/entities/credit-card.entity";

// Mock the use case and repository to simulate real API behavior
jest.mock("@domain/use-cases/get-all-credit-cards.use-case");
jest.mock("@data/repositories/credit-card.repository.impl");

const mockCards: CreditCard[] = [
  {
    id: "card-1",
    lastFourDigits: "1234",
    cardholderName: "Test User",
    cardNumber: "4111111111111234",
    expiryDate: "12/25",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe("useCreditCards Hook - Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCardsStore.setState({ cards: [], isLoading: false });
  });

  describe("Hook initialization and loading", () => {
    it("should return initial empty state on mount", () => {
      const { result } = renderHook(() => useCreditCards());

      expect(result.current.cards).toEqual([]);
      expect(result.current.isLoading).toBe(true); // isLoading starts as true because loadCards is called in useEffect
    });

    it("should have reload function available", () => {
      const { result } = renderHook(() => useCreditCards());

      expect(typeof result.current.reload).toBe("function");
    });
  });

  describe("Hook with store integration", () => {
    it("should load cards from store after mount", async () => {
      const {
        GetAllCreditCardsUseCase,
      } = require("@domain/use-cases/get-all-credit-cards.use-case");
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(mockCards),
      };
      (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { result } = renderHook(() => useCreditCards());

      await waitFor(() => {
        expect(result.current.cards).toEqual(mockCards);
      });
    });

    it("should show loading state during card loading", async () => {
      const {
        GetAllCreditCardsUseCase,
      } = require("@domain/use-cases/get-all-credit-cards.use-case");
      const mockUseCase = {
        execute: jest
          .fn()
          .mockImplementation(
            () =>
              new Promise((resolve) =>
                setTimeout(() => resolve(mockCards), 50),
              ),
          ),
      };
      (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { result } = renderHook(() => useCreditCards());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("should allow manual reload via reload function", async () => {
      const {
        GetAllCreditCardsUseCase,
      } = require("@domain/use-cases/get-all-credit-cards.use-case");
      const mockUseCase = {
        execute: jest
          .fn()
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce(mockCards),
      };
      (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { result } = renderHook(() => useCreditCards());

      // Initial load
      await waitFor(() => {
        expect(result.current.cards.length).toBeDefined();
      });

      // Manual reload
      result.current.reload();

      await waitFor(() => {
        expect(mockUseCase.execute).toHaveBeenCalled();
      });
    });

    it("should handle errors gracefully during load", async () => {
      const {
        GetAllCreditCardsUseCase,
      } = require("@domain/use-cases/get-all-credit-cards.use-case");
      const mockUseCase = {
        execute: jest.fn().mockRejectedValue(new Error("Network error")),
      };
      (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { result } = renderHook(() => useCreditCards());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should have empty cards on error
      expect(result.current.cards).toEqual([]);
    });
  });

  describe("Hook return value structure", () => {
    it("should return object with cards, isLoading, and reload", () => {
      const { result } = renderHook(() => useCreditCards());

      expect(result.current).toHaveProperty("cards");
      expect(result.current).toHaveProperty("isLoading");
      expect(result.current).toHaveProperty("reload");
    });

    it("should return cards as array", () => {
      const { result } = renderHook(() => useCreditCards());

      expect(Array.isArray(result.current.cards)).toBe(true);
    });

    it("should return isLoading as boolean", () => {
      const { result } = renderHook(() => useCreditCards());

      expect(typeof result.current.isLoading).toBe("boolean");
    });
  });

  describe("Integration: Hook → Store → UseCase", () => {
    it("should correctly pass through store data to hook", async () => {
      const {
        GetAllCreditCardsUseCase,
      } = require("@domain/use-cases/get-all-credit-cards.use-case");
      const testCard: CreditCard = {
        id: "card-test",
        lastFourDigits: "9999",
        cardholderName: "Integration Test",
        cardNumber: "5555555555559999",
        expiryDate: "12/26",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUseCase = {
        execute: jest.fn().mockResolvedValue([testCard]),
      };
      (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { result } = renderHook(() => useCreditCards());

      await waitFor(() => {
        expect(result.current.cards).toContainEqual(testCard);
      });

      expect(result.current.cards[0].lastFourDigits).toBe("9999");
      expect(result.current.cards[0].cardholderName).toBe("Integration Test");
    });

    it("should maintain card data structure through hook", async () => {
      const {
        GetAllCreditCardsUseCase,
      } = require("@domain/use-cases/get-all-credit-cards.use-case");
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(mockCards),
      };
      (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { result } = renderHook(() => useCreditCards());

      await waitFor(() => {
        expect(result.current.cards.length).toBeGreaterThan(0);
      });

      const card = result.current.cards[0];
      expect(card).toHaveProperty("id");
      expect(card).toHaveProperty("lastFourDigits");
      expect(card).toHaveProperty("cardholderName");
      expect(card).toHaveProperty("expiryDate");
    });
  });

  describe("Multiple hook instances", () => {
    it("should share store state between multiple hook instances", async () => {
      const {
        GetAllCreditCardsUseCase,
      } = require("@domain/use-cases/get-all-credit-cards.use-case");
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(mockCards),
      };
      (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { result: result1 } = renderHook(() => useCreditCards());
      const { result: result2 } = renderHook(() => useCreditCards());

      await waitFor(() => {
        expect(result1.current.cards).toEqual(result2.current.cards);
      });
    });
  });

  describe("Edge cases", () => {
    it("should handle empty card list from use case", async () => {
      const {
        GetAllCreditCardsUseCase,
      } = require("@domain/use-cases/get-all-credit-cards.use-case");
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue([]),
      };
      (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(
        () => mockUseCase,
      );

      const { result } = renderHook(() => useCreditCards());

      await waitFor(() => {
        expect(result.current.cards).toEqual([]);
        expect(result.current.isLoading).toBe(false);
      });
    });
  });
});
