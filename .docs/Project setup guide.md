# Production-grade pnpm workspace monorepo for a TypeScript full-stack app

## Design goals and architectural stance

A “simple, minimal, practical” monorepo is primarily about **reducing coordination cost without introducing early orchestration tooling**. pnpm workspaces are built specifically to manage multi-package repositories with first-class linking between packages, filtering, and recursive script execution—enough for most small-to-medium monorepos without needing Nx/Turborepo upfront. citeturn2view0turn2view1turn2view2turn12view0

A backend-first approach aligns naturally with what entity["people","Martin Fowler","software architect"] calls “monolith first”: begin with a monolith (simpler to change), find stable boundaries through real use, and only then consider distribution if it becomes necessary. citeturn4search7

For the backend architecture, the target is a **modular monolith**: a single deployable application that is **internally decomposed into modules/components with explicit boundaries**. This gives you most of the maintainability benefits of microservices without the operational complexity of distributed systems, provided you actively enforce boundaries. citeturn4search11turn7view2

Key design decisions used in the setup below are intentionally conservative and widely adopted:

- **TypeScript everywhere**, with configuration inheritance (`extends`) and (optionally) project references to scale build/typecheck performance. citeturn11search3turn3search0turn0search3  
- **ESLint flat config** (the default since ESLint v9) for predictable scoping in a monorepo, plus Prettier for formatting. citeturn13search2turn1search3turn1search7  
- Dev runtime for backend using **tsx watch** (or nodemon), to keep dev feedback tight. citeturn4search6turn4search1  
- pnpm’s **workspace protocol** (`workspace:*`) for internal dependencies; **pnpm filtering + recursive runs** for workflows; optional **catalogs** to keep dependency versions consistent across packages. citeturn2view0turn12view0turn2view2turn16search18turn15search6

## Recommended folder structure

This structure is “apps + packages” because it’s the clearest mental model for full-stack workspaces: applications are deployables, packages are shared/building-block code.

```
repo/
  apps/
    api/                      # Node.js backend (modular monolith)
      src/
        bootstrap/            # process start, env, logging setup
        app/                  # app composition (wires modules together)
        modules/              # feature modules (vertical slices)
          <module>/
            index.ts          # module public API (the only “entry”)
            http/             # routes/controllers/adapters for HTTP
            service/          # application services (use-cases)
            domain/           # domain types, invariants, policies
            data/             # repos, persistence adapters
            __tests__/        # (optional) module-level tests
        shared/               # backend-only shared helpers (keep small)
      package.json
      tsconfig.json
    web/                      # React frontend
      src/
      package.json
      tsconfig.json
      vite.config.ts

  packages/
    contracts/                # shared API contracts & DTOs (backend-first)
      src/
      package.json
      tsconfig.json
    shared/                   # shared utilities (pure, no node/browser globals)
      src/
      package.json
      tsconfig.json

  eslint.config.mjs            # shared ESLint flat config (root)
  prettier.config.cjs          # shared Prettier config (root)
  tsconfig.base.json           # shared TS baseline
  tsconfig.node.json           # Node-oriented TS baseline
  tsconfig.web.json            # Browser/bundler-oriented TS baseline
  tsconfig.json                # optional “solution” references root
  pnpm-workspace.yaml
  package.json                 # root scripts + pinned packageManager
```

Why this works well long-term:

- A **single deployable backend** still has **module folders** organized by what the code does (vertical slices), which is exactly the “organise by functional perspective” guidance often used to avoid “layer soup.” citeturn7view0turn4search11  
- Shared code is explicit: “contracts” for backend-driven types, “shared” for cross-cutting utilities. Using workspace packages for these forces intentional dependency flow. citeturn2view0turn3search0  
- pnpm workspaces are enabled by `pnpm-workspace.yaml`, which defines workspace root and package globs. citeturn2view1turn2view0

## Setup guide from scratch

