import {Routes} from '@angular/router';
import {comingSoonRoute} from '../shared/coming-soon.route';

/** Mounted under /passenger/trip-requests. */
export const TRIP_PLANNING_ROUTES: Routes = [
  comingSoonRoute('', 'Mis solicitudes de viaje'),
  comingSoonRoute('new', 'Programar un viaje'),
  comingSoonRoute(':id', 'Detalle de la solicitud'),
];
