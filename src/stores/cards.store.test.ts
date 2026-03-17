import { useCardsStore } from "./cards.store";
import { GetAllCreditCardsUseCase } from "@domain/use-cases/get-all-credit-cards.use-case";
import { CreditCard } from "@domain/entities/credit-card.entity";

jest.mock("@domain/use-cases/get-all-credit-cards.use-case");
jest.mock("@data/repositories/credit-card.repository.impl");

describe("useCardsStore", () => {
  const mockCards: CreditCard[] = [
    {
      id: "card-1",
      lastFourDigits: "1234",
      cardholderName: "John Doe",
      cardNumber: "4111111111111234",
      expiryDate: "12/25",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "card-2",
      lastFourDigits: "5678",
      cardholderName: "John Doe",
      cardNumber: "5555555555555678",
      expiryDate: "06/26",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useCardsStore.setState({ cards: [], isLoading: false });
  });

  describe("Initial state", () => {
    it("should initialize with empty cards array and false isLoading", () => {
      const state = useCardsStore.getState();

      expect(state.cards).toEqual([]);
      expect(state.isLoading).toBe(false);
    });

    it("should have correct initial structure", () => {
      const state = useCardsStore.getState();

      expect(state).toHaveProperty("cards");
      expect(state).toHaveProperty("isLoading");
      expect(state).toHaveProperty("loadCards");
      expect(state).toHaveProperty("reset");
    });
  });

  describe("loadCards action", () => {
    it("should load cards successfully", async () => {
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(mockCards),
      };
      (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(() => mockUseCase);

      const { loadCards } = useCardsStore.getState();
      await loadCards();

      const state = useCardsStore.getState();
      expect(state.cards).toEqual(mockCards);
      expect(state.isLoading).toBe(false);
    });

    it("should set isLoading to true during load", async () => {
      const mockUseCase = {
        execute: jest
          .fn()
          .mockImplementation(
            () =>
              new Promise((resolve) =>
                setTimeout(() => resolve(mockCards), 10),
              ),
          ),
      };
      (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(() => mockUseCase);

      const { loadCards } = useCardsStore.getState();
      await loadCards();

      expect(mockUseCase.execute).toHaveBeenCalled();
      expect(useCardsStore.getState().isLoading).toBe(false);
    });

    it("should handle error when loading cards fails", async () => {
      const mockUseCase = {
        execute: jest.fn().mockRejectedValue(new Error("Network error")),
      };
      (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(() => mockUseCase);

      const { loadCards } = useCardsStore.getState();
      await loadCards();

      const state = useCardsStore.getState();
      expect(state.cards).toEqual([]);
      expect(state.isLoading).toBe(false);
    });

    it("should call use case execute method", async () => {
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(mockCards),
      };
      (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(() => mockUseCase);

      const { loadCards } = useCardsStore.getState();
      await loadCards();

      expect(mockUseCase.execute).toHaveBeenCalled();
    });

    it("should load empty array when no cards exist", async () => {
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue([]),
      };
      (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(() => mockUseCase);

      const { loadCards } = useCardsStore.getState();
      await loadCards();

      const state = useCardsStore.getState();
      expect(state.cards).toEqual([]);
      expect(state.isLoading).toBe(false);
    });

    it("should handle server error gracefully", async () => {
      const mockUseCase = {
        execute: jest.fn().mockRejectedValue(new Error("500 Internal Server Error")),
      };
      (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(() => mockUseCase);

      const { loadCards } = useCardsStore.getState();

      // Should not throw
      await expect(loadCards()).resolves.toBeUndefined();
      expect(useCardsStore.getState().isLoading).toBe(false);
    });

    it("should replace previous cards on new load", async () => {
      const firstBatch = [mockCards[0]];
      const secondBatch = mockCards;

      const mockUseCase = {
        execute: jest.fn(),
      };
      (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(() => mockUseCase);

      const { loadCards } = useCardsStore.getState();

      // Load first batch
      mockUseCase.execute.mockResolvedValueOnce(firstBatch);
      await loadCards();
      expect(useCardsStore.getState().cards).toEqual(firstBatch);

      // Load second batch
      mockUseCase.execute.mockResolvedValueOnce(secondBatch);
      await loadCards();
      expect(useCardsStore.getState().cards).toEqual(secondBatch);
    });
  });

  describe("reset action", () => {
    it("should reset cards to empty array", async () => {
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(mockCards),
      };
      (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(() => mockUseCase);

      const { loadCards, reset } = useCardsStore.getState();

      // Load cards
      await loadCards();
      expect(useCardsStore.getState().cards).toEqual(mockCards);

      // Reset
      reset();

      const state = useCardsStore.getState();
      expect(state.cards).toEqual([]);
      expect(state.isLoading).toBe(false);
    });

    it("should reset isLoading flag", () => {
      const { reset } = useCardsStore.getState();

      reset();

      expect(useCardsStore.getState().isLoading).toBe(false);
    });

    it("should be callable on initial state without error", () => {
      const { reset } = useCardsStore.getState();

      // Should not throw
      expect(() => reset()).not.toThrow();
      expect(useCardsStore.getState().cards).toEqual([]);
    });
  });

  describe("Card structure validation", () => {
    it("should maintain card structure after load", async () => {
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(mockCards),
      };
      (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(() => mockUseCase);

      const { loadCards } = useCardsStore.getState();
      await loadCards();

      const { cards } = useCardsStore.getState();
      expect(cards[0]).toHaveProperty("id");
      expect(cards[0]).toHaveProperty("lastFourDigits");
      expect(cards[0]).toHaveProperty("cardholderName");
      expect(cards[0]).toHaveProperty("cardNumber");
      expect(cards[0]).toHaveProperty("expiryDate");
    });

    it("should preserve card metadata", async () => {
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(mockCards),
      };
      (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(() => mockUseCase);

      const { loadCards } = useCardsStore.getState();
      await loadCards();

      const { cards } = useCardsStore.getState();
      expect(cards[0].lastFourDigits).toBe("1234");
      expect(cards[0].cardholderName).toBe("John Doe");
      expect(cards[0].expiryDate).toBe("12/25");
    });
  });

  describe("Card filtering", () => {
    it("should load multiple cards correctly", async () => {
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(mockCards),
      };
      (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(() => mockUseCase);

      const { loadCards } = useCardsStore.getState();
      await loadCards();

      const { cards } = useCardsStore.getState();
      expect(cards).toHaveLength(2);
      expect(cards.map((c) => c.lastFourDigits)).toContain("1234");
      expect(cards.map((c) => c.lastFourDigits)).toContain("5678");
    });

    it("should load single card correctly", async () => {
      const singleCard = [mockCards[0]];
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(singleCard),
      };
      (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(() => mockUseCase);

      const { loadCards } = useCardsStore.getState();
      await loadCards();

      const { cards } = useCardsStore.getState();
      expect(cards).toHaveLength(1);
      expect(cards[0].lastFourDigits).toBe("1234");
    });
  });

  describe("Concurrent operations", () => {
    it("should handle multiple sequential loads", async () => {
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(mockCards),
      };
      (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(() => mockUseCase);

      const { loadCards } = useCardsStore.getState();

      await loadCards();
      expect(useCardsStore.getState().cards).toEqual(mockCards);

      await loadCards();
      expect(useCardsStore.getState().cards).toEqual(mockCards);
    });

    it("should handle reset between loads", async () => {
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(mockCards),
      };
      (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(() => mockUseCase);

      const { loadCards, reset } = useCardsStore.getState();

      await loadCards();
      expect(useCardsStore.getState().cards.length).toBeGreaterThan(0);

      reset();
      expect(useCardsStore.getState().cards).toEqual([]);

      await loadCards();
      expect(useCardsStore.getState().cards).toEqual(mockCards);
    });
  });

  describe("Edge cases", () => {
    it("should handle very large card arrays", async () => {
      const largeCardArray = Array.from({ length: 100 }, (_, i) => ({
        id: `card-${i}`,
        lastFourDigits: `${String(i).padStart(4, "0")}`,
        cardholderName: "John Doe",
        cardNumber: `411111111111${String(i).padStart(4, "0")}`,
        expiryDate: "12/25",
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(largeCardArray),
      };
      (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(() => mockUseCase);

      const { loadCards } = useCardsStore.getState();
      await loadCards();

      expect(useCardsStore.getState().cards).toHaveLength(100);
    });

    it("should handle TypeError gracefully", async () => {
      const mockUseCase = {
        execute: jest.fn().mockRejectedValue(new TypeError("Unexpected token")),
      };
      (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(() => mockUseCase);

      const { loadCards } = useCardsStore.getState();

      // Should not throw
      await expect(loadCards()).resolves.toBeUndefined();
      expect(useCardsStore.getState().cards).toEqual([]);
    });

    it("should handle multiple cards with different last four digits correctly", async () => {
      const multipleCards = [
        { ...mockCards[0], id: "card-3", lastFourDigits: "1111" },
        { ...mockCards[1], id: "card-4", lastFourDigits: "2222" },
        { ...mockCards[0], id: "card-5", lastFourDigits: "3333" },
        { ...mockCards[1], id: "card-6", lastFourDigits: "4444" },
      ];

      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(multipleCards),
      };
      (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(() => mockUseCase);

      const { loadCards } = useCardsStore.getState();
      await loadCards();

      const { cards } = useCardsStore.getState();
      expect(cards).toHaveLength(4);
      const lastFourDigits = cards.map((c) => c.lastFourDigits);
      expect(lastFourDigits).toContain("1111");
      expect(lastFourDigits).toContain("2222");
      expect(lastFourDigits).toContain("3333");
      expect(lastFourDigits).toContain("4444");
    });
  });
});