### Create the repo and pin toolchain versions

Use Corepack to pin the pnpm version via the `packageManager` field (reproducible installs across machines), which pnpm explicitly recommends via its Corepack installation path. citeturn9view0turn11search18turn5search15

1) Initialize the repository:

```bash
mkdir repo && cd repo
git init
```

2) Pick a supported Node LTS line, and standardize on it (examples below assume modern LTS). As of late March 2026, Node v24 is Active LTS and Node v22 is Maintenance LTS. citeturn5search1turn5search5

3) Enable Corepack and pin pnpm:

```bash
corepack enable pnpm
corepack use pnpm@latest-10
```

This command flow is documented by pnpm and is designed to write a `packageManager` entry to `package.json` for reproducibility. citeturn9view0turn5search13

### Create workspace layout

1) Create directories:

```bash
mkdir -p apps/api apps/web packages/contracts packages/shared
```

2) Create `pnpm-workspace.yaml`:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

pnpm uses `pnpm-workspace.yaml` as the workspace root config and supports glob inclusion/exclusion; the root package is always included. citeturn2view1

### Create root `package.json` and scripts

Create a root `package.json` like this:

```json
{
  "name": "repo",
  "private": true,
  "scripts": {
    "dev": "pnpm --filter @repo/api dev",
    "dev:web": "pnpm --filter @repo/web dev",
    "dev:full": "pnpm -r --parallel --filter @repo/api --filter @repo/web run dev",

    "build": "pnpm -r --sort run build",
    "typecheck": "pnpm -r --sort run typecheck",

    "lint": "pnpm -r run lint",
    "format": "prettier . --write",
    "format:check": "prettier . --check",

    "clean": "pnpm -r --reverse run clean"
  }
}
```

Important mechanics these scripts rely on:

- `private: true` prevents accidental publishing of the workspace root via npm. citeturn11search0  
- `pnpm --filter` selects packages and is the intended way to run a command against a subset of workspace packages. citeturn2view2turn16search1  
- `pnpm -r` runs scripts across workspace packages; by default it sorts topologically (dependencies before dependents) when `--sort` is true. citeturn12view0  
- `pnpm run` makes workspace-root `node_modules/.bin` available to scripts in all workspace packages, which is how you can keep tooling installed at the root (ESLint/Prettier/tsc) without redundantly installing it per package. citeturn15search6

Note on script naming: pnpm has built-in commands that can conflict with certain script names; be deliberate if you name scripts `deploy`, `setup`, `rebuild`, `clean`. citeturn10search3

### Install shared tooling at the workspace root

Install TypeScript, ESLint, Prettier, and supporting tooling at the workspace root. pnpm requires `-w` (or `--workspace-root`) to explicitly add deps to the root workspace package. citeturn16search2turn16search8

```bash
pnpm add -Dw typescript eslint prettier
pnpm add -Dw typescript-eslint @eslint/js eslint-config-prettier
```

This aligns with modern ESLint + typescript-eslint guidance (flat config quickstart + recommended rules). citeturn13search19turn1search9turn1search3

You’ll add React/Vite and backend runtime deps inside the respective apps (next).

### Scaffold apps

Frontend (React): Using Vite’s scaffolding is the most common minimal setup today; Vite’s docs explicitly support `pnpm create vite`. citeturn15search13turn15search2

```bash
pnpm create vite apps/web --template react-ts
```

Backend (Node): Keep it minimal—just a TypeScript app plus a dev runner.

```bash
cd apps/api
pnpm init -y
cd ../..
```

Now install backend dev runner and (optionally) a web framework in the backend package:

```bash
pnpm --filter @repo/api add -D tsx
```

tsx provides watch mode and is commonly used as a fast TS/ESM runner; its watch behavior is documented. citeturn4search6turn4search2

If you prefer nodemon, install it instead:

```bash
pnpm --filter @repo/api add -D nodemon
```

