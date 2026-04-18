import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { AddContactBottomSheet } from "./add-contact-bottom-sheet";
import { EmergencyContact } from "@domain/entities/emergency-info.entity";

describe("AddContactBottomSheet", () => {
  const baseProps = {
    visible: true,
    onClose: jest.fn(),
    onSave: jest.fn(),
    isPrimary: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders localized placeholders instead of hard-coded English", () => {
    const { getByPlaceholderText } = render(
      <AddContactBottomSheet {...baseProps} />,
    );

    expect(getByPlaceholderText(/Digite o nome completo/i)).toBeTruthy();
    expect(getByPlaceholderText(/Ex: Cônjuge, Pai, Irmã/i)).toBeTruthy();
  });

  it("keeps the save button disabled until every field has a value", () => {
    const onSave = jest.fn();
    const { getByPlaceholderText, getByLabelText } = render(
      <AddContactBottomSheet {...baseProps} onSave={onSave} />,
    );

    const saveButton = getByLabelText(/Salvar Contato/i);
    fireEvent.press(saveButton);
    expect(onSave).not.toHaveBeenCalled();

    fireEvent.changeText(
      getByPlaceholderText(/Digite o nome completo/i),
      "Ana",
    );
    fireEvent.changeText(
      getByPlaceholderText(/Ex: Cônjuge, Pai, Irmã/i),
      "Mãe",
    );
    fireEvent.changeText(getByPlaceholderText(/\+55/), "11999999999");

    fireEvent.press(saveButton);
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: "Ana",
        relationship: "Mãe",
        phoneNumber: "11999999999",
        isPrimary: false,
      }),
    );
  });

  it("pre-fills inputs and preserves the id when editing an existing contact", () => {
    const onSave = jest.fn();
    const initialContact: EmergencyContact = {
      id: "contact_123",
      fullName: "Marcos",
      relationship: "Irmão",
      phoneNumber: "11988887777",
      isPrimary: true,
    };

    const { getByDisplayValue, getByLabelText } = render(
      <AddContactBottomSheet
        {...baseProps}
        initialContact={initialContact}
        onSave={onSave}
      />,
    );

    expect(getByDisplayValue("Marcos")).toBeTruthy();
    expect(getByDisplayValue("Irmão")).toBeTruthy();
    expect(getByDisplayValue("11988887777")).toBeTruthy();

    fireEvent.changeText(getByDisplayValue("Marcos"), "Marcos Matsuda");
    fireEvent.press(getByLabelText(/Salvar Contato/i));

    expect(onSave).toHaveBeenCalledWith({
      id: "contact_123",
      fullName: "Marcos Matsuda",
      relationship: "Irmão",
      phoneNumber: "11988887777",
      isPrimary: true,
    });
  });

  it("shows the edit header when editing an existing contact", () => {
    const initialContact: EmergencyContact = {
      id: "contact_1",
      fullName: "Ana",
      relationship: "Mãe",
      phoneNumber: "11999",
      isPrimary: false,
    };
    const { getByText } = render(
      <AddContactBottomSheet {...baseProps} initialContact={initialContact} />,
    );

    expect(getByText(/Editar Contato/i)).toBeTruthy();
  });

  it("shows the add-primary header when creating the first contact", () => {
    const { getByText } = render(
      <AddContactBottomSheet {...baseProps} isPrimary />,
    );

    expect(getByText(/Adicionar Contato Principal/i)).toBeTruthy();
  });
});
