/* global jest */
// Mock for expo-router
const mockRouter = {
  back: jest.fn(),
  replace: jest.fn(),
  push: jest.fn(),
  setParams: jest.fn(),
  canGoBack: jest.fn(() => true),
};

const mockUseRouter = jest.fn(() => mockRouter);
const mockUseLocalSearchParams = jest.fn(() => ({}));
const mockUseGlobalSearchParams = jest.fn(() => ({}));
const mockUseSegments = jest.fn(() => []);
const mockUsePathname = jest.fn(() => '/');
const mockUseNavigation = jest.fn(() => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
}));

module.exports = {
  useRouter: mockUseRouter,
  useLocalSearchParams: mockUseLocalSearchParams,
  useGlobalSearchParams: mockUseGlobalSearchParams,
  useSegments: mockUseSegments,
  usePathname: mockUsePathname,
  useNavigation: mockUseNavigation,
  router: mockRouter,
  Redirect: jest.fn(({ href }) => null),
  Link: jest.fn(({ children, ...props }) => children),
  Stack: {
    Screen: jest.fn(({ children }) => children),
  },
  Tabs: {
    Screen: jest.fn(({ children }) => children),
  },
  Slot: jest.fn(({ children }) => children),
  Unmatched: jest.fn(({ children }) => children),
};