import {Routes} from '@angular/router';
import {guestGuard} from '../core/guards/auth.guards';

/** Public IAM routes (Driver Management service: /auth, /users). */
export const IAM_ROUTES: Routes = [
  {
    path: 'login',
    title: 'Iniciar sesión · ShareWay',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login-page/login-page').then(m => m.LoginPage),
  },
  {
    path: 'register',
    title: 'Crear cuenta · ShareWay',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/register-page/register-page').then(m => m.RegisterPage),
  },
];
