export interface PinResponsibilityRepository {
  accept(timestamp: number): Promise<void>;
  isAccepted(): Promise<boolean>;
  clear(): Promise<void>;
}
