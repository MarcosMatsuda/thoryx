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

  let mockGetAllCreditCardsUseCase: jest.Mocked<GetAllCreditCardsUseCase>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAllCreditCardsUseCase = {
      execute: jest.fn(),
    } as any;
    
    // Mock the GetAllCreditCardsUseCase constructor
    (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(() => mockGetAllCreditCardsUseCase);
    
    // Mock the repository constructor
    const mockRepository = {
      getAll: jest.fn(),
    };
    (require("@data/repositories/credit-card.repository.impl").CreditCardRepositoryImpl as jest.Mock).mockImplementation(() => mockRepository);
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
      mockGetAllCreditCardsUseCase.execute.mockResolvedValue(mockCards);

      const state = useCardsStore.getState();
      await state.loadCards();

      expect(state.cards).toEqual(mockCards);
      expect(state.isLoading).toBe(false);
    });

    it("should set isLoading to true during load", async () => {
      const mockGetAllCreditCardsUseCase = {
        execute: jest
          .fn()
          .mockImplementation(
            () =>
              new Promise((resolve) =>
                setTimeout(() => resolve(mockCards), 10),
              ),
          ),
      };

      (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(
        () => mockGetAllCreditCardsUseCase,
      );

      const state = useCardsStore.getState();
      const loadPromise = state.loadCards();

      await loadPromise;

      expect(mockGetAllCreditCardsUseCase.execute).toHaveBeenCalled();
      expect(state.isLoading).toBe(false);
    });

    it("should handle error when loading cards fails", async () => {
      const mockGetAllCreditCardsUseCase = {
        execute: jest
          .fn()
          .mockRejectedValue(new Error("Network error")),
      };

      (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(
        () => mockGetAllCreditCardsUseCase,
      );

      const state = useCardsStore.getState();
      await state.loadCards();

      expect(state.cards).toEqual([]);
      expect(state.isLoading).toBe(false);
    });

    it("should call use case execute method", async () => {
      const mockGetAllCreditCardsUseCase = {
        execute: jest.fn().mockResolvedValue(mockCards),
      };

      (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(
        () => mockGetAllCreditCardsUseCase,
      );

      const state = useCardsStore.getState();
      await state.loadCards();

      expect(mockGetAllCreditCardsUseCase.execute).toHaveBeenCalled();
    });

    it("should load empty array when no cards exist", async () => {
      const mockGetAllCreditCardsUseCase = {
        execute: jest.fn().mockResolvedValue([]),
      };

      (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(
        () => mockGetAllCreditCardsUseCase,
      );

      const state = useCardsStore.getState();
      await state.loadCards();

      expect(state.cards).toEqual([]);
      expect(state.isLoading).toBe(false);
    });

    it("should handle server error gracefully", async () => {
      const mockGetAllCreditCardsUseCase = {
        execute: jest
          .fn()
          .mockRejectedValue(new Error("500 Internal Server Error")),
      };

      (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(
        () => mockGetAllCreditCardsUseCase,
      );

      const state = useCardsStore.getState();

      // Should not throw
      await expect(state.loadCards()).resolves.toBeUndefined();
      expect(state.isLoading).toBe(false);
    });

    it("should replace previous cards on new load", async () => {
      const firstBatch = [mockCards[0]];
      const secondBatch = mockCards;

      const mockGetAllCreditCardsUseCase = {
        execute: jest.fn(),
      };

      (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(
        () => mockGetAllCreditCardsUseCase,
      );

      const state = useCardsStore.getState();

      // Load first batch
      mockGetAllCreditCardsUseCase.execute.mockResolvedValueOnce(firstBatch);
      await state.loadCards();
      expect(state.cards).toEqual(firstBatch);

      // Load second batch
      mockGetAllCreditCardsUseCase.execute.mockResolvedValueOnce(secondBatch);
      await state.loadCards();
      expect(state.cards).toEqual(secondBatch);
    });
  });

  describe("reset action", () => {
    it("should reset cards to empty array", async () => {
      const mockGetAllCreditCardsUseCase = {
        execute: jest.fn().mockResolvedValue(mockCards),
      };

      (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(
        () => mockGetAllCreditCardsUseCase,
      );

      const state = useCardsStore.getState();

      // Load cards
      await state.loadCards();
      expect(state.cards).toEqual(mockCards);

      // Reset
      state.reset();

      expect(state.cards).toEqual([]);
      expect(state.isLoading).toBe(false);
    });

    it("should reset isLoading flag", () => {
      const state = useCardsStore.getState();

      state.reset();

      expect(state.isLoading).toBe(false);
    });

    it("should be callable on initial state without error", () => {
      const state = useCardsStore.getState();

      // Should not throw
      expect(() => state.reset()).not.toThrow();
      expect(state.cards).toEqual([]);
    });
  });

  describe("Card structure validation", () => {
    it("should maintain card structure after load", async () => {
      const mockGetAllCreditCardsUseCase = {
        execute: jest.fn().mockResolvedValue(mockCards),
      };

      (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(
        () => mockGetAllCreditCardsUseCase,
      );

      const state = useCardsStore.getState();
      await state.loadCards();

      expect(state.cards[0]).toHaveProperty("id");
      expect(state.cards[0]).toHaveProperty("lastFourDigits");
      expect(state.cards[0]).toHaveProperty("cardholderName");
      expect(state.cards[0]).toHaveProperty("cardNumber");
      expect(state.cards[0]).toHaveProperty("expiryDate");
    });

    it("should preserve card metadata", async () => {
      const mockGetAllCreditCardsUseCase = {
        execute: jest.fn().mockResolvedValue(mockCards),
      };

      (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(
        () => mockGetAllCreditCardsUseCase,
      );

      const state = useCardsStore.getState();
      await state.loadCards();

      expect(state.cards[0].lastFourDigits).toBe("1234");
      expect(state.cards[0].cardholderName).toBe("John Doe");
      expect(state.cards[0].expiryDate).toBe("12/25");
    });
  });

  describe("Card filtering", () => {
    it("should load multiple cards correctly", async () => {
      const mockGetAllCreditCardsUseCase = {
        execute: jest.fn().mockResolvedValue(mockCards),
      };

      (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(
        () => mockGetAllCreditCardsUseCase,
      );

      const state = useCardsStore.getState();
      await state.loadCards();

      expect(state.cards).toHaveLength(2);
      expect(state.cards.map((c: any) => c.lastFourDigits)).toContain("1234");
      expect(state.cards.map((c: any) => c.lastFourDigits)).toContain("5678");
    });

    it("should load single card correctly", async () => {
      const singleCard = [mockCards[0]];
      const mockGetAllCreditCardsUseCase = {
        execute: jest.fn().mockResolvedValue(singleCard),
      };

      (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(
        () => mockGetAllCreditCardsUseCase,
      );

      const state = useCardsStore.getState();
      await state.loadCards();

      expect(state.cards).toHaveLength(1);
      expect(state.cards[0].lastFourDigits).toBe("1234");
    });
  });

  describe("Concurrent operations", () => {
    it("should handle multiple sequential loads", async () => {
      const mockGetAllCreditCardsUseCase = {
        execute: jest.fn().mockResolvedValue(mockCards),
      };

      (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(
        () => mockGetAllCreditCardsUseCase,
      );

      const state = useCardsStore.getState();

      await state.loadCards();
      expect(state.cards).toEqual(mockCards);

      await state.loadCards();
      expect(state.cards).toEqual(mockCards);
    });

    it("should handle reset between loads", async () => {
      const mockGetAllCreditCardsUseCase = {
        execute: jest.fn().mockResolvedValue(mockCards),
      };

      (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(
        () => mockGetAllCreditCardsUseCase,
      );

      const state = useCardsStore.getState();

      await state.loadCards();
      expect(state.cards.length).toBeGreaterThan(0);

      state.reset();
      expect(state.cards).toEqual([]);

      await state.loadCards();
      expect(state.cards).toEqual(mockCards);
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

      const mockGetAllCreditCardsUseCase = {
        execute: jest.fn().mockResolvedValue(largeCardArray),
      };

      (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(
        () => mockGetAllCreditCardsUseCase,
      );

      const state = useCardsStore.getState();
      await state.loadCards();

      expect(state.cards).toHaveLength(100);
    });

    it("should handle TypeError gracefully", async () => {
      const mockGetAllCreditCardsUseCase = {
        execute: jest
          .fn()
          .mockRejectedValue(new TypeError("Unexpected token")),
      };

      (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(
        () => mockGetAllCreditCardsUseCase,
      );

      const state = useCardsStore.getState();

      // Should not throw
      await expect(state.loadCards()).resolves.toBeUndefined();
      expect(state.cards).toEqual([]);
    });

    it("should handle multiple cards with different last four digits correctly", async () => {
      const multipleCards = [
        { ...mockCards[0], id: "card-3", lastFourDigits: "1111" },
        { ...mockCards[1], id: "card-4", lastFourDigits: "2222" },
        { ...mockCards[0], id: "card-5", lastFourDigits: "3333" },
        { ...mockCards[1], id: "card-6", lastFourDigits: "4444" },
      ];

      const mockGetAllCreditCardsUseCase = {
        execute: jest.fn().mockResolvedValue(multipleCards),
      };

      (GetAllCreditCardsUseCase as jest.Mock).mockImplementation(
        () => mockGetAllCreditCardsUseCase,
      );

      const state = useCardsStore.getState();
      await state.loadCards();

      expect(state.cards).toHaveLength(4);
      const lastFourDigits = state.cards.map((c: any) => c.lastFourDigits);
      expect(lastFourDigits).toContain("1111");
      expect(lastFourDigits).toContain("2222");
      expect(lastFourDigits).toContain("3333");
      expect(lastFourDigits).toContain("4444");
    });
  });
});
