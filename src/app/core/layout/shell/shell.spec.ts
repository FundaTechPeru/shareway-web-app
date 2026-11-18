import {signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {of, throwError} from 'rxjs';
import {Role} from '../../../iam/model/auth.model';
import {UsersApiService} from '../../../iam/services/users-api.service';
import {AuthService} from '../../auth/auth.service';
import {Shell} from './shell';

describe('Shell', () => {
  const role = signal<Role | null>('PASSENGER');
  let logout: ReturnType<typeof vi.fn>;
  let getMe: ReturnType<typeof vi.fn>;

  async function create(): Promise<ComponentFixture<Shell>> {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            role,
            currentUser: () => ({id: 'u1', email: 'ana@b.pe', role: role(), expiresAt: null}),
            homeUrl: () => '/passenger/home',
            logout,
          },
        },
        {provide: UsersApiService, useValue: {getMe}},
      ],
    });
    const fixture = TestBed.createComponent(Shell);
    await fixture.whenStable();
    return fixture;
  }

  beforeEach(() => {
    role.set('PASSENGER');
    logout = vi.fn();
    getMe = vi.fn(() => of({fullName: 'Ana Pérez'}));
  });

  const text = (f: ComponentFixture<Shell>) => (f.nativeElement as HTMLElement).textContent ?? '';

  it('shows the brand and the user name from /users/me', async () => {
    const fixture = await create();
    expect(text(fixture)).toContain('ShareWay');
    const name = (fixture.nativeElement as HTMLElement).querySelector('[data-testid=user-name]');
    expect(name?.textContent).toContain('Ana Pérez');
  });

  it('falls back to the email when the profile cannot be loaded', async () => {
    getMe.mockReturnValue(throwError(() => new Error('down')));
    const fixture = await create();
    expect(text(fixture)).toContain('ana@b.pe');
  });

  it('shows the passenger menu', async () => {
    const fixture = await create();
    expect(text(fixture)).toContain('Métodos de pago');
    expect(text(fixture)).not.toContain('Documentos');
  });

  it('shows the driver menu', async () => {
    role.set('DRIVER');
    const fixture = await create();
    expect(text(fixture)).toContain('Documentos');
    expect(text(fixture)).toContain('Ganancias');
    expect(text(fixture)).not.toContain('Métodos de pago');
  });

  it('logs out from the toolbar', async () => {
    const fixture = await create();
    const button = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      'button[aria-label="Cerrar sesión"]',
    );
    button!.click();
    expect(logout).toHaveBeenCalled();
  });
});
