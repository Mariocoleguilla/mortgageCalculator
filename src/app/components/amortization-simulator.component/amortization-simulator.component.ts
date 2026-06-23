import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MortgageService } from 'src/app/services/mortgage.service';

type InputMode = 'installment' | 'manual';

@Component({
  selector: 'app-amortization-simulator',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './amortization-simulator.component.html',
  styleUrls: ['./amortization-simulator.component.sass']
})
export class AmortizationSimulatorComponent implements OnInit {

  // Base mortgage data
  amount: number = 0;
  interestRate: number = 0;
  years: number = 0;
  periodsPerYear: number = 12;
  monthlyFee: number = 0;
  totalPeriods: number = 0;
  totalInterest: number = 0;

  // Input mode
  mode: InputMode = 'manual';

  // Installment mode (from table click)
  selectedInstallment: any = null;

  // Manual mode
  manualRemainingCapital: number | null = null;
  formattedManualCapital: string = '';

  // Extra payment (shared by both modes)
  extraPayment: number = 0;
  formattedExtraPayment: string = '';

  // Computed simulation results
  periodsReduced: number | null = null;
  interestBefore: number | null = null;
  interestAfter: number | null = null;
  interestSavings: number | null = null;

  constructor(private mortgageService: MortgageService, private router: Router) {}

  ngOnInit(): void {
    const data = this.mortgageService.formData.value;

    if (!data || !data.amount) {
      this.router.navigate(['/home']);
      return;
    }

    this.amount = data.amount;
    this.interestRate = data.interestRate;
    this.years = data.years;
    this.periodsPerYear = data.periodsPerYear ?? 12;
    this.computeBaseValues();

    // If arrived from a table row click, pre-select installment mode
    if (data.selectedInstallment) {
      this.selectedInstallment = data.selectedInstallment;
      this.mode = 'installment';
      // Clear the selectedInstallment from the service so navigating back doesn't re-trigger
      const { selectedInstallment, ...rest } = data;
      this.mortgageService.setFormData(rest);
    }
  }

  computeBaseValues(): void {
    this.totalPeriods = this.years * this.periodsPerYear;
    const r = this.interestRate / 100 / this.periodsPerYear;
    this.monthlyFee = r === 0
      ? this.amount / this.totalPeriods
      : (this.amount * r * Math.pow(1 + r, this.totalPeriods)) / (Math.pow(1 + r, this.totalPeriods) - 1);
    this.totalInterest = this.monthlyFee * this.totalPeriods - this.amount;
  }

  get activeCapital(): number {
    if (this.mode === 'installment' && this.selectedInstallment) {
      return this.selectedInstallment.remainingCapital;
    }
    return this.manualRemainingCapital ?? this.amount;
  }

  get remainingPeriodsBefore(): number {
    if (this.mode === 'installment' && this.selectedInstallment) {
      return this.totalPeriods - this.selectedInstallment.period;
    }
    // Estimate remaining periods from manual capital using the same monthly fee
    const r = this.interestRate / 100 / this.periodsPerYear;
    const capital = this.manualRemainingCapital ?? this.amount;
    if (r === 0) return capital / this.monthlyFee;
    const val = 1 - (r * capital) / this.monthlyFee;
    if (val <= 0) return 0;
    return -Math.log(val) / Math.log(1 + r);
  }

  calculateSimulation(): void {
    const capital = this.activeCapital;
    if (!capital || capital <= 0) { this.clearResults(); return; }

    const remainingPeriods = this.remainingPeriodsBefore;
    const r = this.interestRate / 100 / this.periodsPerYear;

    this.interestBefore = (remainingPeriods * this.monthlyFee) - capital;

    const remainingAfterExtra = capital - this.extraPayment;

    if (remainingAfterExtra <= 0) {
      this.periodsReduced = remainingPeriods;
      this.interestAfter = 0;
      this.interestSavings = this.interestBefore;
      return;
    }

    let newPeriods: number;
    if (r === 0) {
      newPeriods = remainingAfterExtra / this.monthlyFee;
    } else {
      const val = 1 - (r * remainingAfterExtra) / this.monthlyFee;
      if (val <= 0) { newPeriods = 0; }
      else newPeriods = -Math.log(val) / Math.log(1 + r);
    }

    this.interestAfter = newPeriods * this.monthlyFee - remainingAfterExtra;
    this.periodsReduced = remainingPeriods - newPeriods;
    this.interestSavings = this.interestBefore - this.interestAfter;
  }

  clearResults(): void {
    this.periodsReduced = null;
    this.interestBefore = null;
    this.interestAfter = null;
    this.interestSavings = null;
  }

  onModeChange(): void {
    this.extraPayment = 0;
    this.formattedExtraPayment = '';
    this.manualRemainingCapital = null;
    this.formattedManualCapital = '';
    this.clearResults();
  }

  formatNumber(value: number | string): string {
    if (value === null || value === undefined || value === '') return '';
    const cleanValue = value.toString().replace(/\D/g, '');
    if (!cleanValue) return '';
    return Number(cleanValue).toLocaleString('de-DE');
  }

  handleNumericInput(event: any, callback: (numericValue: number) => void): string {
    const inputElement = event.target;
    const originalValue = inputElement.value;
    const selectionStart = inputElement.selectionStart;

    const cleanVal = originalValue.replace(/\D/g, '');
    const numericValue = cleanVal ? parseInt(cleanVal, 10) : 0;

    callback(numericValue);

    const formatted = this.formatNumber(cleanVal);
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
    return formatted;
  }

  onManualCapitalInput(event: any): void {
    this.formattedManualCapital = this.handleNumericInput(event, (val) => {
      this.manualRemainingCapital = val || null;
    });
    this.runSimulation();
  }

  onExtraPaymentInput(event: any): void {
    this.formattedExtraPayment = this.handleNumericInput(event, (val) => {
      this.extraPayment = val;
    });
    this.runSimulation();
  }

  runSimulation(): void {
    if (this.extraPayment > 0) {
      this.calculateSimulation();
    } else {
      this.clearResults();
    }
  }

  formatAmount(value: number): string {
    return value?.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '';
  }

  goToTable(): void {
    this.mortgageService.pendingSimulatorRoute = '/simulator';
    this.router.navigate(['/table']);
  }

  goBack(): void {
    this.router.navigate(['/features']);
  }
}