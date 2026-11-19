import {Routes} from '@angular/router';

/** Mounted under /driver/trips. */
export const TRIP_EXECUTION_ROUTES: Routes = [
  {
    path: '',
    title: 'Mis viajes · ShareWay',
    loadComponent: () => import('./pages/trips-page/trips-page').then(m => m.TripsPage),
  },
  {
    path: ':id',
    title: 'Viaje · ShareWay',
    loadComponent: () => import('./pages/trip-page/trip-page').then(m => m.TripPage),
  },
];
