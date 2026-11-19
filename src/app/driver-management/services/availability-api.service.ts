import {HttpClient, HttpContext, HttpErrorResponse} from '@angular/common/http';
import {Injectable, inject} from '@angular/core';
import {Observable, catchError, map, of, throwError} from 'rxjs';
import {environment} from '../../../environments/environment';
import {SILENT_STATUSES} from '../../core/http/error.interceptor';
import {Availability, AvailabilitySlot} from '../model/availability.model';

/** Backend LocalTime may come as "07:00:00"; the UI works with "07:00". */
function toHourMinute(time: string): string {
  return time.slice(0, 5);
}

function normalize(availability: Availability | null): Availability {
  const slots: AvailabilitySlot[] = (availability?.slots ?? []).map(slot => ({
    dayOfWeek: slot.dayOfWeek,
    startTime: toHourMinute(slot.startTime),
    endTime: toHourMinute(slot.endTime),
  }));
  return {slots};
}

/** `/drivers/me/availability` */
@Injectable({providedIn: 'root'})
export class AvailabilityApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/drivers/me/availability`;

  /** A driver without a schedule yet gets an empty one (404 is not an error). */
  get(): Observable<Availability> {
    return this.http
      .get<Availability>(this.url, {context: new HttpContext().set(SILENT_STATUSES, [404])})
      .pipe(
        map(normalize),
        catchError((error: unknown) =>
          error instanceof HttpErrorResponse && error.status === 404
            ? of({slots: []})
            : throwError(() => error),
        ),
      );
  }

  /** Replaces the whole weekly schedule. */
  replace(availability: Availability): Observable<Availability> {
    return this.http.put<Availability>(this.url, availability).pipe(map(normalize));
  }
}
