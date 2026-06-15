import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MortgageService } from 'src/app/services/mortgage.service';

@Component({
  selector: 'app-recurring-amortization-simulator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recurring-amortization-simulator.component.html',
  styleUrls: ['./recurring-amortization-simulator.component.sass']
})
export class RecurringAmortizationSimulatorComponent implements OnInit {
  formData: any;
  originalMonthlyFee: number | null = null;
  newMonthlyFee: number | null = null;
  originalTotalPayments: number | null = null;
  newTotalPayments: number | null = null;
  originalTotalInterest: number | null = null;
  newTotalInterest: number | null = null;
  interestSavings: number | null = null;
  periodsReduced: number | null = null;

  constructor(private mortgageService: MortgageService, public router: Router) { }

  ngOnInit(): void {
    const data = this.mortgageService.formData.value;
    if (data && data.remainingCapital && data.monthlyExtraPayment !== undefined) {
      this.formData = data;
      this.calculateRecurringSimulation();
    } else {
      this.router.navigate(['/']);
    }
  }

calculateRecurringSimulation(): void {
    const principal = this.formData.remainingCapital;
    const annualRate = this.formData.interestRate;
    const years = this.formData.remainingYears;
    const months = this.formData.remainingMonths;
    const periodsPerYear = this.formData.periodsPerYear;
    const monthlyExtraPayment = this.formData.monthlyExtraPayment;

    const totalOriginalPeriods = (years * periodsPerYear) + months;
    const ratePerPeriod = annualRate / 100 / periodsPerYear;

    let localOriginalMonthlyFee: number;

    if (ratePerPeriod === 0) {
      localOriginalMonthlyFee = principal / totalOriginalPeriods;
    } else {
      localOriginalMonthlyFee = (principal * ratePerPeriod * Math.pow(1 + ratePerPeriod, totalOriginalPeriods)) / (Math.pow(1 + ratePerPeriod, totalOriginalPeriods) - 1);
    }

    this.originalMonthlyFee = localOriginalMonthlyFee;
    this.originalTotalPayments = totalOriginalPeriods;
    
    const localOriginalTotalInterest = (localOriginalMonthlyFee * totalOriginalPeriods) - principal;
    this.originalTotalInterest = localOriginalTotalInterest;

    const localNewMonthlyFee = localOriginalMonthlyFee + monthlyExtraPayment;
    this.newMonthlyFee = localNewMonthlyFee;

    const numerator = Math.log(localNewMonthlyFee / (localNewMonthlyFee - principal * ratePerPeriod));
    const denominator = Math.log(1 + ratePerPeriod);
    
    const localNewTotalPayments = numerator / denominator;
    this.newTotalPayments = localNewTotalPayments;

    const localNewTotalInterest = (localNewMonthlyFee * localNewTotalPayments) - principal;
    this.newTotalInterest = localNewTotalInterest;

    this.periodsReduced = totalOriginalPeriods - localNewTotalPayments;
    this.interestSavings = localOriginalTotalInterest - localNewTotalInterest;
  }

  goBack(): void {
    this.router.navigate(['/recurring-amortization-form']);
  }
}