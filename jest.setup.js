// Jest setup file for React Testing Library
import '@testing-library/jest-native/extend-expect'

// Global test utilities
global.console = {
  ...console,
  // Uncomment to debug tests
  // log: jest.fn(),
  // warn: jest.fn(),
  error: jest.fn(),
}