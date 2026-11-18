import {Routes} from '@angular/router';

/** Mounted under /passenger/bookings. */
export const BOOKING_ROUTES: Routes = [
  {
    path: 'new',
    title: 'Reservar viaje · ShareWay',
    loadComponent: () =>
      import('./pages/new-booking-page/new-booking-page').then(m => m.NewBookingPage),
  },
  {
    path: ':id',
    title: 'Mi reserva · ShareWay',
    loadComponent: () => import('./pages/booking-page/booking-page').then(m => m.BookingPage),
  },
];
