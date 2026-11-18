import {signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import {Role} from '../../iam/model/auth.model';
import {AuthService} from '../auth/auth.service';
import {authGuard, guestGuard, roleGuard} from './auth.guards';

describe('auth guards', () => {
  const role = signal<Role | null>(null);
  const homes: Record<string, string> = {PASSENGER: '/passenger/home', DRIVER: '/driver/home'};

  beforeEach(() => {
    role.set(null);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            role,
            isAuthenticated: () => role() !== null,
            homeUrl: (r: Role | null = role()) => (r && homes[r]) ?? '/login',
          },
        },
      ],
    });
  });

  function run(guard: CanActivateFn, url = '/passenger/home'): boolean | string {
    const result = TestBed.runInInjectionContext(() =>
      guard({} as ActivatedRouteSnapshot, {url} as RouterStateSnapshot),
    );
    return result instanceof UrlTree ? result.toString() : (result as boolean);
  }

  describe('authGuard', () => {
    it('lets authenticated users through', () => {
      role.set('PASSENGER');
      expect(run(authGuard)).toBe(true);
    });

    it('sends anonymous users to /login with the return URL', () => {
      expect(run(authGuard, '/driver/documents')).toBe('/login?returnUrl=%2Fdriver%2Fdocuments');
    });
  });

  describe('roleGuard', () => {
    it('allows the expected role', () => {
      role.set('DRIVER');
      expect(run(roleGuard('DRIVER'))).toBe(true);
    });

    it('sends other roles to their own home', () => {
      role.set('PASSENGER');
      expect(run(roleGuard('DRIVER'))).toBe('/passenger/home');
      role.set('DRIVER');
      expect(run(roleGuard('PASSENGER'))).toBe('/driver/home');
    });

    it('sends admins and anonymous users to /login', () => {
      role.set('ADMIN');
      expect(run(roleGuard('PASSENGER', 'DRIVER'))).toBe('/login');
      role.set(null);
      expect(run(roleGuard('PASSENGER'))).toBe('/login');
    });
  });

  describe('guestGuard', () => {
    it('lets anonymous users and admins see the login page', () => {
      expect(run(guestGuard, '/login')).toBe(true);
      role.set('ADMIN');
      expect(run(guestGuard, '/login')).toBe(true);
    });

    it('sends logged-in users to their home', () => {
      role.set('DRIVER');
      expect(run(guestGuard, '/login')).toBe('/driver/home');
    });
  });
});
