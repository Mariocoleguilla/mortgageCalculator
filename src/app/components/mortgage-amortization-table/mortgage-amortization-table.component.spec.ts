import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { MortgageAmortizationTableComponent } from './mortgage-amortization-table.component';
import { MortgageService } from 'src/app/services/mortgage.service';
import { clearAppStorage, provideFirebaseFakes, SAMPLE_MORTGAGE } from 'src/testing/test-providers';

describe('MortgageAmortizationTableComponent', () => {
  let component: MortgageAmortizationTableComponent;
  let fixture: ComponentFixture<MortgageAmortizationTableComponent>;
  let mortgageService: MortgageService;
  let router: Router;
  let el: HTMLElement;

  async function setup(data: any = SAMPLE_MORTGAGE): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [MortgageAmortizationTableComponent],
      providers: [provideRouter([]), ...provideFirebaseFakes()],
    }).compileComponents();

    mortgageService = TestBed.inject(MortgageService);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    if (data) {
      mortgageService.setFormData(data);
    }
    fixture = TestBed.createComponent(MortgageAmortizationTableComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  }

  beforeEach(() => clearAppStorage());
  afterEach(() => clearAppStorage());

  describe('calculatePMT', () => {
    beforeEach(() => setup());

    it('should match the standard annuity formula', () => {
      expect(component.calculatePMT(180000, 2.5, 30, 12)).toBeCloseTo(711.22, 2);
      expect(component.calculatePMT(100000, 3, 25, 12)).toBeCloseTo(474.21, 2);
    });

    it('should split the principal evenly when the rate is 0 %', () => {
      expect(component.calculatePMT(120000, 0, 10, 12)).toBe(1000);
    });
  });

  it('should redirect home when there is no mortgage data', async () => {
    await setup(null);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
    expect(component.tableData.length).toBe(0);
  });

  it('should build one row per payment and fully repay the loan', async () => {
    await setup();
    const rows = component.tableData;

    expect(rows.length).toBe(360);
    expect(rows[0].fees).toBeCloseTo(375, 2); // 180.000 × 2,5 % / 12
    expect(rows[0].capital + rows[0].fees).toBeCloseTo(component.monthlyFee!, 6);
    expect(rows[rows.length - 1].remainingCapital).toBeCloseTo(0, 2);
    expect(rows[rows.length - 1].amortization).toBeCloseTo(180000, 2);
  });

  it('should compute totals consistent with the rows', async () => {
    await setup();
    const interestSum = component.tableData.reduce((s, r) => s + r.fees, 0);

    expect(component.totalFees).toBeCloseTo(interestSum, 6);
    expect(component.totalFees).toBeCloseTo(76038.34, 0);
    expect(component.totalPaid).toBeCloseTo(256038.34, 0);
    expect(component.capitalShare).toBeCloseTo(70.3, 1);
  });

  it('should aggregate rows by year', async () => {
    await setup();
    const years = component.yearlyData;

    expect(years.length).toBe(30);
    expect(years.reduce((s, y) => s + y.interest, 0)).toBeCloseTo(component.totalFees, 6);
    expect(years.reduce((s, y) => s + y.capital, 0)).toBeCloseTo(180000, 2);
    expect(years[0].remainingCapital).toBeCloseTo(component.tableData[11].remainingCapital, 6);
    expect(years[29].paidPercent).toBeCloseTo(100, 4);
  });

  it('should support quarterly payments', async () => {
    await setup({ ...SAMPLE_MORTGAGE, periodsPerYear: 4 });
    expect(component.tableData.length).toBe(120);
    expect(component.yearlyData.length).toBe(30);
    expect(component.periodLabel).toBe('trimestral');
  });

  it('should switch between per-payment and per-year views', async () => {
    await setup();
    expect(el.querySelectorAll('tbody tr').length).toBe(360);

    component.setView('year');
    fixture.detectChanges();
    expect(el.querySelectorAll('tbody tr').length).toBe(30);
  });

  it('should select an installment and open the simulator on row click', async () => {
    await setup();
    (el.querySelector('tbody tr:nth-child(3)') as HTMLElement).click();

    expect(mortgageService.selectedInstallment.value.period).toBe(3);
    expect(router.navigate).toHaveBeenCalledWith(['/simulator']);
  });

  it('should highlight the currently selected installment', async () => {
    await setup();
    mortgageService.setSelectedInstallment(component.tableData[9]);
    fixture.detectChanges();

    expect(el.querySelector('#period-10')?.classList).toContain('selected');
  });

  it('should export the table as a CSV download', async () => {
    await setup();
    let blob: Blob | undefined;
    spyOn(URL, 'createObjectURL').and.callFake((b: Blob | MediaSource) => { blob = b as Blob; return 'blob:test'; });
    spyOn(URL, 'revokeObjectURL');
    const click = spyOn(HTMLAnchorElement.prototype, 'click');

    component.exportCsv();

    expect(click).toHaveBeenCalled();
    const lines = (await blob!.text()).replace('﻿', '').split('\r\n');
    expect(lines.length).toBe(361);
    expect(lines[0]).toContain('Nº cuota');
    expect(lines[1]).toBe('1;711,22;375,00;336,22;336,22;179663,78');
  });
});
