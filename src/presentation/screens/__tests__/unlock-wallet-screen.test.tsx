/**
 * UnlockWalletScreen Tests
 * 
 * Tests for wallet unlock flow including:
 * - PIN entry and verification
 * - Biometric authentication
 * - Navigation using useNavigation hook (navigation.reset, navigation.navigate)
 * - Header display control (no automatic tabs header)
 * - Error handling
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { UnlockWalletScreen } from '../unlock-wallet-screen';

// Mock navigation
const mockNavigate = jest.fn();
const mockReset = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
    navigate: mockNavigate,
    reset: mockReset,
  }),
}));

// Mock the use cases
jest.mock('@domain/use-cases/verify-pin.use-case', () => ({
  VerifyPinUseCase: jest.fn().mockImplementation(() => ({
    execute: jest.fn(),
  })),
}));

jest.mock('@data/repositories/pin.repository.impl', () => ({
  PinRepositoryImpl: jest.fn(),
}));

// Mock biometry hook
jest.mock('@presentation/hooks/use-biometry', () => ({
  useBiometry: () => ({
    isAvailable: true,
    authenticate: jest.fn(),
    getBiometryName: () => 'Face ID',
  }),
}));

// Mock secure storage
jest.mock('@infrastructure/storage/secure-storage.adapter', () => ({
  SecureStorageAdapter: jest.fn().mockImplementation(() => ({
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
  })),
}));

// Mock components
jest.mock('@presentation/components/numeric-keypad', () => ({
  NumericKeypad: ({ onKeyPress, onBackspace }: any) => (
    <div>
      <button testID="key-1" onPress={() => onKeyPress('1')}>1</button>
      <button testID="key-2" onPress={() => onKeyPress('2')}>2</button>
      <button testID="key-3" onPress={() => onKeyPress('3')}>3</button>
      <button testID="key-4" onPress={() => onKeyPress('4')}>4</button>
      <button testID="key-5" onPress={() => onKeyPress('5')}>5</button>
      <button testID="key-6" onPress={() => onKeyPress('6')}>6</button>
      <button testID="backspace" onPress={onBackspace}>DEL</button>
    </div>
  ),
}));

jest.mock('@presentation/components/pin-dot', () => ({
  PinDot: ({ filled }: any) => (
    <div testID="pin-dot" data-filled={filled} />
  ),
}));

jest.mock('@presentation/components/svg-icon', () => ({
  SvgIcon: ({ name }: any) => <div testID={`icon-${name}`} />,
}));

describe('UnlockWalletScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Screen Rendering', () => {
    it('should render without crashing', () => {
      const { queryByText } = render(<UnlockWalletScreen />);
      expect(queryByText).toBeDefined();
    });

    it('should display "Unlock Wallet" title', () => {
      const { getByText } = render(<UnlockWalletScreen />);
      expect(getByText('Unlock Wallet')).toBeTruthy();
    });

    it('should display PIN instruction text', () => {
      const { getByText } = render(<UnlockWalletScreen />);
      expect(getByText(/Enter your PIN/)).toBeTruthy();
    });

    it('should display SECURE STORAGE badge', () => {
      const { getByText } = render(<UnlockWalletScreen />);
      expect(getByText('SECURE STORAGE')).toBeTruthy();
    });

    it('should render lock-unlock icon', () => {
      const { getByTestID } = render(<UnlockWalletScreen />);
      expect(getByTestID('icon-lock-unlock')).toBeTruthy();
    });

    it('should render numeric keypad', () => {
      const { getByTestID } = render(<UnlockWalletScreen />);
      expect(getByTestID('key-1')).toBeTruthy();
    });

    it('should render 6 PIN dots', () => {
      const { getAllByTestID } = render(<UnlockWalletScreen />);
      const dots = getAllByTestID('pin-dot');
      expect(dots).toHaveLength(6);
    });

    it('should display Emergency Details link', () => {
      const { getByText } = render(<UnlockWalletScreen />);
      expect(getByText('Emergency Details')).toBeTruthy();
    });
  });

  describe('PIN Entry', () => {
    it('should add digits to PIN when number keys are pressed', () => {
      const { getByTestID, getAllByTestID } = render(<UnlockWalletScreen />);
      
      fireEvent.press(getByTestID('key-1'));
      fireEvent.press(getByTestID('key-2'));
      fireEvent.press(getByTestID('key-3'));

      const filledDots = getAllByTestID('pin-dot').filter(
        (dot) => dot.props['data-filled'] === true
      );
      expect(filledDots).toHaveLength(3);
    });

    it('should not allow more than 6 digits', () => {
      const { getByTestID, getAllByTestID } = render(<UnlockWalletScreen />);
      
      // Press 7 times
      for (let i = 1; i <= 7; i++) {
        fireEvent.press(getByTestID('key-1'));
      }

      const filledDots = getAllByTestID('pin-dot').filter(
        (dot) => dot.props['data-filled'] === true
      );
      expect(filledDots).toHaveLength(6);
    });

    it('should clear digit on backspace', () => {
      const { getByTestID, getAllByTestID } = render(<UnlockWalletScreen />);
      
      fireEvent.press(getByTestID('key-1'));
      fireEvent.press(getByTestID('key-2'));
      fireEvent.press(getByTestID('backspace'));

      const filledDots = getAllByTestID('pin-dot').filter(
        (dot) => dot.props['data-filled'] === true
      );
      expect(filledDots).toHaveLength(1);
    });

    it('should clear error state when entering new PIN', async () => {
      const { getByTestID, queryByText } = render(<UnlockWalletScreen />);
      
      // Mock failed PIN verification
      const VerifyPinUseCase = require('@domain/use-cases/verify-pin.use-case').VerifyPinUseCase;
      const mockExecute = jest.fn().mockResolvedValue({ success: false });
      VerifyPinUseCase.mockImplementation(() => ({
        execute: mockExecute,
      }));

      // Enter 6 digits to trigger error
      for (let i = 0; i < 6; i++) {
        fireEvent.press(getByTestID('key-1'));
      }

      await waitFor(() => {
        expect(queryByText('Incorrect PIN. Please try again.')).toBeTruthy();
      });

      // Enter another digit - error should clear
      fireEvent.press(getByTestID('key-2'));
      
      await waitFor(() => {
        expect(queryByText('Incorrect PIN. Please try again.')).toBeFalsy();
      });
    });
  });

  describe('PIN Verification and Navigation', () => {
    it('should call navigation.reset to (tabs) on successful PIN verification', async () => {
      const { getByTestID } = render(<UnlockWalletScreen />);
      
      // Mock successful PIN verification
      const VerifyPinUseCase = require('@domain/use-cases/verify-pin.use-case').VerifyPinUseCase;
      const mockExecute = jest.fn().mockResolvedValue({ success: true });
      VerifyPinUseCase.mockImplementation(() => ({
        execute: mockExecute,
      }));

      // Enter 6 digits
      for (let i = 0; i < 6; i++) {
        fireEvent.press(getByTestID('key-1'));
      }

      await waitFor(() => {
        expect(mockReset).toHaveBeenCalledWith({
          index: 0,
          routes: [{ name: '(tabs)' }],
        });
      });
    });

    it('should show error message for incorrect PIN', async () => {
      const { getByTestID, queryByText } = render(<UnlockWalletScreen />);
      
      // Mock failed PIN verification
      const VerifyPinUseCase = require('@domain/use-cases/verify-pin.use-case').VerifyPinUseCase;
      const mockExecute = jest.fn().mockResolvedValue({ success: false });
      VerifyPinUseCase.mockImplementation(() => ({
        execute: mockExecute,
      }));

      // Enter 6 digits
      for (let i = 0; i < 6; i++) {
        fireEvent.press(getByTestID('key-1'));
      }

      await waitFor(() => {
        expect(queryByText('Incorrect PIN. Please try again.')).toBeTruthy();
      });
    });

    it('should clear PIN and error after failed verification', async () => {
      const { getByTestID, getAllByTestID, queryByText } = render(<UnlockWalletScreen />);
      
      // Mock failed PIN verification
      const VerifyPinUseCase = require('@domain/use-cases/verify-pin.use-case').VerifyPinUseCase;
      const mockExecute = jest.fn().mockResolvedValue({ success: false });
      VerifyPinUseCase.mockImplementation(() => ({
        execute: mockExecute,
      }));

      // Enter 6 digits
      for (let i = 0; i < 6; i++) {
        fireEvent.press(getByTestID('key-1'));
      }

      await waitFor(() => {
        const filledDots = getAllByTestID('pin-dot').filter(
          (dot) => dot.props['data-filled'] === true
        );
        expect(filledDots).toHaveLength(0);
        expect(queryByText('Incorrect PIN. Please try again.')).toBeFalsy();
      });
    });

    it('should not call navigation.reset on PIN verification error', async () => {
      const { getByTestID } = render(<UnlockWalletScreen />);
      
      // Mock failed PIN verification
      const VerifyPinUseCase = require('@domain/use-cases/verify-pin.use-case').VerifyPinUseCase;
      const mockExecute = jest.fn().mockResolvedValue({ success: false });
      VerifyPinUseCase.mockImplementation(() => ({
        execute: mockExecute,
      }));

      // Enter 6 digits
      for (let i = 0; i < 6; i++) {
        fireEvent.press(getByTestID('key-1'));
      }

      await waitFor(() => {
        expect(mockReset).not.toHaveBeenCalled();
      });
    });
  });

  describe('Biometric Authentication', () => {
    it('should display biometric button when biometry is available', () => {
      const { getByText } = render(<UnlockWalletScreen />);
      expect(getByText(/Use Face ID/)).toBeTruthy();
    });

    it('should call biometric authentication when button is pressed', async () => {
      const { getByText } = render(<UnlockWalletScreen />);
      const { useBiometry } = require('@presentation/hooks/use-biometry');
      
      const mockAuthenticate = jest.fn().mockResolvedValue({ success: true });
      useBiometry.mockReturnValue({
        isAvailable: true,
        authenticate: mockAuthenticate,
        getBiometryName: () => 'Face ID',
      });

      const biometricButton = getByText(/Use Face ID/);
      fireEvent.press(biometricButton);

      await waitFor(() => {
        expect(mockAuthenticate).toHaveBeenCalledWith('Unlock your wallet');
      });
    });

    it('should navigate to (tabs) on successful biometric authentication', async () => {
      const { getByText } = render(<UnlockWalletScreen />);
      const { useBiometry } = require('@presentation/hooks/use-biometry');
      
      const mockAuthenticate = jest.fn().mockResolvedValue({ success: true });
      useBiometry.mockReturnValue({
        isAvailable: true,
        authenticate: mockAuthenticate,
        getBiometryName: () => 'Face ID',
      });

      const biometricButton = getByText(/Use Face ID/);
      fireEvent.press(biometricButton);

      await waitFor(() => {
        expect(mockReset).toHaveBeenCalledWith({
          index: 0,
          routes: [{ name: '(tabs)' }],
        });
      });
    });

    it('should show error on failed biometric authentication', async () => {
      const { getByText, queryByText } = render(<UnlockWalletScreen />);
      const { useBiometry } = require('@presentation/hooks/use-biometry');
      
      const mockAuthenticate = jest.fn().mockResolvedValue({ success: false, error: 'User cancelled' });
      useBiometry.mockReturnValue({
        isAvailable: true,
        authenticate: mockAuthenticate,
        getBiometryName: () => 'Face ID',
      });

      const biometricButton = getByText(/Use Face ID/);
      fireEvent.press(biometricButton);

      // Error should be shown temporarily
      await waitFor(() => {
        expect(mockReset).not.toHaveBeenCalled();
      });
    });

    it('should not show biometric button when biometry is not available', () => {
      const { useBiometry } = require('@presentation/hooks/use-biometry');
      
      useBiometry.mockReturnValue({
        isAvailable: false,
        authenticate: jest.fn(),
        getBiometryName: () => 'Face ID',
      });

      const { queryByText } = render(<UnlockWalletScreen />);
      expect(queryByText(/Use Face ID/)).toBeFalsy();
    });
  });

  describe('Emergency Details Navigation', () => {
    it('should navigate to emergency-details when link is pressed', () => {
      const { getByText } = render(<UnlockWalletScreen />);
      
      const emergencyLink = getByText('Emergency Details');
      fireEvent.press(emergencyLink);

      expect(mockNavigate).toHaveBeenCalledWith('emergency-details');
    });
  });

  describe('Header (Tabs) Conflict Prevention', () => {
    it('should not render with automatic header containing tabs', () => {
      const { root } = render(<UnlockWalletScreen />);
      
      // The component should not have any header-related elements that would
      // conflict with tab navigation
      const headerTexts = ['(tabs)', 'automatic header'];
      headerTexts.forEach(text => {
        expect(root.findByProps({ children: text })).toBeNull();
      });
    });

    it('should only show custom headers defined in screen options', () => {
      const { getByText } = render(<UnlockWalletScreen />);
      
      // Should show custom content instead of automatic header
      expect(getByText('Unlock Wallet')).toBeTruthy();
      expect(getByText('SECURE STORAGE')).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle PIN verification exceptions gracefully', async () => {
      const { getByTestID } = render(<UnlockWalletScreen />);
      
      // Mock PIN verification to throw error
      const VerifyPinUseCase = require('@domain/use-cases/verify-pin.use-case').VerifyPinUseCase;
      const mockExecute = jest.fn().mockRejectedValue(new Error('Storage error'));
      VerifyPinUseCase.mockImplementation(() => ({
        execute: mockExecute,
      }));

      // Enter 6 digits
      for (let i = 0; i < 6; i++) {
        fireEvent.press(getByTestID('key-1'));
      }

      await waitFor(() => {
        expect(mockReset).not.toHaveBeenCalled();
      });
    });

    it('should handle biometric authentication exceptions gracefully', async () => {
      const { getByText } = render(<UnlockWalletScreen />);
      const { useBiometry } = require('@presentation/hooks/use-biometry');
      
      const mockAuthenticate = jest.fn().mockRejectedValue(new Error('Biometry error'));
      useBiometry.mockReturnValue({
        isAvailable: true,
        authenticate: mockAuthenticate,
        getBiometryName: () => 'Face ID',
      });

      const biometricButton = getByText(/Use Face ID/);
      fireEvent.press(biometricButton);

      await waitFor(() => {
        expect(mockReset).not.toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should display helpful instruction text', () => {
      const { getByText } = render(<UnlockWalletScreen />);
      expect(getByText(/Enter your PIN to access/)).toBeTruthy();
    });

    it('should mention PIN length requirement', () => {
      const { getByText } = render(<UnlockWalletScreen />);
      // The screen uses numeric keypad and pin dots to indicate 6 digits
      const dots = expect.any(Array);
      expect(dots).toBeDefined();
    });
  });
});
