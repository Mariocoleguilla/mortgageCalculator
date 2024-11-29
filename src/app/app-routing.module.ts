import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormMortgageComponent } from './components/form-mortgage/form-mortgage.component';
import { ErrorComponent } from './components/error/error.component';
import { MortgageAmortizationTableComponent } from './components/mortgage-amortization-table/mortgage-amortization-table.component';

const routes: Routes = [
  {
    path: 'home',
    component: FormMortgageComponent
  },
  {
    path: 'table',
    component: MortgageAmortizationTableComponent
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
