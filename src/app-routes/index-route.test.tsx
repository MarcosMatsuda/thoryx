/**
 * Runtime unit test for app/index.tsx
 * Tests that the index screen correctly handles PIN check and navigation.
 */

import React from "react";
import { render, act } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { PinRepositoryImpl } from "@data/repositories/pin.repository.impl";
import { PinResponsibilityRepositoryImpl } from "@data/repositories/pin-responsibility.repository.impl";
import { CheckPinExistsUseCase } from "@domain/use-cases/check-pin-exists.use-case";
import { CheckPinResponsibilityUseCase } from "@domain/use-cases/check-pin-responsibility.use-case";
import IndexScreen from "../../app/index";

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

jest.mock("@data/repositories/pin-responsibility.repository.impl", () => ({
  PinResponsibilityRepositoryImpl: jest.fn(),
}));

jest.mock("@domain/use-cases/check-pin-exists.use-case", () => ({
  CheckPinExistsUseCase: jest.fn(),
}));

jest.mock("@domain/use-cases/check-pin-responsibility.use-case", () => ({
  CheckPinResponsibilityUseCase: jest.fn(),
}));

const MockPinRepositoryImpl = jest.mocked(PinRepositoryImpl);
const MockPinResponsibilityRepositoryImpl = jest.mocked(
  PinResponsibilityRepositoryImpl,
);
const MockCheckPinExistsUseCase = jest.mocked(CheckPinExistsUseCase);
const MockCheckPinResponsibilityUseCase = jest.mocked(
  CheckPinResponsibilityUseCase,
);

function mockPinChecks(hasPin: boolean, responsibilityAccepted: boolean) {
  MockPinRepositoryImpl.mockImplementation(() => ({}) as PinRepositoryImpl);
  MockPinResponsibilityRepositoryImpl.mockImplementation(
    () => ({}) as PinResponsibilityRepositoryImpl,
  );
  MockCheckPinExistsUseCase.mockImplementation(
    () =>
      ({
        execute: jest.fn().mockResolvedValue(hasPin),
      }) as unknown as CheckPinExistsUseCase,
  );
  MockCheckPinResponsibilityUseCase.mockImplementation(
    () =>
      ({
        execute: jest.fn().mockResolvedValue(responsibilityAccepted),
      }) as unknown as CheckPinResponsibilityUseCase,
  );
}

describe("IndexScreen", () => {
  const mockReplace = jest.fn();
  const mockRouter = { replace: mockReplace };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it("should render SplashScreen", () => {
    mockPinChecks(true, true);
    const { getByText } = render(<IndexScreen />);
    expect(getByText("SplashScreen")).toBeTruthy();
  });

  it("should check PIN existence on mount", async () => {
    mockPinChecks(true, true);

    render(<IndexScreen />);

    expect(MockPinRepositoryImpl).toHaveBeenCalled();
    expect(MockCheckPinExistsUseCase).toHaveBeenCalled();
  });

  it("should navigate to /unlock when PIN exists", async () => {
    mockPinChecks(true, true);

    jest.useFakeTimers();

    render(<IndexScreen />);

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockReplace).toHaveBeenCalledWith("/unlock");

    jest.useRealTimers();
  });

  it("should navigate to /pin-responsibility when PIN is absent and not accepted", async () => {
    mockPinChecks(false, false);

    jest.useFakeTimers();

    render(<IndexScreen />);

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockReplace).toHaveBeenCalledWith("/pin-responsibility");

    jest.useRealTimers();
  });

  it("should navigate to /pin-setup when PIN is absent but responsibility is accepted", async () => {
    mockPinChecks(false, true);

    jest.useFakeTimers();

    render(<IndexScreen />);

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockReplace).toHaveBeenCalledWith("/pin-setup");

    jest.useRealTimers();
  });

  it("should handle PIN check errors by navigating to /pin-responsibility", async () => {
    MockPinRepositoryImpl.mockImplementation(() => ({}) as PinRepositoryImpl);
    MockPinResponsibilityRepositoryImpl.mockImplementation(
      () => ({}) as PinResponsibilityRepositoryImpl,
    );
    MockCheckPinExistsUseCase.mockImplementation(
      () =>
        ({
          execute: jest.fn().mockRejectedValue(new Error("check failed")),
        }) as unknown as CheckPinExistsUseCase,
    );
    MockCheckPinResponsibilityUseCase.mockImplementation(
      () =>
        ({
          execute: jest.fn().mockResolvedValue(false),
        }) as unknown as CheckPinResponsibilityUseCase,
    );

    jest.useFakeTimers();

    render(<IndexScreen />);

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockReplace).toHaveBeenCalledWith("/pin-responsibility");

    jest.useRealTimers();
  });

  it("should not navigate before splash timer completes", async () => {
    mockPinChecks(true, true);

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
    MockPinResponsibilityRepositoryImpl.mockImplementation(
      () => ({}) as PinResponsibilityRepositoryImpl,
    );
    MockCheckPinExistsUseCase.mockImplementation(
      () => ({ execute: mockExecute }) as unknown as CheckPinExistsUseCase,
    );
    MockCheckPinResponsibilityUseCase.mockImplementation(
      () =>
        ({
          execute: jest.fn().mockResolvedValue(true),
        }) as unknown as CheckPinResponsibilityUseCase,
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
