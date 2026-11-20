import { Provider } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { DbService } from 'src/app/services/db.service';

/**
 * In-memory replacement for AuthService so unit tests never talk to Firebase.
 * Use `setUser()` to simulate a login.
 */
export class FakeAuthService {
  private _user = new BehaviorSubject<any | null>(null);
  user$ = this._user.asObservable();
  isMockMode = true;

  get currentUser(): any {
    return this._user.value;
  }

  setUser(user: any | null): void {
    this._user.next(user);
  }

  loginWithGoogle = jasmine.createSpy('loginWithGoogle').and.callFake(async () => {
    this._user.next({ uid: 'test-user', displayName: 'Test', email: 'test@example.com' });
  });

  logout = jasmine.createSpy('logout').and.callFake(async () => {
    this._user.next(null);
  });
}

/** In-memory replacement for DbService (Firestore). */
export class FakeDbService {
  cloudData: any = null;
  getUserData = jasmine.createSpy('getUserData').and.callFake(async () => this.cloudData);
  saveMortgageData = jasmine.createSpy('saveMortgageData').and.resolveTo();
  saveSavingsData = jasmine.createSpy('saveSavingsData').and.resolveTo();
}

/** Providers that isolate a test from Firebase. */
export function provideFirebaseFakes(): Provider[] {
  return [
    { provide: AuthService, useClass: FakeAuthService },
    { provide: DbService, useClass: FakeDbService },
  ];
}

/** Clears every piece of browser storage the app uses, so tests don't leak state. */
export function clearAppStorage(): void {
  sessionStorage.clear();
  localStorage.clear();
}

/** Standard mortgage used across specs: 180.000 € at 2,5 % over 30 years, monthly. */
export const SAMPLE_MORTGAGE = { amount: 180000, interestRate: 2.5, years: 30, periodsPerYear: 12 };
