# MVP PRD: Personal File Vault with Shareable Links

## Problem Statement

The current project has only a scaffolded web app and API, but no implementation-ready product definition for the first meaningful feature set. The original dummy PRD established the broad idea of a file upload and notification system, but it left several core questions unresolved, including who owns files, how sharing works, what authentication model to use, how files are stored, and what is intentionally excluded from the first release.

For this project to move from concept to execution, it needs a sharper product definition for a first release that is ambitious enough to be portfolio-worthy, but constrained enough to build well. The first release must support real user accounts, secure file ownership, controlled sharing through revocable links, and a small but complete dashboard experience without expanding into collaboration, notifications, search, preview, malware scanning, or other secondary systems too early.

## Solution

The first release will be a personal file vault where each user can create an account, sign in, upload a single allowed file at a time, manage their own private file list, download their own files, and generate at most one active public bearer-style share link per file. Shared links will open a small public share page that shows limited file metadata and offers a download action. Files remain private by default and are only accessible through controlled API endpoints. Owner authentication will use a JWT stored in an HTTP-only cookie, and all file access, sharing, deletion, and settings updates will be implemented through explicit domain modules in the existing monorepo.

## User Stories

1. As a visitor, I want to sign up with my email, password, and display name, so that I can create my own personal file vault account.
2. As a visitor, I want my account to be created with case-insensitive email handling, so that accidental capitalization differences do not create duplicate identities.
3. As a new user, I want to be logged in immediately after signup, so that I can start using the app without an extra login step.
4. As a returning user, I want to log in with my email and password, so that I can access my files from a protected dashboard.
5. As an authenticated user, I want my session to persist for a reasonable period, so that I do not need to log in constantly during normal use.
6. As an authenticated user, I want the app to detect my current session on page load, so that refreshing the browser does not make the UI lose track of who I am.
7. As an authenticated user, I want unauthorized dashboard access to redirect me back to login, so that the app never stays in a broken half-authenticated state.
8. As an authenticated user, I want a visible logout action, so that I can end my session from anywhere in the protected app.
9. As an authenticated user, I want a dedicated files area, so that file management stays separate from authentication screens.
10. As an authenticated user, I want a dedicated settings area, so that I can manage my profile information without cluttering the files experience.
11. As an authenticated user, I want to view my current display name and email in settings, so that I can understand which account I am using.
12. As an authenticated user, I want to edit my display name, so that I can personalize how my account appears inside the app.
13. As an authenticated user, I want display name changes to update immediately after saving, so that the dashboard reflects my current profile without a full reload.
14. As an authenticated user, I want to see only my own files, so that my vault remains private and scoped to my account.
15. As an authenticated user, I want files to be ordered newest-first, so that my most recent uploads are easiest to find.
16. As an authenticated user, I want cursor-based pagination with a manual load-more interaction, so that the file list stays simple and stable as more files are added.
17. As an authenticated user, I want deleted files to disappear immediately from the list, so that the UI reflects the current state of my vault.
18. As an authenticated user, I want a clear upload area, so that I can add new files without navigating away from the dashboard.
19. As an authenticated user, I want to choose a file through a normal file picker, so that I can upload files in a familiar way.
20. As an authenticated user, I want to drag and drop a file into the upload area, so that uploading feels fast and convenient.
21. As an authenticated user, I want drag-and-drop to accept only one file at a time, so that the upload flow stays predictable.
22. As an authenticated user, I want a clear error when I drop multiple files, so that I understand why the upload did not start.
23. As an authenticated user, I want to review a selected file before uploading, so that I can catch mistakes before sending anything.
24. As an authenticated user, I want to clear a selected file before upload, so that I can recover cleanly from selecting the wrong file.
25. As an authenticated user, I want uploads to begin only after I explicitly click Upload, so that I stay in control of network activity.
26. As an authenticated user, I want to see real upload progress, so that I understand whether a file is still being transferred.
27. As an authenticated user, I want to cancel an in-progress upload, so that I can stop a mistaken or unwanted transfer.
28. As an authenticated user, I want canceled uploads to be shown as canceled rather than failed, so that intentional interruption is not treated like an error.
29. As an authenticated user, I want successful uploads to appear at the top of my file list immediately, so that the result of my action is visible right away.
30. As an authenticated user, I want uploads to be rejected when they exceed the size limit, so that the system enforces clear file constraints.
31. As an authenticated user, I want uploads to be rejected when the file type is not allowed, so that the app remains safer and more predictable.
32. As an authenticated user, I want uploads to validate actual file content, so that renamed or misleading files are not accepted just because of their extension.
33. As an authenticated user, I want specific validation errors when an upload is rejected, so that I can fix the problem without guessing.
34. As an authenticated user, I want each successful upload to create a new immutable file entry, so that later actions always refer to a stable file.
35. As an authenticated user, I want duplicate uploads to be stored as separate files, so that repeated uploads remain predictable and do not trigger hidden deduplication logic.
36. As an authenticated user, I want my files to remain private by default, so that uploading alone never exposes a file publicly.
37. As an authenticated user, I want to download my own files directly without creating a share link, so that the vault is useful even when I am not sharing anything.
38. As an authenticated user, I want the dashboard to show whether each file is private, shared, or expired, so that I can quickly understand its current sharing state.
39. As an authenticated user, I want to create a share link for a file, so that I can send it to someone outside the app.
40. As an authenticated user, I want a file to have only one current share link state, so that I do not have to manage multiple active public URLs for the same file.
41. As an authenticated user, I want to copy the share link immediately when it is first created or regenerated, so that I can use it right away.
42. As an authenticated user, I want the dashboard to show that a file is shared even if the raw token cannot be re-copied later, so that the system can preserve stronger token handling without hiding state from me.
43. As an authenticated user, I want regenerating a share link to replace the old token, so that I can rotate public access when needed.
44. As an authenticated user, I want to revoke a share link, so that I can make a file private again without deleting it.
45. As an authenticated user, I want optional preset expiries when sharing, so that I can choose between no expiry and a few common expiration windows without dealing with a date picker.
46. As an authenticated user, I want share links to default to no expiry, so that links do not stop working unexpectedly unless I chose a time limit.
47. As an authenticated user, I want expired links to be detected automatically when used or listed, so that expiration works without background maintenance jobs.
48. As an unauthenticated recipient, I want a public share page at a simple token-based URL, so that I can inspect a shared file before downloading it.
49. As an unauthenticated recipient, I want the public share page to show only limited file metadata, so that I know what I am about to download.
50. As an unauthenticated recipient, I want the public share page to show the original filename and size, so that I can judge whether the file looks expected.
51. As an unauthenticated recipient, I want the public share page not to expose the owner identity, so that sharing does not unnecessarily reveal personal account information.
52. As an unauthenticated recipient, I want the file download to be an explicit action, so that visiting a share link does not immediately trigger a browser download.
53. As an unauthenticated recipient, I want shared files to download as attachments rather than inline previews, so that the app stays download-focused and safer in v1.
54. As an unauthenticated recipient, I want invalid, expired, or revoked links to show a generic unavailable message, so that dead links are handled cleanly without revealing extra information.
55. As a system operator, I want files stored under an app-managed private storage root, so that no uploaded files are publicly reachable by accident.
56. As a system operator, I want uploaded files written under opaque storage keys instead of user filenames, so that storage remains collision-resistant and does not trust user-provided names.
57. As a system operator, I want metadata stored in PostgreSQL and binary file data stored on disk behind a storage adapter, so that storage can later move to S3 or MinIO without rewriting the product model.
58. As a system operator, I want file downloads streamed from storage, so that serving files is memory-efficient and compatible with future storage backends.
59. As a system operator, I want share tokens stored as hashes rather than raw secrets, so that a database leak does not immediately reveal working public links.
60. As a system operator, I want all file access to go through controlled API endpoints, so that auth, ownership, revocation, and expiry checks are always enforced consistently.
61. As a system operator, I want early upload rejection for oversized or disallowed files, so that invalid files do not become durable storage state.
62. As a system operator, I want uploads to succeed only when both storage and database persistence succeed, so that the dashboard never references missing files and disk never accumulates unnecessary orphans.
63. As a system operator, I want rate limiting on sensitive endpoints, so that login, signup, public share access, and uploads are less vulnerable to abuse.
64. As a developer, I want shared validation schemas and response contracts across the monorepo, so that the web and API stay aligned as the feature grows.
65. As a developer, I want structured API errors with machine-readable codes, so that the frontend and tests can react to failures reliably.
66. As a developer, I want explicit domain modules for auth, files, shares, and settings, so that the backend stays understandable as the implementation expands.
67. As a developer, I want service-layer authorization rules, so that ownership and access checks are centralized instead of duplicated across routes.
68. As a developer, I want real migration history from day one, so that the project grows like a serious application rather than a disposable prototype.
69. As a developer, I want critical automated tests around auth, uploads, sharing, deletion, and settings, so that the highest-risk product flows remain trustworthy as the codebase evolves.

