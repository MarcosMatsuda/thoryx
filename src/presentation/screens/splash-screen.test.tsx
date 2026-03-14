import React from 'react';
import { render } from '@testing-library/react-native';
import { SplashScreen } from './splash-screen';

// Mock the require statement for the image
jest.mock('../../../assets/images/splash-icon.png', () => 'test-image-path');

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => ({
  useSharedValue: jest.fn(() => ({ value: 0 })),
  useAnimatedStyle: jest.fn(() => ({})),
  withTiming: jest.fn(),
  Easing: {
    out: jest.fn(() => jest.fn()),
    cubic: jest.fn(),
  },
}));

describe('SplashScreen', () => {
  it('renders without errors', () => {
    const { getByTestId } = render(<SplashScreen />);
    
    // Check if the component renders
    expect(getByTestId('splash-container')).toBeTruthy();
    expect(getByTestId('splash-logo')).toBeTruthy();
  });

  it('has logo with accessibility label', () => {
    const { getByLabelText } = render(<SplashScreen />);
    
    // Check if the logo has the correct accessibility label
    expect(getByLabelText('Thoryx Logo')).toBeTruthy();
  });
});