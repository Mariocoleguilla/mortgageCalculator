import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { FormMortgageComponent } from './form-mortgage.component';
import { MortgageService } from 'src/app/services/mortgage.service';
import { clearAppStorage, provideFirebaseFakes, SAMPLE_MORTGAGE } from 'src/testing/test-providers';

describe('FormMortgageComponent', () => {
  let component: FormMortgageComponent;
  let fixture: ComponentFixture<FormMortgageComponent>;
  let mortgageService: MortgageService;
  let el: HTMLElement;

  async function setup(): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [FormMortgageComponent],
      providers: [provideRouter([]), ...provideFirebaseFakes()],
    }).compileComponents();

    mortgageService = TestBed.inject(MortgageService);
    fixture = TestBed.createComponent(FormMortgageComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  }

  function typeAmount(value: string): void {
    const input = el.querySelector('#amount') as HTMLInputElement;
    input.value = value;
    input.setSelectionRange(value.length, value.length);
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  beforeEach(() => clearAppStorage());
  afterEach(() => clearAppStorage());

  it('should create with an invalid, empty form', async () => {
    await setup();
    expect(component).toBeTruthy();
    expect(component.mortgageForm.invalid).toBeTrue();
    expect((el.querySelector('#submit-mortgage-form') as HTMLButtonElement).disabled).toBeTrue();
  });

  it('should format the amount with thousand separators as the user types', async () => {
    await setup();
    typeAmount('180000');
    expect((el.querySelector('#amount') as HTMLInputElement).value).toBe('180.000');
    expect(component.mortgageForm.value.amount).toBe(180000);
  });

  it('should reject amounts under 1.000', async () => {
    await setup();
    typeAmount('500');
    expect(component.mortgageForm.get('amount')?.hasError('min')).toBeTrue();
    expect(el.querySelector('.field-error')?.textContent).toContain('1.000');
  });

  it('should show a live payment preview once the form is complete', async () => {
    await setup();
    expect(component.previewPayment).toBeNull();
    expect(el.querySelector('.payment-preview')).toBeNull();

    component.mortgageForm.patchValue(SAMPLE_MORTGAGE);
    fixture.detectChanges();

    expect(component.previewPayment).toBeCloseTo(711.22, 2);
    expect(component.previewInterest).toBeCloseTo(76038.34, 0);
    expect(el.querySelector('.payment-preview')?.textContent).toContain('711,22');
  });

  it('should select the payment frequency from the segmented control', async () => {
    await setup();
    const quarterly = Array.from(el.querySelectorAll<HTMLButtonElement>('.segmented-control button'))
      .find(b => b.textContent?.includes('Trimestral'))!;

    quarterly.click();
    fixture.detectChanges();

    expect(component.mortgageForm.value.periodsPerYear).toBe(4);
    expect(quarterly.classList).toContain('active');
  });

  it('should save the mortgage and navigate to the features page on submit', async () => {
    await setup();
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    component.mortgageForm.patchValue(SAMPLE_MORTGAGE);
    fixture.detectChanges();

    (el.querySelector('#submit-mortgage-form') as HTMLButtonElement).click();

    expect(mortgageService.formData.value).toEqual(SAMPLE_MORTGAGE);
    expect(navigate).toHaveBeenCalledWith(['/features']);
  });

  it('should prefill the form with previously saved data', async () => {
    sessionStorage.setItem('mortgageFormData', JSON.stringify(SAMPLE_MORTGAGE));
    await setup();
    expect(component.mortgageForm.value).toEqual(SAMPLE_MORTGAGE);
    expect(component.formattedAmount).toBe('180.000');
  });

  it('should show the warning when redirected from a protected route', async () => {
    await setup();
    mortgageService.setNeedsMortgageDataWarning(true);
    fixture.detectChanges();
    expect(el.querySelector('.warning-banner')).toBeTruthy();
  });
});
