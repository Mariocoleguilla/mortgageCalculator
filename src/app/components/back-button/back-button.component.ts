import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-back-button',
  standalone: true,
  template: `
    <button type="button" class="back-btn" (click)="goBack()"><span class="arrow" aria-hidden="true">←</span> Volver a las herramientas</button>
  `,
  styles: [`
    .back-btn
      display: inline-flex
      align-items: center
      gap: 0.4rem
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
        .arrow
          transform: translateX(-3px)

    .arrow
      transition: transform 0.2s ease

    @media (max-width: 600px)
      :host
        display: block
      .back-btn
        width: 100%
        justify-content: center
  `]
})
export class BackButtonComponent {
  constructor(private router: Router) { }

  goBack(): void {
    this.router.navigate(['/features']);
  }
}
