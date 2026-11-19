import {Routes} from '@angular/router';

/** Mounted under /passenger/trip-requests. */
export const TRIP_PLANNING_ROUTES: Routes = [
  {
    path: '',
    title: 'Mis solicitudes de viaje · ShareWay',
    loadComponent: () =>
      import('./pages/trip-requests-page/trip-requests-page').then(m => m.TripRequestsPage),
  },
  {
    path: 'new',
    title: 'Programar un viaje · ShareWay',
    loadComponent: () =>
      import('./pages/new-trip-request-page/new-trip-request-page').then(m => m.NewTripRequestPage),
  },
  {
    path: ':id',
    title: 'Solicitud de viaje · ShareWay',
    loadComponent: () =>
      import('./pages/trip-request-detail-page/trip-request-detail-page').then(
        m => m.TripRequestDetailPage,
      ),
  },
];
