# Standing

**Relationship Command**

Standing is a relationship intelligence workspace built to preserve the context,
commitments, signals, and history that normally disappear across inboxes,
messages, notes, and human memory.

It is designed around a simple question:

> Where do I stand with this person, and what matters next?

Standing treats a relationship as a persistent object rather than a contact
record. Conversations create state. State becomes memory. Memory informs the
next interaction.

---

## What Standing Is

Traditional CRMs are built around records, pipelines, and data entry.

Standing is built around relationships.

The product is intended to maintain a durable working model of the people you
interact with, including:

- relationship state
- communication history
- known facts
- private notes
- open loops and commitments
- priority and attention signals
- drafts and pending correspondence
- changes in relationship strength over time

The goal is not to create another place where users manually maintain contact
data.

The goal is to make useful relationship context persistent, retrievable, and
actionable.

---

## Product Model

Standing organizes interaction around several core concepts.

### Contacts

A contact represents a person and the relationship context associated with
them.

Contacts are intended to accumulate useful context over time rather than act as
static address-book entries.

### Relationship Memory

Standing preserves information that should matter during future interactions:
facts, notes, prior context, commitments, and other durable relationship state.

### Thread State

Conversation threads can carry user-specific state such as:

- current workflow state
- starred status
- unread status

Thread state is scoped to the authenticated owner.

### Notes

Private contact notes allow users to persist relationship context that may not
exist in the underlying communication provider.

### Drafts

Draft correspondence is stored as workspace state so unfinished communication
can remain associated with the authenticated user.

---

## Current Development Status

Standing is under active development.

The current local foundation includes:

- Auth0 authentication
- authenticated workspace identity
- PostgreSQL persistence
- Drizzle migrations
- owner-scoped workspace data
- thread state persistence
- contact notes
- draft persistence
- local Docker database infrastructure

Current database tables:

- `thread_states`
- `contact_notes`
- `drafts`

This README describes the current development foundation, not the complete
intended product surface.

---

## Architecture

The local development stack is intentionally isolated.

```text
Browser
  │
  ▼
Standing
  │
  ├── Auth0
  │     └── authenticated user identity
  │
  ├── Workspace API
  │     └── owner-scoped application state
  │
  └── Drizzle
        │
        ▼
     PostgreSQL
```

Development services do not depend on OrbitSuite infrastructure or databases.

---

## Local Development

### Prerequisites

- Node.js
- npm
- Docker with Docker Compose

### 1. Configure environment

Standing expects a local `.env.local`.

Required configuration includes:

```env
AUTH0_SECRET=
AUTH0_BASE_URL=http://localhost:3001
AUTH0_ISSUER_BASE_URL=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=

APP_BASE_URL=http://localhost:3001

DATABASE_URL=postgresql://standing:standing_dev@localhost:5433/standing
```

Do not commit `.env.local` or authentication credentials.

### 2. Start PostgreSQL

```bash
docker compose up -d standing-db
```

Confirm the database is healthy:

```bash
docker compose ps
```

The development database is exposed locally on port `5433`.

### 3. Run database migrations

```bash
npm run db:migrate
```

Standing uses Drizzle for schema migrations.

Do not manually reproduce schema changes outside the migration path.

### 4. Start Standing

```bash
npm run dev -- --port 3001
```

Open:

```text
http://localhost:3001
```

Authentication begins at:

```text
http://localhost:3001/auth/login
```

---

## API Behavior

A basic health check is available at:

```text
GET /api/health
```

Authenticated workspace APIs require a valid Standing session.

For example:

```text
GET /api/workspace
```

must reject anonymous callers rather than returning another user's workspace
state.

Persistent records are associated with the authenticated workspace owner.

Client-supplied identity must never be treated as authoritative for ownership.

---

## Database

### `thread_states`

Stores user-specific state associated with a conversation thread.

Important fields include:

- `owner_id`
- `thread_id`
- `state`
- `starred`
- `unread`

`owner_id` and `thread_id` are uniquely associated.

### `contact_notes`

Stores private notes associated with a contact.

Important fields include:

- `owner_id`
- `contact_id`
- `body`

### `drafts`

Stores pending correspondence.

Important fields include:

- `owner_id`
- `recipient`
- `subject`
- `body`
- `status`

---

## Development Principles

Standing should preserve several invariants as the product grows.

### Identity owns data

Workspace data belongs to the authenticated user.

Ownership must be established server-side from authenticated identity, not from
an arbitrary client-provided owner identifier.

### Memory should be useful

Persist information because it improves future interactions, not merely because
it can be stored.

Standing is intended to become relationship memory, not relationship exhaust.

### Automation should reduce bookkeeping

The long-term value of Standing depends on reducing manual CRM behavior.

Useful relationship state should increasingly be derived from actual
interaction rather than requiring constant user maintenance.

### Source and inference are different things

Observed facts, user-authored notes, derived signals, and model-generated
inferences should remain distinguishable.

A relationship system becomes considerably less useful when it confidently
misremembers people.

### Private means private

Relationship data can contain sensitive professional and personal context.

Authentication, tenant isolation, data minimization, and careful handling of
derived information are product requirements, not later infrastructure work.

---

## Direction

Standing is being developed toward a relationship command layer capable of
answering questions such as:

- Who needs my attention?
- What am I waiting on?
- Who is waiting on me?
- What should I remember before contacting this person?
- Which relationships are becoming more active?
- Which relationships are going cold?
- What commitments remain unresolved?
- What changed since the last interaction?

The intended progression is:

```text
interaction
    ↓
structured state
    ↓
relationship memory
    ↓
signals
    ↓
prioritization
    ↓
next action
```

---

## Name

**Standing** refers to the state of a relationship:

> Where do we stand?

The product turns that question into something a system can remember,
understand, and eventually help act upon.

---

Standing™  
**RELATIONSHIP COMMAND**
