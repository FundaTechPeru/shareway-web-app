import {TestBed} from '@angular/core/testing';
import {Router} from '@angular/router';
import {of} from 'rxjs';
import {fakeJwt, inMinutes} from '../../../testing/fake-jwt';
import {AuthApiService} from '../../iam/services/auth-api.service';
import {NotificationService} from '../notifications/notification.service';
import {AuthService} from './auth.service';
import {TokenStorage} from './token-storage';

describe('AuthService', () => {
  const passengerToken = fakeJwt({
    sub: 'u1',
    email: 'ana@b.pe',
    role: 'PASSENGER',
    exp: inMinutes(60),
  });
  let api: {login: ReturnType<typeof vi.fn>; register: ReturnType<typeof vi.fn>};
  let router: {navigateByUrl: ReturnType<typeof vi.fn>};
  let notifications: {error: ReturnType<typeof vi.fn>};

  function setup(): AuthService {
    TestBed.configureTestingModule({
      providers: [
        {provide: AuthApiService, useValue: api},
        {provide: Router, useValue: router},
        {provide: NotificationService, useValue: notifications},
      ],
    });
    return TestBed.inject(AuthService);
  }

  beforeEach(() => {
    localStorage.clear();
    api = {
      login: vi.fn(() => of({accessToken: passengerToken, tokenType: 'Bearer', expiresIn: 3600})),
      register: vi.fn(() => of({id: 'u1'})),
    };
    router = {navigateByUrl: vi.fn(() => Promise.resolve(true))};
    notifications = {error: vi.fn()};
  });

  afterEach(() => vi.useRealTimers());

  it('starts logged out', () => {
    const auth = setup();
    expect(auth.isAuthenticated()).toBe(false);
    expect(auth.currentUser()).toBeNull();
    expect(auth.role()).toBeNull();
  });

  it('logs in, stores the token and exposes the user as signals', () => {
    const auth = setup();
    let role = '';
    auth.login({email: 'ana@b.pe', password: 'secret123'}).subscribe(u => (role = u.role));

    expect(role).toBe('PASSENGER');
    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.currentUser()?.email).toBe('ana@b.pe');
    expect(auth.accessToken()).toBe(passengerToken);
    expect(TestBed.inject(TokenStorage).get()).toBe(passengerToken);
  });

  it('restores a valid session from storage', () => {
    localStorage.setItem('shareway.accessToken', passengerToken);
    expect(setup().role()).toBe('PASSENGER');
  });

  it('discards an expired token found in storage', () => {
    const expired = fakeJwt({sub: 'u1', role: 'PASSENGER', exp: inMinutes(-1)});
    localStorage.setItem('shareway.accessToken', expired);
    const auth = setup();
    expect(auth.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('shareway.accessToken')).toBeNull();
  });

  it('logs in automatically after registering', () => {
    const auth = setup();
    const request = {
      email: 'ana@b.pe',
      password: 'secret123',
      fullName: 'Ana',
      phone: '987654321',
    };
    auth.register(request).subscribe();
    expect(api.register).toHaveBeenCalledWith(request);
    expect(api.login).toHaveBeenCalledWith({email: 'ana@b.pe', password: 'secret123'});
    expect(auth.isAuthenticated()).toBe(true);
  });

  it('logs out, clears storage and goes to /login', () => {
    const auth = setup();
    auth.login({email: 'ana@b.pe', password: 'x'}).subscribe();
    auth.logout();
    expect(auth.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('shareway.accessToken')).toBeNull();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('logs out automatically when the token expires', () => {
    vi.useFakeTimers();
    const shortLived = fakeJwt({sub: 'u1', role: 'DRIVER', exp: inMinutes(1)});
    api.login.mockReturnValue(of({accessToken: shortLived, tokenType: 'Bearer', expiresIn: 60}));
    const auth = setup();
    auth.login({email: 'a@b.pe', password: 'x'}).subscribe();
    expect(auth.isAuthenticated()).toBe(true);

    vi.advanceTimersByTime(61_000);

    expect(auth.isAuthenticated()).toBe(false);
    expect(notifications.error).toHaveBeenCalledWith('Tu sesión expiró. Inicia sesión nuevamente.');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('fails the login when the token cannot be read', () => {
    api.login.mockReturnValue(of({accessToken: 'garbage', tokenType: 'Bearer', expiresIn: 1}));
    const auth = setup();
    let failed = false;
    auth.login({email: 'a@b.pe', password: 'x'}).subscribe({error: () => (failed = true)});
    expect(failed).toBe(true);
    expect(auth.isAuthenticated()).toBe(false);
  });

  it('maps roles to their home URL', () => {
    const auth = setup();
    expect(auth.homeUrl('PASSENGER')).toBe('/passenger/home');
    expect(auth.homeUrl('DRIVER')).toBe('/driver/home');
    expect(auth.homeUrl('ADMIN')).toBe('/login');
  });
});
