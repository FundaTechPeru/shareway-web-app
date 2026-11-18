import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {environment} from '../../../environments/environment';
import {NewTripRequest} from '../model/trip-request.model';
import {TripPlanningApiService, toBackendUserId} from './trip-planning-api.service';

describe('TripPlanningApiService', () => {
  const url = `${environment.apiBaseUrl}/trip-requests`;
  let http: HttpTestingController;
  let service: TripPlanningApiService;

  const newRequest: NewTripRequest = {
    originLabel: 'Pueblo Libre',
    destinationLabel: 'UPC Monterrico',
    operationZone: 'PUEBLO_LIBRE',
    originLat: -12.07,
    originLng: -77.06,
    destinationLat: -12.1,
    destinationLng: -76.96,
    travelDate: '2026-11-20',
    earliestDeparture: '07:00',
    latestDeparture: '07:30',
    seatsRequested: 1,
  };

  const dto = {
    id: 10,
    passengerId: 7,
    originLabel: 'Pueblo Libre',
    destinationLabel: 'UPC Monterrico',
    operationZone: 'PUEBLO_LIBRE',
    travelDate: '2026-11-20',
    earliestDeparture: '07:00:00',
    latestDeparture: '07:30:00',
    seatsRequested: 1,
    status: 'PENDING_MATCH',
    createdAt: '2026-11-18T10:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(TripPlanningApiService);
  });

  afterEach(() => http.verify());

  it('keeps legacy numeric ids as numbers and UUIDs as strings', () => {
    expect(toBackendUserId('7')).toBe(7);
    expect(toBackendUserId('3f2a-uuid')).toBe('3f2a-uuid');
  });

  it('creates a request adding the passenger id and maps the response', () => {
    let id = '';
    service.create('7', newRequest).subscribe(r => (id = r.id));
    const req = http.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({...newRequest, passengerId: 7});
    req.flush(dto);
    expect(id).toBe('10');
  });

  it('normalizes ids and times when listing', () => {
    let first = {} as Record<string, unknown>;
    service.list().subscribe(list => (first = {...list[0]}));
    http.expectOne(url).flush([dto]);
    expect(first['id']).toBe('10');
    expect(first['passengerId']).toBe('7');
    expect(first['earliestDeparture']).toBe('07:00');
  });

  it('filters the list by passenger and finds one request', () => {
    let mine: unknown[] = [];
    service.listMine('7').subscribe(list => (mine = list));
    http.expectOne(url).flush([dto, {...dto, id: 11, passengerId: 8}]);
    expect(mine.length).toBe(1);

    let found: unknown = undefined;
    service.get('11').subscribe(r => (found = r));
    http.expectOne(url).flush([dto]);
    expect(found).toBeNull();
  });

  it('requests and lists match proposals', () => {
    const proposal = {
      id: 1,
      driverId: 3,
      estimatedFare: 8.5,
      estimatedDurationMinutes: 25,
      status: 'PROPOSED',
      createdAt: '2026-11-18T10:05:00Z',
    };
    let created: {driverId: string}[] = [];
    service.requestProposals('10').subscribe(list => (created = list));
    const post = http.expectOne(`${url}/10/match-proposals`);
    expect(post.request.method).toBe('POST');
    post.flush(proposal);
    expect(created[0].driverId).toBe('3');

    let listed: unknown[] = [];
    service.listProposals('10').subscribe(list => (listed = list));
    http
      .expectOne(r => r.method === 'GET' && r.url === `${url}/10/match-proposals`)
      .flush([proposal]);
    expect(listed.length).toBe(1);
  });
});
