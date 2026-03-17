// Unit test setup - mocks for Node.js environment

// Mock expo-secure-store
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// Mock expo-crypto
jest.mock("expo-crypto", () => ({
  getRandomBytesAsync: jest.fn(() => Promise.resolve(new Uint8Array(16))),
  digestStringAsync: jest.fn(() => Promise.resolve("mock-hash")),
  CryptoDigestAlgorithm: {
    SHA256: "SHA256",
  },
}));

// Mock expo-image-manipulator
jest.mock("expo-image-manipulator", () => ({
  manipulateAsync: jest.fn(() => Promise.resolve({ uri: "mock-uri" })),
}));

// Mock other expo modules that might be imported
jest.mock("expo-application", () => ({
  getApplicationId: jest.fn(() => "com.thoryx.app"),
}));

// Mock react-native-mmkv
jest.mock("react-native-mmkv", () => ({
  MMKV: jest.fn(() => ({
    getString: jest.fn(() => null),
    set: jest.fn(),
    delete: jest.fn(),
    clearAll: jest.fn(),
  })),
}));

// Mock console.log to suppress MMKV logs
global.console.log = jest.fn();
global.console.error = jest.fn();
