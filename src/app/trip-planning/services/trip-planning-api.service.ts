import {HttpClient} from '@angular/common/http';
import {Injectable, inject} from '@angular/core';
import {Observable, map} from 'rxjs';
import {environment} from '../../../environments/environment';
import {
  MatchProposal,
  MatchProposalStatus,
  NewTripRequest,
  TripRequest,
  TripRequestStatus,
} from '../model/trip-request.model';

/**
 * Backend ids for users. TODO(backend): Trip Planning still uses Long for
 * `passengerId` and `driverId` while users are UUIDs (backend blocker #3 in
 * docs/PROGRESS.md). When the service switches to UUID taken from the token, only this file
 * changes: drop `LegacyUserId`, `toBackendUserId` and the `passengerId` field.
 */
type LegacyUserId = number | string;

/** Wire format of POST /trip-requests. */
interface TripRequestBody extends NewTripRequest {
  passengerId: LegacyUserId;
}

/** Wire format of a trip request. */
interface TripRequestDto extends Omit<TripRequest, 'id' | 'passengerId'> {
  id: string | number;
  passengerId: LegacyUserId;
}

/** Wire format of a match proposal. */
interface MatchProposalDto extends Omit<MatchProposal, 'id' | 'driverId'> {
  id: string | number;
  driverId: LegacyUserId;
}

/**
 * Today the user UUID cannot be turned into the Long the service expects, so
 * numeric ids are sent as numbers and UUIDs as they are.
 */
export function toBackendUserId(userId: string): LegacyUserId {
  return /^\d+$/.test(userId) ? Number(userId) : userId;
}

/** Times may come as "HH:mm:ss"; the app uses "HH:mm". */
function hhmm(time: string): string {
  return time?.slice(0, 5) ?? '';
}

export function toTripRequest(dto: TripRequestDto): TripRequest {
  return {
    id: String(dto.id),
    passengerId: String(dto.passengerId),
    originLabel: dto.originLabel,
    destinationLabel: dto.destinationLabel,
    operationZone: dto.operationZone,
    travelDate: dto.travelDate,
    earliestDeparture: hhmm(dto.earliestDeparture),
    latestDeparture: hhmm(dto.latestDeparture),
    seatsRequested: dto.seatsRequested,
    status: dto.status as TripRequestStatus,
    createdAt: dto.createdAt,
  };
}

export function toMatchProposal(dto: MatchProposalDto): MatchProposal {
  return {
    id: String(dto.id),
    driverId: String(dto.driverId),
    estimatedFare: dto.estimatedFare,
    estimatedDurationMinutes: dto.estimatedDurationMinutes,
    status: dto.status as MatchProposalStatus,
    createdAt: dto.createdAt,
  };
}

/** `/trip-requests` and their match proposals. */
@Injectable({providedIn: 'root'})
export class TripPlanningApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/trip-requests`;

  /**
   * TODO(backend): GET /trip-requests is not filtered by user yet (backend
   * blocker #5 in docs/PROGRESS.md). Until then the list is filtered here,
   * which only works once passenger ids are UUIDs.
   */
  readonly canListByUser = false;

  create(passengerUserId: string, request: NewTripRequest): Observable<TripRequest> {
    const body: TripRequestBody = {...request, passengerId: toBackendUserId(passengerUserId)};
    return this.http.post<TripRequestDto>(this.url, body).pipe(map(toTripRequest));
  }

  list(): Observable<TripRequest[]> {
    return this.http.get<TripRequestDto[]>(this.url).pipe(map(list => list.map(toTripRequest)));
  }

  /** Trip requests of one passenger (filtered on the client, see `canListByUser`). */
  listMine(passengerUserId: string): Observable<TripRequest[]> {
    const backendId = String(toBackendUserId(passengerUserId));
    return this.list().pipe(map(list => list.filter(r => r.passengerId === backendId)));
  }

  /** There is no GET /trip-requests/{id}; the request is taken from the list. */
  get(id: string): Observable<TripRequest | null> {
    return this.list().pipe(map(list => list.find(r => r.id === id) ?? null));
  }

  /** Asks the matching engine for proposals for this request. */
  requestProposals(requestId: string): Observable<MatchProposal[]> {
    return this.http
      .post<MatchProposalDto[] | MatchProposalDto>(this.proposalsUrl(requestId), {})
      .pipe(map(body => (Array.isArray(body) ? body : [body]).map(toMatchProposal)));
  }

  listProposals(requestId: string): Observable<MatchProposal[]> {
    return this.http
      .get<MatchProposalDto[]>(this.proposalsUrl(requestId))
      .pipe(map(list => list.map(toMatchProposal)));
  }

  private proposalsUrl(requestId: string): string {
    return `${this.url}/${encodeURIComponent(requestId)}/match-proposals`;
  }
}
