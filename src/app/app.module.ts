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
    AmortizationSimulatorComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
