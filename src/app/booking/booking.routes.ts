import {Routes} from '@angular/router';
import {comingSoonRoute} from '../shared/coming-soon.route';

/** Mounted under /passenger/bookings. */
export const BOOKING_ROUTES: Routes = [comingSoonRoute(':id', 'Mi reserva')];
