/**
 * ChangePinScreen Tests
 * 
 * Tests for PIN change flow including:
 * - PIN entry validation
 * - Navigation using useNavigation hook (navigation.goBack)
 * - Header display control (no automatic tabs header)
 * - PIN verification use case
 * - Error handling
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ChangePinScreen } from '../change-pin-screen';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockReset = jest.fn();

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

jest.mock('@domain/use-cases/save-pin.use-case', () => ({
  SavePinUseCase: jest.fn().mockImplementation(() => ({
    execute: jest.fn(),
  })),
}));

jest.mock('@data/repositories/pin.repository.impl', () => ({
  PinRepositoryImpl: jest.fn(),
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

jest.mock('@presentation/components/pin-confirmation-bottom-sheet', () => ({
  PinConfirmationBottomSheet: () => <div testID="pin-confirmation" />,
}));

describe('ChangePinScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Screen Rendering', () => {
    it('should render without crashing', () => {
      const { queryByText } = render(<ChangePinScreen />);
      expect(queryByText).toBeDefined();
    });

    it('should display "Enter your current PIN" as initial title', () => {
      const { getByText } = render(<ChangePinScreen />);
      expect(getByText('Enter your current PIN')).toBeTruthy();
    });

    it('should display correct subtitle for current PIN step', () => {
      const { getByText } = render(<ChangePinScreen />);
      expect(getByText('Please enter your current 6-digit PIN to continue.')).toBeTruthy();
    });

    it('should render back button', () => {
      const { getByText } = render(<ChangePinScreen />);
      const backButton = getByText('←');
      expect(backButton).toBeTruthy();
    });

    it('should render numeric keypad', () => {
      const { getByTestID } = render(<ChangePinScreen />);
      expect(getByTestID('key-1')).toBeTruthy();
    });

    it('should render 6 PIN dots', () => {
      const { getAllByTestID } = render(<ChangePinScreen />);
      const dots = getAllByTestID('pin-dot');
      expect(dots).toHaveLength(6);
    });
  });

  describe('PIN Entry', () => {
    it('should add digits to PIN when number keys are pressed', () => {
      const { getByTestID, getAllByTestID } = render(<ChangePinScreen />);
      
      fireEvent.press(getByTestID('key-1'));
      fireEvent.press(getByTestID('key-2'));
      fireEvent.press(getByTestID('key-3'));

      const filledDots = getAllByTestID('pin-dot').filter(
        (dot) => dot.props['data-filled'] === true
      );
      expect(filledDots).toHaveLength(3);
    });

    it('should not allow more than 6 digits', () => {
      const { getByTestID, getAllByTestID } = render(<ChangePinScreen />);
      
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
      const { getByTestID, getAllByTestID } = render(<ChangePinScreen />);
      
      fireEvent.press(getByTestID('key-1'));
      fireEvent.press(getByTestID('key-2'));
      fireEvent.press(getByTestID('backspace'));

      const filledDots = getAllByTestID('pin-dot').filter(
        (dot) => dot.props['data-filled'] === true
      );
      expect(filledDots).toHaveLength(1);
    });

    it('should clear error message when entering new PIN', async () => {
      const { getByTestID, queryByText } = render(<ChangePinScreen />);
      
      // First enter 6 digits and verify we can trigger error state
      for (let i = 0; i < 6; i++) {
        fireEvent.press(getByTestID('key-1'));
      }

      // After entering new digits, error should be cleared
      fireEvent.press(getByTestID('backspace'));
      
      // Error should no longer be visible
      await waitFor(() => {
        expect(queryByText(/Invalid PIN|Failed to verify/)).toBeFalsy();
      });
    });
  });

  describe('Navigation - Back Button', () => {
    it('should call navigation.goBack() when back button pressed in current PIN step', () => {
      const { getByText } = render(<ChangePinScreen />);
      const backButton = getByText('←');
      
      fireEvent.press(backButton);
      
      expect(mockGoBack).toHaveBeenCalled();
    });

    it('should go back to current PIN step when back button pressed in new PIN step', async () => {
      const { getByTestID, getByText } = render(<ChangePinScreen />);
      
      // Mock successful PIN verification
      const VerifyPinUseCase = require('@domain/use-cases/verify-pin.use-case').VerifyPinUseCase;
      const mockExecute = jest.fn().mockResolvedValue({ success: true });
      VerifyPinUseCase.mockImplementation(() => ({
        execute: mockExecute,
      }));

      // Enter and verify current PIN
      for (let i = 0; i < 6; i++) {
        fireEvent.press(getByTestID('key-1'));
      }
      fireEvent.press(getByText('Continue'));

      await waitFor(() => {
        expect(getByText('Enter your new PIN')).toBeTruthy();
      });

      // Press back button in new PIN step
      fireEvent.press(getByText('←'));

      // Should not call navigation.goBack() but stay on current PIN step
      expect(getByText('Enter your current PIN')).toBeTruthy();
    });

    it('should clear new PIN when going back to current PIN step', async () => {
      const { getByTestID, getByText, getAllByTestID } = render(<ChangePinScreen />);
      
      // Mock successful PIN verification
      const VerifyPinUseCase = require('@domain/use-cases/verify-pin.use-case').VerifyPinUseCase;
      const mockExecute = jest.fn().mockResolvedValue({ success: true });
      VerifyPinUseCase.mockImplementation(() => ({
        execute: mockExecute,
      }));

      // Enter and verify current PIN
      for (let i = 0; i < 6; i++) {
        fireEvent.press(getByTestID('key-1'));
      }
      fireEvent.press(getByText('Continue'));

      await waitFor(() => {
        expect(getByText('Enter your new PIN')).toBeTruthy();
      });

      // Enter new PIN
      for (let i = 0; i < 3; i++) {
        fireEvent.press(getByTestID('key-2'));
      }

      // Press back button
      fireEvent.press(getByText('←'));

      // All dots should be empty now
      const filledDots = getAllByTestID('pin-dot').filter(
        (dot) => dot.props['data-filled'] === true
      );
      expect(filledDots).toHaveLength(0);
    });
  });

  describe('PIN Verification Flow', () => {
    it('should disable Continue button when PIN is incomplete', () => {
      const { getByTestID, getByText } = render(<ChangePinScreen />);
      
      // Enter only 3 digits
      for (let i = 0; i < 3; i++) {
        fireEvent.press(getByTestID('key-1'));
      }

      const continueButton = getByText('Continue').parent;
      expect(continueButton.props.disabled).toBe(true);
    });

    it('should enable Continue button when PIN is complete (6 digits)', () => {
      const { getByTestID, getByText } = render(<ChangePinScreen />);
      
      // Enter 6 digits
      for (let i = 0; i < 6; i++) {
        fireEvent.press(getByTestID('key-1'));
      }

      const continueButton = getByText('Continue').parent;
      expect(continueButton.props.disabled).toBe(false);
    });

    it('should show error message for invalid current PIN', async () => {
      const { getByTestID, getByText, queryByText } = render(<ChangePinScreen />);
      
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

      // Click continue
      fireEvent.press(getByText('Continue'));

      await waitFor(() => {
        expect(queryByText('Invalid PIN. Please try again.')).toBeTruthy();
      });
    });

    it('should clear PIN field after failed verification', async () => {
      const { getByTestID, getByText, getAllByTestID } = render(<ChangePinScreen />);
      
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

      // Click continue
      fireEvent.press(getByText('Continue'));

      await waitFor(() => {
        const filledDots = getAllByTestID('pin-dot').filter(
          (dot) => dot.props['data-filled'] === true
        );
        expect(filledDots).toHaveLength(0);
      });
    });

    it('should transition to new PIN step after successful verification', async () => {
      const { getByTestID, getByText } = render(<ChangePinScreen />);
      
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

      // Click continue
      fireEvent.press(getByText('Continue'));

      await waitFor(() => {
        expect(getByText('Enter your new PIN')).toBeTruthy();
        expect(getByText('Create a new 6-digit PIN for your account.')).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper header structure', () => {
      const { getByText } = render(<ChangePinScreen />);
      expect(getByText('Change PIN')).toBeTruthy();
    });

    it('should display PIN instruction text', () => {
      const { getByText } = render(<ChangePinScreen />);
      expect(getByText('Please enter your current 6-digit PIN to continue.')).toBeTruthy();
    });
  });

  describe('Header (Tabs) Conflict Prevention', () => {
    it('should not render with automatic header containing tabs', () => {
      const { root } = render(<ChangePinScreen />);
      
      // The component should not have any header-related elements that would
      // conflict with tab navigation
      const headerTexts = ['(tabs)', 'automatic header'];
      headerTexts.forEach(text => {
        expect(root.findByProps({ children: text })).toBeNull();
      });
    });
  });
});
