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
  isDarkMode = false;
  private sub!: Subscription;

  constructor(
    private mortgageService: MortgageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.isDarkMode = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    this.updateTheme();

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

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.updateTheme();
  }

  private updateTheme(): void {
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
