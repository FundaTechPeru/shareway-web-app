import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {environment} from '../../../environments/environment';
import {isCancellable} from '../model/booking.model';
import {BookingApiService} from './booking-api.service';

describe('BookingApiService', () => {
  const api = environment.apiBaseUrl;
  let http: HttpTestingController;
  let service: BookingApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(BookingApiService);
  });

  afterEach(() => http.verify());

  it('estimates the fare of a group', () => {
    service.estimateFare('g-1').subscribe();
    const req = http.expectOne(r => r.url === `${api}/fares/estimate`);
    expect(req.request.params.get('groupId')).toBe('g-1');
    req.flush({amount: 7.5, currency: 'PEN', ruleVersion: 'v1'});
  });

  it('creates a booking with the Idempotency-Key header', () => {
    service.create({requestId: 'r-1', groupId: 'g-1'}, 'key-123').subscribe();
    const req = http.expectOne(`${api}/bookings`);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Idempotency-Key')).toBe('key-123');
    expect(req.request.body).toEqual({requestId: 'r-1', groupId: 'g-1'});
    req.flush({bookingId: 'b-1', status: 'REQUESTED'}, {status: 202, statusText: 'Accepted'});
  });

  it('gets and cancels a booking', () => {
    service.get('b-1').subscribe();
    http.expectOne(`${api}/bookings/b-1`).flush({bookingId: 'b-1', status: 'CONFIRMED'});

    service.cancel('b-1').subscribe();
    const req = http.expectOne(`${api}/bookings/b-1/cancel`);
    expect(req.request.method).toBe('POST');
    req.flush({bookingId: 'b-1', status: 'CANCELLED', penaltyAmount: 2, currency: 'PEN'});
  });

  it('allows cancelling only before the trip starts', () => {
    expect(isCancellable('CONFIRMED')).toBe(true);
    expect(isCancellable('IN_PROGRESS')).toBe(false);
    expect(isCancellable('CANCELLED')).toBe(false);
  });
});
