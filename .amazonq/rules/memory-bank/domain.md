# Standing — Domain Model

## Core Entities

These are the intended durable objects of the system. Names are directional, not an implementation mandate.

```
Person
Identity
Organization
Thread
Interaction
Fact
Commitment
PrivateNote
Signal
RelationshipState
ScoreSnapshot
Draft
SourceReference
ProviderCursor
```

## Fact

Facts carry provenance. Every extracted fact should be traceable to its source.

```
Fact
  subject: Person
  claim: string
  source: SourceReference
  observed_at: timestamp
  extracted_at: timestamp
  confidence: float
  status: active | superseded | disputed
  durability_class: transient | durable | unknown
```

## Commitment

Represents a promise or obligation between the user and a contact.

```
Commitment
  person: Person
  owner: me | them | shared
  action: string
  source: SourceReference
  created_at: timestamp
  due_at: timestamp | null
  status: open | resolved | cancelled
  confidence: float
  resolved_at: timestamp | null
  resolved_by: SourceReference | null
```

## RelationshipState

Avoid collapsing these dimensions into a single score prematurely.

```
strength
momentum
intent
urgency
attention_required
workflow_state
last_interaction_at
next_expected_action
```

## SourceReference

Every extracted fact, commitment, or signal should point back to its evidence.

```
SourceReference
  provider: string
  source_type: string
  external_id: string
  thread_id: string
  message_id: string
  observed_at: timestamp
  excerpt_pointer: string | null
```

## ProviderCursor

Synchronization state must support resumable sync, deduplication, reconnect, cursor invalidation, and replay.

```
ProviderCursor
  provider: string
  cursor: string
  last_synced_at: timestamp
  status: active | invalidated
```

## Memory Lifecycle

Facts and signals should carry metadata to support aging and correction:

```
first_observed: timestamp
last_confirmed: timestamp
superseded_by: Fact | null
confidence: float
durability_class: transient | durable | unknown
```

Standing should eventually become good at forgetting obsolete information, not merely accumulating it.

## Memory Classification

The four classes of memory must remain distinguishable:

| Class | Description |
|---|---|
| Observed facts | Extracted from actual correspondence or activity |
| User-authored memory | Notes, corrections, and explicit annotations |
| Derived state | Computed from observed facts (e.g. relationship score) |
| Model inference | AI-generated signals — lowest trust, must retain provenance |

## Product Principles

1. **Relationship state over contact records** — the person is the durable object; communication is evidence
2. **Provenance before confidence** — observed facts, user notes, derived signals, and model inference must remain distinguishable
3. **Identity owns data** — ownership derives from authenticated server-side identity only
4. **Open loops are more important than generic tasks** — Standing should understand who owes whom what
5. **Explain prioritization** — whenever Standing ranks someone highly, explain why
6. **Learn normal cadence** — a daily relationship and a quarterly one should not share the same cooling threshold
7. **Preserve the delta** — users often need what changed, not the entire history
8. **Compose with context, not just generation** — check for forgotten attachments, unanswered questions, broken commitments, tone discontinuity
9. **Memory should age** — facts can become stale and require confirmation, supersession, dispute, or forgetting
10. **Automation should reduce bookkeeping** — if users must constantly curate Standing like a CRM, the product has failed
11. **Private means private** — authentication, tenant isolation, minimization, correction, deletion, export, and provenance are product requirements
12. **Avoid feature gravity** — every feature should answer: does this help the user understand relationship state or act correctly on it?
