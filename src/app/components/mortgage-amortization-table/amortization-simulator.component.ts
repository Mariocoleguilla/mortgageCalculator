import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MortgageService } from 'src/app/services/mortgage.service';

@Component({
  selector: 'app-amortization-simulator',
  templateUrl: './amortization-simulator.component.html',
  styleUrls: ['./amortization-simulator.component.sass']
} )
export class AmortizationSimulatorComponent implements OnInit {
  formData: any;
  extraPayment: number = 0;
  periodsReduced: number | null = null;
  interestBefore: number | null = null;
  interestAfter: number | null = null;
  interestSavings: number | null = null;

  constructor(private mortgageService: MortgageService, private router: Router) { }

  ngOnInit(): void {
    this.mortgageService.formData$.subscribe(data => {
      if (data && data.selectedInstallment) {
        this.formData = data;
      } else {
        this.router.navigate(['/home']);
      }
    });
  }

  calculateSimulation(): void {
    const currentCapital = this.formData.selectedInstallment.remainingCapital;
    const remainingAfterExtra = currentCapital - this.extraPayment;

    const monthlyFee = this.formData.selectedInstallment.monthlyFee;
    const periodsPerYear = this.formData.periodsPerYear;
    const ratePerPeriod = this.formData.interestRate / 100 / periodsPerYear;
    const totalPeriodsRemainingBefore = (this.formData.years * periodsPerYear) - this.formData.selectedInstallment.period;

    // Intereses que quedarían por pagar sin amortización extra
    this.interestBefore = (totalPeriodsRemainingBefore * monthlyFee) - currentCapital;

    if (remainingAfterExtra <= 0) {
      this.periodsReduced = totalPeriodsRemainingBefore;
      this.interestAfter = 0;
      this.interestSavings = this.interestBefore;
      return;
    }

    let newRemainingPeriods: number;
    if (ratePerPeriod === 0) {
      newRemainingPeriods = remainingAfterExtra / monthlyFee;
    } else {
      // Cálculo del número de periodos (n) para amortizar la deuda restante con la misma cuota
      // n = -log(1 - (r * PV) / P) / log(1 + r)
      const val = 1 - (ratePerPeriod * remainingAfterExtra) / monthlyFee;
      newRemainingPeriods = -Math.log(val) / Math.log(1 + ratePerPeriod);
    }

    if (newRemainingPeriods > 0) {
      this.periodsReduced = totalPeriodsRemainingBefore - newRemainingPeriods;
      this.interestAfter = (newRemainingPeriods * monthlyFee) - remainingAfterExtra;
      this.interestSavings = this.interestBefore - this.interestAfter;
    }
  }

  goBack(): void {
    this.router.navigate(['/table']);
  }
}