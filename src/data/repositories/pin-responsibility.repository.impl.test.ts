import * as SecureStore from "expo-secure-store";
import { PinResponsibilityRepositoryImpl } from "./pin-responsibility.repository.impl";

describe("PinResponsibilityRepositoryImpl", () => {
  const repository = new PinResponsibilityRepositoryImpl();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("persists acceptance with the provided timestamp", async () => {
    await repository.accept(1234);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      "thoryx_pin_responsibility_accepted_at",
      "1234",
    );
  });

  it("reports accepted when a value is stored", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce("1234");
    await expect(repository.isAccepted()).resolves.toBe(true);
  });

  it("reports not accepted when nothing is stored", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);
    await expect(repository.isAccepted()).resolves.toBe(false);
  });

  it("clears the stored value", async () => {
    await repository.clear();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      "thoryx_pin_responsibility_accepted_at",
    );
  });
});
