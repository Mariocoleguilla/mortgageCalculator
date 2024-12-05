import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormMortgage } from 'src/app/models/form-mortgage/form-mortgage.module';
import { MortgageService } from 'src/app/services/mortgage.service';

@Component({
  selector: 'app-mortgage-amortization-table',
  templateUrl: './mortgage-amortization-table.component.html',
  styleUrls: ['./mortgage-amortization-table.component.sass']
})
export class MortgageAmortizationTableComponent implements OnInit {

  formData: any;
  monthlyFee: number | null = null;
  tableData: any[] = [];
  totalFees: number = 0;

  constructor(
    private activatedRoute: ActivatedRoute,
    private mortgageService: MortgageService,
    private router: Router
  ) {
    this.mortgageService.formData$.subscribe((data) => {
      if (Object.keys(data).length) {
        this.formData = data;
        this.fillMortgageTable(this.formData);
      } else {
        this.router.navigate(["/home"]);
      }
    });
  }

  ngOnInit(): void {
  }

  fillMortgageTable(formData: FormMortgage): void {
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
  
    const numerator = ratePerPeriod * Math.pow(1 + ratePerPeriod, totalPayments);
    const denominator = Math.pow(1 + ratePerPeriod, totalPayments) - 1;
  
    return principal * numerator / denominator;
  }
}
