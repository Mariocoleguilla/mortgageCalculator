import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { MortgageService } from 'src/app/services/mortgage.service';
import { CurrencyService } from 'src/app/services/currency.service';
import { CurrencyConvertPipe } from 'src/app/pipes/currency-convert.pipe';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';

@Component({
  selector: 'app-savings-calculator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, CurrencyConvertPipe, BackButtonComponent],
  templateUrl: './savings-calculator.component.html',
  styleUrls: ['./savings-calculator.component.sass']
})
export class SavingsCalculatorComponent implements OnInit, OnDestroy {
  savingsForm!: FormGroup;
  private formSubscription!: Subscription;

  // Mortgage details
  mortgageAmount: number = 0;
  interestRate: number = 0;
  years: number = 0;
  periodsPerYear: number = 12;
  monthlyMortgagePayment: number = 0;

  // View state
  isAnnualView: boolean = false;

  // Results
  monthlySalary: number = 0;
  totalMonthlyExpenses: number = 0;
  monthlySavings: number = 0;
  savingsPercentage: number = 0;

  // Prorated parts
  monthlySupplies: number = 0;
  monthlyTaxesInsurance: number = 0;

  // Financial health ratios
  mortgageToIncomeRatio: number = 0;

  private currencySub!: Subscription;
  private previousRate = 1;

  constructor(
    private fb: FormBuilder,
    private mortgageService: MortgageService,
    private currencyService: CurrencyService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 1. Get mortgage data
    const mData = this.mortgageService.formData.value;
    if (!mData || !mData.amount) {
      this.router.navigate(['/home']);
      return;
    }

    this.mortgageAmount = mData.amount;
    this.interestRate = mData.interestRate;
    this.years = mData.years;
    this.periodsPerYear = mData.periodsPerYear ?? 12;

    this.calculateMortgagePayment();

    // 2. Initialize Form
    this.savingsForm = this.fb.group({
      monthlySalary: [null, [Validators.required, Validators.min(0)]],
      community: [null, [Validators.min(0)]],
      electricity: [null, [Validators.min(0)]],
      gas: [null, [Validators.min(0)]],
      water: [null, [Validators.min(0)]],
      internet: [null, [Validators.min(0)]],
      homeInsurance: [null, [Validators.min(0)]],
      ibi: [null, [Validators.min(0)]],
      garbage: [null, [Validators.min(0)]]
    });

    // 3. Load saved data if exists
    const saved = this.mortgageService.savingsData.value;
    if (saved) {
      const rate = this.currencyService.exchangeRate;
      const currencyData: any = {};
      Object.keys(saved).forEach(key => {
        const val = saved[key];
        if (val !== null && val !== undefined) {
          currencyData[key] = Math.round(val * rate);
        }
      });
      this.savingsForm.patchValue(currencyData, { emitEvent: false });
    }

    this.previousRate = this.currencyService.exchangeRate;

    // 4. Calculate initially
    this.updateCalculations();

    // 5. Watch form changes
    this.formSubscription = this.savingsForm.valueChanges.subscribe(() => {
      this.updateCalculations();
    });

    // 6. Watch currency changes
    this.currencySub = this.currencyService.exchangeRate$.subscribe(newRate => {
      if (newRate === this.previousRate) return;

      const formValues = this.savingsForm.value;
      const updatedValues: any = {};

      Object.keys(formValues).forEach(key => {
        const val = formValues[key];
        if (val !== null && val !== undefined) {
          updatedValues[key] = Math.round((val / this.previousRate) * newRate);
        }
      });

      this.previousRate = newRate;
      this.savingsForm.patchValue(updatedValues, { emitEvent: false });
      this.updateCalculations();
    });
  }

  ngOnDestroy(): void {
    if (this.formSubscription) {
      this.formSubscription.unsubscribe();
    }
    if (this.currencySub) {
      this.currencySub.unsubscribe();
    }
  }

  calculateMortgagePayment(): void {
    const totalPeriods = this.years * this.periodsPerYear;
    const r = this.interestRate / 100 / this.periodsPerYear;

    const installment = r === 0
      ? this.mortgageAmount / totalPeriods
      : (this.mortgageAmount * r * Math.pow(1 + r, totalPeriods)) / (Math.pow(1 + r, totalPeriods) - 1);

    // Standardize to monthly fee if periods are not 12
    this.monthlyMortgagePayment = installment * (this.periodsPerYear / 12);
  }

  updateCalculations(): void {
    const formVal = this.savingsForm.value;
    const rate = this.currencyService.exchangeRate;

    this.monthlySalary = (formVal.monthlySalary || 0) / rate;

    const comm = (formVal.community || 0) / rate;
    const elec = (formVal.electricity || 0) / rate;
    const gas = (formVal.gas || 0) / rate;
    const water = (formVal.water || 0) / rate;
    const net = (formVal.internet || 0) / rate;

    const ins = (formVal.homeInsurance || 0) / rate;
    const ibiVal = (formVal.ibi || 0) / rate;
    const garb = (formVal.garbage || 0) / rate;

    // Prorated monthly expenses (in EUR)
    this.monthlySupplies = comm + elec + gas + water + net;
    this.monthlyTaxesInsurance = (ins + ibiVal + garb) / 12;

    // Total monthly expenses (in EUR)
    this.totalMonthlyExpenses = this.monthlyMortgagePayment + this.monthlySupplies + this.monthlyTaxesInsurance;

    // Monthly savings (in EUR)
    this.monthlySavings = this.monthlySalary - this.totalMonthlyExpenses;

    // Ratios
    this.savingsPercentage = this.monthlySalary > 0
      ? (this.monthlySavings / this.monthlySalary) * 100
      : 0;

    this.mortgageToIncomeRatio = this.monthlySalary > 0
      ? (this.monthlyMortgagePayment / this.monthlySalary) * 100
      : 0;

    // Save EUR values to persistent store
    const eurData = {
      monthlySalary: this.monthlySalary,
      community: comm,
      electricity: elec,
      gas: gas,
      water: water,
      internet: net,
      homeInsurance: ins,
      ibi: ibiVal,
      garbage: garb
    };
    this.mortgageService.setSavingsData(eurData);
  }

  toggleViewMode(isAnnual: boolean): void {
    this.isAnnualView = isAnnual;
  }

  // Helper getters for UI representation
  get displaySalary(): number {
    return this.isAnnualView ? this.monthlySalary * 12 : this.monthlySalary;
  }

  get displayMortgage(): number {
    return this.isAnnualView ? this.monthlyMortgagePayment * 12 : this.monthlyMortgagePayment;
  }

  get displaySupplies(): number {
    return this.isAnnualView ? this.monthlySupplies * 12 : this.monthlySupplies;
  }

  get displayTaxesInsurance(): number {
    return this.isAnnualView ? this.monthlyTaxesInsurance * 12 : this.monthlyTaxesInsurance;
  }

  get displayTotalExpenses(): number {
    return this.isAnnualView ? this.totalMonthlyExpenses * 12 : this.totalMonthlyExpenses;
  }

  get displaySavings(): number {
    return this.isAnnualView ? this.monthlySavings * 12 : this.monthlySavings;
  }

  get absoluteDisplaySavings(): number {
    return Math.abs(this.displaySavings);
  }

  formatAmount(value: number): string {
    return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  get currencySymbol(): string {
    return this.currencyService.currentCurrency.symbol;
  }
}
