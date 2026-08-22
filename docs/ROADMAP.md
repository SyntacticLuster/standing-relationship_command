# Standing™ Roadmap

## Phase 0 — Lock the Domain Model

Establish durable entities for people, identities, interactions, facts,
commitments, signals, relationship state, source references, and provider state.

The objective is to prevent provider-specific semantics from becoming the
application's domain model.

## Phase 1 — One Mailbox Provider, Completely

Implement one provider end-to-end:

```text
OAuth/connect
    ↓
initial sync
    ↓
incremental sync
    ↓
identity resolution
    ↓
thread ingestion
    ↓
state mutation
    ↓
provider reconciliation
    ↓
reconnect/recovery
```

Priority, Inbox, Waiting, Snoozed, and Archive should become real projections
over live correspondence.

## Phase 2 — Relationship Memory

Separate memory into:

- observed facts
- user-authored memory
- derived state
- model inference

Every inferred or extracted item should retain provenance and support correction.

## Phase 3 — Open Loops as a First-Class Primitive

Represent relationship commitments explicitly.

Examples:

- send architecture note tomorrow
- return revised forecast
- make introduction to Sarah
- confirm diligence session

Standing should eventually detect when later correspondence resolves an open
loop and propose closure.

## Phase 4 — Separate Relationship Dimensions

Internally distinguish:

- strength
- momentum
- intent
- urgency
- attention required
- current state

Priority should be derived from these dimensions rather than treated as
relationship strength.

## Phase 5 — Build the "Standing" Object

Every person should have a concise current-state summary.

Example:

> Active relationship. High investment intent. Technical diligence underway.
> Last interaction 12 minutes ago. Waiting on you for architecture answers and
> the execution ledger. IC meets Thursday. Momentum increasing.

Preserve Standing snapshots over time.

## Phase 6 — Relationship Diffs

Show what changed since the user's last meaningful interaction rather than
forcing them to reread history.

## Phase 7 — Compose Preflight

Do not make Compose primarily an AI writer.

Make it relationship-aware preflight:

```text
✓ Tone consistent with prior correspondence
✓ Answers the architecture question
⚠ You promised to attach the execution ledger
⚠ One open question remains unanswered
```

## Phase 8 — Search Becomes Command

Support questions such as:

- Who am I waiting on?
- Who is waiting on me?
- Who has gone cold this month?
- Which investors have high intent but no touch in seven days?
- Who did I promise something before Friday?
- Who mentioned AWS credits?
- Who should I talk to today?

Use structured predicates where possible, semantic retrieval where useful, and
models for interpretation.

## Phase 9 — Calendar

Use calendar data for pre-meeting briefs and post-meeting state updates.

## Phase 10 — Relationship Graph

Model relationships among relationships without prematurely introducing
specialized graph infrastructure.

## Phase 11 — Production Hardening

Before broad launch:

- privacy review
- tenant isolation
- provenance integrity
- provider reconnect behavior
- deletion semantics
- memory correction and forgetting
- auditability
- failure attribution
- rate-limit handling
- encrypted secret handling
- data export/deletion

## Phase 12 — Additional Providers

Only after the first provider and relationship model are proven.

## Suggested Milestone Order

1. Domain model + provenance
2. One production-quality mailbox adapter
3. Identity resolution
4. Interaction/event ingestion
5. Open-loop extraction
6. Fact extraction with provenance
7. Standing snapshot
8. Priority engine with explainability
9. Relationship diff
10. Compose preflight
11. Calendar
12. Natural-language command/search
13. Cross-relationship graph
14. Production/security/privacy hardening
15. Additional providers

Around milestone 7, Standing should already be useful enough for real-user testing.
