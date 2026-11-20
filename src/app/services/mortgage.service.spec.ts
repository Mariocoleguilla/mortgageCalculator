import { TestBed } from '@angular/core/testing';
import { MortgageService } from './mortgage.service';
import { AuthService } from './auth.service';
import { DbService } from './db.service';
import { clearAppStorage, FakeAuthService, FakeDbService, provideFirebaseFakes, SAMPLE_MORTGAGE } from 'src/testing/test-providers';

describe('MortgageService', () => {
  let service: MortgageService;
  let auth: FakeAuthService;
  let db: FakeDbService;

  function createService(): void {
    TestBed.configureTestingModule({ providers: provideFirebaseFakes() });
    service = TestBed.inject(MortgageService);
    auth = TestBed.inject(AuthService) as unknown as FakeAuthService;
    db = TestBed.inject(DbService) as unknown as FakeDbService;
  }

  beforeEach(() => clearAppStorage());
  afterEach(() => clearAppStorage());

  it('should start without mortgage data', () => {
    createService();
    expect(service.hasMortgageData).toBeFalse();
    expect(service.formData.value).toEqual({});
  });

  it('should store form data in memory and in sessionStorage', () => {
    createService();
    service.setFormData(SAMPLE_MORTGAGE);

    expect(service.hasMortgageData).toBeTrue();
    expect(service.formData.value).toEqual(SAMPLE_MORTGAGE);
    expect(JSON.parse(sessionStorage.getItem('mortgageFormData')!)).toEqual(SAMPLE_MORTGAGE);
  });

  it('should restore form data saved in a previous session', () => {
    sessionStorage.setItem('mortgageFormData', JSON.stringify(SAMPLE_MORTGAGE));
    createService();

    expect(service.hasMortgageData).toBeTrue();
    expect(service.formData.value).toEqual(SAMPLE_MORTGAGE);
  });

  it('should discard corrupted session data', () => {
    sessionStorage.setItem('mortgageFormData', '{not json');
    createService();

    expect(service.hasMortgageData).toBeFalse();
    expect(sessionStorage.getItem('mortgageFormData')).toBeNull();
  });

  it('should not sync to the cloud when nobody is logged in', () => {
    createService();
    service.setFormData(SAMPLE_MORTGAGE);
    expect(db.saveMortgageData).not.toHaveBeenCalled();
  });

  it('should sync to the cloud when a user is logged in', () => {
    createService();
    auth.setUser({ uid: 'u1' });
    service.setFormData(SAMPLE_MORTGAGE);
    expect(db.saveMortgageData).toHaveBeenCalledWith('u1', SAMPLE_MORTGAGE);
  });

  it('should load cloud data after login', async () => {
    createService();
    db.cloudData = { mortgage: SAMPLE_MORTGAGE, savings: { monthlySalary: 2000 } };
    auth.setUser({ uid: 'u1' });
    await db.getUserData.calls.mostRecent().returnValue;
    await Promise.resolve();

    expect(service.formData.value).toEqual(SAMPLE_MORTGAGE);
    expect(service.hasMortgageData).toBeTrue();
    expect(service.savingsData.value).toEqual({ monthlySalary: 2000 });
  });

  it('should persist and clear the selected installment', () => {
    createService();
    const row = { period: 12, remainingCapital: 175000 };

    service.setSelectedInstallment(row);
    expect(service.selectedInstallment.value).toEqual(row);
    expect(sessionStorage.getItem('mortgageSelectedInstallment')).not.toBeNull();

    service.clearSelectedInstallment();
    expect(service.selectedInstallment.value).toBeNull();
    expect(sessionStorage.getItem('mortgageSelectedInstallment')).toBeNull();
  });

  it('should wipe everything on clearFormData', () => {
    createService();
    service.setFormData(SAMPLE_MORTGAGE);
    service.setSelectedInstallment({ period: 1 });
    service.setSavingsData({ monthlySalary: 2000 });

    service.clearFormData();

    expect(service.hasMortgageData).toBeFalse();
    expect(service.formData.value).toEqual({});
    expect(service.selectedInstallment.value).toBeNull();
    expect(service.savingsData.value).toBeNull();
    expect(sessionStorage.length).toBe(0);
  });
});
