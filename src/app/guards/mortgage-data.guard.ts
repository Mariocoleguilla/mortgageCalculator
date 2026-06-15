import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MortgageService } from '../services/mortgage.service';

export const mortgageDataGuard: CanActivateFn = () => {
  const mortgageService = inject(MortgageService);
  const router = inject(Router);

  if (mortgageService.hasMortgageData) {
    return true;
  }

  mortgageService.needsMortgageDataWarning = true;
  return router.createUrlTree(['/home']);
};
