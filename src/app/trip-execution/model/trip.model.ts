import {StatusTone} from '../../shared/components/status-chip/status-chip';

/** App-level trip status (the service answers in Spanish; see the adapter). */
export type TripStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'UNKNOWN';

export interface Boarding {
  bookingId: string;
  passengerId: string;
  boarded: boolean;
  boardedAt: string | null;
  failedAttempts: number;
  locked: boolean;
}

export interface Trip {
  id: string;
  groupId: string;
  driverId: string;
  status: TripStatus;
  /** Raw status from the service, shown when it is not a known value. */
  rawStatus: string;
  startedAt: string | null;
  finishedAt: string | null;
  boardings: Boarding[];
}

export type BoardingMethod = 'PIN';

export interface BoardingValidation {
  driverId: string;
  bookingId: string;
  code: string;
  method: BoardingMethod;
}

export type BoardingOutcome = 'VALID' | 'INVALID' | 'LOCKED';

export interface BoardingResult {
  outcome: BoardingOutcome;
  /** Raw `resultado` from the service. */
  rawResult: string;
  failedAttempts: number;
  remainingAttempts: number;
}

export const TRIP_STATUS_LABELS: Record<TripStatus, string> = {
  SCHEDULED: 'Programado',
  IN_PROGRESS: 'En curso',
  COMPLETED: 'Finalizado',
  CANCELLED: 'Cancelado',
  UNKNOWN: 'Desconocido',
};

export const TRIP_STATUS_TONES: Record<TripStatus, StatusTone> = {
  SCHEDULED: 'info',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'error',
  UNKNOWN: 'neutral',
};
