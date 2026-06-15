import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MortgageService } from 'src/app/services/mortgage.service';

@Component({
    selector: 'app-form-mortgage',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './form-mortgage.component.html',
    styleUrls: ['./form-mortgage.component.sass']
})
export class FormMortgageComponent implements OnInit {

  mortgageForm: FormGroup;
  formattedAmount: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private mortgageService: MortgageService
  ) {
    this.mortgageForm = this.fb.group({
      amount: [138400, [Validators.required, Validators.min(1000)]], // Minimum amount to finance
      interestRate: [2.45, [Validators.required, Validators.min(0), Validators.max(100)]], // TIN as a percentage
      years: [25, [Validators.required, Validators.min(1)]], // Minimum 1 year
      periodsPerYear: [12, [Validators.required, Validators.min(1)]], // Minimum 1 period
    });
  }

  ngOnInit(): void {
    const initialAmount = this.mortgageForm.get('amount')?.value;
    if (initialAmount) {
      this.formattedAmount = this.formatNumber(initialAmount);
    }
  }

  formatNumber(value: number | string): string {
    if (value === null || value === undefined || value === '') return '';
    const cleanValue = value.toString().replace(/\D/g, '');
    if (!cleanValue) return '';
    return Number(cleanValue).toLocaleString('de-DE'); // 'de-DE' uses dots for thousands separation
  }

  onAmountInput(event: any): void {
    const inputElement = event.target;
    const originalValue = inputElement.value;
    const selectionStart = inputElement.selectionStart;

    const cleanVal = originalValue.replace(/\D/g, '');
    const numericValue = cleanVal ? parseInt(cleanVal, 10) : null;

    this.mortgageForm.patchValue({ amount: numericValue }, { emitEvent: false });
    this.mortgageForm.get('amount')?.markAsTouched();

    const formatted = this.formatNumber(cleanVal);
    this.formattedAmount = formatted;
    inputElement.value = formatted;

    let digitsBeforeCursor = 0;
    for (let i = 0; i < selectionStart; i++) {
      if (/\d/.test(originalValue[i])) {
        digitsBeforeCursor++;
      }
    }

    let newCursorPosition = 0;
    let digitsCount = 0;
    while (digitsCount < digitsBeforeCursor && newCursorPosition < formatted.length) {
      if (/\d/.test(formatted[newCursorPosition])) {
        digitsCount++;
      }
      newCursorPosition++;
    }

    inputElement.setSelectionRange(newCursorPosition, newCursorPosition);
  }

  onAmountBlur(): void {
    this.mortgageForm.get('amount')?.markAsTouched();
  }

  submitForm(): void {
    const formData = this.mortgageForm.value;
    this.mortgageService.setFormData(formData);
    this.router.navigate(["table"]);
  }
}
