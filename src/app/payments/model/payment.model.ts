import {StatusTone} from '../../shared/components/status-chip/status-chip';

export type CardBrand = 'VISA' | 'MASTERCARD' | 'AMEX';

/** POST /payment-methods (simulated gateway: any token works, `tok_declined` fails). */
export interface RegisterPaymentMethodRequest {
  cardToken: string;
  brand: CardBrand;
  last4: string;
  expMonth: number;
  expYear: number;
}

/** GET /payment-methods */
export interface PaymentMethodResponse {
  id: string;
  brand: CardBrand;
  last4: string;
  expMonth: number;
  expYear: number;
}

export type PaymentStatus = 'PENDING' | 'AUTHORIZED' | 'REJECTED' | 'CAPTURED' | 'VOIDED';

/** GET /payments/me */
export interface PaymentResponse {
  id: string;
  bookingId: string;
  passengerId: string;
  paymentMethodId: string;
  status: PaymentStatus;
  authorizedAmount: number | null;
  capturedAmount: number | null;
  currency: string;
  providerRef: string | null;
  authorizedAt: string | null;
  capturedAt: string | null;
  voidedAt: string | null;
}

export const CARD_BRANDS: readonly CardBrand[] = ['VISA', 'MASTERCARD', 'AMEX'];

export const CARD_BRAND_LABELS: Record<CardBrand, string> = {
  VISA: 'Visa',
  MASTERCARD: 'Mastercard',
  AMEX: 'American Express',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Pendiente',
  AUTHORIZED: 'Autorizado',
  REJECTED: 'Rechazado',
  CAPTURED: 'Cobrado',
  VOIDED: 'Anulado',
};

export const PAYMENT_STATUS_TONES: Record<PaymentStatus, StatusTone> = {
  PENDING: 'neutral',
  AUTHORIZED: 'info',
  REJECTED: 'error',
  CAPTURED: 'success',
  VOIDED: 'warning',
};

/** Simulated card token; the full card number is never requested. */
export function simulatedCardToken(declined = false): string {
  return declined ? 'tok_declined' : `tok_${crypto.randomUUID()}`;
}
