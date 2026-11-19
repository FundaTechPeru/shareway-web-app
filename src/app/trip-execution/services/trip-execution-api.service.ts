import {HttpClient} from '@angular/common/http';
import {Injectable, inject} from '@angular/core';
import {Observable, map} from 'rxjs';
import {environment} from '../../../environments/environment';
import {
  Boarding,
  BoardingOutcome,
  BoardingResult,
  BoardingValidation,
  Trip,
  TripStatus,
} from '../model/trip.model';

// --- Wire format (Spanish). Never leaves this file. ---

interface AbordajeDto {
  reservaId: string;
  pasajeroId: string;
  abordo: boolean;
  abordadoEn: string | null;
  intentosFallidos: number;
  bloqueado: boolean;
}

interface ViajeDto {
  id: string;
  grupoId: string;
  conductorId: string;
  estado: string;
  inicioReal: string | null;
  finReal: string | null;
  abordajes: AbordajeDto[] | null;
}

interface ValidarAbordajeDto {
  conductorId: string;
  reservaId: string;
  codigo: string;
  metodo: string;
}

interface ResultadoAbordajeDto {
  resultado: string;
  intentosFallidos: number;
  intentosRestantes: number;
}

const STATUS_BY_ESTADO: Record<string, TripStatus> = {
  PROGRAMADO: 'SCHEDULED',
  PENDIENTE: 'SCHEDULED',
  CREADO: 'SCHEDULED',
  SCHEDULED: 'SCHEDULED',
  EN_CURSO: 'IN_PROGRESS',
  INICIADO: 'IN_PROGRESS',
  IN_PROGRESS: 'IN_PROGRESS',
  FINALIZADO: 'COMPLETED',
  COMPLETADO: 'COMPLETED',
  COMPLETED: 'COMPLETED',
  CANCELADO: 'CANCELLED',
  CANCELLED: 'CANCELLED',
};

export function toTripStatus(estado: string): TripStatus {
  return STATUS_BY_ESTADO[(estado ?? '').toUpperCase()] ?? 'UNKNOWN';
}

export function toBoardingOutcome(resultado: string): BoardingOutcome {
  const value = (resultado ?? '').toUpperCase();
  if (value.includes('BLOQUEAD') || value.includes('LOCKED')) {
    return 'LOCKED';
  }
  if (value.includes('INVALID') || value.includes('RECHAZ') || value.includes('FALL')) {
    return 'INVALID';
  }
  if (
    ['VALIDO', 'VALIDADO', 'EXITOSO', 'EXITO', 'OK', 'ABORDADO', 'VALID'].some(v => value === v)
  ) {
    return 'VALID';
  }
  return 'INVALID';
}

function toBoarding(dto: AbordajeDto): Boarding {
  return {
    bookingId: dto.reservaId,
    passengerId: dto.pasajeroId,
    boarded: dto.abordo,
    boardedAt: dto.abordadoEn,
    failedAttempts: dto.intentosFallidos ?? 0,
    locked: dto.bloqueado,
  };
}

export function toTrip(dto: ViajeDto): Trip {
  return {
    id: dto.id,
    groupId: dto.grupoId,
    driverId: dto.conductorId,
    status: toTripStatus(dto.estado),
    rawStatus: dto.estado,
    startedAt: dto.inicioReal,
    finishedAt: dto.finReal,
    boardings: (dto.abordajes ?? []).map(toBoarding),
  };
}

function toBoardingResult(dto: ResultadoAbordajeDto): BoardingResult {
  return {
    outcome: toBoardingOutcome(dto.resultado),
    rawResult: dto.resultado,
    failedAttempts: dto.intentosFallidos,
    remainingAttempts: dto.intentosRestantes,
  };
}

/**
 * Adapter for the Trip Execution service, which speaks Spanish (the gateway
 * maps /api/v1/trips to /api/viajes). It exposes English models only.
 * TODO(backend): the service has no authentication yet (backend blocker
 * #6 in docs/PROGRESS.md), so the driver id is sent in the body.
 */
@Injectable({providedIn: 'root'})
export class TripExecutionApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/trips`;

  get(tripId: string): Observable<Trip> {
    return this.http.get<ViajeDto>(this.tripUrl(tripId)).pipe(map(toTrip));
  }

  validateBoarding(tripId: string, validation: BoardingValidation): Observable<BoardingResult> {
    const body: ValidarAbordajeDto = {
      conductorId: validation.driverId,
      reservaId: validation.bookingId,
      codigo: validation.code,
      metodo: validation.method,
    };
    return this.http
      .post<ResultadoAbordajeDto>(`${this.tripUrl(tripId)}/abordajes`, body)
      .pipe(map(toBoardingResult));
  }

  start(tripId: string, driverId: string): Observable<void> {
    return this.http.post<void>(`${this.tripUrl(tripId)}/iniciar`, {conductorId: driverId});
  }

  finish(tripId: string, driverId: string): Observable<void> {
    return this.http.post<void>(`${this.tripUrl(tripId)}/finalizar`, {conductorId: driverId});
  }

  cancel(tripId: string, reason: string): Observable<void> {
    return this.http.post<void>(`${this.tripUrl(tripId)}/cancelar`, {motivo: reason});
  }

  private tripUrl(tripId: string): string {
    return `${this.url}/${encodeURIComponent(tripId)}`;
  }
}
