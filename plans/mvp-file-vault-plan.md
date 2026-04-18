# Plan: Personal File Vault with Shareable Links

> Source PRD: [.docs/mvp-file-vault-prd.md](C:/Users/uniqu/OneDrive/Desktop/Workspace/Aereth/.docs/mvp-file-vault-prd.md)

## Architectural decisions

Durable decisions that apply across all phases:

- **Routes**: Public auth routes live separately from authenticated app routes, with protected owner experience under `/app/*` and public share pages at `/s/:token`.
- **API surface**: Owner-facing API is organized into domain modules for `auth`, `files`, `shares`, and `settings`. The web app uses a dedicated current-session endpoint instead of reading auth state from local storage.
- **Authentication**: Minimal real accounts use `email`, `password`, and `displayName`. Authentication uses a JWT in an HTTP-only cookie with a 7-day session, same-site deployment assumptions, cookie flags, and `Origin` checks on state-changing owner routes.
- **Authorization**: Ownership and access-control rules live in a service layer rather than being duplicated directly in route handlers.
- **Schema**: PostgreSQL is the source of truth for relational data, managed with Prisma and real migration history from day one.
- **Key models**: `User`, `File`, and `ShareLink` are the core entities. IDs are UUIDs. Emails are normalized case-insensitively. Timestamps are stored and compared in UTC.
- **File model**: Files are immutable, private by default, and stored as separate records even when duplicate content is uploaded. File metadata remains minimal.
- **Storage**: Binary files are stored under an app-managed private storage root on the local filesystem using opaque storage keys behind a storage abstraction that can later support S3 or MinIO.
- **Sharing**: Each file has only one current share-link state. Public share URLs are token-only bearer links. Share tokens are stored hashed, not in raw reversible form.
- **Validation**: Uploads accept one file per request, enforce a configurable allowlist, use server-side type detection, reject early, and feel atomic from the product perspective.
- **Downloads**: Owner and public downloads are streamed through controlled API endpoints and always force attachment behavior in v1.
- **List behavior**: Owner file lists are newest-first and use cursor pagination keyed by creation time plus file ID, surfaced through a manual `Load more` interaction.
- **Errors**: The API returns a consistent structured error shape with machine-readable codes.
- **Testing**: Critical flows are covered with automated tests that validate externally visible behavior rather than internal implementation details.

---

## Phase 1: Account Bootstrap And Session Spine

**User stories**: 1, 2, 3, 4, 5, 6, 7, 8, 64, 65, 66, 67, 68

### What to build

Deliver the first complete authenticated slice: account creation, login, logout, session restoration, protected owner routing, shared current-user state, and the initial domain-module/service-layer backbone. This phase establishes the app shell, auth contracts, database foundation, and structured error handling without yet implementing file functionality.

### Acceptance criteria

- [ ] A visitor can sign up with `displayName`, `email`, and `password`, using case-insensitive email uniqueness and a valid password policy.
- [ ] Signup and login both establish an authenticated session through an HTTP-only cookie, and logout clears that session.
- [ ] The web app can restore session state through a dedicated current-user endpoint and redirect unauthenticated users away from protected owner routes.
- [ ] The backend is organized around durable auth/service/error patterns that later file and share phases can build on.
- [ ] Automated tests cover signup, login, logout, session restoration, and unauthorized access handling.

---

## Phase 2: Settings Vertical Slice

**User stories**: 10, 11, 12, 13

### What to build

Add the narrow settings experience inside the authenticated app so a signed-in user can view their profile identity and edit only their `displayName`, with the updated session reflected immediately in the shared current-user state.

### Acceptance criteria

- [ ] An authenticated user can open a settings section that shows current `displayName` and read-only `email`.
- [ ] An authenticated user can update `displayName` and see the change reflected immediately in session-driven UI without a full reload.
- [ ] Unauthenticated access to settings is rejected and redirected consistently with the auth model from Phase 1.
- [ ] Automated tests cover authenticated settings updates and unauthenticated rejection.

---

## Phase 3: Vault Read Path And Empty-State Dashboard

**User stories**: 9, 14, 15, 16, 17

### What to build

Deliver the first end-to-end file-vault read path for authenticated owners: persisted file records, protected file listing, newest-first ordering, cursor pagination, and an owner dashboard that can represent an empty vault cleanly before upload and share actions exist.

### Acceptance criteria

