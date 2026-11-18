import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Router, provideRouter} from '@angular/router';
import {of} from 'rxjs';
import {AuthService} from '../../../core/auth/auth.service';
import {NotificationService} from '../../../core/notifications/notification.service';
import {PASSWORD_PATTERN, PHONE_PATTERN} from '../../../shared/validation/patterns';
import {RegisterPage} from './register-page';

describe('RegisterPage', () => {
  let fixture: ComponentFixture<RegisterPage>;
  let auth: {register: ReturnType<typeof vi.fn>; homeUrl: () => string};
  let navigate: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    auth = {
      register: vi.fn(() => of({id: 'u1', email: 'a@b.pe', role: 'PASSENGER', expiresAt: null})),
      homeUrl: () => '/passenger/home',
    };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {provide: AuthService, useValue: auth},
        {provide: NotificationService, useValue: {success: vi.fn(), error: vi.fn()}},
      ],
    });
    navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(RegisterPage);
    await fixture.whenStable();
  });

  const el = () => fixture.nativeElement as HTMLElement;

  async function fill(values: Record<string, string>): Promise<void> {
    for (const [name, value] of Object.entries(values)) {
      const input = el().querySelector<HTMLInputElement>(`input[formControlName=${name}]`)!;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }
    el().querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  }

  it('accepts passwords of 8-72 chars with a letter and a number', () => {
    expect(PASSWORD_PATTERN.test('abcdefg1')).toBe(true);
    expect(PASSWORD_PATTERN.test('abc1')).toBe(false);
    expect(PASSWORD_PATTERN.test('abcdefgh')).toBe(false);
    expect(PASSWORD_PATTERN.test('12345678')).toBe(false);
    expect(PASSWORD_PATTERN.test('a1'.repeat(36))).toBe(true);
    expect(PASSWORD_PATTERN.test('a1'.repeat(36) + 'x')).toBe(false);
  });

  it('accepts phones with an optional + and 9-15 digits', () => {
    expect(PHONE_PATTERN.test('987654321')).toBe(true);
    expect(PHONE_PATTERN.test('+51987654321')).toBe(true);
    expect(PHONE_PATTERN.test('98765432')).toBe(false);
    expect(PHONE_PATTERN.test('1234567890123456')).toBe(false);
    expect(PHONE_PATTERN.test('987-654-321')).toBe(false);
  });

  it('shows Spanish errors and does not submit invalid data', async () => {
    await fill({fullName: ' ', email: 'x', phone: '123', password: 'abcdefgh'});
    expect(auth.register).not.toHaveBeenCalled();
    const text = el().textContent ?? '';
    expect(text).toContain('Ingresa tu nombre completo.');
    expect(text).toContain('Ingresa un correo válido.');
    expect(text).toContain('De 9 a 15 dígitos');
    expect(text).toContain('Debe incluir al menos una letra y un número.');
  });

  it('registers, logs in and goes to the passenger home', async () => {
    await fill({
      fullName: ' Ana Pérez ',
      email: 'ana@b.pe',
      phone: '+51987654321',
      password: 'secret123',
    });
    expect(auth.register).toHaveBeenCalledWith({
      fullName: 'Ana Pérez',
      email: 'ana@b.pe',
      phone: '+51987654321',
      password: 'secret123',
    });
    expect(navigate).toHaveBeenCalledWith('/passenger/home');
  });
});
