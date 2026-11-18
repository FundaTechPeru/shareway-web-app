import {Injectable} from '@angular/core';

const ACCESS_TOKEN_KEY = 'shareway.accessToken';

/**
 * Persists the access token in localStorage. Storage can be unavailable
 * (private mode, blocked site data), so every access is guarded.
 */
@Injectable({providedIn: 'root'})
export class TokenStorage {
  get(): string | null {
    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  set(token: string): void {
    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } catch {
      // The session still works in memory for this tab.
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    } catch {
      // Nothing to clear.
    }
  }
}
