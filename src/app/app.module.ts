import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormMortgageComponent } from './components/form-mortgage/form-mortgage.component';
import { MortgageAmortizationTableComponent } from './components/mortgage-amortization-table/mortgage-amortization-table.component';
import { HeaderComponent } from './components/header/header.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { ErrorComponent } from './components/error/error.component';
import { AmortizationSimulatorComponent } from './components/mortgage-amortization-table/amortization-simulator.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { OutstandingMortgageFormComponent } from './components/outstanding-mortgage-form/outstanding-mortgage-form.component';
import { RecurringAmortizationFormComponent } from './components/recurring-amortization-form/recurring-amortization-form.component';
import { RecurringAmortizationSimulatorComponent } from './components/recurring-amortization-simulator/recurring-amortization-simulator.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    NavbarComponent,
    FooterComponent,
    ErrorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    FormMortgageComponent,
    MortgageAmortizationTableComponent,
    AmortizationSimulatorComponent,
    OutstandingMortgageFormComponent,
    RecurringAmortizationFormComponent,
    RecurringAmortizationSimulatorComponent,
    SidebarComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
