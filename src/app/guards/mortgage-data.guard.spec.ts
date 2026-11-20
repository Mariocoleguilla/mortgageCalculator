import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { mortgageDataGuard } from './mortgage-data.guard';
import { MortgageService } from '../services/mortgage.service';
import { clearAppStorage, provideFirebaseFakes, SAMPLE_MORTGAGE } from 'src/testing/test-providers';

describe('mortgageDataGuard', () => {
  let service: MortgageService;
  const run = () => TestBed.runInInjectionContext(() =>
    mortgageDataGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));

  beforeEach(() => {
    clearAppStorage();
    TestBed.configureTestingModule({ providers: [provideRouter([]), ...provideFirebaseFakes()] });
    service = TestBed.inject(MortgageService);
  });

  afterEach(() => clearAppStorage());

  it('should allow navigation when there is mortgage data', () => {
    service.setFormData(SAMPLE_MORTGAGE);
    expect(run()).toBeTrue();
  });

  it('should redirect to /home and flag the warning when there is no data', () => {
    let warning = false;
    service.needsMortgageDataWarning$.subscribe(v => warning = v);

    const result = run();

    expect(result instanceof UrlTree).toBeTrue();
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/home');
    expect(warning).toBeTrue();
  });
});
