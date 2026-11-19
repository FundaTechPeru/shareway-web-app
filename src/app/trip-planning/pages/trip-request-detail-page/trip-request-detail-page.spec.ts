import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {of} from 'rxjs';
import {provideAppLocale} from '../../../../testing/locale';
import {AuthService} from '../../../core/auth/auth.service';
import {MatchProposal, TripRequest} from '../../model/trip-request.model';
import {TripPlanningApiService} from '../../services/trip-planning-api.service';
import {TripRequestsPage} from '../trip-requests-page/trip-requests-page';
import {TripRequestDetailPage} from './trip-request-detail-page';

const request: TripRequest = {
  id: '10',
  passengerId: 'u1',
  originLabel: 'PUCP',
  destinationLabel: 'Miraflores (Parque Kennedy)',
  operationZone: 'SAN_MIGUEL',
  travelDate: '2026-11-20',
  earliestDeparture: '07:00',
  latestDeparture: '07:30',
  seatsRequested: 1,
  status: 'PROPOSED',
  createdAt: '2026-11-18T10:00:00Z',
};

const proposal: MatchProposal = {
  id: 'p1',
  driverId: 'd1',
  estimatedFare: 8.5,
  estimatedDurationMinutes: 25,
  status: 'PROPOSED',
  createdAt: '2026-11-18T10:05:00Z',
};

const text = (f: ComponentFixture<unknown>) =>
  ((f.nativeElement as HTMLElement).textContent ?? '').replace(/\s+/g, ' ');

describe('TripRequestDetailPage', () => {
  let fixture: ComponentFixture<TripRequestDetailPage>;
  let api: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(async () => {
    api = {
      get: vi.fn(() => of(request)),
      listProposals: vi.fn(() => of([])),
      requestProposals: vi.fn(() => of([proposal])),
    };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideAppLocale(),
        {provide: TripPlanningApiService, useValue: api},
      ],
    });
    fixture = TestBed.createComponent(TripRequestDetailPage);
    fixture.componentRef.setInput('id', '10');
    await fixture.whenStable();
  });

  it('shows the request and an empty proposals state', () => {
    expect(api['get']).toHaveBeenCalledWith('10');
    expect(text(fixture)).toContain('PUCP → Miraflores');
    expect(text(fixture)).toContain('Con propuestas');
    expect(text(fixture)).toContain('Aún no hay propuestas');
  });

  it('asks for proposals and offers to book them', async () => {
    fixture.componentInstance.searchDrivers();
    await fixture.whenStable();
    expect(api['requestProposals']).toHaveBeenCalledWith('10');
    expect(text(fixture)).toContain('S/ 8.50');
    expect(text(fixture)).toContain('Aprox. 25 min');
    const book = (fixture.nativeElement as HTMLElement).querySelector<HTMLAnchorElement>(
      'a[href*="bookings/new"]',
    );
    expect(book?.getAttribute('href')).toBe('/passenger/bookings/new?requestId=10');
  });
});

describe('TripRequestsPage', () => {
  it('lists the passenger requests and explains the backend limitation', async () => {
    const listMine = vi.fn(() => of([request]));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideAppLocale(),
        {provide: TripPlanningApiService, useValue: {listMine, canListByUser: false}},
        {provide: AuthService, useValue: {currentUser: () => ({id: 'u1'})}},
      ],
    });
    const fixture = TestBed.createComponent(TripRequestsPage);
    await fixture.whenStable();

    expect(listMine).toHaveBeenCalledWith('u1');
    expect(text(fixture)).toContain('Disponible próximamente');
    expect(text(fixture)).toContain('PUCP → Miraflores');
  });
});
