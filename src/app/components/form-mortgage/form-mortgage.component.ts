import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MortgageService } from 'src/app/services/mortgage.service';
import { CurrencyService } from 'src/app/services/currency.service';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';
import { CurrencyConvertPipe } from 'src/app/pipes/currency-convert.pipe';

@Component({
    selector: 'app-form-mortgage',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, CurrencyConvertPipe],
    templateUrl: './form-mortgage.component.html',
    styleUrls: ['./form-mortgage.component.sass']
})
export class FormMortgageComponent implements OnInit, OnDestroy {

  mortgageForm: FormGroup;
  formattedAmount: string = '';
  showWarning = false;
  user: any = null;
  private warningSubscription!: Subscription;
  private currencySub!: Subscription;
  private authSub!: Subscription;
  private hasMortgageDataSub!: Subscription;
  private previousRate = 1;

  readonly periodOptions = [
    { value: 12, label: 'Mensual' },
    { value: 4, label: 'Trimestral' },
    { value: 2, label: 'Semestral' },
    { value: 1, label: 'Anual' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private mortgageService: MortgageService,
    private currencyService: CurrencyService,
    private authService: AuthService
  ) {
    this.mortgageForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(1000)]],
      interestRate: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      years: [null, [Validators.required, Validators.min(1)]],
      periodsPerYear: [12, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit(): void {
    // Show warning if redirected from a protected route
    this.warningSubscription = this.mortgageService.needsMortgageDataWarning$.subscribe(show => {
      if (show) {
        this.showWarning = true;
        this.mortgageService.setNeedsMortgageDataWarning(false);
      }
    });

    this.authSub = this.authService.user$.subscribe(u => {
      this.user = u;
      // When a logged-in user already has mortgage data (loaded from local cache
      // or just synced from Firestore), skip this page and go straight to features.
      if (u && this.mortgageService.hasMortgageData) {
        this.router.navigate(['/features']);
        return;
      }
    });

    // Also react when Firestore finishes loading the data asynchronously
    // (the user object may already be set but data arrives moments later)
    this.hasMortgageDataSub = this.mortgageService.hasMortgageData$.subscribe(hasMortgage => {
      if (hasMortgage && this.authService.currentUser) {
        this.router.navigate(['/features']);
        return;
      }
    });

    // Load existing data from session if available
    const existing = this.mortgageService.formData.value;
    const rate = this.currencyService.exchangeRate;
    if (existing && existing.amount) {
      const amountInCurrency = Math.round(existing.amount * rate);
      this.mortgageForm.patchValue({
        amount: amountInCurrency,
        interestRate: existing.interestRate,
        years: existing.years,
        periodsPerYear: existing.periodsPerYear ?? 12,
      });
      this.formattedAmount = this.formatNumber(amountInCurrency);
    }

    this.previousRate = rate;

    // Listen to currency changes to convert the typed amount in real-time
    this.currencySub = this.currencyService.exchangeRate$.subscribe(newRate => {
      if (newRate === this.previousRate) return;

      const currentAmount = this.mortgageForm.get('amount')?.value;
      if (currentAmount) {
        const newAmount = Math.round((currentAmount / this.previousRate) * newRate);
        this.mortgageForm.patchValue({ amount: newAmount }, { emitEvent: false });
        this.formattedAmount = this.formatNumber(newAmount);
      }
      this.previousRate = newRate;
    });
  }

  formatNumber(value: number | string): string {
    if (value === null || value === undefined || value === '') return '';
    const cleanValue = value.toString().replace(/\D/g, '');
    if (!cleanValue) return '';
    return Number(cleanValue).toLocaleString('de-DE');
  }

  onAmountInput(event: any): void {
    const inputElement = event.target;
    const originalValue = inputElement.value;
    const selectionStart = inputElement.selectionStart;

    const cleanVal = originalValue.replace(/\D/g, '');
    const numericValue = cleanVal ? parseInt(cleanVal, 10) : null;

    this.mortgageForm.patchValue({ amount: numericValue }, { emitEvent: false });
    this.mortgageForm.get('amount')?.markAsTouched();

    const formatted = this.formatNumber(cleanVal);
    this.formattedAmount = formatted;
    inputElement.value = formatted;

    let digitsBeforeCursor = 0;
    for (let i = 0; i < selectionStart; i++) {
      if (/\d/.test(originalValue[i])) {
        digitsBeforeCursor++;
      }
    }

    let newCursorPosition = 0;
    let digitsCount = 0;
    while (digitsCount < digitsBeforeCursor && newCursorPosition < formatted.length) {
      if (/\d/.test(formatted[newCursorPosition])) {
        digitsCount++;
      }
      newCursorPosition++;
    }

    inputElement.setSelectionRange(newCursorPosition, newCursorPosition);
  }

  onAmountBlur(): void {
    this.mortgageForm.get('amount')?.markAsTouched();
  }

  submitForm(): void {
    const formData = { ...this.mortgageForm.value };
    if (formData.amount) {
      // Convert user input in active currency back to base EUR
      formData.amount = this.currencyService.convertToBase(formData.amount);
    }
    this.mortgageService.setFormData(formData);
    this.router.navigate(['/features']);
  }

  ngOnDestroy(): void {
    this.warningSubscription?.unsubscribe();
    this.currencySub?.unsubscribe();
    this.authSub?.unsubscribe();
    this.hasMortgageDataSub?.unsubscribe();
  }

  async login(): Promise<void> {
    try {
      await this.authService.loginWithGoogle();
      // On success, redirect to features if we have mortgage data loaded
      if (this.mortgageService.hasMortgageData) {
        this.router.navigate(['/features']);
      }
    } catch (err) {
      console.error('Login error from mortgage form:', err);
    }
  }

  /** Payment per period in base currency (EUR), or null while the form is incomplete. */
  get previewPayment(): number | null {
    const { amount, interestRate, years, periodsPerYear } = this.mortgageForm.value;
    if (!amount || amount < 1000 || interestRate === null || interestRate < 0 || !years || years < 1 || !periodsPerYear) {
      return null;
    }
    const principal = this.currencyService.convertToBase(amount);
    const n = years * periodsPerYear;
    const r = interestRate / 100 / periodsPerYear;
    return r === 0 ? principal / n : (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  get previewTotal(): number | null {
    const p = this.previewPayment;
    if (p === null) return null;
    const { years, periodsPerYear } = this.mortgageForm.value;
    return p * years * periodsPerYear;
  }

  get previewInterest(): number | null {
    const total = this.previewTotal;
    return total === null ? null : total - this.currencyService.convertToBase(this.mortgageForm.value.amount);
  }

  get currencySymbol(): string {
    return this.currencyService.currentCurrency.symbol;
  }

  get currencyCode(): string {
    return this.currencyService.currentCurrency.code;
  }
}