nodemon watches for file changes and restarts the process automatically. citeturn4search1turn4search31

### Create shared packages

Initialize your shared packages (`contracts`, `shared`) with minimal `package.json` + `tsconfig.json`. These will be consumed via pnpm workspace linking and the workspace protocol. citeturn2view0turn8search14

## TypeScript configuration strategy

### Baselines and inheritance

Use `extends` to keep TS configs consistent: TypeScript loads base config first and overlays per-project overrides; relative paths resolve relative to the originating config file. citeturn11search3turn11search15

Create three root config files:

`tsconfig.base.json` (shared strictness and hygiene)

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,

    "noEmitOnError": true,
    "skipLibCheck": true,

    "forceConsistentCasingInFileNames": true
  }
}
```

`tsconfig.node.json` (Node-oriented defaults)

```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "types": ["node"],
    "sourceMap": true
  }
}
```

TypeScript specifically recommends Node-* module modes (e.g. `nodenext`) for modern Node environments, and its module/moduleResolution settings affect type checking and resolution behavior. citeturn3search2turn3search18turn14search0turn14search3

`tsconfig.web.json` (bundler/browser-oriented defaults)

```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "noEmit": true
  }
}
```

TypeScript’s guidance is explicit that bundler-oriented resolution can be appropriate when your runtime is a bundler, whereas NodeNext can be too strict for bundled imports. citeturn14search2turn14search0

### Per-package configs

Backend app `apps/api/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.node.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",

    "composite": true,
    "declaration": false
  },
  "include": ["src/**/*.ts"]
}
```

If you set `composite: true`, TypeScript applies constraints that enable `--build` mode and faster incremental multi-project builds. citeturn0search3turn3search0

Frontend app `apps/web/tsconfig.json` can mostly remain what Vite generates, but it’s fine to align it to `tsconfig.web.json` to keep repo-wide consistency (Vite expects TS for typechecking; bundling is done by Vite). citeturn15search13turn15search2

Shared package `packages/contracts/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.node.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",

    "composite": true,
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/**/*.ts"]
}
```

Declaring shared packages as composite projects enables efficient builds via `tsc --build`, and `.tsbuildinfo` files are used for incremental compilation. citeturn3search0turn14search1

### Project references

Project references are worthwhile once you have more than a couple of shared packages or the backend starts to feel heavy. They let you structure builds into smaller pieces and use `tsc --build` to compile/check in dependency order. citeturn3search0turn0search27turn14search20

Use this progressive approach:

- Start with **no references** (fastest initial setup).
- Add references when:
  - typechecking becomes slow, or
  - you want stricter boundary enforcement between workspace packages.

If/when you enable references, add a root “solution” `tsconfig.json`:

```json
{
  "files": [],
  "references": [
    { "path": "./packages/contracts" },
    { "path": "./packages/shared" },
    { "path": "./apps/api" }
  ]
}
```

Then typecheck/build with:

```bash
pnpm exec tsc -b
```

TypeScript’s handbook ties project references directly to `--build` mode as the intended way to orchestrate multi-project compilation. citeturn3search0turn3search4turn3search20

A caution: project references are powerful, but not always necessary from day one—some teams defer them until there’s measurable pain. citeturn3search22

## Shared tooling setup

### ESLint

Use ESLint **flat config** (`eslint.config.mjs`) at the workspace root. Flat config is the default since ESLint v9 and is the recommended direction for new setups. citeturn13search12turn13search2turn13search3

Create `eslint.config.mjs` in the repo root:

```js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";

