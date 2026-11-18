# Decisions log

Decisions taken while working autonomously, when CLAUDE.md did not settle a
question. Each entry says what was decided and why.

## Phase 0 — project setup

- **Role home pages.** `/driver/home` lives in `driver-management` (it shows the
  verification checklist). `/passenger/home` is a small page in `core/layout`
  because it summarizes several bounded contexts.
- **Root URL.** `/` redirects to `/login`; logged-in users are sent from there to
  their home by `guestGuard`.

## Phase 1 — auth (US-31, US-32)

- **Branch name.** A `feature/us-32-login` branch already existed with no
  commits of its own; it was left untouched and the work happens in
  `feature/us-32-auth`, the name requested for this phase.
- **No GitHub CLI.** `gh` is not installed, so features are merged locally with
  `git merge --no-ff` and pushed at the end.
- **502 also means "service starting".** While testing the gateway, Render
  answered 502 (not only 503/504) while services were waking up, so the error
  interceptor shows "El servicio está iniciando, intenta en unos segundos" for
  502, 503 and 504.
- **Backend error messages.** The snackbar shows the backend `message` as is
  (we cannot translate free text). When the body has no `message`, a Spanish
  message per status is used.
- **401 on login/register** means wrong credentials, not an expired session: it
  shows the message and does not log out. Any other 401 logs out and goes to
  `/login`.
- **Opt-out of the global snackbar.** `SILENT_STATUSES` (an `HttpContextToken`)
  lets a service handle statuses such as a 404 meaning "not created yet".
- **ADMIN login.** The token is discarded right away and the login page shows a
  notice to use the admin panel, so an admin never keeps a session here.
- **returnUrl.** After login the app only honors a `returnUrl` inside the
  user's own area (`/passenger/...` or `/driver/...`).
- **Tolerant JWT parsing.** `role` may come as `PASSENGER` or `ROLE_PASSENGER`
  (or as a `roles` array); the user id is `userId`, falling back to `sub`.
- **User name in the shell** comes from `GET /users/me`; if it fails, the email
  from the token is shown.
- **`core` uses the IAM API service.** `AuthService` (core) calls
  `AuthApiService` (iam) so all `/auth` and `/users` calls stay in the IAM
  bounded context.
- **Locale.** `es-PE` is registered and the default currency is PEN, so the
  standard `date` and `currency` pipes already format for Peru.
