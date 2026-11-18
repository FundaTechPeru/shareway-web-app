import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Router, provideRouter} from '@angular/router';
import {of, throwError} from 'rxjs';
import {provideAppLocale} from '../../../testing/locale';
import {NotificationService} from '../../core/notifications/notification.service';
import {BookingApiService} from '../services/booking-api.service';
import {BookingPage} from './booking-page/booking-page';
import {NewBookingPage} from './new-booking-page/new-booking-page';

const text = (f: ComponentFixture<unknown>) =>
  ((f.nativeElement as HTMLElement).textContent ?? '').replace(/\s+/g, ' ');

describe('NewBookingPage', () => {
  let api: Record<string, ReturnType<typeof vi.fn>>;
  let navigate: ReturnType<typeof vi.spyOn>;

  async function render(query: {requestId?: string; groupId?: string}) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideAppLocale(),
        {provide: BookingApiService, useValue: api},
        {provide: NotificationService, useValue: {success: vi.fn(), error: vi.fn()}},
      ],
    });
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(NewBookingPage);
    for (const [key, value] of Object.entries(query)) {
      fixture.componentRef.setInput(key, value);
    }
    await fixture.whenStable();
    return fixture;
  }

  beforeEach(() => {
    api = {
      estimateFare: vi.fn(() => of({amount: 7.5, currency: 'PEN', ruleVersion: 'v2'})),
      create: vi.fn(() => of({bookingId: 'b-1', status: 'REQUESTED'})),
    };
  });

  it('shows the coming-soon state when there is no groupId', async () => {
    const fixture = await render({requestId: 'r-1'});
    expect(text(fixture)).toContain('Disponible próximamente');
    expect(api['estimateFare']).not.toHaveBeenCalled();
    fixture.componentInstance.reserve();
    expect(api['create']).not.toHaveBeenCalled();
  });

  it('shows the fare and books with an idempotency key', async () => {
    const fixture = await render({requestId: 'r-1', groupId: 'g-1'});
    expect(api['estimateFare']).toHaveBeenCalledWith('g-1');
    expect(text(fixture)).toContain('S/ 7.50');

    fixture.componentInstance.reserve();
    const [body, key] = api['create'].mock.calls[0];
    expect(body).toEqual({requestId: 'r-1', groupId: 'g-1'});
    expect(key).toMatch(/^[0-9a-f-]{36}$/);
    expect(navigate).toHaveBeenCalledWith(['/passenger/bookings', 'b-1']);
  });

  it('reuses the same idempotency key when retrying after an error', async () => {
    api['create'].mockReturnValueOnce(throwError(() => new Error('503')));
    const fixture = await render({requestId: 'r-1', groupId: 'g-1'});

    fixture.componentInstance.reserve();
    fixture.componentInstance.reserve();

    const keys = api['create'].mock.calls.map(call => call[1]);
    expect(keys.length).toBe(2);
    expect(keys[0]).toBe(keys[1]);
  });
});

describe('BookingPage', () => {
  let api: Record<string, ReturnType<typeof vi.fn>>;

  async function render() {
    TestBed.configureTestingModule({
      providers: [
        provideAppLocale(),
        {provide: BookingApiService, useValue: api},
        {provide: NotificationService, useValue: {success: vi.fn(), error: vi.fn()}},
      ],
    });
    const fixture = TestBed.createComponent(BookingPage);
    fixture.componentRef.setInput('id', 'b-1');
    await fixture.whenStable();
    return fixture;
  }

  beforeEach(() => {
    api = {
      get: vi.fn(() => of({bookingId: 'b-1', status: 'CONFIRMED'})),
      cancel: vi.fn(() =>
        of({bookingId: 'b-1', status: 'CANCELLED', penaltyAmount: 2.5, currency: 'PEN'}),
      ),
    };
  });

  it('shows the booking status', async () => {
    const fixture = await render();
    expect(api['get']).toHaveBeenCalledWith('b-1');
    expect(text(fixture)).toContain('Confirmada');
    expect(text(fixture)).toContain('Cancelar reserva');
  });

  it('cancels and shows the penalty', async () => {
    const fixture = await render();
    fixture.componentInstance.cancel();
    await fixture.whenStable();
    expect(api['cancel']).toHaveBeenCalledWith('b-1');
    expect(text(fixture)).toContain('Cancelada');
    expect(text(fixture)).toContain('penalidad de S/ 2.50');
    expect(text(fixture)).not.toContain('Cancelar reserva');
  });

  it('does not offer cancelling once the trip started', async () => {
    api['get'].mockReturnValue(of({bookingId: 'b-1', status: 'IN_PROGRESS'}));
    const fixture = await render();
    expect(text(fixture)).not.toContain('Cancelar reserva');
  });
});
