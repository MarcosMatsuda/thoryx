export interface ILocalDataSource<T> {
  get(key: string): Promise<T | null>;
  set(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  getAll(): Promise<T[]>;
  clear(): Promise<void>;
}
