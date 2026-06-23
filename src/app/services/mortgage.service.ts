import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FormMortgage } from '../models/form-mortgage/form-mortgage.module';

const SESSION_KEY = 'mortgageFormData';

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

  constructor() {
    // Restore data from sessionStorage on startup
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
  }

  setFormData(data: any) {
    this.formData.next(data); // Update form data
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
    this._hasMortgageData.next(true);
  }

  get hasMortgageData(): boolean {
    return this._hasMortgageData.value;
  }

  clearFormData() {
    this.formData.next({});
    sessionStorage.removeItem(SESSION_KEY);
    this._hasMortgageData.next(false);
  }
}
