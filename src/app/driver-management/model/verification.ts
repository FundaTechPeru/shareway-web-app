import {
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_TYPES,
  DOCUMENT_TYPE_LABELS,
  DocumentResponse,
  latestByType,
} from './document.model';
import {VehicleResponse} from './vehicle.model';

export type ChecklistState = 'done' | 'pending' | 'rejected' | 'missing';

export interface ChecklistItem {
  label: string;
  detail: string;
  state: ChecklistState;
  link: string;
}

/**
 * Verification checklist: the driver becomes VERIFIED once there is a vehicle
 * and all 4 documents are approved.
 */
export function buildChecklist(
  documents: readonly DocumentResponse[],
  vehicles: readonly VehicleResponse[],
): ChecklistItem[] {
  const latest = latestByType(documents);
  const documentItems = DOCUMENT_TYPES.map((type): ChecklistItem => {
    const doc = latest[type];
    const state: ChecklistState = !doc
      ? 'missing'
      : doc.status === 'APPROVED'
        ? 'done'
        : doc.status === 'REJECTED'
          ? 'rejected'
          : 'pending';
    return {
      label: DOCUMENT_TYPE_LABELS[type],
      detail: doc ? DOCUMENT_STATUS_LABELS[doc.status] : 'Sin subir',
      state,
      link: '/driver/documents',
    };
  });
  const vehicleItem: ChecklistItem = {
    label: 'Vehículo registrado',
    detail: vehicles.length > 0 ? `${vehicles.length} registrado(s)` : 'Sin registrar',
    state: vehicles.length > 0 ? 'done' : 'missing',
    link: '/driver/vehicles',
  };
  return [...documentItems, vehicleItem];
}
