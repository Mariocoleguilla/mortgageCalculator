import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormMortgageComponent } from './components/form-mortgage/form-mortgage.component';
import { ErrorComponent } from './components/error/error.component';
import { MortgageAmortizationTableComponent } from './components/mortgage-amortization-table/mortgage-amortization-table.component';
import { AmortizationSimulatorComponent } from './components/amortization-simulator.component/amortization-simulator.component';
import { OutstandingMortgageFormComponent } from './components/outstanding-mortgage-form/outstanding-mortgage-form.component';
import { RecurringAmortizationFormComponent } from './components/recurring-amortization-form/recurring-amortization-form.component';
import { RecurringAmortizationSimulatorComponent } from './components/recurring-amortization-simulator/recurring-amortization-simulator.component';
import { FeaturesComponent } from './components/features/features.component';
import { RecurringSimulatorComponent } from './components/recurring-simulator/recurring-simulator.component';
import { mortgageDataGuard } from './guards/mortgage-data.guard';
import { SavingsCalculatorComponent } from './components/savings-calculator/savings-calculator.component';

const routes: Routes = [
  {
    path: 'home',
    component: FormMortgageComponent
  },
  {
    path: 'features',
    component: FeaturesComponent,
    canActivate: [mortgageDataGuard]
  },
  {
    path: 'table',
    component: MortgageAmortizationTableComponent,
    canActivate: [mortgageDataGuard]
  },
  {
    path: 'simulator',
    component: AmortizationSimulatorComponent,
    canActivate: [mortgageDataGuard]
  },
  {
    path: 'outstanding-mortgage-form',
    component: OutstandingMortgageFormComponent,
    canActivate: [mortgageDataGuard]
  },
  {
    path: 'recurring-amortization-form',
    component: RecurringAmortizationFormComponent,
    canActivate: [mortgageDataGuard]
  },
  {
    path: 'recurring-simulator',
    component: RecurringSimulatorComponent,
    canActivate: [mortgageDataGuard]
  },
  {
    path: 'recurring-amortization-simulator',
    component: RecurringAmortizationSimulatorComponent,
    canActivate: [mortgageDataGuard]
  },
  {
    path: 'savings-calculator',
    component: SavingsCalculatorComponent,
    canActivate: [mortgageDataGuard]
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  },
  {
    path: '**',
    component: ErrorComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
