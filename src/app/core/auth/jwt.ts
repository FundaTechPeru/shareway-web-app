import {Role} from '../../iam/model/auth.model';

/** Authenticated user as read from the access token claims. */
export interface AuthUser {
  /** UUID taken from the `userId` claim, or `sub` when missing. */
  id: string;
  email: string;
  role: Role;
  /** Expiration in epoch milliseconds, or `null` when the token has no `exp`. */
  expiresAt: number | null;
}

const ROLES: readonly Role[] = ['PASSENGER', 'DRIVER', 'ADMIN'];

/** Decodes the payload of a JWT without validating its signature. */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length !== 3 || !parts[1]) {
    return null;
  }
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const bytes = Uint8Array.from(atob(padded), c => c.charCodeAt(0));
    const payload: unknown = JSON.parse(new TextDecoder().decode(bytes));
    return typeof payload === 'object' && payload !== null
      ? (payload as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

/** Accepts `PASSENGER` as well as Spring-style `ROLE_PASSENGER`. */
function toRole(value: unknown): Role | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== 'string') {
    return null;
  }
  const normalized = raw.toUpperCase().replace(/^ROLE_/, '');
  return (ROLES as readonly string[]).includes(normalized) ? (normalized as Role) : null;
}

/** Maps the token claims (`sub`/`userId`, `email`, `role`, `exp`) to an AuthUser. */
export function parseAuthUser(token: string): AuthUser | null {
  const claims = decodeJwtPayload(token);
  if (!claims) {
    return null;
  }
  const id = claims['userId'] ?? claims['sub'];
  const role = toRole(claims['role'] ?? claims['roles']);
  const email = claims['email'];
  const exp = claims['exp'];
  if ((typeof id !== 'string' && typeof id !== 'number') || !role) {
    return null;
  }
  return {
    id: String(id),
    email: typeof email === 'string' ? email : '',
    role,
    expiresAt: typeof exp === 'number' ? exp * 1000 : null,
  };
}

/** True when the user's token has expired at `now` (epoch ms). */
export function isExpired(user: AuthUser, now = Date.now()): boolean {
  return user.expiresAt !== null && user.expiresAt <= now;
}
