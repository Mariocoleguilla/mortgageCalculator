import { Component } from '@angular/core';
import { UntypedFormGroup, FormControl, Validators, UntypedFormBuilder } from '@angular/forms';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.sass'],
    standalone: false
})
export class AppComponent {
  
  mortgageForm: UntypedFormGroup;

  constructor(private fb: UntypedFormBuilder) {
    this.mortgageForm = this.fb.group({
      years: [null, [Validators.required, Validators.min(1)]], // Minimum 1 year
      interestRate: [null, [Validators.required, Validators.min(0), Validators.max(100)]], // TIN as a percentage
      amount: [null, [Validators.required, Validators.min(1000)]], // Minimum amount to finance
    });
  }
}
