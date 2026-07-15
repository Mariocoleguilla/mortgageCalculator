import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'USD', name: 'Dólar estadounidense', symbol: '$', flag: '🇺🇸' },
  { code: 'GBP', name: 'Libra esterlina', symbol: '£', flag: '🇬🇧' },
  { code: 'CHF', name: 'Franco suizo', symbol: 'Fr', flag: '🇨🇭' },
  { code: 'JPY', name: 'Yen japonés', symbol: '¥', flag: '🇯🇵' },
  { code: 'MXN', name: 'Peso mexicano', symbol: '$', flag: '🇲🇽' },
  { code: 'BRL', name: 'Real brasileño', symbol: 'R$', flag: '🇧🇷' },
  { code: 'COP', name: 'Peso colombiano', symbol: '$', flag: '🇨🇴' },
];

interface CachedRate {
  rate: number;
  timestamp: number; // ms epoch
}

const LS_KEY_CURRENCY = 'mc_selectedCurrency';
const LS_KEY_RATES    = 'mc_exchangeRates';
const CACHE_TTL_MS    = 60 * 60 * 1000; // 1 hour
const FRANKFURTER_API = 'https://api.frankfurter.dev/v2';

@Injectable({ providedIn: 'root' })
export class CurrencyService {

  private _selectedCurrency = new BehaviorSubject<Currency>(SUPPORTED_CURRENCIES[0]);
  selectedCurrency$ = this._selectedCurrency.asObservable();

  private _exchangeRate = new BehaviorSubject<number>(1);
  exchangeRate$ = this._exchangeRate.asObservable();

  private _isLoading = new BehaviorSubject<boolean>(false);
  isLoading$ = this._isLoading.asObservable();

  private _error = new BehaviorSubject<string | null>(null);
  error$ = this._error.asObservable();

  /** In-memory cache of fetched rates. Also backed by localStorage. */
  private rateCache = new Map<string, CachedRate>();

  constructor() {
    // EUR→EUR always 1, never expires
    this.rateCache.set('EUR', { rate: 1, timestamp: Infinity });

    // Load persisted rate cache from localStorage
    this._loadCacheFromStorage();

    // Restore the last selected currency (persisted across full browser sessions)
    const savedCode = localStorage.getItem(LS_KEY_CURRENCY);
    if (savedCode) {
      const found = SUPPORTED_CURRENCIES.find(c => c.code === savedCode);
      if (found && found.code !== 'EUR') {
        // Apply cached rate immediately if fresh, then re-fetch to refresh
        this._applyFromCache(found) || this.changeCurrency(found.code);
        return;
      }
    }
  }

  // ──────────────── Public API ────────────────

  get currentCurrency(): Currency { return this._selectedCurrency.value; }
  get exchangeRate(): number       { return this._exchangeRate.value; }

  /** Convert a value stored in EUR to the active display currency */
  convert(eurValue: number): number {
    return eurValue * this._exchangeRate.value;
  }

  /** Convert a value in the active currency back to EUR */
  convertToBase(currencyValue: number): number {
    const rate = this._exchangeRate.value;
    return rate === 0 ? currencyValue : currencyValue / rate;
  }

  async changeCurrency(code: string): Promise<void> {
    const found = SUPPORTED_CURRENCIES.find(c => c.code === code);
    if (!found) return;
    if (found.code === this._selectedCurrency.value.code) return;

    // Try cache hit (only if fresh)
    if (this._applyFromCache(found)) return;

    // Fetch from Frankfurter API
    this._isLoading.next(true);
    this._error.next(null);

    try {
      const res = await fetch(`${FRANKFURTER_API}/rate/EUR/${code}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const rate: number = data.rate;

      this._saveToCache(code, rate);
      this._selectedCurrency.next(found);
      this._exchangeRate.next(rate);
      localStorage.setItem(LS_KEY_CURRENCY, code);
      this._error.next(null);
    } catch (err) {
      this._error.next(
        `No se pudo obtener el tipo de cambio para ${code}. Se mantiene ${this._selectedCurrency.value.code}.`
      );
    } finally {
      this._isLoading.next(false);
    }
  }

  // ──────────────── Private helpers ────────────────

  /** Apply a currency from cache. Returns true if cache was fresh enough. */
  private _applyFromCache(currency: Currency): boolean {
    const cached = this.rateCache.get(currency.code);
    if (!cached) return false;

    const isEur = currency.code === 'EUR';
    const isFresh = isEur || (Date.now() - cached.timestamp < CACHE_TTL_MS);
    if (!isFresh) return false;

    this._selectedCurrency.next(currency);
    this._exchangeRate.next(cached.rate);
    localStorage.setItem(LS_KEY_CURRENCY, currency.code);
    this._error.next(null);

    // Schedule a background refresh if it's more than 30 min old
    if (!isEur && (Date.now() - cached.timestamp > 30 * 60 * 1000)) {
      this._refreshInBackground(currency.code);
    }

    return true;
  }

  private _saveToCache(code: string, rate: number): void {
    const entry: CachedRate = { rate, timestamp: Date.now() };
    this.rateCache.set(code, entry);
    this._persistCacheToStorage();
  }

  private _persistCacheToStorage(): void {
    const obj: Record<string, CachedRate> = {};
    this.rateCache.forEach((v, k) => {
      if (k !== 'EUR') obj[k] = v;
    });
    try {
      localStorage.setItem(LS_KEY_RATES, JSON.stringify(obj));
    } catch { /* quota exceeded – ignore */ }
  }

  private _loadCacheFromStorage(): void {
    try {
      const raw = localStorage.getItem(LS_KEY_RATES);
      if (!raw) return;
      const obj: Record<string, CachedRate> = JSON.parse(raw);
      Object.entries(obj).forEach(([code, entry]) => {
        if (entry?.rate && entry?.timestamp) {
          this.rateCache.set(code, entry);
        }
      });
    } catch { /* corrupted data – ignore */ }
  }

  private async _refreshInBackground(code: string): Promise<void> {
    try {
      const res = await fetch(`${FRANKFURTER_API}/rate/EUR/${code}`);
      if (!res.ok) return;
      const data = await res.json();
      this._saveToCache(code, data.rate);
      // Only push update if this currency is still active
      if (this._selectedCurrency.value.code === code) {
        this._exchangeRate.next(data.rate);
      }
    } catch { /* silent */ }
  }
}
