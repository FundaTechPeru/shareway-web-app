import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Router, provideRouter} from '@angular/router';
import {of, throwError} from 'rxjs';
import {AuthService} from '../../../core/auth/auth.service';
import {AuthUser} from '../../../core/auth/jwt';
import {Role} from '../../model/auth.model';
import {LoginPage} from './login-page';

describe('LoginPage', () => {
  let fixture: ComponentFixture<LoginPage>;
  let auth: {
    login: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
    homeUrl: (role: Role) => string;
  };
  let navigate: ReturnType<typeof vi.spyOn>;

  const userWith = (role: Role): AuthUser => ({id: 'u1', email: 'a@b.pe', role, expiresAt: null});

  beforeEach(async () => {
    auth = {
      login: vi.fn(() => of(userWith('PASSENGER'))),
      logout: vi.fn(),
      homeUrl: role => (role === 'DRIVER' ? '/driver/home' : '/passenger/home'),
    };
    TestBed.configureTestingModule({
      providers: [provideRouter([]), {provide: AuthService, useValue: auth}],
    });
    navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(LoginPage);
    await fixture.whenStable();
  });

  const el = () => fixture.nativeElement as HTMLElement;

  function setInput(name: string, value: string): void {
    const input = el().querySelector<HTMLInputElement>(`input[formControlName=${name}]`)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  async function fillAndSubmit(email: string, password: string): Promise<void> {
    setInput('email', email);
    setInput('password', password);
    el().querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  }

  it('does not call the API when the form is invalid', async () => {
    await fillAndSubmit('not-an-email', '');
    expect(auth.login).not.toHaveBeenCalled();
    expect(el().textContent).toContain('Ingresa un correo válido.');
    expect(el().textContent).toContain('Ingresa tu contraseña.');
  });

  it('logs in and goes to the passenger home', async () => {
    await fillAndSubmit('ana@b.pe', 'secret123');
    expect(auth.login).toHaveBeenCalledWith({email: 'ana@b.pe', password: 'secret123'});
    expect(navigate).toHaveBeenCalledWith('/passenger/home');
  });

  it('sends drivers to the driver home', async () => {
    auth.login.mockReturnValue(of(userWith('DRIVER')));
    await fillAndSubmit('d@b.pe', 'secret123');
    expect(navigate).toHaveBeenCalledWith('/driver/home');
  });

  it('honors a returnUrl inside the user area only', async () => {
    fixture.componentRef.setInput('returnUrl', '/passenger/payments');
    await fillAndSubmit('ana@b.pe', 'secret123');
    expect(navigate).toHaveBeenCalledWith('/passenger/payments');

    fixture.componentRef.setInput('returnUrl', '/driver/documents');
    await fillAndSubmit('ana@b.pe', 'secret123');
    expect(navigate).toHaveBeenLastCalledWith('/passenger/home');
  });

  it('shows the admin notice and ends the admin session', async () => {
    auth.login.mockReturnValue(of(userWith('ADMIN')));
    await fillAndSubmit('admin@b.pe', 'secret123');
    expect(auth.logout).toHaveBeenCalledWith({redirect: false});
    expect(navigate).not.toHaveBeenCalled();
    expect(el().textContent).toContain('panel de administración');
  });

  it('re-enables the form after an error', async () => {
    auth.login.mockReturnValue(throwError(() => new Error('401')));
    await fillAndSubmit('ana@b.pe', 'wrong123');
    const button = el().querySelector<HTMLButtonElement>('button[type=submit]')!;
    expect(button.disabled).toBe(false);
  });
});
