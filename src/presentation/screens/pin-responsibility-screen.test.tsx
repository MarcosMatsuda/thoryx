import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { PinResponsibilityScreen } from "./pin-responsibility-screen";

const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

const mockExecute = jest.fn();
jest.mock("@domain/use-cases/accept-pin-responsibility.use-case", () => ({
  AcceptPinResponsibilityUseCase: jest
    .fn()
    .mockImplementation(() => ({ execute: mockExecute })),
}));

jest.mock("@data/repositories/pin-responsibility.repository.impl", () => ({
  PinResponsibilityRepositoryImpl: jest.fn().mockImplementation(() => ({})),
}));

describe("PinResponsibilityScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockExecute.mockResolvedValue(undefined);
  });

  it("renders the warning and checkbox label", () => {
    const { getByText } = render(<PinResponsibilityScreen />);
    expect(getByText(/Antes de criar seu PIN/i)).toBeTruthy();
    expect(
      getByText(/Entendi e assumo a responsabilidade/i),
    ).toBeTruthy();
  });

  it("disables the continue button until the checkbox is marked", async () => {
    const { getByLabelText } = render(<PinResponsibilityScreen />);
    const button = getByLabelText("Continuar");
    expect(button.props.accessibilityState.disabled).toBe(true);

    fireEvent.press(button);
    await waitFor(() => {
      expect(mockExecute).not.toHaveBeenCalled();
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  it("accepts responsibility and navigates to pin-setup after confirmation", async () => {
    const { getByLabelText, getByText } = render(<PinResponsibilityScreen />);
    fireEvent.press(getByText(/Entendi e assumo a responsabilidade/i));
    fireEvent.press(getByLabelText("Continuar"));

    await waitFor(() => {
      expect(mockExecute).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith("/pin-setup");
    });
  });
});
