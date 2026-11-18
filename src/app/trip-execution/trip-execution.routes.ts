import {Routes} from '@angular/router';
import {comingSoonRoute} from '../shared/coming-soon.route';

/** Mounted under /driver/trips. */
export const TRIP_EXECUTION_ROUTES: Routes = [comingSoonRoute(':id', 'Mi viaje')];
