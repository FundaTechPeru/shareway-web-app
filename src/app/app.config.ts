import {registerLocaleData} from '@angular/common';
import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import localeEsPe from '@angular/common/locales/es-PE';
import {
  ApplicationConfig,
  DEFAULT_CURRENCY_CODE,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {provideRouter, withComponentInputBinding} from '@angular/router';
import {routes} from './app.routes';
import {authInterceptor} from './core/http/auth.interceptor';
import {errorInterceptor} from './core/http/error.interceptor';

registerLocaleData(localeEsPe);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, errorInterceptor])),
    {provide: LOCALE_ID, useValue: 'es-PE'},
    {provide: DEFAULT_CURRENCY_CODE, useValue: 'PEN'},
  ],
};
