import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormMortgage } from 'src/app/models/form-mortgage/form-mortgage.module';
import { MortgageService } from 'src/app/services/mortgage.service';

@Component({
    selector: 'app-mortgage-amortization-table',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './mortgage-amortization-table.component.html',
    styleUrls: ['./mortgage-amortization-table.component.sass']
})
export class MortgageAmortizationTableComponent {

  formData: any;
  monthlyFee: number | null = null;
  tableData: any[] = [];
  totalFees: number = 0;

  constructor(
    private mortgageService: MortgageService,
    private router: Router
  ) {
    const data = this.mortgageService.formData.value;
    if (data && Object.keys(data).length) {
      this.formData = data;
      this.fillMortgageTable(this.formData);
    } else {
      this.router.navigate(["/"]);
    }
  }

  onRowClick(row: any): void {
    const destination = this.mortgageService.pendingSimulatorRoute;
    this.mortgageService.pendingSimulatorRoute = '/simulator'; // reset to default
    this.mortgageService.setFormData({ ...this.formData, selectedInstallment: row });
    this.router.navigate([destination]);
  }

  fillMortgageTable(formData: FormMortgage): void {
    this.tableData = [];
    this.totalFees = 0;
    let period: number = 1;
    this.monthlyFee = this.calculatePMT(formData.amount, formData.interestRate, formData.years, formData.periodsPerYear);
    
    let amortization: number = 0;
    let remainingCapital: number = formData.amount;
    let fees: number = 0;

    for (let i = 0; i < formData.years; i++) {
      for (let j = 0; j < formData.periodsPerYear; j++) {
        fees = ((remainingCapital*formData.interestRate)/formData.periodsPerYear)/100;
        this.totalFees += fees;
        amortization += this.monthlyFee - fees;
        remainingCapital = remainingCapital - (this.monthlyFee - fees);
        this.tableData.push({
          period: period,
          monthlyFee: this.monthlyFee,
          fees: fees,
          capital: this.monthlyFee - fees,
          amortization: amortization,
          remainingCapital: remainingCapital
        });
        period++;
      }
    }
  }

  calculatePMT(principal: number, annualRate: number, years: number, paymentsPerYear: number): number {
    const ratePerPeriod = annualRate / 100 / paymentsPerYear;  // Tasa de interés por periodo
    const totalPayments = years * paymentsPerYear;             // Total de pagos
  
    // Si la tasa es 0 (sin interés), se calcula el pago dividiendo el principal entre los periodos
    if (ratePerPeriod === 0) {
      return principal / totalPayments;
    }

    return (principal * ratePerPeriod * Math.pow(1 + ratePerPeriod, totalPayments)) / (Math.pow(1 + ratePerPeriod, totalPayments) - 1);
  }
}