## Implementation Decisions

- The first release is a personal file vault, not a collaborative workspace.
- Notifications are entirely out of scope for v1.
- Authentication will use minimal real accounts with `email`, `password`, and `displayName`.
- Email addresses are normalized and treated as case-insensitively unique.
- Signup logs the user in immediately after account creation.
- Owner authentication uses a JWT stored in an HTTP-only cookie.
- Session duration is fixed at seven days, with no refresh-token system.
- CSRF protection for owner routes will use secure cookie flags plus `Origin` validation rather than a separate CSRF token flow.
- The frontend will use a dedicated session endpoint to discover the current user during app boot.
- The frontend will keep one shared current-user state rather than fetching user identity independently on every page.
- Unauthorized responses from owner-only routes will clear session state and redirect to login immediately.
- The authenticated frontend will use a common app shell for files and settings.
- The owner dashboard will include routes and flows for signup, login, file list, upload, share creation, link regeneration, link revocation, owner download, delete, and minimal settings.
- Settings scope is intentionally narrow: show current display name, allow display-name updates, and show email read-only.
- The API will be organized into domain modules for auth, files, shares, and settings.
- Backend business rules will live in a service layer, especially for ownership and access control.
- Shared Zod schemas and types will define the main contracts between web and API.
- The API will return a consistent structured error shape with machine-readable codes.
- PostgreSQL will be used from day one, managed through Prisma with real migration history.
- Internal entities will use UUIDs.
- Timestamps and time comparisons will use UTC throughout storage and API payloads.
- Files remain private by default and are never made public implicitly on upload.
- Files are immutable after upload.
- Duplicate uploads are stored as separate files rather than deduplicated by content hash.
- Uploads are limited to one file per request.
- The upload UI will support both file-picker selection and drag-and-drop, but still accept only one file at a time.
- Dragging multiple files will show a specific owner-facing validation error.
- The upload flow uses explicit user submission rather than auto-upload.
- The upload experience includes selected-file summary, real measured upload progress, cancel support, and clear/remove selection.
- Upload cancellation is a neutral user action, not an error state.
- The maximum file size is 25 MB in v1 and should remain configurable.
- File types are restricted by a configurable allowlist.
- Server-side file-type detection is required; the system must not trust only client-reported type or extension.
- Files are stored on the local filesystem in v1, behind a storage abstraction designed to support later S3 or MinIO migration.
- The storage system uses an app-managed private storage root outside any public web directory.
- Physical files are stored under random opaque storage keys rather than original filenames.
- Uploads should reject invalid files as early as possible in the request pipeline.
- Uploads should feel atomic from the product perspective: no durable file record exists unless both storage and database persistence succeed, and failed uploads clean up temporary data immediately.
- File downloads must be streamed from storage rather than read fully into memory.
- Files are served only through controlled API endpoints; the upload directory is never mounted as static content.
- Download responses should always force attachment behavior in v1.
- File metadata for v1 stays minimal and focused on ownership, storage location, MIME type, size, timestamps, and current share-link state.
- The owner file list uses strict newest-first ordering.
- Pagination uses cursor semantics keyed by creation time plus file ID.
- The file list UI uses a manual load-more interaction rather than infinite scroll.
- The file list shows relative upload times rather than exact timestamps in the main row UI.
- Share links are bearer-style public links that work for anyone holding the URL.
- Public share URLs use only the opaque token in the path.
- Public share pages are implemented in the React app, backed by small public API endpoints.
- The public share page shows filename and size, but not owner identity.
- Invalid, expired, and revoked public links all produce the same generic unavailable experience.
- A file has only one current share-link state in v1.
- Share-link state lives in a dedicated relation rather than being inlined into file metadata fields.
- Share-link history is out of scope; the system keeps only current state.
- Share links default to no expiry, with preset optional expiries of 24 hours, 7 days, or 30 days.
- Expiration is enforced lazily at read/request time rather than through background cleanup jobs.
- Share tokens are stored as hashes, not as raw tokens.
- Because tokens are hash-only, the raw share URL can be shown when a link is created or regenerated, but not reconstructed later from the dashboard.
- The `Share` action should be safe and idempotent with current-state semantics, while explicit regeneration rotates the token.
- Delete uses immediate hard delete with one confirmation step.
- Hard delete removes the metadata record, invalidates share access, and removes the stored file.
- Per-user storage quotas are out of scope for v1.
- Malware scanning is out of scope for v1, but the upload flow should be structured so that scanning could be inserted later.
- Sensitive endpoints should be protected with basic rate limiting.
- The likely upload parsing approach is a standard multipart middleware rather than a custom parser.
- The likely JWT implementation should use a standard, actively maintained library rather than hand-rolled token handling.

