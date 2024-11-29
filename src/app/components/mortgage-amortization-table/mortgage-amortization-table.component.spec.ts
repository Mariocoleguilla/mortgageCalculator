import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MortgageAmortizationTableComponent } from './mortgage-amortization-table.component';

describe('MortgageAmortizationTableComponent', () => {
  let component: MortgageAmortizationTableComponent;
  let fixture: ComponentFixture<MortgageAmortizationTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MortgageAmortizationTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MortgageAmortizationTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
