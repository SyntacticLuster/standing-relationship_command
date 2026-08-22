# Standing™ Domain Model Direction

## Core Entities

```text
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

These names are directional, not an implementation mandate.

## Fact

Facts should carry provenance.

A fact should conceptually resemble:

```text
Fact
  subject: Person
  claim: "prefers live product evidence"
  source: SourceReference
  observed_at: timestamp
  extracted_at: timestamp
  confidence: float
  status: active | superseded | disputed
  durability_class: transient | durable | unknown
```

## Commitment

```text
Commitment
  person
  owner: me | them | shared
  action
  source
  created_at
  due_at
  status
  confidence
  resolved_at
  resolved_by
```

## RelationshipState

Possible dimensions:

```text
strength
momentum
intent
urgency
attention_required
workflow_state
last_interaction_at
next_expected_action
```

Avoid prematurely collapsing these into a single score.

## SourceReference

Every extracted fact, commitment, or signal should be able to point back to its
evidence.

Suggested shape:

```text
SourceReference
  provider
  source_type
  external_id
  thread_id
  message_id
  observed_at
  excerpt_pointer
```

## ProviderCursor

Synchronization state should support:

- resumable sync
- deduplication
- reconnect
- cursor invalidation
- replay where required

## Memory Lifecycle

Suggested metadata:

```text
first_observed
last_confirmed
superseded_by
confidence
durability_class
```

Standing should eventually become good at forgetting obsolete information, not
merely accumulating it.
