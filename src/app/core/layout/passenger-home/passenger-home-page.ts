import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {RouterLink} from '@angular/router';

interface QuickLink {
  title: string;
  description: string;
  icon: string;
  link: string;
}

/** Passenger landing after login: quick access to the main flows. */
@Component({
  selector: 'app-passenger-home-page',
  imports: [MatCardModule, MatIconModule, RouterLink],
  templateUrl: './passenger-home-page.html',
  styleUrl: './passenger-home-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PassengerHomePage {
  protected readonly links: readonly QuickLink[] = [
    {
      title: 'Programar un viaje',
      description: 'Indica origen, destino y horario para encontrar conductor.',
      icon: 'add_road',
      link: '/passenger/trip-requests/new',
    },
    {
      title: 'Mis solicitudes',
      description: 'Revisa tus solicitudes de viaje y sus propuestas.',
      icon: 'route',
      link: '/passenger/trip-requests',
    },
    {
      title: 'Métodos de pago',
      description: 'Registra o elimina tus tarjetas.',
      icon: 'credit_card',
      link: '/passenger/payment-methods',
    },
    {
      title: 'Mis pagos',
      description: 'Consulta el historial de tus pagos.',
      icon: 'receipt_long',
      link: '/passenger/payments',
    },
    {
      title: 'Quiero ser conductor',
      description: 'Registra tu perfil de conductor y empieza a ganar.',
      icon: 'directions_car',
      link: '/passenger/become-driver',
    },
  ];
}
