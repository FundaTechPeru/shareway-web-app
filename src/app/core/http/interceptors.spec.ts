import {HttpClient, HttpContext, provideHttpClient, withInterceptors} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {environment} from '../../../environments/environment';
import {AuthService} from '../auth/auth.service';
import {NotificationService} from '../notifications/notification.service';
import {authInterceptor} from './auth.interceptor';
import {
  SERVICE_STARTING_MESSAGE,
  SESSION_EXPIRED_MESSAGE,
  SILENT_STATUSES,
  errorInterceptor,
} from './error.interceptor';

describe('HTTP interceptors', () => {
  const api = environment.apiBaseUrl;
  let http: HttpClient;
  let controller: HttpTestingController;
  let token: string | null;
  let auth: {accessToken: () => string | null; logout: ReturnType<typeof vi.fn>};
  let notifications: {error: ReturnType<typeof vi.fn>};

  beforeEach(() => {
    token = 'jwt-token';
    auth = {accessToken: () => token, logout: vi.fn()};
    notifications = {error: vi.fn()};
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
        provideHttpClientTesting(),
        {provide: AuthService, useValue: auth},
        {provide: NotificationService, useValue: notifications},
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  function failWith(
    url: string,
    status: number,
    body: object | null = null,
    context?: HttpContext,
  ) {
    let caught = false;
    http.get(url, {context}).subscribe({error: () => (caught = true)});
    controller.expectOne(url).flush(body, {status, statusText: 'Error'});
    expect(caught).toBe(true);
  }

  describe('authInterceptor', () => {
    it('adds the bearer token to gateway requests', () => {
      http.get(`${api}/users/me`).subscribe();
      const req = controller.expectOne(`${api}/users/me`);
      expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-token');
      req.flush({});
    });

    it('does not add the header without a token', () => {
      token = null;
      http.get(`${api}/users/me`).subscribe();
      const req = controller.expectOne(`${api}/users/me`);
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    });

    it('does not leak the token to other hosts', () => {
      http.get('https://example.com/data').subscribe();
      const req = controller.expectOne('https://example.com/data');
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    });
  });

  describe('errorInterceptor', () => {
    it('shows the backend message', () => {
      failWith(`${api}/drivers/me/vehicles`, 400, {status: 400, message: 'Placa inválida'});
      expect(notifications.error).toHaveBeenCalledWith('Placa inválida');
    });

    it('uses a Spanish fallback when the body has no message', () => {
      failWith(`${api}/drivers/me/vehicles`, 403);
      expect(notifications.error).toHaveBeenCalledWith(
        'No tienes permiso para realizar esta acción.',
      );
    });

    it.each([502, 503, 504])('reports %i as a service starting up', status => {
      failWith(`${api}/trip-requests`, status, {message: 'Bad gateway'});
      expect(notifications.error).toHaveBeenCalledWith(SERVICE_STARTING_MESSAGE);
    });

    it('logs out on 401 for authenticated requests', () => {
      failWith(`${api}/users/me`, 401);
      expect(auth.logout).toHaveBeenCalledWith({message: SESSION_EXPIRED_MESSAGE});
      expect(notifications.error).not.toHaveBeenCalled();
    });

    it('keeps the session on 401 from the login endpoint', () => {
      let caught = false;
      http.post(`${api}/auth/login`, {}).subscribe({error: () => (caught = true)});
      controller
        .expectOne(`${api}/auth/login`)
        .flush({message: 'Credenciales inválidas'}, {status: 401, statusText: 'Unauthorized'});
      expect(caught).toBe(true);
      expect(auth.logout).not.toHaveBeenCalled();
      expect(notifications.error).toHaveBeenCalledWith('Credenciales inválidas');
    });

    it('stays silent for statuses the caller handles', () => {
      const context = new HttpContext().set(SILENT_STATUSES, [404]);
      failWith(`${api}/drivers/me/availability`, 404, null, context);
      expect(notifications.error).not.toHaveBeenCalled();
    });
  });
});
