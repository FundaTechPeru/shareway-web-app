import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {environment} from '../../../environments/environment';
import {AuthApiService} from './auth-api.service';
import {UsersApiService} from './users-api.service';

describe('IAM API services', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('posts credentials to /auth/login', () => {
    let token = '';
    TestBed.inject(AuthApiService)
      .login({email: 'a@b.pe', password: 'secret123'})
      .subscribe(r => (token = r.accessToken));

    const req = http.expectOne(`${environment.apiBaseUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({email: 'a@b.pe', password: 'secret123'});
    req.flush({accessToken: 'jwt', tokenType: 'Bearer', expiresIn: 3600});
    expect(token).toBe('jwt');
  });

  it('posts the new passenger to /auth/register', () => {
    const body = {
      email: 'a@b.pe',
      password: 'secret123',
      fullName: 'Ana Pérez',
      phone: '+51987654321',
    };
    TestBed.inject(AuthApiService).register(body).subscribe();

    const req = http.expectOne(`${environment.apiBaseUrl}/auth/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({id: 'u1', ...body, role: 'PASSENGER'}, {status: 201, statusText: 'Created'});
  });

  it('gets the current user from /users/me', () => {
    let name = '';
    TestBed.inject(UsersApiService)
      .getMe()
      .subscribe(u => (name = u.fullName));

    const req = http.expectOne(`${environment.apiBaseUrl}/users/me`);
    expect(req.request.method).toBe('GET');
    req.flush({id: 'u1', fullName: 'Ana Pérez'});
    expect(name).toBe('Ana Pérez');
  });
});
