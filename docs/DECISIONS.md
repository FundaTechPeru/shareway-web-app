# Decisions log

Decisions taken by the team during development, when the project specification
did not settle a question. Each entry says what was decided and why.

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

## Phase 2 — driver onboarding (US-16 to US-19, US-30)

- **Re-login after becoming a driver.** We do not keep the password, so after
  the profile is created the page asks the user to confirm their password and
  logs in again to get a DRIVER token. "Ingresar más tarde" logs out instead.
- **Document upload.** `type` is sent as a multipart form field next to the
  `file` part (not also as a query param, to avoid Spring joining both values).
  The client accepts PDF, JPG and PNG up to 10 MB; the backend still decides.
- **Latest document per type.** If a type was uploaded several times, the page
  shows the most recent upload. Approved documents cannot be replaced from the
  UI.
- **Plate format.** `^[A-Z0-9]{3}-\d{3}$`: the specification says `ABC-123`, and real
  Peruvian plates may mix letters and digits in the first block (`A1B-234`).
  The input uppercases and inserts the dash automatically.
- **Vehicle year.** Between 1980 and next year (no backend rule was documented).
- **Availability.** A 404 on `GET /drivers/me/availability` is treated as an
  empty schedule. Times are shown as `HH:mm` even if the backend sends
  `HH:mm:ss`. Slots of the same day cannot overlap and must end after they
  start.
- **Driver home.** Each request (profile, documents, vehicles) fails
  independently, so the checklist still renders if one service is down.

## Phase 3 — payments and earnings (US-25, US-26)

- **DTOs confirmed.** The Payments & Settlement OpenAPI spec (read-only GET of
  `/v3/api-docs/payments-settlement`) matches the API contract. It also defines the
  payment statuses `PENDING | AUTHORIZED | REJECTED | CAPTURED | VOIDED`, the
  `last4` pattern `\d{4}` and `expMonth` 1..12 / `expYear` 2000..2100.
- **Simulated decline.** Outside production the card form shows a "Simular
  tarjeta rechazada" checkbox that sends `tok_declined`, so the rejection flow
  can be demoed without inventing a card number.
- **Expired cards.** The form rejects cards that expired before the current
  month.
- **Delete confirmation** is inline on the card ("¿Eliminar esta tarjeta?")
  instead of a dialog, to keep the page simple.
- **Payment history** shows the captured amount when present, otherwise the
  authorized amount, and sorts by the latest relevant date.
- **Settlement detail** has its own route (`/driver/earnings/:id`) and uses
  `GET /settlements/me/{id}`.
- **Driver home** shows the earnings summary next to the verification
  checklist; if the summary fails, the rest of the page still works.

## Phase 4 — trips and bookings (US-02, US-03, US-04, US-12, US-23, US-24)

- **OpenAPI specs unavailable.** The Driver Management, Trip Planning, Booking
  and Trip Execution specs answered 502/503 for about 25 minutes (Render free
  tier), so these DTOs follow the API contract. Only Payments could be checked.
- **Legacy ids in Trip Planning.** `TripPlanningApiService` is the only place
  that knows `passengerId`/`driverId` are Long: numeric ids are sent as
  numbers, UUIDs as strings, and responses are normalized to string ids.
- **"My trip requests".** `GET /trip-requests` is not filtered by user, so the
  service filters on the client by passenger id and the page shows a
  "Disponible próximamente" notice. Other passengers' requests are never shown.
- **No `GET /trip-requests/{id}`.** The detail page takes the request from the
  list.
- **Match proposals.** "Buscar conductores" calls
  `POST /trip-requests/{id}/match-proposals` with an empty body; the response
  may be one proposal or a list.
- **Places and operationZone.** The selector offers 5 districts and 5
  universities with fixed coordinates. `operationZone` is the district code of
  the origin (for example `PUEBLO_LIBRE`), since no list of zones was
  documented.
- **Seats requested.** Between 1 and 4.
- **Booking flow.** "Reservar" on a proposal opens
  `/passenger/bookings/new?requestId=...`. Fare and booking need a `groupId`
  that no endpoint returns, so that page shows "Disponible próximamente" unless
  a `groupId` query param is present. `/passenger/bookings/:id` shows the
  status, a refresh button and cancellation with the penalty returned by the
  backend.
- **Idempotency-Key.** Created with `crypto.randomUUID()` on the first
  "Reservar" click, reused on retries after an error, and discarded once the
  booking is accepted.
- **Cancellable statuses.** `REQUESTED`, `GROUPED` and `CONFIRMED`.
- **Trip Execution adapter.** Spanish statuses (`PROGRAMADO`, `EN_CURSO`,
  `FINALIZADO`, `CANCELADO` and close variants) map to English ones; anything
  else is `UNKNOWN` and the raw value is displayed. Boarding results map to
  `VALID`, `INVALID` or `LOCKED`.
- **Boarding PIN.** 4 to 6 digits, method `PIN`.
- **Driver trips.** There is no "my trips" endpoint, so `/driver/trips` shows a
  notice and lets the driver open a trip by its code. Because Trip Execution
  has no authentication, the page hides the actions when the trip's
  `driverId` is not the logged-in driver (client-side check only).
- **Placeholder removed.** The phase 0 `ComingSoonPage` was deleted once every
  route had its page.
