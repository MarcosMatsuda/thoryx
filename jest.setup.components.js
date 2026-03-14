// Jest setup for component tests

// Setup must happen before importing testing library
jest.mock('expo/src/winter/installGlobal', () => ({
  installGlobal: jest.fn(),
}))

jest.mock('expo/src/winter/runtime.native', () => ({
  require: jest.fn(),
}))

// Polyfills for Stream APIs that may be needed
if (typeof global.TextDecoderStream === 'undefined') {
  global.TextDecoderStream = class {
    constructor() {}
  }
}

if (typeof global.TextEncoderStream === 'undefined') {
  global.TextEncoderStream = class {
    constructor() {}
  }
}

if (typeof global.ReadableStream === 'undefined') {
  global.ReadableStream = class {
    constructor() {}
  }
}

if (typeof global.WritableStream === 'undefined') {
  global.WritableStream = class {
    constructor() {}
  }
}

if (typeof global.TransformStream === 'undefined') {
  global.TransformStream = class {
    constructor() {}
  }
}

// Mock NativeWind
jest.mock('nativewind', () => ({
  useColorScheme: () => 'light',
}))

// Mock expo modules
jest.mock('expo-font', () => ({
  loadAsync: jest.fn(() => Promise.resolve()),
  isLoaded: jest.fn(() => true),
}))

jest.mock('expo-camera', () => ({
  CameraView: () => null,
  useCameraPermissions: () => [{ granted: false }, jest.fn()],
}))

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  launchCameraAsync: jest.fn(() => Promise.resolve({ canceled: true })),
}))

jest.mock('expo-router', () => ({
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
}))

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}))

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}))

jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn(() => ({
    getString: jest.fn(() => null),
    set: jest.fn(),
    delete: jest.fn(),
    clearAll: jest.fn(),
  })),
}))

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => ({
  useSharedValue: jest.fn((value) => ({ value })),
  useAnimatedStyle: jest.fn(() => ({})),
  withTiming: jest.fn((target, config) => target),
  Easing: {
    out: jest.fn((inner) => inner),
    cubic: jest.fn(() => jest.fn()),
  },
  default: {},
}))

// Global test utilities
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
}
