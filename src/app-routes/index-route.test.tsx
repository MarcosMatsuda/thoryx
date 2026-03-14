/**
 * Runtime unit test for app/index.tsx
 * Tests that the index screen correctly handles PIN check and navigation
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import IndexScreen from '../../app/index';

// Mock the dependencies
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@presentation/screens/splash-screen', () => ({
  SplashScreen: () => 'SplashScreen',
}));

jest.mock('@data/repositories/pin.repository.impl', () => ({
  PinRepositoryImpl: jest.fn(),
}));

jest.mock('@domain/use-cases/check-pin-exists.use-case', () => ({
  CheckPinExistsUseCase: jest.fn(),
}));

describe('IndexScreen', () => {
  const mockReplace = jest.fn();
  const mockRouter = { replace: mockReplace };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('should render SplashScreen', () => {
    const { getByText } = render(<IndexScreen />);
    expect(getByText('SplashScreen')).toBeTruthy();
  });

  it('should check PIN existence on mount', async () => {
    const mockExecute = jest.fn().mockResolvedValue(true);
    const MockPinRepositoryImpl = require('@data/repositories/pin.repository.impl').PinRepositoryImpl;
    const MockCheckPinExistsUseCase = require('@domain/use-cases/check-pin-exists.use-case').CheckPinExistsUseCase;

    MockPinRepositoryImpl.mockImplementation(() => ({}));
    MockCheckPinExistsUseCase.mockImplementation(() => ({
      execute: mockExecute,
    }));

    render(<IndexScreen />);

    // Wait for async effects
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(MockPinRepositoryImpl).toHaveBeenCalled();
    expect(MockCheckPinExistsUseCase).toHaveBeenCalledWith({});
    expect(mockExecute).toHaveBeenCalled();
  });

  it('should navigate to /unlock when PIN exists', async () => {
    const mockExecute = jest.fn().mockResolvedValue(true);
    const MockPinRepositoryImpl = require('@data/repositories/pin.repository.impl').PinRepositoryImpl;
    const MockCheckPinExistsUseCase = require('@domain/use-cases/check-pin-exists.use-case').CheckPinExistsUseCase;

    MockPinRepositoryImpl.mockImplementation(() => ({}));
    MockCheckPinExistsUseCase.mockImplementation(() => ({
      execute: mockExecute,
    }));

    jest.useFakeTimers();
    
    render(<IndexScreen />);

    // Fast-forward through the 2-second timer
    jest.advanceTimersByTime(2000);

    // Wait for async effects
    await Promise.resolve();

    expect(mockReplace).toHaveBeenCalledWith('/unlock');

    jest.useRealTimers();
  });

  it('should navigate to /pin-setup when PIN does not exist', async () => {
    const mockExecute = jest.fn().mockResolvedValue(false);
    const MockPinRepositoryImpl = require('@data/repositories/pin.repository.impl').PinRepositoryImpl;
    const MockCheckPinExistsUseCase = require('@domain/use-cases/check-pin-exists.use-case').CheckPinExistsUseCase;

    MockPinRepositoryImpl.mockImplementation(() => ({}));
    MockCheckPinExistsUseCase.mockImplementation(() => ({
      execute: mockExecute,
    }));

    jest.useFakeTimers();
    
    render(<IndexScreen />);

    // Fast-forward through the 2-second timer
    jest.advanceTimersByTime(2000);

    // Wait for async effects
    await Promise.resolve();

    expect(mockReplace).toHaveBeenCalledWith('/pin-setup');

    jest.useRealTimers();
  });

  it('should handle PIN check errors by navigating to /pin-setup', async () => {
    const mockExecute = jest.fn().mockRejectedValue(new Error('PIN check failed'));
    const MockPinRepositoryImpl = require('@data/repositories/pin.repository.impl').PinRepositoryImpl;
    const MockCheckPinExistsUseCase = require('@domain/use-cases/check-pin-exists.use-case').CheckPinExistsUseCase;

    MockPinRepositoryImpl.mockImplementation(() => ({}));
    MockCheckPinExistsUseCase.mockImplementation(() => ({
      execute: mockExecute,
    }));

    jest.useFakeTimers();
    
    render(<IndexScreen />);

    // Fast-forward through the 2-second timer
    jest.advanceTimersByTime(2000);

    // Wait for async effects
    await Promise.resolve();

    expect(mockReplace).toHaveBeenCalledWith('/pin-setup');

    jest.useRealTimers();
  });

  it('should not navigate before splash timer completes', async () => {
    const mockExecute = jest.fn().mockResolvedValue(true);
    const MockPinRepositoryImpl = require('@data/repositories/pin.repository.impl').PinRepositoryImpl;
    const MockCheckPinExistsUseCase = require('@domain/use-cases/check-pin-exists.use-case').CheckPinExistsUseCase;

    MockPinRepositoryImpl.mockImplementation(() => ({}));
    MockCheckPinExistsUseCase.mockImplementation(() => ({
      execute: mockExecute,
    }));

    jest.useFakeTimers();
    
    render(<IndexScreen />);

    // Only advance 1 second, not the full 2 seconds
    jest.advanceTimersByTime(1000);

    // Wait for async effects
    await Promise.resolve();

    expect(mockReplace).not.toHaveBeenCalled();

    // Now advance the remaining time
    jest.advanceTimersByTime(1000);

    // Wait for async effects
    await Promise.resolve();

    expect(mockReplace).toHaveBeenCalledWith('/unlock');

    jest.useRealTimers();
  });

  it('should not navigate before PIN check completes', async () => {
    let resolveExecute: (value: boolean) => void;
    const mockExecute = jest.fn().mockImplementation(() => new Promise(resolve => {
      resolveExecute = resolve;
    }));
    
    const MockPinRepositoryImpl = require('@data/repositories/pin.repository.impl').PinRepositoryImpl;
    const MockCheckPinExistsUseCase = require('@domain/use-cases/check-pin-exists.use-case').CheckPinExistsUseCase;

    MockPinRepositoryImpl.mockImplementation(() => ({}));
    MockCheckPinExistsUseCase.mockImplementation(() => ({
      execute: mockExecute,
    }));

    jest.useFakeTimers();
    
    render(<IndexScreen />);

    // Advance the full 2 seconds, but PIN check hasn't resolved yet
    jest.advanceTimersByTime(2000);

    // Wait for async effects
    await Promise.resolve();

    expect(mockReplace).not.toHaveBeenCalled();

    // Now resolve the PIN check
    resolveExecute!(true);

    // Wait for async effects
    await Promise.resolve();

    expect(mockReplace).toHaveBeenCalledWith('/unlock');

    jest.useRealTimers();
  });
});