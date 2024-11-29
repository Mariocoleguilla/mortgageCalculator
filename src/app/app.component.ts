import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  
  mortgageForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.mortgageForm = this.fb.group({
      years: [null, [Validators.required, Validators.min(1)]], // Minimum 1 year
      interestRate: [null, [Validators.required, Validators.min(0), Validators.max(100)]], // TIN as a percentage
      amount: [null, [Validators.required, Validators.min(1000)]], // Minimum amount to finance
    });
  }
}
