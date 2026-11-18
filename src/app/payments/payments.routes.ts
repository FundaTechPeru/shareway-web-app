import {Routes} from '@angular/router';
import {comingSoonRoute} from '../shared/coming-soon.route';

/** Mounted under /passenger. */
export const PASSENGER_PAYMENTS_ROUTES: Routes = [
  comingSoonRoute('payment-methods', 'Métodos de pago'),
  comingSoonRoute('payments', 'Mis pagos'),
];

/** Mounted under /driver/earnings. */
export const DRIVER_EARNINGS_ROUTES: Routes = [comingSoonRoute('', 'Mis ganancias')];
