import {Routes} from '@angular/router';

/** Mounted under /passenger. */
export const PASSENGER_PAYMENTS_ROUTES: Routes = [
  {
    path: 'payment-methods',
    title: 'Métodos de pago · ShareWay',
    loadComponent: () =>
      import('./pages/payment-methods-page/payment-methods-page').then(m => m.PaymentMethodsPage),
  },
  {
    path: 'payments',
    title: 'Mis pagos · ShareWay',
    loadComponent: () => import('./pages/payments-page/payments-page').then(m => m.PaymentsPage),
  },
];

/** Mounted under /driver/earnings. */
export const DRIVER_EARNINGS_ROUTES: Routes = [
  {
    path: '',
    title: 'Mis ganancias · ShareWay',
    loadComponent: () => import('./pages/earnings-page/earnings-page').then(m => m.EarningsPage),
  },
  {
    path: ':id',
    title: 'Liquidación · ShareWay',
    loadComponent: () =>
      import('./pages/settlement-detail-page/settlement-detail-page').then(
        m => m.SettlementDetailPage,
      ),
  },
];
