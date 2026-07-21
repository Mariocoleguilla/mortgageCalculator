import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyService } from '../services/currency.service';

/**
 * Pipe that converts a numeric value from EUR to the currently selected
 * currency and formats it with the currency symbol.
 *
 * Usage: {{ 1500 | currencyConvert }}
 * With custom decimals: {{ 1500 | currencyConvert:0 }}
 *
 * pure: false — Angular re-runs transform() on every CD cycle so the view
 * always reflects the latest exchange rate without manual subscriptions.
 */
@Pipe({
  name: 'currencyConvert',
  standalone: true,
  pure: false
})
export class CurrencyConvertPipe implements PipeTransform {

  constructor(private currencyService: CurrencyService) {}

  transform(eurValue: number | null | undefined, decimals: number = 2): string {
    if (eurValue === null || eurValue === undefined || isNaN(eurValue)) return '—';

    const rate = this.currencyService.exchangeRate;
    const converted = eurValue * rate;
    const currency = this.currencyService.currentCurrency;

    // JPY and COP: no decimal places by convention
    const usedDecimals = (currency.code === 'JPY' || currency.code === 'COP') ? 0 : decimals;

    const formatted = converted.toLocaleString('de-DE', {
      minimumFractionDigits: usedDecimals,
      maximumFractionDigits: usedDecimals,
    });

    return `${formatted}\u00a0${currency.symbol}`;
  }
}
