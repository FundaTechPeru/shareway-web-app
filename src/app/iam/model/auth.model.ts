/** User roles issued by the Driver Management service. */
export type Role = 'PASSENGER' | 'DRIVER' | 'ADMIN';

export type DriverStatus = 'PENDING_VERIFICATION' | 'VERIFIED';

/** POST /auth/register */
export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}

/** POST /auth/login */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

/** GET /users/me */
export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: Role;
  driverStatus: DriverStatus | null;
  createdAt: string;
}
