import {StatusTone} from '../../shared/components/status-chip/status-chip';

export type BookingStatus =
  'REQUESTED' | 'GROUPED' | 'CONFIRMED' | 'BOARDED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

/** GET /fares/estimate?groupId= */
export interface FareEstimate {
  amount: number;
  currency: string;
  ruleVersion: string;
}

/** POST /bookings */
export interface CreateBookingRequest {
  requestId: string;
  groupId: string;
}

/** POST /bookings (202) and GET /bookings/{id} */
export interface Booking {
  bookingId: string;
  status: BookingStatus;
}

/** POST /bookings/{id}/cancel */
export interface BookingCancellation {
  bookingId: string;
  status: BookingStatus;
  penaltyAmount: number;
  currency: string;
}

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  REQUESTED: 'Solicitada',
  GROUPED: 'Agrupada',
  CONFIRMED: 'Confirmada',
  BOARDED: 'A bordo',
  IN_PROGRESS: 'En curso',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
};

export const BOOKING_STATUS_TONES: Record<BookingStatus, StatusTone> = {
  REQUESTED: 'neutral',
  GROUPED: 'info',
  CONFIRMED: 'success',
  BOARDED: 'success',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
  CANCELLED: 'error',
};

/** A booking can be cancelled until the trip starts. */
export function isCancellable(status: BookingStatus): boolean {
  return status === 'REQUESTED' || status === 'GROUPED' || status === 'CONFIRMED';
}
