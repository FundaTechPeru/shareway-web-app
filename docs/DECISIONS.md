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
