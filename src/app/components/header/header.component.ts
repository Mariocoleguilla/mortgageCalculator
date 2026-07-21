import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MortgageService } from 'src/app/services/mortgage.service';
import { CurrencyService, Currency, SUPPORTED_CURRENCIES } from 'src/app/services/currency.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.sass'],
    standalone: false
})
export class HeaderComponent implements OnInit, OnDestroy {
  mortgageData: any = null;
  selectedInstallment: any = null;
  isDarkMode = false;
  private sub!: Subscription;
  private installmentSub!: Subscription;

  // Currency state
  readonly currencies: Currency[] = SUPPORTED_CURRENCIES;
  selectedCurrencyCode: string = 'EUR';
  isLoadingCurrency = false;
  currencyError: string | null = null;
  private currencySub!: Subscription;
  private loadingSub!: Subscription;
  private errorSub!: Subscription;

  constructor(
    private mortgageService: MortgageService,
    private currencyService: CurrencyService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.isDarkMode = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    this.updateTheme();

    this.sub = this.mortgageService.formData$.subscribe(data => {
      this.mortgageData = data && data.amount ? data : null;
    });

    this.installmentSub = this.mortgageService.selectedInstallment$.subscribe(inst => {
      this.selectedInstallment = inst;
    });

    // Currency subscriptions
    this.currencySub = this.currencyService.selectedCurrency$.subscribe(c => {
      this.selectedCurrencyCode = c.code;
    });
    this.loadingSub = this.currencyService.isLoading$.subscribe(l => {
      this.isLoadingCurrency = l;
    });
    this.errorSub = this.currencyService.error$.subscribe(e => {
      this.currencyError = e;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.installmentSub?.unsubscribe();
    this.currencySub?.unsubscribe();
    this.loadingSub?.unsubscribe();
    this.errorSub?.unsubscribe();
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }

  clearMortgage(event: Event): void {
    event.stopPropagation();
    this.mortgageService.clearFormData();
    this.router.navigate(['/home']);
  }

  clearInstallment(event: Event): void {
    event.stopPropagation();
    this.mortgageService.clearSelectedInstallment();
  }

  formatAmount(amount: number): string {
    return amount?.toLocaleString('de-DE') ?? '';
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.updateTheme();
  }

  onCurrencyChange(event: Event): void {
    const code = (event.target as HTMLSelectElement).value;
    this.selectedCurrencyCode = code;
    this.currencyService.changeCurrency(code);
  }

  private updateTheme(): void {
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
