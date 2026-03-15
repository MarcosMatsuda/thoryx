import { Pin, PinInput } from "@domain/entities/pin.entity";

export interface PinRepository {
  save(pinInput: PinInput): Promise<Pin>;
  verify(pin: string): Promise<boolean>;
  exists(): Promise<boolean>;
  delete(): Promise<void>;
}
