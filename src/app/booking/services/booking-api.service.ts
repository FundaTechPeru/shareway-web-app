import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable, inject} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {
  Booking,
  BookingCancellation,
  CreateBookingRequest,
  FareEstimate,
} from '../model/booking.model';

/**
 * Booking & Pricing. TODO(backend): the gateway does not route
 * /api/v1/bookings|fares|fare-rules to the Booking service yet (404) and does
 * not inject X-User-Id from the JWT (CLAUDE.md section 6.2).
 */
@Injectable({providedIn: 'root'})
export class BookingApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  estimateFare(groupId: string): Observable<FareEstimate> {
    return this.http.get<FareEstimate>(`${this.baseUrl}/fares/estimate`, {
      params: new HttpParams().set('groupId', groupId),
    });
  }

  /**
   * The same `idempotencyKey` must be reused when the user retries the same
   * reservation, so the backend does not create it twice.
   */
  create(request: CreateBookingRequest, idempotencyKey: string): Observable<Booking> {
    return this.http.post<Booking>(`${this.baseUrl}/bookings`, request, {
      headers: {'Idempotency-Key': idempotencyKey},
    });
  }

  get(bookingId: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.baseUrl}/bookings/${encodeURIComponent(bookingId)}`);
  }

  cancel(bookingId: string): Observable<BookingCancellation> {
    return this.http.post<BookingCancellation>(
      `${this.baseUrl}/bookings/${encodeURIComponent(bookingId)}/cancel`,
      {},
    );
  }
}
