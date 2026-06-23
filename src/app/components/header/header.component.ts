import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MortgageService } from 'src/app/services/mortgage.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.sass'],
    standalone: false
})
export class HeaderComponent implements OnInit, OnDestroy {
  mortgageData: any = null;
  private sub!: Subscription;

  constructor(
    private mortgageService: MortgageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sub = this.mortgageService.formData$.subscribe(data => {
      this.mortgageData = data && data.amount ? data : null;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }

  clearMortgage(event: Event): void {
    event.stopPropagation();
    this.mortgageService.clearFormData();
    this.router.navigate(['/home']);
  }

  formatAmount(amount: number): string {
    return amount?.toLocaleString('de-DE') ?? '';
  }
}
