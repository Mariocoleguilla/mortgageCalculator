import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MortgageService } from 'src/app/services/mortgage.service';

@Component({
  selector: 'app-form-mortgage',
  templateUrl: './form-mortgage.component.html',
  styleUrls: ['./form-mortgage.component.sass']
})
export class FormMortgageComponent implements OnInit {

  mortgageForm: FormGroup;

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
  }

  submitForm(): void {
    const formData = this.mortgageForm.value;
    this.mortgageService.setFormData(formData);
    this.router.navigate(["table"]);
  }
}
