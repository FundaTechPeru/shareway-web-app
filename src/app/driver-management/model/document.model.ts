export type DocumentType =
  'DRIVERS_LICENSE' | 'NATIONAL_ID' | 'CRIMINAL_RECORD' | 'VEHICLE_REGISTRATION';

export type DocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/** GET /drivers/me/documents */
export interface DocumentResponse {
  id: string;
  driverId: string;
  type: DocumentType;
  status: DocumentStatus;
  originalFilename: string;
  contentType: string;
  sizeBytes: number;
  rejectionReason: string | null;
  uploadedAt: string;
  reviewedAt: string | null;
}

/** All documents a driver must have approved, in display order. */
export const DOCUMENT_TYPES: readonly DocumentType[] = [
  'DRIVERS_LICENSE',
  'NATIONAL_ID',
  'CRIMINAL_RECORD',
  'VEHICLE_REGISTRATION',
];

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  DRIVERS_LICENSE: 'Licencia de conducir',
  NATIONAL_ID: 'DNI',
  CRIMINAL_RECORD: 'Certificado de antecedentes penales',
  VEHICLE_REGISTRATION: 'Tarjeta de propiedad del vehículo',
};

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  PENDING: 'En revisión',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
};

/** Latest uploaded document of each type (by `uploadedAt`). */
export function latestByType(
  documents: readonly DocumentResponse[],
): Partial<Record<DocumentType, DocumentResponse>> {
  const latest: Partial<Record<DocumentType, DocumentResponse>> = {};
  for (const doc of documents) {
    const current = latest[doc.type];
    if (!current || doc.uploadedAt > current.uploadedAt) {
      latest[doc.type] = doc;
    }
  }
  return latest;
}
