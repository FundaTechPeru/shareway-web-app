# Progress report — shareway-web-app

Web app for ShareWay passengers and drivers (Angular 22 + Angular Material).
All phases were merged into `develop` with `git merge --no-ff`. Before every
merge, `npm run lint`, `npm test -- --watch=false` and `npm run build` passed.
Current state: **27 test files, 158 unit tests, all passing**.

Decisions taken along the way are in [DECISIONS.md](DECISIONS.md).

## Summary by phase

### Phase 0 — project setup (`feature/project-setup`)

- SCSS instead of CSS, Angular Material (Material 3) with a ShareWay theme
  (teal `#0F766E`, amber `#F59E0B`).
- gts (Google TypeScript Style Guide) with `lint`, `fix` and `clean` scripts;
  LF line endings enforced with `.gitattributes`.
- Environments with `apiBaseUrl` and `proxy.conf.json` (`/api` → API Gateway)
  used by `npm start`. Strict TypeScript and strict templates.
- Folders per bounded context with lazy routes, GitHub Actions CI,
  `render.yaml` and README.

### Phase 1 — authentication (`feature/us-32-auth`, US-31, US-32)

- `core/auth`: `TokenStorage` (localStorage), JWT decoding (`sub`/`userId`,
  `email`, `role`, `exp`) and `AuthService` with signals (`currentUser`,
  `role`, `isAuthenticated`), login, register with automatic login, logout and
  automatic logout when the token expires.
