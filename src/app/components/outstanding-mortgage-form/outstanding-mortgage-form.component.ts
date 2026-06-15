import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MortgageService } from 'src/app/services/mortgage.service';

@Component({
  selector: 'app-outstanding-mortgage-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './outstanding-mortgage-form.component.html',
  styleUrls: ['./outstanding-mortgage-form.component.sass']
})
export class OutstandingMortgageFormComponent {
  outstandingMortgageForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private mortgageService: MortgageService
  ) {
    this.outstandingMortgageForm = this.fb.group({
      remainingCapital: [null, [Validators.required, Validators.min(1000)]],
      remainingYears: [null, [Validators.required, Validators.min(0)]],
      remainingMonths: [null, [Validators.required, Validators.min(0), Validators.max(11)]],
      interestRate: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      periodsPerYear: [12, [Validators.required, Validators.min(1)]], // Assuming 12 periods per year for simplicity
    });
  }

  submitForm(): void {
    const formData = this.outstandingMortgageForm.value;
    const totalRemainingYears = formData.remainingYears + (formData.remainingMonths / 12);
    this.mortgageService.setFormData({ amount: formData.remainingCapital, years: totalRemainingYears, interestRate: formData.interestRate, periodsPerYear: formData.periodsPerYear });
    this.router.navigate(['/simulator']);
  }
}