import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormMortgage } from 'src/app/models/form-mortgage/form-mortgage.module';
import { MortgageService } from 'src/app/services/mortgage.service';
import { CurrencyService } from 'src/app/services/currency.service';
import { CurrencyConvertPipe } from 'src/app/pipes/currency-convert.pipe';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';

interface AmortizationRow {
  period: number;
  monthlyFee: number;
  fees: number;
  capital: number;
  amortization: number;
  remainingCapital: number;
}

interface YearRow {
  year: number;
  interest: number;
  capital: number;
  paidPercent: number;
  remainingCapital: number;
}

type TableView = 'period' | 'year';

@Component({
    selector: 'app-mortgage-amortization-table',
    standalone: true,
    imports: [CommonModule, CurrencyConvertPipe, BackButtonComponent],
    templateUrl: './mortgage-amortization-table.component.html',
    styleUrls: ['./mortgage-amortization-table.component.sass']
})
export class MortgageAmortizationTableComponent implements OnDestroy {

  formData: any;
  monthlyFee: number | null = null;
  tableData: AmortizationRow[] = [];
  yearlyData: YearRow[] = [];
  totalFees: number = 0;
  periodsPerYear = 12;
  view: TableView = 'period';
  selectedPeriod: number | null = null;
  private installmentSub?: Subscription;

  constructor(
    private mortgageService: MortgageService,
    private currencyService: CurrencyService,
    private router: Router
  ) {
    const data = this.mortgageService.formData.value;
    if (data && Object.keys(data).length) {
      this.formData = data;
      this.periodsPerYear = data.periodsPerYear || 12;
      this.fillMortgageTable(this.formData);
      this.buildYearlyData();
    } else {
      this.router.navigate(["/"]);
    }
    this.installmentSub = this.mortgageService.selectedInstallment$.subscribe(inst => {
      this.selectedPeriod = inst?.period ?? null;
    });
  }

  ngOnDestroy(): void {
    this.installmentSub?.unsubscribe();
  }

  get totalPaid(): number {
    return (this.formData?.amount ?? 0) + this.totalFees;
  }

  /** Share of the total paid that goes to capital (0–100). */
  get capitalShare(): number {
    return this.totalPaid > 0 ? (this.formData.amount / this.totalPaid) * 100 : 0;
  }

  get periodLabel(): string {
    switch (this.periodsPerYear) {
      case 12: return 'mensual';
      case 4: return 'trimestral';
      case 2: return 'semestral';
      case 1: return 'anual';
      default: return 'por periodo';
    }
  }

  setView(view: TableView): void {
    this.view = view;
  }

  goToYear(year: number): void {
    this.view = 'period';
    const firstPeriod = (year - 1) * this.periodsPerYear + 1;
    // Wait for the monthly table to render before scrolling
    setTimeout(() => {
      document.getElementById('period-' + firstPeriod)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  onRowClick(row: AmortizationRow): void {
    const destination = this.mortgageService.pendingSimulatorRoute;
    this.mortgageService.pendingSimulatorRoute = '/simulator'; // reset to default
    this.mortgageService.setSelectedInstallment(row);
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
          // Avoid showing "-0,00" on the last row due to floating point drift
          remainingCapital: Math.abs(remainingCapital) < 0.005 ? 0 : remainingCapital
        });
        period++;
      }
    }
  }

  buildYearlyData(): void {
    this.yearlyData = [];
    const amount = this.formData.amount;
    for (let i = 0; i < this.tableData.length; i += this.periodsPerYear) {
      const rows = this.tableData.slice(i, i + this.periodsPerYear);
      const last = rows[rows.length - 1];
      this.yearlyData.push({
        year: i / this.periodsPerYear + 1,
        interest: rows.reduce((sum, r) => sum + r.fees, 0),
        capital: rows.reduce((sum, r) => sum + r.capital, 0),
        paidPercent: amount > 0 ? (last.amortization / amount) * 100 : 0,
        remainingCapital: last.remainingCapital,
      });
    }
  }

  /** Downloads the table (in the selected currency) as a CSV that opens correctly in Excel. */
  exportCsv(): void {
    const rate = this.currencyService.exchangeRate;
    const code = this.currencyService.currentCurrency.code;
    const fmt = (n: number) => (n * rate).toFixed(2).replace('.', ',');
    let lines: string[];

    if (this.view === 'year') {
      lines = [
        `Año;Interés (${code});Capital (${code});% Amortizado;Capital pendiente (${code})`,
        ...this.yearlyData.map(y =>
          [y.year, fmt(y.interest), fmt(y.capital), y.paidPercent.toFixed(2).replace('.', ','), fmt(y.remainingCapital)].join(';'))
      ];
    } else {
      lines = [
        `Nº cuota;Cuota (${code});Interés (${code});Capital (${code});Amortizado (${code});Capital pendiente (${code})`,
        ...this.tableData.map(r =>
          [r.period, fmt(r.monthlyFee), fmt(r.fees), fmt(r.capital), fmt(r.amortization), fmt(r.remainingCapital)].join(';'))
      ];
    }

    // BOM so Excel detects UTF-8 (accents, currency symbols)
    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.view === 'year' ? 'amortizacion-anual.csv' : 'amortizacion.csv';
    a.click();
    URL.revokeObjectURL(url);
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
