import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MortgageService } from 'src/app/services/mortgage.service';

@Component({
  selector: 'app-recurring-amortization-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recurring-amortization-form.component.html',
  styleUrls: ['./recurring-amortization-form.component.sass']
})
export class RecurringAmortizationFormComponent {
  recurringAmortizationForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private mortgageService: MortgageService
  ) {
    this.recurringAmortizationForm = this.fb.group({
      remainingCapital: [null, [Validators.required, Validators.min(1000)]],
      remainingYears: [null, [Validators.required, Validators.min(0)]],
      remainingMonths: [null, [Validators.required, Validators.min(0), Validators.max(11)]],
      interestRate: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      periodsPerYear: [12, [Validators.required, Validators.min(1)]],
      monthlyExtraPayment: [null, [Validators.required, Validators.min(1)]], // New field for recurring extra payment
    });
  }

  submitForm(): void {
    const formData = this.recurringAmortizationForm.value;
    this.mortgageService.setFormData(formData);
    this.router.navigate(['/recurring-simulator']);
  }
}