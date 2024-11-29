import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FormMortgage } from '../models/form-mortgage/form-mortgage.module';

@Injectable({
  providedIn: 'root'
})
export class MortgageService {

  constructor() { }
  
  private formData = new BehaviorSubject<any>({}); // Initial data
  formData$ = this.formData.asObservable(); // Public Observable

  setFormData(data: any) {
    this.formData.next(data); // Update form data
  }
}
