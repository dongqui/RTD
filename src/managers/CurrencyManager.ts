import { LocalStorage } from "../data/LocalStorage";

export type CurrencyChangeCallback = (diamonds: number) => void;

export default class CurrencyManager {
  private static instance: CurrencyManager;
  private diamonds: number = 0;
  private readonly STORAGE_KEY = "currency";
  private readonly DEFAULT_DIAMONDS = 1000;
  private listeners: CurrencyChangeCallback[] = [];

  private constructor() {
    this.load();
  }

  static getInstance(): CurrencyManager {
    if (!CurrencyManager.instance) {
      CurrencyManager.instance = new CurrencyManager();
    }
    return CurrencyManager.instance;
  }

  private load(): void {
    const data = LocalStorage.get<{ diamonds: number }>(this.STORAGE_KEY, {
      diamonds: this.DEFAULT_DIAMONDS,
    });
    this.diamonds = data.diamonds;
  }

  private save(): void {
    LocalStorage.set(this.STORAGE_KEY, { diamonds: this.diamonds });
    this.notifyListeners();
  }

  getDiamonds(): number {
    return this.diamonds;
  }

  hasDiamonds(amount: number): boolean {
    return this.diamonds >= amount;
  }

  addDiamonds(amount: number): void {
    this.diamonds += amount;
    this.save();
  }

  spendDiamonds(amount: number): boolean {
    if (!this.hasDiamonds(amount)) {
      return false;
    }
    this.diamonds -= amount;
    this.save();
    return true;
  }

  // Event subscription for UI updates
  onChange(callback: CurrencyChangeCallback): void {
    this.listeners.push(callback);
  }

  offChange(callback: CurrencyChangeCallback): void {
    this.listeners = this.listeners.filter((cb) => cb !== callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach((cb) => cb(this.diamonds));
  }

  reset(): void {
    this.diamonds = this.DEFAULT_DIAMONDS;
    this.save();
  }
}
