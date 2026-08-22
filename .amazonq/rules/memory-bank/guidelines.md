# Standing — Development Guidelines

## Code Quality Standards

### TypeScript

- Strict TypeScript throughout; no `any` — use explicit types or `unknown` with narrowing
- Use `type` for object shapes and unions; `interface` is not used in this codebase
- Inline type assertions use `as` only when parsing external input (e.g., `await request.json() as { field?: string }`)
- Config files use `import type` for type-only imports: `import type { NextConfig } from "next"`
- All exports are named or default — no barrel re-exports

### Naming Conventions

- **Files**: `camelCase.ts` / `camelCase.tsx` for modules; `route.ts` for API route handlers
- **Variables/functions**: `camelCase`
- **Types**: `PascalCase`
- **DB columns**: `snake_case` in PostgreSQL; `camelCase` in TypeScript via Drizzle column mapping
- **CSS classes**: `kebab-case` (e.g., `signal-shell`, `thread-row`, `detail-pane`)

### Formatting

- Double quotes for strings throughout
- Trailing commas in multi-line objects and arrays
- 2-space indentation
- Semicolons present

---

## API Route Patterns

Every workspace API route follows this exact structure:

```ts
export async function POST(request: Request) {
  const owner = await requireOwner();
  if (owner instanceof Response) return owner;   // early return on 401

  try {
    const payload = (await request.json()) as { field?: string };
    const field = payload.field?.trim() ?? "";

    if (!field) {
      return Response.json({ error: "..." }, { status: 400 });
    }

    const db = getDb();
    const [result] = await db.insert(table).values({ ownerId: owner, ...}).returning();

    return Response.json({ result }, { status: 201 });
  } catch (error) {
    return routeError(error);
  }
}
```

Key rules:
- Always call `requireOwner()` first and guard with `instanceof Response`
- `owner` (Auth0 `sub`) is always set server-side — never trust client-supplied identity
- Validate all inputs before touching the DB; return `400` with a descriptive `{ error }` message
- Wrap DB operations in `try/catch` and delegate to `routeError(error)`
- Use `Response.json()` — not `NextResponse`
- `status: 201` for successful creates; `status: 200` (default) for reads/updates

---

## Database Patterns

### Querying

```ts
const db = getDb();

// Select with owner filter (always filter by owner)
const rows = await db.select().from(table).where(eq(table.ownerId, owner));

// Insert with returning
const [row] = await db.insert(table).values({ ownerId: owner, ...fields }).returning();

// Upsert (thread-state pattern)
await db.insert(threadStates)
  .values(values)
  .onConflictDoUpdate({
    target: [threadStates.ownerId, threadStates.threadId],
    set: { state: values.state, updatedAt: values.updatedAt },
  });

// Aggregate
const [{ value }] = await db.select({ value: count() }).from(table).where(eq(table.ownerId, owner));
```

### Schema Definition

```ts
export const myTable = pgTable(
  "my_table",
  {
    id: serial("id").primaryKey(),
    ownerId: text("owner_id").notNull(),
    // ... fields
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("my_table_owner_idx").on(table.ownerId),
  ],
);
```

- Every table has `id` (serial PK), `ownerId` (text, notNull), and timestamp(s)
- Always add an index on `ownerId`; add a `uniqueIndex` when a composite key is needed
- Use `text` for string fields, `boolean` with `.default(false)` for flags, `timestamp` for dates
- String fields that may be empty use `.default("")` rather than being nullable

---

## Auth Patterns

### In API routes — use `requireOwner()`

```ts
import { requireOwner } from "../shared";

const owner = await requireOwner();
if (owner instanceof Response) return owner;
// owner is now a string (Auth0 sub)
```

### In server components — use `getUser()` or `requireUser()`

```ts
import { getUser, requireUser } from "./auth";

// Nullable — for conditional rendering
const user = await getUser();

// Redirects to /auth/login if no session
const user = await requireUser();
```

### Auth0 session shape

```ts
type AppUser = {
  sub: string;        // stable identity — used as owner_id in DB
  email: string | null;
  displayName: string; // name ?? email ?? sub
};
```

---

## Client Component Patterns

### State management

- All workspace state lives in a single `StandingWorkspace` client component
- `useState` for UI state; `useMemo` for derived/filtered lists
- No external state library (no Redux, Zustand, etc.)

### Data fetching

- `useEffect` with a cleanup flag (`let active = true`) for initial workspace hydration:

```ts
useEffect(() => {
  let active = true;
  fetch("/api/workspace", { cache: "no-store" })
    .then(async (res) => { ... })
    .then((data) => { if (!active) return; setState(data); })
    .catch(() => { if (active) setToast("..."); });
  return () => { active = false; };
}, []);
```

- Mutations use `fetch` directly with `method: "POST"` and `content-type: application/json`
- Optimistic updates: apply state change locally first, then persist async; on failure show toast but do not revert

### Toast notifications

- Single `toast` string state; set via `setToast("message")`
- Used for both success confirmations and graceful degradation messages

---

## Error Handling

### API routes

`routeError(error)` in `shared.ts` handles two cases:
- DB relation not found → `503` with "Standing storage has not finished provisioning."
- All other errors → `500` with "Standing could not persist this change."

### Client

- Network/API failures are caught silently; a toast message informs the user
- The pattern "kept in this session; durable sync is unavailable" is the standard degraded-mode message

---

## Security Invariants

These must be preserved in all new code:

1. **`owner_id` is always set from the Auth0 session server-side** — never from request body or query params
2. **All workspace data queries must filter by `ownerId`** — no cross-tenant data leakage
3. **Unauthenticated requests return `401`** — never return another user's data to an anonymous caller
4. **Client-supplied identity is never authoritative** — `requireOwner()` is the only source of truth

---

## Adding a New Workspace Resource

1. Add table to `db/schema.ts` following existing conventions (id, ownerId, fields, timestamps, indexes)
2. Run `npm run db:generate` then `npm run db:migrate`
3. Create `app/api/workspace/<resource>/route.ts` using the standard route pattern
4. Import `requireOwner` and `routeError` from `../shared`
5. Add the resource to `GET /api/workspace` if it needs to be hydrated on load
6. Update `StoredWorkspace` type in `StandingWorkspace.tsx` if surfacing in the UI

---

## What Not To Do

- Do not use `NextResponse` — use `Response.json()` directly
- Do not trust `request.body` for ownership — always use `requireOwner()`
- Do not add nullable columns to the schema when an empty string default suffices
- Do not manually write SQL — use Drizzle query builder
- Do not bypass the migration path — no manual `ALTER TABLE` in development
- Do not commit `.env.local` or any credentials
