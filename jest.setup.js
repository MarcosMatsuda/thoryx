// Jest setup file for React Testing Library + React Native

// Mock Expo's winter modules
jest.mock("expo/src/winter/installGlobal", () => ({
  installGlobal: jest.fn(),
}));

jest.mock("expo/src/winter/runtime.native", () => ({
  require: jest.fn(() => ({})),
}));

// Intercept the Expo asset loader
const Module = require("module");
const originalRequire = Module.prototype.require;

Module.prototype.require = function (id) {
  // Mock image assets before they're loaded
  if (id.includes("splash-icon.png") || id.match(/\.(png|jpg|jpeg|gif|svg)$/)) {
    return "test-image-path";
  }

  // Intercept expo winter modules
  if (id.includes("expo/src/winter")) {
    if (id.includes("installGlobal")) {
      return { installGlobal: jest.fn() };
    }
    if (id.includes("runtime.native")) {
      return { require: jest.fn(() => ({})) };
    }
  }

  return originalRequire.apply(this, arguments);
};

// Polyfills for Stream APIs that may be needed
if (typeof global.TextDecoderStream === "undefined") {
  global.TextDecoderStream = class {
    constructor() {}
  };
}

if (typeof global.TextEncoderStream === "undefined") {
  global.TextEncoderStream = class {
    constructor() {}
  };
}

if (typeof global.ReadableStream === "undefined") {
  global.ReadableStream = class {
    constructor() {}
  };
}

if (typeof global.WritableStream === "undefined") {
  global.WritableStream = class {
    constructor() {}
  };
}

if (typeof global.TransformStream === "undefined") {
  global.TransformStream = class {
    constructor() {}
  };
}

// Now import the jest-native matchers
require("@testing-library/jest-native/extend-expect");

// Mock NativeWind
jest.mock("nativewind", () => ({
  useColorScheme: () => ({ colorScheme: "dark", setColorScheme: jest.fn() }),
}));

// Mock theme store
jest.mock("@stores/theme.store", () => ({
  useThemeStore: jest.fn(() => ({
    mode: "system",
    setMode: jest.fn(),
    loadTheme: jest.fn(),
  })),
  ThemeMode: {},
}));

// Mock expo modules
jest.mock("expo-font", () => ({
  loadAsync: jest.fn(() => Promise.resolve()),
  isLoaded: jest.fn(() => true),
}));

jest.mock("expo-camera", () => ({
  CameraView: () => null,
  useCameraPermissions: () => [{ granted: false }, jest.fn()],
}));

jest.mock("expo-image-picker", () => ({
  requestCameraPermissionsAsync: jest.fn(() =>
    Promise.resolve({ granted: true }),
  ),
  launchCameraAsync: jest.fn(() => Promise.resolve({ canceled: true })),
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    navigate: jest.fn(),
    reset: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn(),
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock("react-native-mmkv", () => ({
  MMKV: jest.fn(() => ({
    getString: jest.fn(() => null),
    set: jest.fn(),
    delete: jest.fn(),
    clearAll: jest.fn(),
  })),
}));

// Mock react-i18next — use pt-BR translations for test assertions
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

// Mock i18next itself (for non-component files using i18n.t())
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

// Mock expo-localization
jest.mock("expo-localization", () => ({
  getLocales: () => [{ languageTag: "pt-BR", languageCode: "pt" }],
}));

// Global test utilities
global.console = {
  ...console,
  error: jest.fn(),
};
