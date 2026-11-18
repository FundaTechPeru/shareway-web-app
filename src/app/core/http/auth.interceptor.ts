import {HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {environment} from '../../../environments/environment';
import {AuthService} from '../auth/auth.service';

/** Adds `Authorization: Bearer <token>` to every request sent to the gateway. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).accessToken();
  if (!token || !req.url.startsWith(environment.apiBaseUrl)) {
    return next(req);
  }
  return next(req.clone({setHeaders: {Authorization: `Bearer ${token}`}}));
};
