/**
 * Navigation Layout Tests
 * 
 * Tests for app/_layout.tsx to ensure:
 * - All routes have headerShown: false to prevent automatic header (tabs) conflicts
 * - Gesture navigation is properly disabled where needed
 * - Stack configuration is correct
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import RootLayout from '../../../app/_layout';

// Mock expo-router Stack component to capture screen configurations
const mockScreenConfigs: Record<string, any> = {};

jest.mock('expo-router', () => {
  const actual = jest.requireActual('expo-router');
  return {
    ...actual,
    Stack: {
      Screen: ({ name, options }: any) => {
        mockScreenConfigs[name] = options;
        return null;
      },
      // Return a component that acts as a container
      (): any => ({
        children: [],
      }),
    },
  };
});

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

jest.mock('@react-navigation/native', () => ({
  ThemeProvider: ({ children }: any) => children,
  DefaultTheme: {},
  DarkTheme: {},
}));

jest.mock('@presentation/hooks/use-color-scheme', () => ({
  useColorScheme: () => 'light',
}));

describe('Navigation Layout - Header Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mockScreenConfigs).forEach(key => delete mockScreenConfigs[key]);
  });

  it('should render RootLayout without crashing', () => {
    const { queryByTestId } = render(<RootLayout />);
    expect(queryByTestId).toBeDefined();
  });

  describe('Header Configuration', () => {
    beforeEach(() => {
      render(<RootLayout />);
    });

    it('should have headerShown: false for index screen', () => {
      expect(mockScreenConfigs['index']?.headerShown).toBe(false);
    });

    it('should have headerShown: false for unlock screen', () => {
      expect(mockScreenConfigs['unlock']?.headerShown).toBe(false);
    });

    it('should have headerShown: false for (tabs) group', () => {
      expect(mockScreenConfigs['(tabs)']?.headerShown).toBe(false);
    });

    it('should have headerShown: false for home screen', () => {
      expect(mockScreenConfigs['home']?.headerShown).toBe(false);
    });

    it('should have headerShown: false for emergency screen', () => {
      expect(mockScreenConfigs['emergency']?.headerShown).toBe(false);
    });

    it('should have headerShown: false for emergency-setup screen', () => {
      expect(mockScreenConfigs['emergency-setup']?.headerShown).toBe(false);
    });

    it('should have headerShown: false for add-credit-card screen', () => {
      expect(mockScreenConfigs['add-credit-card']?.headerShown).toBe(false);
    });

    it('should have headerShown: false for document-details screen', () => {
      expect(mockScreenConfigs['document-details']?.headerShown).toBe(false);
    });

    it('should have headerShown: false for add-document screen', () => {
      expect(mockScreenConfigs['add-document']?.headerShown).toBe(false);
    });

    it('should have headerShown: false for select-documents screen', () => {
      expect(mockScreenConfigs['select-documents']?.headerShown).toBe(false);
    });

    it('should have headerShown: false for profile-setup screen', () => {
      expect(mockScreenConfigs['profile-setup']?.headerShown).toBe(false);
    });

    it('should have headerShown: false for change-pin screen', () => {
      expect(mockScreenConfigs['change-pin']?.headerShown).toBe(false);
    });

    it('should have headerShown: false for modal', () => {
      // Modal has different configuration but should still control header
      expect(mockScreenConfigs['modal']?.presentation).toBe('modal');
    });
  });

  describe('Gesture Navigation', () => {
    beforeEach(() => {
      render(<RootLayout />);
    });

    it('should disable gesture navigation for (tabs) to prevent swipe back', () => {
      expect(mockScreenConfigs['(tabs)']?.gestureEnabled).toBe(false);
    });

    it('should disable gesture navigation for home to prevent swipe back', () => {
      expect(mockScreenConfigs['home']?.gestureEnabled).toBe(false);
    });
  });

  describe('Route Configuration Completeness', () => {
    beforeEach(() => {
      render(<RootLayout />);
    });

    it('should have all critical routes configured', () => {
      const criticalRoutes = [
        'index',
        'unlock',
        '(tabs)',
        'home',
        'emergency',
        'change-pin',
      ];

      criticalRoutes.forEach(route => {
        expect(mockScreenConfigs[route]).toBeDefined();
      });
    });

    it('should have all routes with headerShown: false except modal', () => {
      Object.entries(mockScreenConfigs).forEach(([name, config]) => {
        if (name === 'modal') {
          // Modal has presentation: 'modal' instead
          expect(config.presentation).toBe('modal');
        } else {
          expect(config.headerShown).toBe(false);
        }
      });
    });
  });
});
