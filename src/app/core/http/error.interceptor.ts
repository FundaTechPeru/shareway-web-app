import {
  HttpContextToken,
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import {inject} from '@angular/core';
import {catchError, throwError} from 'rxjs';
import {AuthService} from '../auth/auth.service';
import {NotificationService} from '../notifications/notification.service';

/**
 * Lets a caller handle some HTTP statuses itself (for example a 404 that just
 * means "not created yet") without the global snackbar.
 */
export const SILENT_STATUSES = new HttpContextToken<readonly number[]>(() => []);

export const SERVICE_STARTING_MESSAGE = 'El servicio está iniciando, intenta en unos segundos';
export const SESSION_EXPIRED_MESSAGE = 'Tu sesión expiró. Inicia sesión nuevamente.';

const FALLBACK_MESSAGES: Record<number, string> = {
  0: 'No se pudo conectar con el servidor. Revisa tu conexión.',
  400: 'Los datos enviados no son válidos.',
  401: 'Correo o contraseña incorrectos.',
  403: 'No tienes permiso para realizar esta acción.',
  404: 'No se encontró el recurso solicitado.',
  409: 'La operación entra en conflicto con datos existentes.',
};

/** Gateway statuses that mean a Render service is down or waking up. */
const STARTING_STATUSES = [502, 503, 504];

/** Extracts the `message` field of the backend error JSON, if any. */
export function backendMessage(error: HttpErrorResponse): string | null {
  const body: unknown = error.error;
  if (typeof body === 'object' && body !== null && 'message' in body) {
    const message = (body as {message: unknown}).message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }
  return null;
}

/** Spanish message to show for an HTTP error. */
export function errorMessage(error: HttpErrorResponse): string {
  if (STARTING_STATUSES.includes(error.status)) {
    return SERVICE_STARTING_MESSAGE;
  }
  return (
    backendMessage(error) ??
    FALLBACK_MESSAGES[error.status] ??
    'Ocurrió un error inesperado. Intenta nuevamente.'
  );
}

function isAuthRequest(req: HttpRequest<unknown>): boolean {
  return /\/auth\/(login|register)$/.test(req.url);
}

/**
 * Shows backend errors in a snackbar. A 401 outside of login/register means
 * the session is no longer valid: it logs out and goes to /login.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const notifications = inject(NotificationService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }
      if (error.status === 401 && !isAuthRequest(req)) {
        auth.logout({message: SESSION_EXPIRED_MESSAGE});
      } else if (!req.context.get(SILENT_STATUSES).includes(error.status)) {
        notifications.error(errorMessage(error));
      }
      return throwError(() => error);
    }),
  );
};
