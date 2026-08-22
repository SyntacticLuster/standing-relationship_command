# Standing — Project Structure

## Directory Layout

```
standing-relationship_command/
├── app/                        # Next.js App Router root
│   ├── api/
│   │   ├── health/route.ts     # GET /api/health — unauthenticated health check
│   │   └── workspace/
│   │       ├── route.ts        # GET /api/workspace — full workspace state
│   │       ├── shared.ts       # requireOwner(), routeError() helpers
│   │       ├── drafts/route.ts # POST /api/workspace/drafts
│   │       ├── notes/route.ts  # POST /api/workspace/notes
│   │       └── thread-state/route.ts  # POST /api/workspace/thread-state
│   ├── auth.ts                 # Auth0 client, getUser(), requireUser()
│   ├── globals.css             # Global styles (Tailwind v4)
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Home page — server component, passes user to client
│   ├── signal-data.ts          # Seed/example contacts and threads
│   └── StandingWorkspace.tsx   # Primary client component (entire workspace UI)
├── db/
│   ├── index.ts                # getDb() — lazy singleton Pool + Drizzle instance
│   └── schema.ts               # Drizzle table definitions
├── drizzle/                    # Migration output (drizzle-kit generate)
│   ├── meta/
│   └── 0000_wild_argent.sql
├── docs/                       # Product and architecture documentation
│   ├── AWS_MIGRATION_PLAN.md
│   ├── AWS_TARGET_ARCHITECTURE.md
│   ├── DOMAIN_MODEL.md
│   ├── PRODUCT_VISION.md
│   ├── ROADMAP.md
│   └── ...
├── examples/d1/                # Legacy Cloudflare D1 reference (not active)
├── public/                     # Static assets
├── tests/
│   └── rendered-html.test.mjs  # Build + HTML smoke test
├── .env.local                  # Local secrets (not committed)
├── docker-compose.yml          # PostgreSQL dev service on port 5433
├── Dockerfile                  # Standalone Next.js image
├── drizzle.config.ts           # Drizzle-kit config
├── next.config.ts              # Next.js config (standalone output)
└── tsconfig.json
```

## Core Components

### API Layer (`app/api/workspace/`)

All workspace routes follow the same pattern:
1. Call `requireOwner()` — returns `owner` string (Auth0 `sub`) or a `401 Response`
2. Parse and validate request body
3. Call `getDb()` and execute Drizzle query
4. Return `Response.json(...)` or call `routeError(error)`

`shared.ts` provides two shared utilities used by every route:
- `requireOwner()` — extracts authenticated `sub` from Auth0 session
- `routeError(error)` — maps DB errors to appropriate HTTP responses

### Database Layer (`db/`)

- `index.ts` — lazy singleton `Pool` (max 10 connections), `getDb()` returns a Drizzle instance with schema
- `schema.ts` — three tables: `threadStates`, `contactNotes`, `drafts`

### Auth (`app/auth.ts`)

- `auth0` — singleton `Auth0Client` from `@auth0/nextjs-auth0/server`
- `getUser()` — returns `AppUser | null` (sub, email, displayName)
- `requireUser()` — redirects to `/auth/login` if no session (used in server components)
- `requireOwner()` — used in API routes, returns `sub` or `401 Response`

### UI (`app/StandingWorkspace.tsx`)

Single large client component (`"use client"`) containing the entire workspace UI. Sub-components defined in the same file:
- `ThreadRow` — list item in thread list
- `ThreadDetail` — message stack + reply dock
- `RelationshipPanel` — contact intelligence sidebar
- `ContactsList` — contacts view list
- `ContactDetail` — full contact record with note form
- `Icon` — inline SVG icon renderer keyed by `IconName`
- `Avatar` — initials avatar with accent color

### Data Flow

```
page.tsx (server)
  └── getUser() → Auth0 session
  └── <StandingWorkspace> (client)
        └── useEffect → GET /api/workspace → hydrates thread/note/draft state
        └── user actions → POST /api/workspace/* → persists changes
```

## Architectural Patterns

- **App Router only** — no Pages Router usage
- **Server components for auth boundary** — `page.tsx` is a server component; auth check happens server-side before rendering the client shell
- **Owner-scoped data** — `owner_id` is always derived from the Auth0 session server-side, never from client input
- **Optimistic UI** — thread state changes are applied locally first, then persisted async; failures show a toast but don't revert
- **Singleton DB pool** — one `Pool` instance per process, lazy-initialized on first request
- **`force-dynamic`** — workspace routes export `dynamic = "force-dynamic"` to prevent caching
