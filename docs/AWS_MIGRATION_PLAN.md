# AWS Migration Plan — Standing

## Goal

Migrate Standing from ChatGPT Sites / Vinext / Cloudflare Workers to a
standard Next.js Node container deployable on AWS ECS Fargate, without
changing the application's UI or workspace behavior.

## Migration boundaries

### What must be replaced

| Sites surface | Replacement |
|---|---|
| `vinext` build and runtime | `next build` / `next start` |
| `vite.config.ts` + `@cloudflare/vite-plugin` | Removed; Next.js handles its own build |
| `worker/index.ts` Cloudflare Worker entry | Removed; Next.js Node server is the entry |
| `build/sites-vite-plugin.ts` | Removed |
| `scripts/build-verified.sh`, `install-ci.sh`, `sites-env.sh` | Replaced by standard `next build` and optional CI scripts |
| `.openai/hosting.json` | Removed; replaced by `.env.example` and ECS config |
| `app/chatgpt-auth.ts` (Sites identity headers) | Replaced by Auth0 server-side session adapter |
| `db/index.ts` (`cloudflare:workers` env + `drizzle-orm/d1`) | Replaced by `pg` + `drizzle-orm/node-postgres` |
| `db/schema.ts` (SQLite types) | Converted to PostgreSQL types |
| `drizzle.config.ts` (sqlite dialect) | Updated to postgresql dialect |

### What is preserved

- All application UI and visual design (`app/StandingWorkspace.tsx`, `app/globals.css`)
- Example workspace content (`app/signal-data.ts`)
- Thread-state, contact-note, and draft behavior
- Server-side ownership enforcement (owner ID on every row, enforced in every query)
- Existing API route structure (`/api/workspace/*`)

## Phase 1 — Runtime replacement (Commit 4)

### 1.1 Package changes

Remove: `vinext`, `vite`, `@cloudflare/vite-plugin`, `@vitejs/plugin-react`,
`@vitejs/plugin-rsc`, `wrangler`, `react-server-dom-webpack`.

Add: `@auth0/nextjs-auth0`, `pg`, `@types/pg`, `drizzle-orm/node-postgres`
(already in `drizzle-orm`).

Update `package.json` scripts:
```json
{
  "dev":   "next dev",
  "build": "next build",
  "start": "next start",
  "test":  "next build && node --test tests/rendered-html.test.mjs"
}
```

### 1.2 Next.js configuration

Enable standalone output in `next.config.ts`:
```ts
const nextConfig: NextConfig = { output: "standalone" };
```

### 1.3 Authentication adapter

Replace `app/chatgpt-auth.ts` with `app/auth.ts` — a thin wrapper around
`@auth0/nextjs-auth0` that exposes:

- `getUser()` — returns `{ sub, email, name } | null` from the server session
- `requireUser()` — redirects to Auth0 login if no session
- Auth0 route handler at `app/api/auth/[auth0]/route.ts`

The `sub` claim becomes the stable owner identifier. Email and name are
treated as mutable display fields.

### 1.4 Database adapter

Replace `db/index.ts`:
- Remove `cloudflare:workers` import
- Use `pg.Pool` with `DATABASE_URL`
- Use `drizzle-orm/node-postgres`

Convert `db/schema.ts` from SQLite to PostgreSQL:
- `sqliteTable` → `pgTable`
- `integer(..., { mode: "boolean" })` → `boolean()`
- `integer().primaryKey({ autoIncrement: true })` → `serial().primaryKey()`
- `text` timestamps → `timestamp` with `defaultNow()`
- `ownerEmail` columns → `ownerId` (populated from Auth0 `sub`)

Update `drizzle.config.ts` dialect to `postgresql`.

Generate a fresh PostgreSQL migration under `drizzle/`.

Preserve the original SQLite migration under `docs/legacy-d1-migration/` for
provenance.

### 1.5 API route updates

Replace `requireOwner` in `app/api/workspace/shared.ts`:
- Read identity from the Auth0 server session (not request headers)
- Return the stable `sub` as the owner ID
- Return `401` if no session

Update all `ownerEmail` references in route handlers to `ownerId`.

### 1.6 Container surface

Add:
- `Dockerfile` — multi-stage build (builder + runner)
- `.dockerignore`
- `app/api/health/route.ts` — `GET /api/health` → `200 {"status":"ok"}`
- `.env.example` — placeholder variable documentation

### 1.7 Test update

Update `tests/rendered-html.test.mjs` to match the Next.js standalone build
output structure (`.next/` instead of `dist/`).

## Phase 2 — AWS provisioning (deferred, requires explicit approval)

- Create VPC, subnets, security groups
- Provision RDS PostgreSQL instance
- Create ECR repository
- Create ECS cluster, task definition, service
- Configure ALB with ACM certificate
- Store secrets in Secrets Manager
- Wire ECS task IAM role to read secrets
- Configure CloudWatch log group

## Phase 3 — Deferred features

- Live mailbox integration (Gmail, Microsoft 365, SES inbound/outbound)
- Auth0 organization / workspace-membership enforcement
- CI/CD pipeline
- Multi-tenant isolation beyond row-level scoping

## Risk register

| Risk | Mitigation |
|---|---|
| Auth0 SDK API changes between versions | Pin SDK version; read installed type definitions before coding |
| PostgreSQL migration data loss | Expand/contract pattern; keep old columns until cutover is verified |
| `next build` contacting the database | Guard all DB calls behind request-time execution; no top-level `getDb()` calls at module load |
| Session cookie size | Auth0 SDK handles cookie chunking; no action needed |
| Node version mismatch in container | Pin `FROM node:22-alpine` in Dockerfile |
