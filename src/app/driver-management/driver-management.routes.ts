import {Routes} from '@angular/router';
import {comingSoonRoute} from '../shared/coming-soon.route';

/** Mounted under /passenger: become a driver (US-16). */
export const BECOME_DRIVER_ROUTES: Routes = [comingSoonRoute('', 'Quiero ser conductor')];

/** Mounted under /driver: profile, documents, vehicles and availability. */
export const DRIVER_MANAGEMENT_ROUTES: Routes = [
  comingSoonRoute('home', 'Inicio del conductor'),
  comingSoonRoute('documents', 'Mis documentos'),
  comingSoonRoute('vehicles', 'Mis vehículos'),
  comingSoonRoute('availability', 'Mi disponibilidad'),
];
