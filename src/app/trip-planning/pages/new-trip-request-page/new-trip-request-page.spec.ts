import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormControl, FormGroup} from '@angular/forms';
import {Router, provideRouter} from '@angular/router';
import {of} from 'rxjs';
import {AuthService} from '../../../core/auth/auth.service';
import {NotificationService} from '../../../core/notifications/notification.service';
import {TripPlanningApiService} from '../../services/trip-planning-api.service';
import {NewTripRequestPage, todayIso, tripRequestValidator} from './new-trip-request-page';

describe('tripRequestValidator', () => {
  const now = new Date(2026, 10, 18, 9, 0);
  const validate = (value: Record<string, string>) =>
    tripRequestValidator(
      new FormGroup(
        Object.fromEntries(Object.entries(value).map(([k, v]) => [k, new FormControl(v)])),
      ),
      now,
    );
  const base = {
    originId: 'pucp',
    destinationId: 'miraflores',
    travelDate: '2026-11-18',
    earliestDeparture: '07:00',
    latestDeparture: '07:30',
  };

  it('accepts a valid request', () => {
    expect(validate(base)).toBeNull();
  });

  it('rejects same origin and destination, past dates and empty windows', () => {
    expect(
      validate({
        ...base,
        destinationId: 'pucp',
        travelDate: '2026-11-17',
        latestDeparture: '07:00',
      }),
    ).toEqual({samePlace: true, pastDate: true, window: true});
  });

  it('formats today as YYYY-MM-DD', () => {
    expect(todayIso(now)).toBe('2026-11-18');
  });
});

describe('NewTripRequestPage', () => {
  let fixture: ComponentFixture<NewTripRequestPage>;
  let create: ReturnType<typeof vi.fn>;
  let navigate: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    create = vi.fn(() => of({id: '42'}));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {provide: TripPlanningApiService, useValue: {create}},
        {provide: AuthService, useValue: {currentUser: () => ({id: 'user-uuid'})}},
        {provide: NotificationService, useValue: {success: vi.fn(), error: vi.fn()}},
      ],
    });
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(NewTripRequestPage);
    await fixture.whenStable();
  });

  it('fills label, coordinates and zone from the selected places', () => {
    const page = fixture.componentInstance;
    page.form.patchValue({
      originId: 'pueblo-libre',
      destinationId: 'upc-monterrico',
      travelDate: todayIso(),
      earliestDeparture: '23:00',
      latestDeparture: '23:30',
      seatsRequested: 2,
    });
    page.submit();

    expect(create).toHaveBeenCalledWith('user-uuid', {
      originLabel: 'Pueblo Libre (Plaza Bolívar)',
      destinationLabel: 'UPC Monterrico',
      operationZone: 'PUEBLO_LIBRE',
      originLat: -12.0757,
      originLng: -77.0636,
      destinationLat: -12.104,
      destinationLng: -76.9631,
      travelDate: todayIso(),
      earliestDeparture: '23:00',
      latestDeparture: '23:30',
      seatsRequested: 2,
    });
    expect(navigate).toHaveBeenCalledWith(['/passenger/trip-requests', '42']);
  });

  it('does not submit without origin and destination', () => {
    fixture.componentInstance.submit();
    expect(create).not.toHaveBeenCalled();
  });
});
