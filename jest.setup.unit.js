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

// Mock react-i18next and i18next for unit tests
jest.mock("react-i18next", () => {
  const mockPtBR = require("./src/shared/i18n/locales/pt-BR.json");
  function mockGetNested(obj, path) {
    return path.split(".").reduce((acc, key) => acc && acc[key], obj);
  }
  function mockT(key, params) {
    let value = mockGetNested(mockPtBR, key) || key;
    if (params && typeof value === "string") {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(`{{${k}}}`, v);
      });
    }
    return value;
  }
  return {
    useTranslation: () => ({
      t: mockT,
      i18n: { language: "pt-BR", changeLanguage: jest.fn() },
    }),
    initReactI18next: { type: "3rdParty", init: jest.fn() },
  };
});

jest.mock("i18next", () => {
  const mockPtBR = require("./src/shared/i18n/locales/pt-BR.json");
  function mockGetNested(obj, path) {
    return path.split(".").reduce((acc, key) => acc && acc[key], obj);
  }
  function mockT(key, params) {
    let value = mockGetNested(mockPtBR, key) || key;
    if (params && typeof value === "string") {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(`{{${k}}}`, v);
      });
    }
    return value;
  }
  return {
    t: mockT,
    use: jest.fn().mockReturnThis(),
    init: jest.fn(),
    changeLanguage: jest.fn(),
    language: "pt-BR",
  };
});

jest.mock("expo-localization", () => ({
  getLocales: () => [{ languageTag: "pt-BR", languageCode: "pt" }],
}));

// Mock theme store
jest.mock("./src/stores/theme.store", () => ({
  useThemeStore: jest.fn(() => ({
    mode: "system",
    setMode: jest.fn(),
    loadTheme: jest.fn(),
  })),
  ThemeMode: {},
}));

// Mock console.log to suppress MMKV logs
global.console.log = jest.fn();
global.console.error = jest.fn();
