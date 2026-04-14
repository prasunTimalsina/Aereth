# Aereth Monorepo

TypeScript monorepo scaffold with:

- `apps/web` for the React + Vite frontend
- `apps/api` for the Express backend
- `packages/shared` for shared schemas, config helpers, and utilities

## Getting Started

```bash
pnpm install
pnpm dev
```

## Workspace Scripts

- `pnpm dev` runs the web and API apps together
- `pnpm dev:web` runs only the frontend
- `pnpm dev:api` runs only the backend
- `pnpm build` builds every workspace package
- `pnpm lint` lints every workspace package
- `pnpm typecheck` type-checks every workspace package
- `pnpm format` formats the repository

