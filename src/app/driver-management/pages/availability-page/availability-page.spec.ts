import {ComponentFixture, TestBed} from '@angular/core/testing';
import {of} from 'rxjs';
import {NotificationService} from '../../../core/notifications/notification.service';
import {AvailabilityApiService} from '../../services/availability-api.service';
import {AvailabilityPage} from './availability-page';
import {hasOverlap} from './availability-validators';

describe('availability validators', () => {
  it('detects overlapping ranges', () => {
    expect(
      hasOverlap([
        {startTime: '07:00', endTime: '09:00'},
        {startTime: '08:30', endTime: '10:00'},
      ]),
    ).toBe(true);
  });

  it('allows back-to-back ranges', () => {
    expect(
      hasOverlap([
        {startTime: '09:00', endTime: '11:00'},
        {startTime: '07:00', endTime: '09:00'},
      ]),
    ).toBe(false);
  });
});

describe('AvailabilityPage', () => {
  let fixture: ComponentFixture<AvailabilityPage>;
  let api: {get: ReturnType<typeof vi.fn>; replace: ReturnType<typeof vi.fn>};
  let notifications: {success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn>};

  beforeEach(async () => {
    api = {
      get: vi.fn(() => of({slots: [{dayOfWeek: 'MONDAY', startTime: '07:00', endTime: '09:00'}]})),
      replace: vi.fn(body => of(body)),
    };
    notifications = {success: vi.fn(), error: vi.fn()};
    TestBed.configureTestingModule({
      providers: [
        {provide: AvailabilityApiService, useValue: api},
        {provide: NotificationService, useValue: notifications},
      ],
    });
    fixture = TestBed.createComponent(AvailabilityPage);
    await fixture.whenStable();
  });

  const el = () => fixture.nativeElement as HTMLElement;
  const day = (d: string) => el().querySelector(`[data-day=${d}]`)!;

  it('loads the schedule into the week', () => {
    expect(day('MONDAY').querySelectorAll('.slot').length).toBe(1);
    expect(day('TUESDAY').textContent).toContain('Sin horarios.');
  });

  it('saves the whole schedule ordered by day and time', async () => {
    const page = fixture.componentInstance;
    page.addSlot('FRIDAY', '18:00', '20:00');
    page.addSlot('MONDAY', '17:00', '19:00');
    page.save();
    await fixture.whenStable();

    expect(api.replace).toHaveBeenCalledWith({
      slots: [
        {dayOfWeek: 'MONDAY', startTime: '07:00', endTime: '09:00'},
        {dayOfWeek: 'MONDAY', startTime: '17:00', endTime: '19:00'},
        {dayOfWeek: 'FRIDAY', startTime: '18:00', endTime: '20:00'},
      ],
    });
    expect(notifications.success).toHaveBeenCalledWith('Disponibilidad guardada.');
  });

  it('blocks saving invalid or overlapping slots', async () => {
    const page = fixture.componentInstance;
    page.addSlot('MONDAY', '08:00', '10:00');
    page.addSlot('TUESDAY', '10:00', '09:00');
    await fixture.whenStable();

    expect(day('MONDAY').textContent).toContain('Hay horarios que se superponen.');
    expect(day('TUESDAY').textContent).toContain('posterior a la de inicio');

    page.save();
    expect(api.replace).not.toHaveBeenCalled();
    expect(notifications.error).toHaveBeenCalled();
  });
});
