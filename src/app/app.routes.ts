import {Routes} from '@angular/router';
import {comingSoonRoute} from './shared/coming-soon.route';

// TODO: protect /passenger and /driver with authGuard + roleGuard once IAM is
// implemented, and replace the login redirect with the landing page.
export const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'login'},
  {
    path: '',
    loadChildren: () => import('./iam/iam.routes').then(m => m.IAM_ROUTES),
  },
  {
    path: 'passenger',
    loadComponent: () => import('./core/layout/shell/shell').then(m => m.Shell),
    children: [
      {path: '', pathMatch: 'full', redirectTo: 'home'},
      comingSoonRoute('home', 'Inicio'),
      {
        path: 'trip-requests',
        loadChildren: () =>
          import('./trip-planning/trip-planning.routes').then(m => m.TRIP_PLANNING_ROUTES),
      },
      {
        path: 'bookings',
        loadChildren: () => import('./booking/booking.routes').then(m => m.BOOKING_ROUTES),
      },
      {
        path: 'become-driver',
        loadChildren: () =>
          import('./driver-management/driver-management.routes').then(m => m.BECOME_DRIVER_ROUTES),
      },
      {
        path: '',
        loadChildren: () =>
          import('./payments/payments.routes').then(m => m.PASSENGER_PAYMENTS_ROUTES),
      },
    ],
  },
  {
    path: 'driver',
    loadComponent: () => import('./core/layout/shell/shell').then(m => m.Shell),
    children: [
      {path: '', pathMatch: 'full', redirectTo: 'home'},
      {
        path: 'earnings',
        loadChildren: () =>
          import('./payments/payments.routes').then(m => m.DRIVER_EARNINGS_ROUTES),
      },
      {
        path: 'trips',
        loadChildren: () =>
          import('./trip-execution/trip-execution.routes').then(m => m.TRIP_EXECUTION_ROUTES),
      },
      {
        path: '',
        loadChildren: () =>
          import('./driver-management/driver-management.routes').then(
            m => m.DRIVER_MANAGEMENT_ROUTES,
          ),
      },
    ],
  },
  {path: '**', redirectTo: 'login'},
];
