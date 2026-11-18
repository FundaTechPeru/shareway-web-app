import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Router, provideRouter} from '@angular/router';
import {of} from 'rxjs';
import {provideAppLocale} from '../../../testing/locale';
import {AuthService} from '../../core/auth/auth.service';
import {NotificationService} from '../../core/notifications/notification.service';
import {Trip} from '../model/trip.model';
import {TripExecutionApiService} from '../services/trip-execution-api.service';
import {PIN_PATTERN, TripPage} from './trip-page/trip-page';
import {TripsPage} from './trips-page/trips-page';

const baseTrip: Trip = {
  id: 't-1',
  groupId: 'g-1',
  driverId: 'driver-1',
  status: 'SCHEDULED',
  rawStatus: 'PROGRAMADO',
  startedAt: null,
  finishedAt: null,
  boardings: [
    {
      bookingId: 'booking-a',
      passengerId: 'p-1',
      boarded: false,
      boardedAt: null,
      failedAttempts: 0,
      locked: false,
    },
    {
      bookingId: 'booking-b',
      passengerId: 'p-2',
      boarded: false,
      boardedAt: null,
      failedAttempts: 3,
      locked: true,
    },
  ],
};

const text = (f: ComponentFixture<unknown>) =>
  ((f.nativeElement as HTMLElement).textContent ?? '').replace(/\s+/g, ' ');

describe('TripPage', () => {
  let api: Record<string, ReturnType<typeof vi.fn>>;
  let notifications: {success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn>};

  async function render(trip: Trip = baseTrip, userId = 'driver-1') {
    api = {
      get: vi.fn(() => of(trip)),
      validateBoarding: vi.fn(() =>
        of({outcome: 'INVALID', rawResult: 'INVALIDO', failedAttempts: 1, remainingAttempts: 2}),
      ),
      start: vi.fn(() => of(undefined)),
      finish: vi.fn(() => of(undefined)),
      cancel: vi.fn(() => of(undefined)),
    };
    notifications = {success: vi.fn(), error: vi.fn()};
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideAppLocale(),
        {provide: TripExecutionApiService, useValue: api},
        {provide: AuthService, useValue: {currentUser: () => ({id: userId})}},
        {provide: NotificationService, useValue: notifications},
      ],
    });
    const fixture = TestBed.createComponent(TripPage);
    fixture.componentRef.setInput('id', 't-1');
    await fixture.whenStable();
    return fixture;
  }

  it('accepts PINs of 4 to 6 digits', () => {
    expect(PIN_PATTERN.test('1234')).toBe(true);
    expect(PIN_PATTERN.test('123456')).toBe(true);
    expect(PIN_PATTERN.test('123')).toBe(false);
    expect(PIN_PATTERN.test('12a4')).toBe(false);
  });

  it('shows the trip with boarding state', async () => {
    const fixture = await render();
    expect(text(fixture)).toContain('Programado');
    expect(text(fixture)).toContain('0 de 2 pasajeros');
    expect(text(fixture)).toContain('Bloqueado por intentos fallidos');
    expect(text(fixture)).toContain('Iniciar viaje');
  });

  it('validates boarding with the PIN and reports remaining attempts', async () => {
    const fixture = await render();
    const page = fixture.componentInstance;
    page.pins.get('booking-a')!.setValue('1234');
    page.validate(baseTrip.boardings[0]);

    expect(api['validateBoarding']).toHaveBeenCalledWith('t-1', {
      driverId: 'driver-1',
      bookingId: 'booking-a',
      code: '1234',
      method: 'PIN',
    });
    expect(notifications.error).toHaveBeenCalledWith('PIN incorrecto. Te quedan 2 intento(s).');
  });

  it('does not send an invalid PIN', async () => {
    const fixture = await render();
    fixture.componentInstance.pins.get('booking-a')!.setValue('12');
    fixture.componentInstance.validate(baseTrip.boardings[0]);
    expect(api['validateBoarding']).not.toHaveBeenCalled();
  });

  it('starts the trip as the current driver', async () => {
    const fixture = await render();
    fixture.componentInstance.start();
    expect(api['start']).toHaveBeenCalledWith('t-1', 'driver-1');
  });

  it('finishes a trip in progress', async () => {
    const running = await render({...baseTrip, status: 'IN_PROGRESS'});
    expect(text(running)).toContain('Finalizar viaje');
    running.componentInstance.finish();
    expect(api['finish']).toHaveBeenCalledWith('t-1', 'driver-1');
  });

  it('requires a reason to cancel', async () => {
    const fixture = await render();
    const page = fixture.componentInstance;
    page.cancel();
    expect(api['cancel']).not.toHaveBeenCalled();
    page.cancelReason.setValue('Vehículo averiado');
    page.cancel();
    expect(api['cancel']).toHaveBeenCalledWith('t-1', 'Vehículo averiado');
  });

  it('hides actions when the trip belongs to another driver', async () => {
    const fixture = await render(baseTrip, 'someone-else');
    expect(text(fixture)).toContain('no está asignado a tu cuenta');
    expect(text(fixture)).not.toContain('Iniciar viaje');
  });
});

describe('TripsPage', () => {
  it('shows the coming-soon notice and opens a trip by code', async () => {
    TestBed.configureTestingModule({providers: [provideRouter([])]});
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(TripsPage);
    await fixture.whenStable();

    expect(text(fixture)).toContain('Disponible próximamente');
    fixture.componentInstance.tripId.setValue(' t-1 ');
    fixture.componentInstance.open();
    expect(navigate).toHaveBeenCalledWith(['/driver/trips', 't-1']);
  });
});
