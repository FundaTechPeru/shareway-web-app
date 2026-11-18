import {DriverStatus} from '../../iam/model/auth.model';

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

/** POST /users/me/driver-profile */
export interface CreateDriverProfileRequest {
  licenseNumber: string;
  emergencyContact: EmergencyContact;
}

/** GET /users/me/driver-profile */
export interface DriverProfileResponse {
  userId: string;
  fullName: string;
  email: string;
  licenseNumber: string;
  driverStatus: DriverStatus;
  emergencyContact: EmergencyContact;
}

export const DRIVER_STATUS_LABELS: Record<DriverStatus, string> = {
  PENDING_VERIFICATION: 'Verificación pendiente',
  VERIFIED: 'Verificado',
};
