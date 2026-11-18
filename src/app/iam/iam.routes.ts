import {Routes} from '@angular/router';
import {comingSoonRoute} from '../shared/coming-soon.route';

/** Public IAM routes (Driver Management service: /auth, /users). */
export const IAM_ROUTES: Routes = [
  comingSoonRoute('login', 'Iniciar sesión'),
  comingSoonRoute('register', 'Crear cuenta'),
];
