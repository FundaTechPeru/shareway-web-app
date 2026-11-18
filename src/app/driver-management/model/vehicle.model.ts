/** POST/PUT /drivers/me/vehicles */
export interface VehicleRequest {
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  seats: number;
}

/** GET /drivers/me/vehicles */
export interface VehicleResponse extends VehicleRequest {
  id: string;
}

/** Plate in the ABC-123 format (letters or digits, a dash and 3 digits). */
export const PLATE_PATTERN = /^[A-Z0-9]{3}-\d{3}$/;
export const MIN_SEATS = 1;
export const MAX_SEATS = 8;
