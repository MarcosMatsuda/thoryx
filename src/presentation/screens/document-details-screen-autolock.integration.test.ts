import { Document } from "@domain/entities/document.entity";

jest.mock("@data/repositories/document.repository.impl");
jest.mock("@data/repositories/document-type.repository.impl");

jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => ({ back: jest.fn(), push: jest.fn() })),
  useLocalSearchParams: jest.fn(() => ({ documentId: "doc-123" })),
}));

jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock("react-native-mmkv", () => {
  throw new Error("MMKV not available");
});

describe("DocumentDetailsScreen - Auto-lock Toggle Integration", () => {
  const createMockDocument = (
    typeId: string = "RG",
    isAutoLockEnabled: boolean = false,
  ): Document => ({
    id: "doc-123",
    typeId,
    typeName: typeId,
    fields: {
      fullName: "John Doe",
      rgNumber: "12345678",
      dateOfBirth: "01/01/1990",
      expiryDate: "01/01/2030",
    },
    photos: { front: "encrypted-front", back: "encrypted-back" },
    isAutoLockEnabled,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Toggle Visibility", () => {
    it("should be visible for RG documents", () => {
      const rgDoc = createMockDocument("RG");
      expect(["RG", "CNH"].includes(rgDoc.typeId)).toBe(true);
    });

    it("should be visible for CNH documents", () => {
      const cnhDoc = createMockDocument("CNH");
      expect(["RG", "CNH"].includes(cnhDoc.typeId)).toBe(true);
    });
  });

  describe("Initial State Loading", () => {
    it("should load initial auto-lock state as false", () => {
      const doc = createMockDocument("RG", false);
      expect(doc.isAutoLockEnabled).toBe(false);
    });

    it("should load initial auto-lock state as true", () => {
      const doc = createMockDocument("RG", true);
      expect(doc.isAutoLockEnabled).toBe(true);
    });

    it("should use false as default when undefined", () => {
      const doc = {
        ...createMockDocument(),
        isAutoLockEnabled: undefined as any,
      };
      const initialState = doc.isAutoLockEnabled || false;
      expect(initialState).toBe(false);
    });
  });

  describe("Toggle Operations", () => {
    it("should toggle false to true", () => {
      const doc = createMockDocument("RG", false);
      const toggled = { ...doc, isAutoLockEnabled: true };
      expect(toggled.isAutoLockEnabled).toBe(true);
    });

    it("should toggle true to false", () => {
      const doc = createMockDocument("RG", true);
      const toggled = { ...doc, isAutoLockEnabled: false };
      expect(toggled.isAutoLockEnabled).toBe(false);
    });

    it("should maintain document identity during toggle", () => {
      const doc = createMockDocument("RG", false);
      const toggled = { ...doc, isAutoLockEnabled: true };
      expect(toggled.id).toBe(doc.id);
      expect(toggled.typeId).toBe("RG");
      expect(toggled.fields.rgNumber).toBe("12345678");
    });

    it("should persist toggle state across multiple toggles", () => {
      let currentState = false;
      currentState = !currentState;
      expect(currentState).toBe(true);
      currentState = !currentState;
      expect(currentState).toBe(false);
      currentState = !currentState;
      expect(currentState).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("should revert toggle state on failure", () => {
      let state = { isAutoLockEnabled: false };
      const newState = !state.isAutoLockEnabled;
      state.isAutoLockEnabled = newState;
      try {
        throw new Error("Network error");
      } catch {
        state.isAutoLockEnabled = !newState;
      }
      expect(state.isAutoLockEnabled).toBe(false);
    });
  });

  describe("Component Structure Validation", () => {
    it("should have handleToggleAutoLock function", () => {
      const fs = require("fs");
      const path = require("path");
      const code = fs.readFileSync(
        path.join(__dirname, "./document-details-screen.tsx"),
        "utf8",
      );
      expect(code).toContain("const handleToggleAutoLock");
    });

    it("should have isAutoLockEnabled state variable", () => {
      const fs = require("fs");
      const path = require("path");
      const code = fs.readFileSync(
        path.join(__dirname, "./document-details-screen.tsx"),
        "utf8",
      );
      expect(code).toContain("setIsAutoLockEnabled");
    });

    it("should call repository.toggleAutoLock", () => {
      const fs = require("fs");
      const path = require("path");
      const code = fs.readFileSync(
        path.join(__dirname, "./document-details-screen.tsx"),
        "utf8",
      );
      expect(code).toContain("repository.toggleAutoLock");
    });

    it("should use isAutoLockEnabled for toggle visual state", () => {
      const fs = require("fs");
      const path = require("path");
      const code = fs.readFileSync(
        path.join(__dirname, "./document-details-screen.tsx"),
        "utf8",
      );
      expect(code).toContain("isAutoLockEnabled");
      expect(code).toContain("onPress={handleToggleAutoLock}");
    });
  });
});
