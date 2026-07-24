import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-back-button',
  standalone: true,
  template: `
    <button class="back-btn" (click)="goBack()">← Volver a las herramientas</button>
  `,
  styles: [`
    .back-btn
      padding: 0.65rem 1.25rem
      background: var(--card-light-bg)
      border: 1px solid var(--border-color)
      border-radius: 8px
      font-size: 0.9rem
      font-weight: 600
      color: var(--text-main)
      cursor: pointer
      transition: all 0.2s
      font-family: inherit

      &:hover
        background: var(--hover-bg)
        border-color: var(--text-muted)
  `]
})
export class BackButtonComponent {
  constructor(private router: Router) { }

  goBack(): void {
    this.router.navigate(['/features']);
  }
}