export default defineConfig([
  globalIgnores([
    "**/dist/**",
    "**/build/**",
    "**/.turbo/**",
    "**/.vite/**",
    "**/node_modules/**",
    "**/.pnpm/**"
  ]),

  js.configs.recommended,

  ...tseslint.configs.recommended,

  // Prettier should own formatting concerns
  eslintConfigPrettier,

  // Monorepo “safety rails”
  {
    rules: {
      // Keep workspace packages using package imports, not ../../..
      "no-restricted-imports": [
        "error",
        {
          patterns: ["../*", "../../*", "../../../*"]
        }
      ]
    }
  }
]);
```

Why this is “modern best practice” for 2025+:

- ESLint introduced helpers like `defineConfig()` and `globalIgnores()` to make flat config safer and less confusing. citeturn13search13turn13search5turn13search24  
- typescript-eslint’s flat config quickstart provides recommended configs compatible with ESLint’s flat config format. citeturn13search19turn1search6  
- `eslint-config-prettier` is the standard way to disable ESLint formatting rules so Prettier can format consistently. citeturn1search3turn1search7

Typed linting (optional): typescript-eslint explicitly notes that rules requiring type information are slower because they require TypeScript to analyze the whole project, but they can catch deeper issues. Treat this as an opt-in later step. citeturn13search0turn13search1

### Prettier

Prettier recommends configuring options via a config file so CLI + editors behave consistently. citeturn1search3turn1search7turn1search32

Create `prettier.config.cjs` in the root:

```js
/** @type {import("prettier").Config} */
module.exports = {
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  printWidth: 100
};
```

(You can also use `.prettierrc` JSON; Prettier supports both and resolves configuration by searching upward from the file being formatted.) citeturn1search7turn1search11

### Package scripts: keep tooling centralized, usage local

In each workspace package, add lightweight scripts (they can call tools installed at the root because pnpm includes `<workspace root>/node_modules/.bin` in PATH). citeturn15search6

Example `apps/api/package.json` scripts:

```json
{
  "name": "@repo/api",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "pnpm exec tsc -p tsconfig.json",
    "typecheck": "pnpm exec tsc -p tsconfig.json --noEmit",
    "lint": "eslint .",
    "clean": "rm -rf dist"
  }
}
```

tsx watch mode behavior (watching imported files, excluding node_modules/dist by default) is documented and is typically sufficient for backend DX without extra configuration. citeturn4search6turn4search2

If you use nodemon instead, it provides automatic restart for Node projects when files change. citeturn4search1turn4search31

## Backend structure and modular monolith patterns

### Module boundaries and layout

Inside a modular monolith, the most important rule is: **code is easy to move, boundaries are hard to re-invent later**. You want a folder structure that makes boundaries obvious and discourages “just import the repo from another module.”

A widely used approach is to organize by feature/functionality (“vertical slicing”) instead of technical layers. citeturn7view0turn7view1turn4search11

A concrete module layout under `apps/api/src/modules/<module>`:

- `index.ts` is the **only import surface** other modules should touch.
- `http/` owns transport details (routes, controllers, request parsing).
- `service/` owns use-cases / orchestration.
- `domain/` owns types and invariants (no database, no HTTP).
- `data/` owns persistence adapters.

This aligns with entity["people","Simon Brown","software architect"]’s modular monolith guidance: treat internal parts as “components” with a well-defined interface, and use tooling/the compiler to help enforce boundaries where possible. citeturn7view1turn7view2turn6view0

### Practical boundary enforcement (without extra platforms)

Without introducing Nx/Turbo or a module framework, you still have three practical enforcement mechanisms:

- **Public API entrypoint per module** (the `index.ts` rule) + code review. This is the lowest ceremony and most effective early. citeturn7view2  
- **ESLint restrictions** to block cross-module “deep imports.” ESLint flat config makes scoping rules by glob/paths straightforward. citeturn13search3turn1search9  
- **Workspace packages for hard boundaries** later: when a module is mature, extracting it to `packages/<module>` makes boundaries enforceable with Node’s package resolution and pnpm workspace linking. citeturn2view0turn15search26

This staged approach keeps the initial setup simple while leaving a clear path to scale boundaries as the codebase grows. citeturn4search7turn4search11

## Best practices for dependency management, code sharing, and workflow

### Dependency management in a pnpm workspace

Internal dependencies should use the workspace protocol:

- `workspace:` forces pnpm to resolve to a local workspace package and fail if it can’t, avoiding ambiguity that can happen with version ranges. citeturn2view0turn8search14  
- pnpm also documents that when packages are packed/published, `workspace:` dependency specs are replaced with real versions/semver ranges in the tarball manifest. citeturn10search7turn8search14

In practice, this means in `apps/api/package.json`:

```json
{
  "dependencies": {
    "@repo/contracts": "workspace:*",
    "@repo/shared": "workspace:*"
  }
}
```

To keep third-party dependency versions consistent across many workspace packages, pnpm supports **catalogs**: a workspace-level feature for reusable version specifiers via the `catalog:` protocol. citeturn16search18turn5search3turn2view1

If you opt into catalogs, define them in `pnpm-workspace.yaml` and then reference versions as `catalog:` (or `catalog:default`) in package manifests. citeturn0search7turn5search3

If you ever need to force a transitive dependency version across the workspace, use pnpm’s top-level `overrides` (root-only) rather than ad-hoc fixes per package. citeturn0search4turn1search8

### Avoid phantom dependencies

pnpm’s default install model is intentionally strict: code only has access to dependencies declared in its own `package.json`, even though content is stored efficiently and linked. This reduces “works on my machine” bugs caused by implicit/hoisted dependencies. citeturn15search26turn15search6

Avoid loosening this unless you have a concrete reason:

- Avoid hoisting patterns that make undeclared dependencies resolvable; pnpm explicitly notes that hoisting to the root can create phantom dependencies. citeturn16search13

### Backend-first code sharing strategy

A backend-first flow is easiest when the backend owns API contracts and the frontend consumes them from a shared package. You have two battle-tested, non-experimental options:

Type-only contracts (lowest tooling)
- Put DTOs, API input/output types, and shared enums in `packages/contracts`.
- Backend uses the types to shape responses; frontend uses them to type API client code.
- Combine with runtime validation on the backend separately as needed. citeturn3search0turn2view0

Schema-as-contract (recommended when you want runtime validation + shared types)
- Use a schema library like entity["organization","Zod","typescript-first validation"] in `packages/contracts`, define schemas once, validate at runtime, and infer TypeScript types from schemas.
- This reduces drift between runtime validation and compile-time types. citeturn8search0turn8search4turn8search28

If you later want generated clients: generating TypeScript types/clients from OpenAPI is a common production practice, but it adds a build step and is best introduced once your API stabilizes. citeturn8search17turn8search1

### Scripts and development workflow

The workflow is designed around pnpm’s strengths:

- Use `pnpm --filter` for “work on one app/package right now.” citeturn2view2turn15search3  
- Use `pnpm -r --sort` for “build/test/typecheck everything in dependency order.” pnpm documents that `--sort` runs packages topologically. citeturn12view0  
- Keep tool dependencies at the root; package scripts can run them because pnpm adds workspace root `.bin` to PATH for workspace scripts. citeturn15search6  

A minimal “backend-first” day-to-day loop is:

```bash
pnpm dev          # runs only the backend by default
pnpm typecheck    # monorepo-wide correctness gate
pnpm lint         # monorepo-wide lint gate
```

This keeps the default developer path focused on backend changes (API, modules, contracts) before UI integration. citeturn2view2turn12view0

### Production packaging without monorepo tooling platforms

When you containerize or deploy the backend, you typically want a **self-contained output directory**. pnpm provides `pnpm deploy`, which creates a deploy directory with a localized virtual store to keep the deploy directory portable (with some workspace settings caveats). citeturn15search17turn10search2

If you don’t want to enable injected workspace packages, pnpm documents using `--legacy` or `force-legacy-deploy`. citeturn10search2turn10search5