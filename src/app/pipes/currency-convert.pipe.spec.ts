import { CurrencyConvertPipe } from './currency-convert.pipe';
import { CurrencyService, SUPPORTED_CURRENCIES } from '../services/currency.service';

describe('CurrencyConvertPipe', () => {
  let rate = 1;
  let currency = SUPPORTED_CURRENCIES[0];
  const fakeCurrencyService = {
    get exchangeRate() { return rate; },
    get currentCurrency() { return currency; },
  } as unknown as CurrencyService;
  const pipe = new CurrencyConvertPipe(fakeCurrencyService);
  const byCode = (code: string) => SUPPORTED_CURRENCIES.find(c => c.code === code)!;

  beforeEach(() => {
    rate = 1;
    currency = byCode('EUR');
  });

  it('should format euros with Spanish separators and a non-breaking space', () => {
    expect(pipe.transform(180000)).toBe('180.000,00 €');
  });

  it('should honour a custom number of decimals', () => {
    expect(pipe.transform(1234.567, 0)).toBe('1.235 €');
  });

  it('should convert using the active exchange rate', () => {
    rate = 1.1;
    currency = byCode('USD');
    expect(pipe.transform(100)).toBe('110,00 $');
  });

  it('should never show decimals for JPY', () => {
    rate = 160;
    currency = byCode('JPY');
    expect(pipe.transform(10)).toBe('1.600 ¥');
  });

  it('should render a dash for missing values', () => {
    expect(pipe.transform(null)).toBe('—');
    expect(pipe.transform(undefined)).toBe('—');
    expect(pipe.transform(NaN)).toBe('—');
  });
});
