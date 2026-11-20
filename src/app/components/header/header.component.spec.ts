import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { provideRouter, Router } from '@angular/router';
import { HeaderComponent } from './header.component';
import { CurrencyConvertPipe } from 'src/app/pipes/currency-convert.pipe';
import { MortgageService } from 'src/app/services/mortgage.service';
import { clearAppStorage, provideFirebaseFakes, SAMPLE_MORTGAGE } from 'src/testing/test-providers';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mortgageService: MortgageService;
  let el: HTMLElement;

  beforeEach(async () => {
    clearAppStorage();
    document.documentElement.classList.remove('dark');

    await TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      imports: [FormsModule, CurrencyConvertPipe],
      providers: [provideRouter([]), ...provideFirebaseFakes()],
    }).compileComponents();

    mortgageService = TestBed.inject(MortgageService);
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    clearAppStorage();
    document.documentElement.classList.remove('dark');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not show the mortgage summary without data', () => {
    expect(el.querySelector('.mortgage-summary')).toBeNull();
  });

  it('should show the mortgage summary once data is set', () => {
    mortgageService.setFormData(SAMPLE_MORTGAGE);
    fixture.detectChanges();

    const summary = el.querySelector('.mortgage-summary')!;
    expect(summary).toBeTruthy();
    expect(summary.textContent).toContain('180.000,00');
    expect(summary.textContent).toContain('2.5%');
    expect(summary.textContent).toContain('30 años');
  });

  it('should show the selected installment chip', () => {
    mortgageService.setSelectedInstallment({ period: 24, remainingCapital: 170000 });
    fixture.detectChanges();
    expect(el.querySelector('.installment-summary')?.textContent).toContain('#24');
  });

  it('should clear the mortgage and go home from the summary × button', () => {
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    mortgageService.setFormData(SAMPLE_MORTGAGE);
    fixture.detectChanges();

    (el.querySelector('.mortgage-summary .clear-mortgage-btn') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(mortgageService.hasMortgageData).toBeFalse();
    expect(el.querySelector('.mortgage-summary')).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should toggle dark mode and remember the choice', () => {
    component.toggleTheme();
    expect(document.documentElement.classList.contains('dark')).toBe(component.isDarkMode);
    expect(localStorage.getItem('theme')).toBe(component.isDarkMode ? 'dark' : 'light');

    const before = component.isDarkMode;
    component.toggleTheme();
    expect(component.isDarkMode).toBe(!before);
  });
});