## Testing Decisions

- Tests should focus on externally observable behavior, not implementation details such as internal helper structure, ORM call counts, or component internals.
- Good tests for this feature verify what users and clients can do, what they cannot do, and which structured outcomes they receive on success and failure.
- Auth tests should cover signup, login, logout, session restoration, unauthorized redirects, and case-insensitive email behavior.
- File tests should cover single-file upload success, oversized upload rejection, disallowed type rejection, file-content/type mismatch rejection, upload cancellation, owner download, pagination behavior, and hard delete behavior.
- Share tests should cover share creation, regeneration, revocation, optional expiry handling, public metadata access, public download access, and generic handling for invalid or unavailable links.
- Settings tests should cover authenticated display-name updates, immediate session-state reflection, and refusal of unauthenticated settings access.
- Storage-oriented tests should verify observable atomic behavior: failed uploads do not create usable file records and canceled uploads do not leave user-visible artifacts.
- Error-handling tests should assert structured error codes and messages rather than brittle raw text matching alone.
- Contract tests should validate shared request and response shapes at the API boundary using the monorepo's shared schema layer.
- Prior art for tests in the current codebase is minimal because the repository is still at scaffold stage, so the initial test suite should establish the standard rather than mirror existing feature tests.

## Out of Scope

- Notifications of any kind, including in-app, email, push, or webhook flows.
- Multi-user collaboration, workspaces, teams, shared ownership, and in-app recipient accounts.
- File preview or inline rendering for images, PDFs, or other formats.
- Folder hierarchies, tags, favorites, advanced metadata, search, and filter builders.
- File editing, versioning, replace-in-place behavior, or file history.
- Multiple active share links per file.
- Share-link history or auditing.
- Email verification, password reset, refresh tokens, multi-device session management, email change, or password change flows.
- Quotas, billing, plans, or storage accounting beyond the per-file size cap.
- Malware scanning, antivirus quarantine, and background processing infrastructure for scan jobs.
- Recycle-bin or temporary deleted-state behavior.
- Admin surfaces, moderation tools, or analytics dashboards.
- Public owner identity on share pages.
- Cloud object storage in the first release.

## Further Notes

- The dummy PRD established the initial concept, but this PRD intentionally narrows the scope to a first release that can be implemented well inside the current monorepo.
- The architectural center of gravity for v1 is the combination of domain modules, shared contracts, service-layer authorization, and a storage abstraction that hides filesystem details from the product layer.
- The main risks in implementation are auth correctness, token handling, upload validation, database/storage consistency, and access control. Those areas should receive the earliest tests and the strictest review.
- Several intentionally deferred features have obvious extension points: malware scanning can be inserted into the upload pipeline, cloud storage can replace the local adapter, notifications can subscribe to file events later, and recycle-bin behavior can build on the delete path once retention requirements exist.
- This PRD is written so it can be copied into a GitHub issue with minimal editing if issue publication is needed later.
