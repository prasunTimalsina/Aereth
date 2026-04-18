# AGENTS.md

Agent operating guide for this repository.

## Project Overview

- Monorepo: pnpm workspace
- Apps: apps/web (React + Vite), apps/api (Express)
- Shared package: packages/shared (schemas and shared contracts)
- Runtime baseline: Node 24.14.1, pnpm 10.15.1

## Instruction Precedence

When instructions conflict, use this order:

1. Current user chat request
2. Nearest AGENTS.md
3. .github/copilot-instructions.md
4. Task-specific guidance in .agents/skills/_/SKILL.md and .agents/prompts/_.md
5. If conflict remains, choose the stricter safety/security rule

## Safety-Critical Rules (MUST)

- Keep files private by default unless the task explicitly requires public access behavior.
- Enforce ownership and auth checks on protected data and endpoints.
- Never commit secrets, tokens, credentials, or .env files.
- Do not run destructive commands unless explicitly approved.

## Quality-Critical Rules (MUST)

- Before finalizing code changes, run repo-root validation:
  - pnpm typecheck
  - pnpm lint
- If changes span multiple packages or shared contracts, do not skip repo-root validation.
- Keep diffs focused and avoid unrelated refactors.

## Workflow Guidance (SHOULD)

- During iteration, use package-scoped checks for speed when changes are isolated.
- Prefer small, reviewable changes over broad rewrites.
- Use existing module boundaries and shared schema contracts.

## Ask First

Ask for confirmation before:

- Adding or removing dependencies
- Prisma schema/storage model changes with cross-cutting impact
- Deleting files or doing broad repo-wide refactors
- Running mass formatting or destructive commands
- Expanding beyond v1 PRD scope

## Prisma + Postgres Safety

- Any Prisma schema change must include a migration in the same task.
- Run prisma generate after schema changes.
- Do not run destructive reset flows without explicit approval.
- Keep DATABASE_URL and all secrets in environment variables only.

## v1 Scope Guardrails

Source of truth: .docs/mvp-file-vault-prd.md

In scope for v1:

- Auth (signup/login/logout/session)
- Personal vault ownership model
- Single-file upload flow with validation
- Private-by-default files
- One active share link per file with revoke and optional expiry

Out of scope for v1 unless explicitly requested:

- Notifications
- Collaboration/workspaces
- Inline preview systems
- Advanced search/filtering
- Quotas/billing
- Malware scanning pipelines
- Multi-link history per file

If a request pushes beyond these boundaries, ask before implementing expanded scope.

## Commands

Use repo-root commands unless a package-scoped check is sufficient during iteration:

- Install: pnpm install
- Dev (all): pnpm dev
- Dev (api): pnpm dev:api
- Dev (web): pnpm dev:web
- Build: pnpm build
- Typecheck: pnpm typecheck
- Lint: pnpm lint
- Format: pnpm format
- Format check: pnpm format:check

## Completion Checklist (MUST)

Before completing a task:

1. Run required validation (tiered during iteration, repo-root before final).
2. Verify no v1 scope violation against .docs/mvp-file-vault-prd.md.
3. Summarize exactly what changed and what checks were run.
4. If any checks were not run, state what was skipped and why.

## Maintenance

- Keep this file repo-accurate and minimal.
- Update this file when scripts, tooling, architecture, or scope guardrails change.
