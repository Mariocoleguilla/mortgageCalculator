import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MortgageService } from 'src/app/services/mortgage.service';

type InputMode = 'installment' | 'manual';

@Component({
  selector: 'app-recurring-simulator',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './recurring-simulator.component.html',
  styleUrls: ['./recurring-simulator.component.sass']
})
export class RecurringSimulatorComponent implements OnInit {

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

  // Recurring extra payment per period
  monthlyExtraPayment: number = 0;

  // Simulation results
  newMonthlyFee: number | null = null;
  newTotalPeriods: number | null = null;
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

    if (data.selectedInstallment) {
      this.selectedInstallment = data.selectedInstallment;
      this.mode = 'installment';
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
    const r = this.interestRate / 100 / this.periodsPerYear;
    const capital = this.manualRemainingCapital ?? this.amount;
    if (r === 0) return capital / this.monthlyFee;
    const val = 1 - (r * capital) / this.monthlyFee;
    if (val <= 0) return 0;
    return -Math.log(val) / Math.log(1 + r);
  }

  calculateSimulation(): void {
    const capital = this.activeCapital;
    if (!capital || capital <= 0 || this.monthlyExtraPayment <= 0) {
      this.clearResults();
      return;
    }

    const remainingPeriods = this.remainingPeriodsBefore;
    const r = this.interestRate / 100 / this.periodsPerYear;

    // Interest without extra payment
    this.interestBefore = (remainingPeriods * this.monthlyFee) - capital;

    // New monthly fee including the extra recurring payment
    this.newMonthlyFee = this.monthlyFee + this.monthlyExtraPayment;

    // New number of periods to pay off the remaining capital
    let newPeriods: number;
    if (r === 0) {
      newPeriods = capital / this.newMonthlyFee;
    } else {
      const val = 1 - (r * capital) / this.newMonthlyFee;
      if (val <= 0) {
        newPeriods = 1;
      } else {
        newPeriods = -Math.log(val) / Math.log(1 + r);
      }
    }

    this.newTotalPeriods = newPeriods;
    this.periodsReduced = remainingPeriods - newPeriods;
    this.interestAfter = (newPeriods * this.newMonthlyFee) - capital;
    this.interestSavings = this.interestBefore - this.interestAfter;
  }

  clearResults(): void {
    this.newMonthlyFee = null;
    this.newTotalPeriods = null;
    this.periodsReduced = null;
    this.interestBefore = null;
    this.interestAfter = null;
    this.interestSavings = null;
  }

  onModeChange(): void {
    this.monthlyExtraPayment = 0;
    this.clearResults();
  }

  onInputChange(): void {
    if (this.monthlyExtraPayment > 0) {
      this.calculateSimulation();
    } else {
      this.clearResults();
    }
  }

  goToTable(): void {
    this.mortgageService.pendingSimulatorRoute = '/recurring-simulator';
    this.router.navigate(['/table']);
  }

  formatAmount(value: number): string {
    return value?.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '';
  }

  goBack(): void {
    this.router.navigate(['/features']);
  }
}
