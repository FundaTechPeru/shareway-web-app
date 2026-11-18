import {TestBed} from '@angular/core/testing';
import {Router, provideRouter, withComponentInputBinding} from '@angular/router';
import {RouterTestingHarness} from '@angular/router/testing';
import {routes} from './app.routes';

describe('app routes', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes, withComponentInputBinding())],
    });
    harness = await RouterTestingHarness.create();
  });

  const cases: Array<[string, string]> = [
    ['/login', 'Iniciar sesión'],
    ['/register', 'Crear cuenta'],
    ['/passenger/home', 'Inicio'],
    ['/passenger/trip-requests', 'Mis solicitudes de viaje'],
    ['/passenger/trip-requests/new', 'Programar un viaje'],
    ['/passenger/trip-requests/abc', 'Detalle de la solicitud'],
    ['/passenger/bookings/abc', 'Mi reserva'],
    ['/passenger/payment-methods', 'Métodos de pago'],
    ['/passenger/payments', 'Mis pagos'],
    ['/passenger/become-driver', 'Quiero ser conductor'],
    ['/driver/home', 'Inicio del conductor'],
    ['/driver/documents', 'Mis documentos'],
    ['/driver/vehicles', 'Mis vehículos'],
    ['/driver/availability', 'Mi disponibilidad'],
    ['/driver/earnings', 'Mis ganancias'],
    ['/driver/trips/abc', 'Mi viaje'],
  ];

  for (const [url, title] of cases) {
    it(`lazy loads ${url}`, async () => {
      await harness.navigateByUrl(url);
      expect(TestBed.inject(Router).url).toBe(url);
      expect(harness.routeNativeElement?.textContent).toContain(title);
    });
  }

  it('redirects the root and unknown URLs to /login', async () => {
    await harness.navigateByUrl('/');
    expect(TestBed.inject(Router).url).toBe('/login');
    await harness.navigateByUrl('/does-not-exist');
    expect(TestBed.inject(Router).url).toBe('/login');
  });

  it('redirects role roots to their home', async () => {
    await harness.navigateByUrl('/driver');
    expect(TestBed.inject(Router).url).toBe('/driver/home');
    await harness.navigateByUrl('/passenger');
    expect(TestBed.inject(Router).url).toBe('/passenger/home');
  });
});
