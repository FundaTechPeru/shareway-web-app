# ShareWay Web App

Web application for **passengers** and **drivers** of ShareWay (startup FundaTech): scheduled shared rides with verified drivers in Lima, Peru.

This project is part of the final assignment for the *Fundamentos de Arquitectura de Software* course (UPC). The backend follows a microservices architecture with Domain-Driven Design, and this frontend is organized by the same bounded contexts.

> This repo is **not** the admin panel (`shareway-admin-web`) nor the mobile app (`shareway-mobile-app`).

## Stack

- [Angular](https://angular.dev) 22 — standalone components, signals, new control flow, lazy-loaded features
- [Angular Material](https://material.angular.dev) (Material 3) with a custom ShareWay theme
- TypeScript (strict mode + strict templates)
- [Vitest](https://vitest.dev) via the Angular CLI unit-test builder
- [gts](https://github.com/google/gts) (Google TypeScript Style Guide: ESLint + Prettier)

The UI is in Spanish; code, routes and commits are in English.

## Getting started

Requirements: Node.js 24 and npm 11.

```bash
npm ci
npm start          # http://localhost:4200
```

`npm start` runs the dev server with `proxy.conf.json`, which forwards every `/api` request to the API Gateway (`https://shareway-api-gateway.onrender.com`). This avoids CORS issues during local development.

> The backend runs on Render's free tier: the first request after a period of inactivity may take a while (HTTP 503/504) while the services wake up.

### Scripts

| Script          | Description                                       |
| --------------- | ------------------------------------------------- |
| `npm start`     | Dev server with the API proxy                     |
| `npm run build` | Production build into `dist/shareway-web-app/`    |
| `npm test`      | Unit tests (`npm test -- --watch=false` for CI)   |
| `npm run lint`  | Lint and format check with gts                    |
| `npm run fix`   | Auto-fix lint and formatting issues               |

## Configuration

The only setting is the API base URL, defined in Angular environment files (no secrets are stored in the code):

| File                                          | `apiBaseUrl`                                          |
| --------------------------------------------- | ----------------------------------------------------- |
| `src/environments/environment.development.ts` | `/api/v1` (served through the dev-server proxy)       |
| `src/environments/environment.ts`             | `https://shareway-api-gateway.onrender.com/api/v1`    |

All backend calls go through the **API Gateway**; microservices are never called directly. The aggregated Swagger UI is available at <https://shareway-api-gateway.onrender.com/docs>.

## Project structure

```
src/
  app/
    core/                # singletons: auth, HTTP interceptors, guards, layout (shell)
    shared/              # style guide components (card, chip, banner, button, empty state)
    iam/                 # login and registration (/login, /register)
    driver-management/   # driver profile, documents, vehicles, availability
    trip-planning/       # trip requests and match proposals
    booking/             # fares, bookings and cancellations
    payments/            # payment methods, payments, driver earnings
    trip-execution/      # trip view, boarding validation, start/finish
    app.routes.ts        # top-level routes (lazy-loads each bounded context)
  environments/          # apiBaseUrl per environment
  styles/                # style guide tokens, Material palettes and global helpers
  styles.scss            # global styles and Material theme
```

Each bounded context contains `model/` (TypeScript interfaces matching backend DTOs), `services/` (one `*ApiService` per resource, the only place that uses `HttpClient`), `pages/`, and a `*.routes.ts` file loaded lazily from `app.routes.ts`.

## Workflow

- **GitFlow:** `main` and `develop`; `feature/us-XX-short-description` branches start from `develop` and return via pull request; `release/x.y.z` and `hotfix/x.y.z-description` branches. Semantic versioning.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org) (`feat:`, `fix:`, `test:`, `docs:`, `chore:`, `refactor:`).
- **CI:** GitHub Actions (`.github/workflows/ci.yml`) runs `npm ci`, lint, tests and build on every push and pull request to `develop` and `main`.

## Deployment

The app is deployed as a **Render Static Site** defined in [`render.yaml`](render.yaml) (Blueprint):

- Build command: `npm ci && npm run build`
- Publish directory: `dist/shareway-web-app/browser`
- Rewrite rule: `/*` → `/index.html` so Angular's router handles every route

To deploy, create a new Blueprint in Render pointing to this repository.
