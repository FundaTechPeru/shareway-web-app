import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {Router, provideRouter, withComponentInputBinding} from '@angular/router';
import {RouterTestingHarness} from '@angular/router/testing';
import {fakeJwt, inMinutes} from '../testing/fake-jwt';
import {routes} from './app.routes';

describe('app routes', () => {
  let harness: RouterTestingHarness;

  async function setup(role: 'PASSENGER' | 'DRIVER' | null): Promise<void> {
    localStorage.clear();
    if (role) {
      localStorage.setItem(
        'shareway.accessToken',
        fakeJwt({sub: 'u1', email: 'a@b.pe', role, exp: inMinutes(60)}),
      );
    }
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    harness = await RouterTestingHarness.create();
  }

  const url = () => TestBed.inject(Router).url;

  afterEach(() => localStorage.clear());

  describe('anonymous user', () => {
    beforeEach(() => setup(null));

    it('shows the login at the root and for unknown URLs', async () => {
      await harness.navigateByUrl('/');
      expect(url()).toBe('/login');
      await harness.navigateByUrl('/does-not-exist');
      expect(url()).toBe('/login');
    });

    it('can open the register page', async () => {
      await harness.navigateByUrl('/register');
      expect(url()).toBe('/register');
    });

    it('is sent to /login from protected areas', async () => {
      await harness.navigateByUrl('/driver/documents');
      expect(url()).toBe('/login?returnUrl=%2Fdriver%2Fdocuments');
      await harness.navigateByUrl('/passenger/home');
      expect(url()).toBe('/login?returnUrl=%2Fpassenger%2Fhome');
    });
  });

  describe('passenger', () => {
    beforeEach(() => setup('PASSENGER'));

    it.each([
      '/passenger/home',
      '/passenger/trip-requests',
      '/passenger/trip-requests/new',
      '/passenger/trip-requests/abc',
      '/passenger/bookings/abc',
      '/passenger/bookings/new?requestId=r1',
      '/passenger/payment-methods',
      '/passenger/payments',
      '/passenger/become-driver',
    ])('lazy loads %s', async path => {
      await harness.navigateByUrl(path);
      expect(url()).toBe(path);
      expect(harness.routeNativeElement?.textContent?.length).toBeGreaterThan(0);
    });

    it('goes home from /, /login and /passenger', async () => {
      await harness.navigateByUrl('/');
      expect(url()).toBe('/passenger/home');
      await harness.navigateByUrl('/passenger');
      expect(url()).toBe('/passenger/home');
    });

    it('cannot open the driver area', async () => {
      await harness.navigateByUrl('/driver/documents');
      expect(url()).toBe('/passenger/home');
    });
  });

  describe('driver', () => {
    beforeEach(() => setup('DRIVER'));

    it.each([
      '/driver/home',
      '/driver/documents',
      '/driver/vehicles',
      '/driver/availability',
      '/driver/earnings',
      '/driver/earnings/s1',
      '/driver/trips',
      '/driver/trips/abc',
    ])('lazy loads %s', async path => {
      await harness.navigateByUrl(path);
      expect(url()).toBe(path);
      expect(harness.routeNativeElement?.textContent?.length).toBeGreaterThan(0);
    });

    it('cannot open the passenger area', async () => {
      await harness.navigateByUrl('/passenger/payments');
      expect(url()).toBe('/driver/home');
    });
  });
});
