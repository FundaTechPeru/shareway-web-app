import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Router, provideRouter} from '@angular/router';
import {of} from 'rxjs';
import {AuthService} from '../../../core/auth/auth.service';
import {NotificationService} from '../../../core/notifications/notification.service';
import {DriverProfileApiService} from '../../services/driver-profile-api.service';
import {BecomeDriverPage, LICENSE_PATTERN} from './become-driver-page';

describe('BecomeDriverPage', () => {
  let fixture: ComponentFixture<BecomeDriverPage>;
  let api: {create: ReturnType<typeof vi.fn>};
  let auth: {
    currentUser: () => {email: string} | null;
    login: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
    homeUrl: () => string;
  };
  let navigate: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    api = {create: vi.fn(() => of({}))};
    auth = {
      currentUser: () => ({email: 'ana@b.pe'}),
      login: vi.fn(() => of({role: 'DRIVER'})),
      logout: vi.fn(),
      homeUrl: () => '/driver/home',
    };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {provide: DriverProfileApiService, useValue: api},
        {provide: AuthService, useValue: auth},
        {provide: NotificationService, useValue: {success: vi.fn(), error: vi.fn()}},
      ],
    });
    navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(BecomeDriverPage);
    await fixture.whenStable();
  });

  const el = () => fixture.nativeElement as HTMLElement;

  function type(selector: string, value: string): void {
    const input = el().querySelector<HTMLInputElement>(selector)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  async function submit(): Promise<void> {
    el().querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  }

  it('validates the license format', () => {
    expect(LICENSE_PATTERN.test('Q1234567')).toBe(true);
    expect(LICENSE_PATTERN.test('ABCDEF123456')).toBe(true);
    expect(LICENSE_PATTERN.test('Q123456')).toBe(false);
    expect(LICENSE_PATTERN.test('q12345678')).toBe(false);
    expect(LICENSE_PATTERN.test('ABCDEF1234567')).toBe(false);
  });

  it('shows errors and does not submit an empty form', async () => {
    await submit();
    expect(api.create).not.toHaveBeenCalled();
    expect(el().textContent).toContain('Ingresa tu número de licencia.');
    expect(el().textContent).toContain('Ingresa el nombre del contacto.');
  });

  it('creates the profile and then logs in again to become a driver', async () => {
    type('input[formControlName=licenseNumber]', 'q 12345678');
    type('input[formControlName=name]', ' Luis Pérez ');
    type('input[formControlName=phone]', '987654321');
    type('input[formControlName=relationship]', 'Hermano');
    await submit();

    expect(api.create).toHaveBeenCalledWith({
      licenseNumber: 'Q12345678',
      emergencyContact: {name: 'Luis Pérez', phone: '987654321', relationship: 'Hermano'},
    });
    expect(el().textContent).toContain('Perfil creado');

    type('input[formControlName=password]', 'secret123');
    await submit();
    expect(auth.login).toHaveBeenCalledWith({email: 'ana@b.pe', password: 'secret123'});
    expect(navigate).toHaveBeenCalledWith('/driver/home');
  });
});
