import {registerLocaleData} from '@angular/common';
import localeEsPe from '@angular/common/locales/es-PE';
import {DEFAULT_CURRENCY_CODE, LOCALE_ID, Provider} from '@angular/core';

registerLocaleData(localeEsPe);

/** Same locale and currency as app.config.ts, for component tests. */
export function provideAppLocale(): Provider[] {
  return [
    {provide: LOCALE_ID, useValue: 'es-PE'},
    {provide: DEFAULT_CURRENCY_CODE, useValue: 'PEN'},
  ];
}
