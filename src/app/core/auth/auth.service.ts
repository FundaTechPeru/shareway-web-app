import {Injectable, computed, inject, signal} from '@angular/core';
import {Router} from '@angular/router';
import {Observable, map, switchMap} from 'rxjs';
import {LoginRequest, RegisterRequest, Role} from '../../iam/model/auth.model';
import {AuthApiService} from '../../iam/services/auth-api.service';
import {NotificationService} from '../notifications/notification.service';
import {AuthUser, isExpired, parseAuthUser} from './jwt';
import {TokenStorage} from './token-storage';

/** setTimeout cannot wait longer than ~24.8 days. */
const MAX_TIMEOUT_MS = 2_147_483_647;

interface Session {
  token: string;
  user: AuthUser;
}

/** Holds the session as signals and handles login, register and logout. */
@Injectable({providedIn: 'root'})
export class AuthService {
  private readonly api = inject(AuthApiService);
  private readonly storage = inject(TokenStorage);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);

  private readonly session = signal<Session | null>(null);
  private expiryTimer: ReturnType<typeof setTimeout> | null = null;

  readonly currentUser = computed(() => this.session()?.user ?? null);
  readonly role = computed<Role | null>(() => this.currentUser()?.role ?? null);
  readonly isAuthenticated = computed(() => this.session() !== null);

  constructor() {
    const token = this.storage.get();
    if (token && !this.startSession(token)) {
      this.storage.clear();
    }
  }

  /** Raw access token for the Authorization header. */
  accessToken(): string | null {
    return this.session()?.token ?? null;
  }

  login(credentials: LoginRequest): Observable<AuthUser> {
    return this.api.login(credentials).pipe(
      map(response => {
        const user = this.startSession(response.accessToken);
        if (!user) {
          throw new Error('The access token could not be read.');
        }
        this.storage.set(response.accessToken);
        return user;
      }),
    );
  }

  /** Registers a passenger and logs them in right away. */
  register(request: RegisterRequest): Observable<AuthUser> {
    return this.api
      .register(request)
      .pipe(switchMap(() => this.login({email: request.email, password: request.password})));
  }

  /** Ends the session; by default navigates to /login. */
  logout(options: {redirect?: boolean; message?: string} = {}): void {
    this.clearTimer();
    this.session.set(null);
    this.storage.clear();
    if (options.message) {
      this.notifications.error(options.message);
    }
    if (options.redirect ?? true) {
      void this.router.navigateByUrl('/login');
    }
  }

  /** Landing URL for a role; ADMIN has no place in this app. */
  homeUrl(role: Role | null = this.role()): string {
    switch (role) {
      case 'PASSENGER':
        return '/passenger/home';
      case 'DRIVER':
        return '/driver/home';
      default:
        return '/login';
    }
  }

  private startSession(token: string): AuthUser | null {
    const user = parseAuthUser(token);
    if (!user || isExpired(user)) {
      return null;
    }
    this.session.set({token, user});
    this.scheduleExpiry(user);
    return user;
  }

  private scheduleExpiry(user: AuthUser): void {
    this.clearTimer();
    if (user.expiresAt === null) {
      return;
    }
    const delay = Math.min(user.expiresAt - Date.now(), MAX_TIMEOUT_MS);
    this.expiryTimer = setTimeout(
      () => this.logout({message: 'Tu sesión expiró. Inicia sesión nuevamente.'}),
      delay,
    );
  }

  private clearTimer(): void {
    if (this.expiryTimer !== null) {
      clearTimeout(this.expiryTimer);
      this.expiryTimer = null;
    }
  }
}