- [ ] The database and API can represent file records owned by users with the minimal metadata needed for the MVP.
- [ ] An authenticated user can open the files area and see only their own files.
- [ ] File listing is newest-first and supports cursor pagination that the UI can extend with a manual `Load more` action.
- [ ] Deleted or absent files do not appear in the list, and the empty state is a valid, working first-use experience.
- [ ] Automated tests cover ownership-scoped listing and cursor-based pagination behavior.

---

## Phase 4: Single-File Upload Flow

**User stories**: 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 55, 56, 57, 61, 62

### What to build

Add the first full write path for the vault: single-file selection through picker or drag-and-drop, selected-file review, explicit upload submission, actual progress, cancel support, early validation, atomic persistence across database and private storage, and immediate appearance of the uploaded file in the owner dashboard.

### Acceptance criteria

- [ ] An authenticated user can select or drag one file, review it, clear it, and explicitly start upload from the dashboard.
- [ ] Uploads show real progress and support cancellation that leaves no usable file record behind.
- [ ] The API enforces one-file-per-request, size limits, allowlist validation, and server-side type detection with specific structured validation errors.
- [ ] Successful uploads persist file metadata plus durable private storage and prepend the new file into the owner’s newest-first list.
- [ ] Automated tests cover successful upload, multi-file drag rejection, oversize rejection, disallowed type rejection, type mismatch rejection, and canceled upload behavior.

---

## Phase 5: Owner File Actions

**User stories**: 17, 37, 58, 60

### What to build

Complete the private owner-management loop by adding authenticated direct download and immediate hard delete, both enforced through controlled API access and ownership checks, with the dashboard staying in sync after destructive actions.

### Acceptance criteria

- [ ] An authenticated owner can download their own file directly without creating a share link.
- [ ] Download responses stream from storage and force attachment behavior.
- [ ] An authenticated owner can hard-delete a file with confirmation, which removes the stored file and associated metadata from active use.
- [ ] Deleted files disappear from the owner list immediately after a successful delete action.
- [ ] Automated tests cover owner download, unauthorized access rejection, and delete behavior.

---

## Phase 6: Public Sharing Baseline

**User stories**: 38, 39, 40, 41, 42, 48, 49, 50, 51, 52, 53, 59

### What to build

Introduce the first complete public-sharing slice: current share-link state per file, share creation for an owner, immediate reveal/copy of the newly created public URL, public share-page metadata lookup, and public attachment download through token-based access.

### Acceptance criteria

- [ ] An authenticated owner can create a share link for a file and receive the raw URL immediately at creation time.
- [ ] The dashboard can represent that a file is shared even though raw token values are not recoverable later.
- [ ] The public share page at `/s/:token` can show filename and size for a valid shared file without exposing owner identity.
- [ ] Public downloads work through controlled token-based API access and stream the file as an attachment.
- [ ] Automated tests cover share creation, hashed-token lookup behavior, public metadata access, and public download success.

---

## Phase 7: Share Lifecycle Controls

**User stories**: 38, 43, 44, 45, 46, 47, 54

### What to build

Extend public sharing from baseline access to full lifecycle control by adding revoke, regenerate, preset expiries, lazy expiration, shared-state updates in the owner dashboard, and generic unavailable handling for every dead-link path.

### Acceptance criteria

- [ ] An authenticated owner can revoke an active share link and make the file private again.
- [ ] An authenticated owner can regenerate a share link, replacing the prior token and receiving the new raw URL immediately.
- [ ] Share creation and regeneration support the preset expiry choices, including no-expiry-by-default.
- [ ] Expired, revoked, and invalid public links all resolve to the same generic unavailable experience.
- [ ] Automated tests cover revoke, regenerate, expiry evaluation, and generic dead-link behavior.

---

## Phase 8: Security And Reliability Hardening

**User stories**: 63, 64, 65, 69

### What to build

Tighten the MVP so the end-to-end system is safer and more trustworthy in real use: sensitive-endpoint rate limiting, finalized structured error coverage, shared contract enforcement across web and API boundaries, and broad critical-flow automated testing spanning auth, file, share, delete, and settings behaviors.

### Acceptance criteria

- [ ] Sensitive auth, upload, and public share endpoints enforce basic rate limiting with stable error semantics.
- [ ] Shared contracts and structured error codes are applied consistently across the main owner and public flows.
- [ ] Critical end-to-end and integration tests cover the highest-risk product behavior defined in the PRD.
- [ ] The combined MVP can be demonstrated as a coherent product loop from signup to upload to sharing to download to revoke/delete.

