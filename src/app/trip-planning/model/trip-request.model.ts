import {StatusTone} from '../../shared/components/status-chip/status-chip';

export type TripRequestStatus = 'PENDING_MATCH' | 'PROPOSED' | 'CONFIRMED' | 'CANCELLED';
export type MatchProposalStatus = 'PROPOSED' | 'ACCEPTED' | 'EXPIRED' | 'REJECTED';

/**
 * App model of a new trip request. The passenger is taken from the session by
 * TripPlanningApiService, so it is not part of this form model.
 */
export interface NewTripRequest {
  originLabel: string;
  destinationLabel: string;
  operationZone: string;
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
  /** YYYY-MM-DD */
  travelDate: string;
  /** HH:mm */
  earliestDeparture: string;
  /** HH:mm */
  latestDeparture: string;
  seatsRequested: number;
}

/** App model of a trip request (ids normalized to strings). */
export interface TripRequest {
  id: string;
  passengerId: string;
  originLabel: string;
  destinationLabel: string;
  operationZone: string;
  travelDate: string;
  earliestDeparture: string;
  latestDeparture: string;
  seatsRequested: number;
  status: TripRequestStatus;
  createdAt: string;
}

/** App model of a match proposal (ids normalized to strings). */
export interface MatchProposal {
  id: string;
  driverId: string;
  estimatedFare: number;
  estimatedDurationMinutes: number;
  status: MatchProposalStatus;
  createdAt: string;
}

export const TRIP_REQUEST_STATUS_LABELS: Record<TripRequestStatus, string> = {
  PENDING_MATCH: 'Buscando conductor',
  PROPOSED: 'Con propuestas',
  CONFIRMED: 'Confirmada',
  CANCELLED: 'Cancelada',
};

export const TRIP_REQUEST_STATUS_TONES: Record<TripRequestStatus, StatusTone> = {
  PENDING_MATCH: 'warning',
  PROPOSED: 'info',
  CONFIRMED: 'success',
  CANCELLED: 'neutral',
};

export const PROPOSAL_STATUS_LABELS: Record<MatchProposalStatus, string> = {
  PROPOSED: 'Propuesta',
  ACCEPTED: 'Aceptada',
  EXPIRED: 'Vencida',
  REJECTED: 'Rechazada',
};

export const PROPOSAL_STATUS_TONES: Record<MatchProposalStatus, StatusTone> = {
  PROPOSED: 'info',
  ACCEPTED: 'success',
  EXPIRED: 'neutral',
  REJECTED: 'error',
};
