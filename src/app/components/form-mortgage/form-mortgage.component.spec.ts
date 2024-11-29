import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormMortgageComponent } from './form-mortgage.component';

describe('FormMortgageComponent', () => {
  let component: FormMortgageComponent;
  let fixture: ComponentFixture<FormMortgageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormMortgageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormMortgageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
