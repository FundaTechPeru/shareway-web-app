import {StatusTone} from '../../shared/components/status-chip/status-chip';

export type SettlementStatus = 'PENDING' | 'PAID';

/** GET /settlements/me */
export interface SettlementResponse {
  id: string;
  tripId: string;
  driverId: string;
  grossAmount: number;
  commissionAmount: number;
  netAmount: number;
  currency: string;
  status: SettlementStatus;
  tripCompletedAt: string;
  createdAt: string;
  paidAt: string | null;
}

/** GET /settlements/me/summary */
export interface EarningsSummaryResponse {
  totalGross: number;
  totalCommission: number;
  totalNet: number;
  pendingNet: number;
  paidNet: number;
}

export const SETTLEMENT_STATUS_LABELS: Record<SettlementStatus, string> = {
  PENDING: 'Pendiente de pago',
  PAID: 'Pagado',
};

export const SETTLEMENT_STATUS_TONES: Record<SettlementStatus, StatusTone> = {
  PENDING: 'warning',
  PAID: 'success',
};
