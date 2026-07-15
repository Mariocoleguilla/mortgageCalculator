import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';
import { DbService } from './db.service';

const SESSION_KEY = 'mortgageFormData';
const SESSION_KEY_INSTALLMENT = 'mortgageSelectedInstallment';
const SESSION_KEY_SAVINGS = 'mortgageSavingsData';

@Injectable({
  providedIn: 'root'
})
export class MortgageService {

  private _hasMortgageData = new BehaviorSubject<boolean>(false);
  hasMortgageData$ = this._hasMortgageData.asObservable();

  // Subject to show a warning when redirected from a protected route
  private _needsMortgageDataWarning = new BehaviorSubject<boolean>(false);
  needsMortgageDataWarning$ = this._needsMortgageDataWarning.asObservable();

  setNeedsMortgageDataWarning(value: boolean) {
    this._needsMortgageDataWarning.next(value);
  }

  // Which simulator to navigate to when the user selects a table row
  // 'one-time' → /simulator | 'recurring' → /recurring-simulator | null → /simulator (default)
  pendingSimulatorRoute: '/simulator' | '/recurring-simulator' = '/simulator';

  public formData = new BehaviorSubject<any>({}); // Initial data
  formData$ = this.formData.asObservable(); // Public Observable

  // Persistently selected installment (from amortization table row click)
  public selectedInstallment = new BehaviorSubject<any>(null);
  selectedInstallment$ = this.selectedInstallment.asObservable();

  // Persistently saved savings calculator data
  public savingsData = new BehaviorSubject<any>(null);
  savingsData$ = this.savingsData.asObservable();

  constructor(
    private authService: AuthService,
    private dbService: DbService
  ) {
    // Restore mortgage data from sessionStorage on startup
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.formData.next(parsed);
        this._hasMortgageData.next(true);
      } catch {
        sessionStorage.removeItem(SESSION_KEY);
      }
    }

    // Restore selected installment from sessionStorage on startup
    const savedInstallment = sessionStorage.getItem(SESSION_KEY_INSTALLMENT);
    if (savedInstallment) {
      try {
        this.selectedInstallment.next(JSON.parse(savedInstallment));
      } catch {
        sessionStorage.removeItem(SESSION_KEY_INSTALLMENT);
      }
    }

    // Restore savings data from sessionStorage on startup
    const savedSavings = sessionStorage.getItem(SESSION_KEY_SAVINGS);
    if (savedSavings) {
      try {
        this.savingsData.next(JSON.parse(savedSavings));
      } catch {
        sessionStorage.removeItem(SESSION_KEY_SAVINGS);
      }
    }

    // Sync Firestore data when user authentication state changes
    this.authService.user$.subscribe(async (user) => {
      if (user) {
        // Logged in!
        const cloudData = await this.dbService.getUserData(user.uid);
        if (cloudData) {
          if (cloudData.mortgage && cloudData.mortgage.amount) {
            this.formData.next(cloudData.mortgage);
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(cloudData.mortgage));
            this._hasMortgageData.next(true);
          } else if (this.formData.value && this.formData.value.amount) {
            // Firestore is empty but local has data, upload it
            await this.dbService.saveMortgageData(user.uid, this.formData.value);
          }

          if (cloudData.savings) {
            this.savingsData.next(cloudData.savings);
            sessionStorage.setItem(SESSION_KEY_SAVINGS, JSON.stringify(cloudData.savings));
          } else if (this.savingsData.value) {
            // Firestore is empty but local has data, upload it
            await this.dbService.saveSavingsData(user.uid, this.savingsData.value);
          }
        }
      }
    });
  }

  setFormData(data: any) {
    this.formData.next(data); // Update form data
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
    this._hasMortgageData.next(true);

    const user = this.authService.currentUser;
    if (user) {
      this.dbService.saveMortgageData(user.uid, data);
    }
  }

  get hasMortgageData(): boolean {
    return this._hasMortgageData.value;
  }

  clearFormData() {
    this.clearLocalData();
    const user = this.authService.currentUser;
    if (user) {
      this.dbService.saveMortgageData(user.uid, {});
      this.dbService.saveSavingsData(user.uid, null);
    }
  }

  setSelectedInstallment(installment: any) {
    this.selectedInstallment.next(installment);
    sessionStorage.setItem(SESSION_KEY_INSTALLMENT, JSON.stringify(installment));
  }

  clearSelectedInstallment() {
    this.selectedInstallment.next(null);
    sessionStorage.removeItem(SESSION_KEY_INSTALLMENT);
  }

  setSavingsData(data: any) {
    this.savingsData.next(data);
    sessionStorage.setItem(SESSION_KEY_SAVINGS, JSON.stringify(data));

    const user = this.authService.currentUser;
    if (user) {
      this.dbService.saveSavingsData(user.uid, data);
    }
  }

  clearSavingsData() {
    this.savingsData.next(null);
    sessionStorage.removeItem(SESSION_KEY_SAVINGS);
    
    const user = this.authService.currentUser;
    if (user) {
      this.dbService.saveSavingsData(user.uid, null);
    }
  }

  clearLocalData() {
    this.formData.next({});
    sessionStorage.removeItem(SESSION_KEY);
    this._hasMortgageData.next(false);
    this.clearSelectedInstallment();
    this.savingsData.next(null);
    sessionStorage.removeItem(SESSION_KEY_SAVINGS);
  }
}
