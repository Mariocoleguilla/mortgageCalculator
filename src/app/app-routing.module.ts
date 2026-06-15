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
import { mortgageDataGuard } from './guards/mortgage-data.guard';

const routes: Routes = [
  {
    path: 'home',
    component: FormMortgageComponent
  },
  {
    path: 'features',
    component: FeaturesComponent
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
    component: RecurringAmortizationSimulatorComponent,
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
