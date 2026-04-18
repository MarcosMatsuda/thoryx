import { Pin, PinInput, StoredPin } from "@domain/entities/pin.entity";

export interface PinRepository {
  save(pinInput: PinInput): Promise<Pin>;
  verify(pin: string, stored?: StoredPin | null): Promise<boolean>;
  verifyLegacy(pin: string, stored?: StoredPin | null): Promise<boolean>;
  readStored(): Promise<StoredPin | null>;
  exists(): Promise<boolean>;
  delete(): Promise<void>;
}