- `core/http`: `authInterceptor` (Bearer token, only for gateway URLs) and
  `errorInterceptor` (401 → logout and `/login`; backend `message` in a
  snackbar; 502/503/504 → "El servicio está iniciando, intenta en unos
  segundos").
- `core/guards`: `authGuard`, `roleGuard('PASSENGER' | 'DRIVER')` on
  `/passenger` and `/driver`, and `guestGuard` on `/login` and `/register`.
- Login and register pages with Reactive Forms and the exact backend rules;
  redirect by role; ADMIN sees a notice to use the admin panel.
- Shell with the user's name (`GET /users/me`), a role-based side menu
  (responsive) and logout. Passenger home with quick links.

### Phase 2 — driver onboarding (`feature/us-17-driver-onboarding`, US-16 to US-19, US-30)

- Become a driver: driver profile form, then the user confirms the password to
  log in again and get a DRIVER token.
- Documents: multipart upload of the 4 types, status and rejection reason.
- Vehicles: register and edit (plate `ABC-123`, 1-8 seats).
- Availability: editable weekly schedule (GET/PUT) with validation of time
  ranges and overlaps.
- Driver home: verification checklist (4 documents + vehicle) and status.

### Phase 3 — payments and earnings (`feature/us-25-payments-earnings`, US-25, US-26)

- Passenger payment methods: list, add (simulated token `tok_<uuid>`, only
  brand, last 4 digits and expiration) and delete with confirmation.
- Passenger payment history.
- Driver earnings: summary, settlements list and settlement detail; summary
  also shown on the driver home.

### Phase 4 — trips and bookings (`feature/us-02-trips-bookings`, US-02, US-03, US-04, US-12, US-23, US-24)

- Trip Planning: trip request form with predefined Lima places (districts and
  universities), requests list and detail with match proposals. The Long ids
  of the service are isolated in `TripPlanningApiService`.
- Booking: fare estimate and reservation with an `Idempotency-Key` reused on
  retries; booking status and cancellation with penalty.
- Trip Execution: adapter that maps the Spanish API to English models; driver
  trip page with PIN boarding validation, start, finish and cancel.
- Flows blocked by the backend show the full UI with a "Disponible
  próximamente" notice and a `// TODO(backend): ...` comment.

## Commits

All commits reachable from `develop` at the time of writing (the commit that
updates this table is not listed).

| Repository | Branch | Commit Id | Commit Message | Commit Message Body | Committed on (Date) |
|---|---|---|---|---|---|
| FundaTechPeru/shareway-web-app | main | 1479de2 | initial commit | — | 2026-11-18 17:27 |
| FundaTechPeru/shareway-web-app | feature/project-setup | 42f69c1 | chore: switch stylesheets from CSS to SCSS | — | 2026-11-18 17:36 |
| FundaTechPeru/shareway-web-app | feature/project-setup | d607f51 | feat: add Angular Material with a custom ShareWay theme | — | 2026-11-18 17:37 |
| FundaTechPeru/shareway-web-app | feature/project-setup | 5ff7e2b | chore: configure gts for Google TypeScript Style Guide | Add lint, fix and clean scripts, ESLint flat config pointing to the Angular tsconfig projects, gts Prettier config, and enforce LF line endings via .gitattributes. | 2026-11-18 17:38 |
| FundaTechPeru/shareway-web-app | feature/project-setup | 0f89e89 | chore: add environments with apiBaseUrl and dev-server proxy to the gateway | — | 2026-11-18 17:38 |
| FundaTechPeru/shareway-web-app | feature/project-setup | 2914691 | chore: enable explicit strict TypeScript and strict template checks | — | 2026-11-18 17:38 |
| FundaTechPeru/shareway-web-app | feature/project-setup | 9693d5b | feat: scaffold bounded-context folders with lazy placeholder routes | Add core, shared and one folder per bounded context (iam, driver-management, trip-planning, booking, payments, trip-execution), each with a lazy routes file rendering a shared ComingSoonPage. Add a minimal Shell layout for /passenger and /driver and route tests. | 2026-11-18 17:40 |
| FundaTechPeru/shareway-web-app | feature/project-setup | e39d1ca | ci: add GitHub Actions workflow running lint, tests and build | — | 2026-11-18 17:40 |
| FundaTechPeru/shareway-web-app | feature/project-setup | bb5c73b | chore: add Render Blueprint for the static site deployment | — | 2026-11-18 17:40 |
| FundaTechPeru/shareway-web-app | feature/project-setup | 72f9542 | docs: write README with setup, structure and deployment | — | 2026-11-18 17:41 |
| FundaTechPeru/shareway-web-app | develop | fe32c10 | Merge branch 'feature/project-setup' into develop | — | 2026-11-18 17:46 |
| FundaTechPeru/shareway-web-app | feature/us-32-auth | e64fa7e | docs: add decisions log | — | 2026-11-18 17:50 |
| FundaTechPeru/shareway-web-app | feature/us-32-auth | 21548d6 | feat(iam): add auth and users API services with DTO models | — | 2026-11-18 17:50 |
| FundaTechPeru/shareway-web-app | feature/us-32-auth | d1f5c1f | feat(auth): add token storage, JWT decoding and signal-based AuthService | Logs in, registers with automatic login, logs out, and logs out automatically when the token expires. | 2026-11-18 17:50 |
| FundaTechPeru/shareway-web-app | feature/us-32-auth | 70ee5d6 | feat(http): add auth and error interceptors with Spanish snackbar messages | — | 2026-11-18 17:50 |
| FundaTechPeru/shareway-web-app | feature/us-32-auth | a026ed7 | feat(guards): add authGuard, roleGuard and guestGuard | — | 2026-11-18 17:50 |
| FundaTechPeru/shareway-web-app | feature/us-32-auth | 02f3b8a | feat(iam): add login and passenger registration pages (US-31, US-32) | Reactive forms with the backend validation rules, redirect by role, admin notice, and automatic login after registering. | 2026-11-18 17:52 |
| FundaTechPeru/shareway-web-app | feature/us-32-auth | 5f9ea44 | feat(layout): show user name, role-based menu and logout in the shell | — | 2026-11-18 17:54 |
| FundaTechPeru/shareway-web-app | feature/us-32-auth | 6b8d840 | feat(layout): add passenger home with quick links | — | 2026-11-18 17:54 |
| FundaTechPeru/shareway-web-app | feature/us-32-auth | 4f78d97 | feat(routes): protect passenger and driver areas with auth and role guards | — | 2026-11-18 17:54 |
| FundaTechPeru/shareway-web-app | feature/us-32-auth | 27d9705 | docs: record phase 1 decisions | — | 2026-11-18 17:54 |
| FundaTechPeru/shareway-web-app | develop | c0b5b09 | Merge branch 'feature/us-32-auth' into develop | — | 2026-11-18 17:55 |
| FundaTechPeru/shareway-web-app | feature/us-17-driver-onboarding | f680089 | feat(driver-management): add profile, documents, vehicles and availability API services | — | 2026-11-18 17:56 |
| FundaTechPeru/shareway-web-app | feature/us-17-driver-onboarding | 28263e8 | refactor: move password and phone patterns to shared validation | — | 2026-11-18 17:58 |
| FundaTechPeru/shareway-web-app | feature/us-17-driver-onboarding | d5373f3 | feat(driver-management): add become-driver page with re-login as DRIVER (US-16) | — | 2026-11-18 17:58 |
| FundaTechPeru/shareway-web-app | feature/us-17-driver-onboarding | e51b871 | feat(shared): add status chip component | — | 2026-11-18 17:59 |
| FundaTechPeru/shareway-web-app | feature/us-17-driver-onboarding | 74fdf76 | feat(driver-management): add documents page with multipart upload and review status (US-17) | — | 2026-11-18 17:59 |
| FundaTechPeru/shareway-web-app | feature/us-17-driver-onboarding | 3c3f3f8 | feat(driver-management): add vehicles page to register and edit vehicles (US-18, US-30) | — | 2026-11-18 18:00 |
| FundaTechPeru/shareway-web-app | feature/us-17-driver-onboarding | 3ab5c4b | feat(driver-management): add editable weekly availability (US-19) | Validates end after start and no overlapping slots per day; saving replaces the whole schedule with PUT. | 2026-11-18 18:01 |
| FundaTechPeru/shareway-web-app | feature/us-17-driver-onboarding | 8640e17 | feat(driver-management): add driver home with verification checklist | — | 2026-11-18 18:02 |
| FundaTechPeru/shareway-web-app | feature/us-17-driver-onboarding | 5254976 | docs: record phase 2 decisions | — | 2026-11-18 18:02 |
| FundaTechPeru/shareway-web-app | develop | 041649f | Merge branch 'feature/us-17-driver-onboarding' into develop | — | 2026-11-18 18:03 |
| FundaTechPeru/shareway-web-app | feature/us-25-payments-earnings | 2ec683c | feat(payments): add payment methods, payments and settlements API services | — | 2026-11-18 18:04 |
| FundaTechPeru/shareway-web-app | feature/us-25-payments-earnings | dea4204 | feat(payments): add payment methods page with simulated card tokens | Only brand, last 4 digits and expiration are captured; the token is tok_<uuid> (or tok_declined to simulate a rejection outside production). | 2026-11-18 18:07 |
| FundaTechPeru/shareway-web-app | feature/us-25-payments-earnings | 59f9268 | feat(payments): add passenger payment history | — | 2026-11-18 18:07 |
| FundaTechPeru/shareway-web-app | feature/us-25-payments-earnings | af18406 | feat(payments): add driver earnings summary and settlement detail (US-25, US-26) | — | 2026-11-18 18:07 |
| FundaTechPeru/shareway-web-app | feature/us-25-payments-earnings | 1db6bdd | feat(driver-management): show earnings summary on the driver home | — | 2026-11-18 18:08 |
| FundaTechPeru/shareway-web-app | feature/us-25-payments-earnings | 59f661a | test(routes): cover the settlement detail route | — | 2026-11-18 18:08 |
| FundaTechPeru/shareway-web-app | feature/us-25-payments-earnings | c293bf4 | docs: record phase 3 decisions | — | 2026-11-18 18:08 |
| FundaTechPeru/shareway-web-app | develop | f8b936f | Merge branch 'feature/us-25-payments-earnings' into develop | — | 2026-11-18 18:08 |
| FundaTechPeru/shareway-web-app | feature/us-02-trips-bookings | d966efb | feat(trip-planning): add trip planning API service with legacy id adapter | Isolates the Long passengerId/driverId of the service in one file and maps DTOs to app models with string ids. | 2026-11-18 18:10 |
| FundaTechPeru/shareway-web-app | feature/us-02-trips-bookings | f6848db | feat(booking): add booking and fare API service with Idempotency-Key | — | 2026-11-18 18:11 |
| FundaTechPeru/shareway-web-app | feature/us-02-trips-bookings | b133d9e | feat(trip-execution): add trip execution API adapter from Spanish to English models | — | 2026-11-18 18:11 |
| FundaTechPeru/shareway-web-app | feature/us-02-trips-bookings | f7dd90e | feat(shared): add coming-soon notice for flows blocked by the backend | — | 2026-11-18 18:13 |
| FundaTechPeru/shareway-web-app | feature/us-02-trips-bookings | 8ac96c9 | feat(trip-planning): add trip request form with predefined Lima places (US-02) | — | 2026-11-18 18:13 |
| FundaTechPeru/shareway-web-app | feature/us-02-trips-bookings | 9c990d2 | feat(trip-planning): add trip requests list and detail with match proposals | — | 2026-11-18 18:13 |
| FundaTechPeru/shareway-web-app | feature/us-02-trips-bookings | 018cbc9 | feat(booking): add fare estimate, reservation and cancellation pages (US-03, US-04, US-12) | The Idempotency-Key is created once per reservation attempt and reused on retries. Fare and booking show a coming-soon state until the backend exposes the groupId. | 2026-11-18 18:15 |
| FundaTechPeru/shareway-web-app | feature/us-02-trips-bookings | 374a818 | chore(booking): remove pages placeholder | — | 2026-11-18 18:15 |
| FundaTechPeru/shareway-web-app | feature/us-02-trips-bookings | 5a124b5 | feat(trip-execution): add driver trip page with PIN boarding, start, finish and cancel (US-23, US-24, US-25) | — | 2026-11-18 18:17 |
| FundaTechPeru/shareway-web-app | feature/us-02-trips-bookings | 01669ce | feat(layout): add 'Mis viajes' to the driver menu | — | 2026-11-18 18:17 |
| FundaTechPeru/shareway-web-app | feature/us-02-trips-bookings | 8606e3c | refactor(shared): remove the phase 0 coming-soon placeholder page | Every route now has its real page; blocked flows use the inline coming-soon notice instead. | 2026-11-18 18:18 |
| FundaTechPeru/shareway-web-app | feature/us-02-trips-bookings | 44f0ed7 | docs: record phase 4 decisions | — | 2026-11-18 18:18 |
| FundaTechPeru/shareway-web-app | develop | 9915772 | Merge branch 'feature/us-02-trips-bookings' into develop | — | 2026-11-18 18:18 |
| FundaTechPeru/shareway-web-app | develop | b5e439f | docs: add progress report with phases, commits and backend blockers | — | 2026-11-18 18:20 |

## Blocked by the backend

The UI and the `*ApiService` for these flows are complete; the app shows a
"Disponible próximamente" state and the code has `// TODO(backend): ...`.

| # | Missing in the backend | Effect in the web app |
|---|---|---|
| 1 | Central CORS for this web domain in the gateway | Local development works through the dev-server proxy; the deployed site on Render needs CORS to call the gateway. |
| 2 | Gateway routes for `/api/v1/bookings`, `/fares`, `/fare-rules` and `X-User-Id` from the JWT | Fare, booking, booking status and cancellation return 404 today; the error is shown in a snackbar. |
| 3 | `passengerId`/`driverId` as UUID taken from the token in Trip Planning | Creating a trip request sends the user UUID where a Long is expected. Isolated in `TripPlanningApiService`. |
| 4 | An endpoint that returns the `groupId` | `/passenger/bookings/new` cannot estimate the fare or book; it shows "Disponible próximamente". |
| 5 | `GET /bookings/me`, driver "my trips", and `/trip-requests` filtered by user | No "my bookings" list; `/driver/trips` lets the driver open a trip by code; the trip requests list is filtered on the client and shows a notice. |
| 6 | Authentication in Trip Execution | The driver id travels in the body; the trip page only hides actions on the client if the trip belongs to another driver. |

Also: the OpenAPI specs of Driver Management, Trip Planning, Booking and Trip
Execution were unreachable (502/503) while working, so their DTOs follow
the API contract. Payments & Settlement was checked against its spec and matches.

## How to try it locally

Requirements: Node.js 24 and npm 11.

```bash
npm ci
npm start                      # http://localhost:4200, proxies /api to the gateway
npm run lint                   # gts
npm test -- --watch=false      # Vitest unit tests
npm run build                  # production build in dist/shareway-web-app/browser
```

The backend runs on Render's free tier: the first requests may fail with
"El servicio está iniciando, intenta en unos segundos" while services wake up.
Wait a minute and retry.

Suggested walkthrough:

1. **Register** a passenger at `/register` (password with letters and numbers,
   phone like `+51987654321`). You land on `/passenger/home`.
2. **Payment methods** (`/passenger/payment-methods`): add a card with any
   last 4 digits. Check "Simular tarjeta rechazada" to send `tok_declined` and
   see the rejection.
3. **Schedule a trip** (`/passenger/trip-requests/new`): choose origin,
   destination, date and time window. On the detail page, "Buscar conductores"
   asks for match proposals (blocked items above may return errors).
4. **Become a driver** (`/passenger/become-driver`): fill the license
   (8-12 uppercase letters/digits) and emergency contact, then confirm your
   password to continue as DRIVER.
5. As a driver, upload the 4 **documents**, register a **vehicle**, set your
   **availability**, and check the **checklist** and **earnings** on
   `/driver/home`. An admin must approve the documents in the admin panel for
   the status to become "Verificado".
6. **Driver trip** (`/driver/trips`): open a trip by its code to validate
   boarding PINs, start and finish it.
7. Log in with an **ADMIN** account to see the notice to use the admin panel.

Note: these steps create data in the real backend, so use test accounts.
