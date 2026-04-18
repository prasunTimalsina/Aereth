# Phase 1 Spec: Account Bootstrap And Session Spine

> Source plan: [plans/mvp-file-vault-plan.md](plans/mvp-file-vault-plan.md)
> Source PRD: [.docs/mvp-file-vault-prd.md](../.docs/mvp-file-vault-prd.md)

## Scope

Phase 1 delivers the first complete authenticated slice of the personal file vault. The goal is to make the app usable for a real owner account before any file upload, sharing, or public download behavior exists.

### In Scope

- Signup with `displayName`, `email`, and `password`
- Login with `email` and `password`
- Logout and session clearing
- Session restoration on app load
- Protected owner routing under the authenticated app shell
- Dedicated current-user/session endpoint
- Shared current-user state between app views
- Initial auth, service-layer, and error-handling backbone
- Prisma-backed PostgreSQL schema foundation with real migration history
- Structured API errors with machine-readable codes
- Automated tests for the auth/session spine

### Out of Scope

- File upload, file listing, file deletion, and download flows
- Share-link creation, regeneration, revocation, or public share pages
- Settings/profile editing beyond the session bootstrap slice
- Notifications, collaboration, search, previews, quotas, and malware scanning

## Product Goal

A visitor should be able to create an account, sign in, remain signed in across reloads, and move through the protected app shell without the application losing track of identity or exposing owner-only screens to unauthenticated users.

## User Stories Covered

1. As a visitor, I want to sign up with my email, password, and display name, so that I can create my own personal file vault account.
2. As a visitor, I want my account to be created with case-insensitive email handling, so that accidental capitalization differences do not create duplicate identities.
3. As a new user, I want to be logged in immediately after signup, so that I can start using the app without an extra login step.
4. As a returning user, I want to log in with my email and password, so that I can access my files from a protected dashboard.
5. As an authenticated user, I want my session to persist for a reasonable period, so that I do not need to log in constantly during normal use.
6. As an authenticated user, I want the app to detect my current session on page load, so that refreshing the browser does not make the UI lose track of who I am.
7. As an authenticated user, I want unauthorized dashboard access to redirect me back to login, so that the app never stays in a broken half-authenticated state.
8. As an authenticated user, I want a visible logout action, so that I can end my session from anywhere in the protected app.
9. As a developer, I want shared validation schemas and response contracts across the monorepo, so that the web and API stay aligned as the feature grows.
10. As a developer, I want structured API errors with machine-readable codes, so that the frontend and tests can react to failures reliably.
11. As a developer, I want explicit domain modules for auth, files, shares, and settings, so that the backend stays understandable as the implementation expands.
12. As a developer, I want service-layer authorization rules, so that ownership and access checks are centralized instead of duplicated across routes.
13. As a developer, I want real migration history from day one, so that the project grows like a serious application rather than a disposable prototype.

## Durable Decisions For Phase 1

- Public auth routes stay separate from authenticated app routes.
- The owner experience lives under `/app/*`.
- The web app uses a dedicated current-session endpoint rather than local storage for auth discovery.
- Authentication uses `email`, `password`, and `displayName`.
- Sessions are JWT-based and stored in an HTTP-only cookie.
- The initial session lifetime is seven days.
- Owner-only state-changing routes require ownership checks and `Origin` validation.
- Authorization belongs in the service layer, not route handlers.
- PostgreSQL and Prisma are the persistence foundation from day one.
- The first backend domains are `auth`, `files`, `shares`, and `settings`, even if only `auth` is implemented in this phase.
- API errors should remain structured and machine-readable.

## Functional Requirements

### Authentication

- Signup must normalize email addresses so case differences do not create duplicate identities.
- Signup must validate password strength before creating the user record.
- Signup must create the user and establish a logged-in session in one flow.
- Login must accept valid credentials and establish the same authenticated session.
- Logout must clear the session cookie and return the app to an unauthenticated state.

### Session Spine

- The app must be able to determine the current signed-in user on initial load.
- Protected routes must redirect unauthenticated users to the login flow.
- The session state should be shared by the app shell so the user identity remains consistent across views.

### Backend Foundation

- The backend must expose a dedicated current-user/session endpoint.
- The backend must return structured errors with stable codes for auth failures and validation failures.
- The auth flow must be implemented through explicit service-layer logic rather than inline route-only behavior.
- Prisma schema changes must be accompanied by a migration and generated client update in the same task.

## Acceptance Criteria

- [ ] A visitor can create an account using `displayName`, `email`, and `password`.
- [ ] A visitor can log in with a valid email/password pair.
- [ ] A signed-in user remains authenticated across page refreshes until session expiry or logout.
- [ ] Unauthenticated users cannot remain on protected owner routes.
- [ ] Logout reliably clears the authenticated session.
- [ ] Auth responses use structured error payloads with machine-readable codes.
- [ ] Prisma-backed persistence exists with migration history in place.
- [ ] Automated tests cover signup, login, logout, session restoration, and unauthorized access.

## Validation Expectations

- Run package-scoped checks during implementation if the work is isolated.
- Run repo-root validation before considering the phase complete:
  - `pnpm typecheck`
  - `pnpm lint`
- Run relevant tests for auth/session behavior as they are added.
- If Prisma schema is touched, run `prisma generate` and include a migration.

## Notes

- This phase is intentionally narrow: it proves identity, session handling, route protection, and the backend contract surface before any file or sharing behavior exists.
- The next phase should build on this slice by adding the minimal settings experience without changing the auth spine.
