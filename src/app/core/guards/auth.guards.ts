import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {Role} from '../../iam/model/auth.model';
import {AuthService} from '../auth/auth.service';

/** Only authenticated users; others go to /login keeping the requested URL. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  if (auth.isAuthenticated()) {
    return true;
  }
  return inject(Router).createUrlTree(['/login'], {queryParams: {returnUrl: state.url}});
};

/** Only users with one of the given roles; others go to their own home. */
export function roleGuard(...roles: Role[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const role = auth.role();
    if (role && roles.includes(role)) {
      return true;
    }
    return inject(Router).parseUrl(auth.homeUrl(role));
  };
}

/** Login and register pages: logged-in passengers/drivers go to their home. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const role = auth.role();
  if (role === 'PASSENGER' || role === 'DRIVER') {
    return inject(Router).parseUrl(auth.homeUrl(role));
  }
  return true;
};
