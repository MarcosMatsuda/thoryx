/**
 * Runtime unit test for app/index.tsx
 * Tests that the index screen correctly handles PIN check and navigation
 */

import React from "react";
import { render, act } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { PinRepositoryImpl } from "@data/repositories/pin.repository.impl";
import { CheckPinExistsUseCase } from "@domain/use-cases/check-pin-exists.use-case";
import IndexScreen from "../../app/index";

// Mock the dependencies
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@presentation/screens/splash-screen", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactInFactory = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Text } = require("react-native");
  return {
    SplashScreen: () =>
      ReactInFactory.createElement(Text, null, "SplashScreen"),
  };
});

jest.mock("@data/repositories/pin.repository.impl", () => ({
  PinRepositoryImpl: jest.fn(),
}));

jest.mock("@domain/use-cases/check-pin-exists.use-case", () => ({
  CheckPinExistsUseCase: jest.fn(),
}));

const MockPinRepositoryImpl = jest.mocked(PinRepositoryImpl);
const MockCheckPinExistsUseCase = jest.mocked(CheckPinExistsUseCase);

describe("IndexScreen", () => {
  const mockReplace = jest.fn();
  const mockRouter = { replace: mockReplace };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it("should render SplashScreen", () => {
    const { getByText } = render(<IndexScreen />);
    expect(getByText("SplashScreen")).toBeTruthy();
  });

  it("should check PIN existence on mount", async () => {
    const mockExecute = jest.fn().mockResolvedValue(true);
    MockPinRepositoryImpl.mockImplementation(() => ({}) as PinRepositoryImpl);
    MockCheckPinExistsUseCase.mockImplementation(
      () => ({ execute: mockExecute }) as unknown as CheckPinExistsUseCase,
    );

    render(<IndexScreen />);

    expect(MockPinRepositoryImpl).toHaveBeenCalled();
    expect(MockCheckPinExistsUseCase).toHaveBeenCalledWith({});
    expect(mockExecute).toHaveBeenCalled();
  });

  it("should navigate to /unlock when PIN exists", async () => {
    const mockExecute = jest.fn().mockResolvedValue(true);
    MockPinRepositoryImpl.mockImplementation(() => ({}) as PinRepositoryImpl);
    MockCheckPinExistsUseCase.mockImplementation(
      () => ({ execute: mockExecute }) as unknown as CheckPinExistsUseCase,
    );

    jest.useFakeTimers();

    render(<IndexScreen />);

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockReplace).toHaveBeenCalledWith("/unlock");

    jest.useRealTimers();
  });

  it("should navigate to /pin-setup when PIN does not exist", async () => {
    const mockExecute = jest.fn().mockResolvedValue(false);
    MockPinRepositoryImpl.mockImplementation(() => ({}) as PinRepositoryImpl);
    MockCheckPinExistsUseCase.mockImplementation(
      () => ({ execute: mockExecute }) as unknown as CheckPinExistsUseCase,
    );

    jest.useFakeTimers();

    render(<IndexScreen />);

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockReplace).toHaveBeenCalledWith("/pin-setup");

    jest.useRealTimers();
  });

  it("should handle PIN check errors by navigating to /pin-setup", async () => {
    const mockExecute = jest
      .fn()
      .mockRejectedValue(new Error("PIN check failed"));
    MockPinRepositoryImpl.mockImplementation(() => ({}) as PinRepositoryImpl);
    MockCheckPinExistsUseCase.mockImplementation(
      () => ({ execute: mockExecute }) as unknown as CheckPinExistsUseCase,
    );

    jest.useFakeTimers();

    render(<IndexScreen />);

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockReplace).toHaveBeenCalledWith("/pin-setup");

    jest.useRealTimers();
  });

  it("should not navigate before splash timer completes", async () => {
    const mockExecute = jest.fn().mockResolvedValue(true);
    MockPinRepositoryImpl.mockImplementation(() => ({}) as PinRepositoryImpl);
    MockCheckPinExistsUseCase.mockImplementation(
      () => ({ execute: mockExecute }) as unknown as CheckPinExistsUseCase,
    );

    jest.useFakeTimers();

    render(<IndexScreen />);

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockReplace).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockReplace).toHaveBeenCalledWith("/unlock");

    jest.useRealTimers();
  });

  it("should not navigate before PIN check completes", async () => {
    let resolveExecute: (value: boolean) => void;
    const mockExecute = jest.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveExecute = resolve;
        }),
    );

    MockPinRepositoryImpl.mockImplementation(() => ({}) as PinRepositoryImpl);
    MockCheckPinExistsUseCase.mockImplementation(
      () => ({ execute: mockExecute }) as unknown as CheckPinExistsUseCase,
    );

    jest.useFakeTimers();

    render(<IndexScreen />);

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockReplace).not.toHaveBeenCalled();

    await act(async () => {
      resolveExecute!(true);
    });

    expect(mockReplace).toHaveBeenCalledWith("/unlock");

    jest.useRealTimers();
  });
});
