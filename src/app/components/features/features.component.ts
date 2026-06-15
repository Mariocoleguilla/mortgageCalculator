import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MortgageService } from 'src/app/services/mortgage.service';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.sass']
})
export class FeaturesComponent implements OnInit {
  formData: any = null;

  features = [
    {
      id: 'amortization-table',
      icon: '📋',
      title: 'Tabla de Amortización',
      description: 'Consulta el desglose detallado de cada cuota de tu hipoteca: capital, intereses y capital pendiente periodo a periodo.',
      route: '/table',
      color: '#4caf50'
    },
    {
      id: 'amortization-simulator',
      icon: '📉',
      title: 'Simulador de Amortización',
      description: 'Simula el impacto de una amortización anticipada sobre tu hipoteca y descubre cuánto puedes ahorrar en intereses.',
      route: '/outstanding-mortgage-form',
      color: '#2196f3'
    }
  ];

  constructor(
    private router: Router,
    private mortgageService: MortgageService
  ) {}

  ngOnInit(): void {
    this.formData = this.mortgageService.formData.value;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
