# Standing — Technology Stack

## Languages & Runtime

- **TypeScript 5.9** — entire codebase; `"type": "module"` in package.json
- **Node.js ≥ 22.13.0** (enforced via `engines` field)
- **React 19** with Next.js 16 App Router

## Core Dependencies

| Package | Version | Purpose |
|---|---|---|
| `next` | 16.2.6 | Framework — App Router, server components, API routes |
| `react` / `react-dom` | 19.2.6 | UI rendering |
| `@auth0/nextjs-auth0` | 4.27.0 | Authentication — `Auth0Client`, session management |
| `drizzle-orm` | 0.45.2 | Type-safe ORM for PostgreSQL |
| `pg` | 8.13.3 | PostgreSQL client (node-postgres) |

## Dev Dependencies

| Package | Version | Purpose |
|---|---|---|
| `drizzle-kit` | 0.31.10 | Schema migrations (`generate`, `migrate`) |
| `tailwindcss` | 4.2.1 | CSS utility framework (v4) |
| `@tailwindcss/postcss` | 4.2.1 | PostCSS integration for Tailwind v4 |
| `typescript` | 5.9.3 | Type checking |
| `eslint` + `eslint-config-next` | 9.39.4 / 16.2.6 | Linting |

## Database

- **PostgreSQL 16** (Alpine) via Docker
- **Drizzle ORM** for schema definition and queries
- **Connection**: `pg.Pool` with max 10 connections, lazy singleton
- Dev port: `5433` (mapped from container `5432`)
- Credentials (dev): `standing:standing_dev@localhost:5433/standing`

## Build & Output

- `next.config.ts` sets `output: "standalone"` — produces a self-contained Node.js server
- Dockerfile builds the standalone output for container deployment

## Development Commands

```bash
# Start PostgreSQL
docker compose up -d

# Run migrations
npm run db:migrate          # drizzle-kit migrate

# Generate new migration after schema change
npm run db:generate         # drizzle-kit generate

# Start dev server (port 3001)
npm run dev -- --port 3001

# Build
npm run build

# Test (build + HTML smoke test)
npm test

# Lint
npm run lint
```

## Environment Variables

Required in `.env.local`:

```env
AUTH0_SECRET=
AUTH0_BASE_URL=http://localhost:3001
AUTH0_ISSUER_BASE_URL=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=

APP_BASE_URL=http://localhost:3001

DATABASE_URL=postgresql://standing:standing_dev@localhost:5433/standing
```

## Key URLs (local dev)

| URL | Purpose |
|---|---|
| `http://localhost:3001` | Application |
| `http://localhost:3001/auth/login` | Auth0 login entry |
| `GET /api/health` | Health check (unauthenticated) |
| `GET /api/workspace` | Full workspace state (authenticated) |

## Database Schema Summary

```
thread_states     — owner_id, thread_id (unique pair), state, starred, unread, updated_at
contact_notes     — owner_id, contact_id, body, created_at
drafts            — owner_id, recipient, subject, body, status, created_at, updated_at
```

All tables include `owner_id` for tenant isolation. Indexes on `owner_id` for all tables; unique index on `(owner_id, thread_id)` for `thread_states`.
