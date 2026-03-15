export class InputMasks {
  static creditCardNumber(value: string): string {
    const cleaned = value.replace(/\D/g, "");
    const limited = cleaned.substring(0, 16);
    const formatted = limited.replace(/(\d{4})(?=\d)/g, "$1 ");
    return formatted;
  }

  static expiryDate(value: string): string {
    const cleaned = value.replace(/\D/g, "");
    const limited = cleaned.substring(0, 4);

    if (limited.length >= 2) {
      return `${limited.substring(0, 2)}/${limited.substring(2)}`;
    }

    return limited;
  }

  static cvv(value: string): string {
    const cleaned = value.replace(/\D/g, "");
    return cleaned.substring(0, 4);
  }

  static cardholderName(value: string): string {
    return value.replace(/[^a-zA-Z\s]/g, "").toUpperCase();
  }

  static removeCardNumberMask(value: string): string {
    return value.replace(/\s/g, "");
  }

  static removeExpiryDateMask(value: string): string {
    return value.replace(/\//g, "");
  }
}
