# Standing — Roadmap & Direction

## Current State

The current build is a functional workspace UI backed by PostgreSQL persistence. It runs on example/seed data. Signal ingestion, live mailbox adapters, and AI-derived relationship signals are not yet implemented.

## Phased Roadmap

### Phase 0 — Lock the Domain Model
Establish durable entities for people, identities, interactions, facts, commitments, signals, relationship state, source references, and provider state. Prevent provider-specific semantics from becoming the application's domain model.

### Phase 1 — One Mailbox Provider, Completely
Implement one provider end-to-end:
```
OAuth/connect → initial sync → incremental sync → identity resolution
  → thread ingestion → state mutation → provider reconciliation → reconnect/recovery
```
Priority, Inbox, Waiting, Snoozed, and Archive become real projections over live correspondence.

### Phase 2 — Relationship Memory
Separate memory into: observed facts, user-authored memory, derived state, model inference. Every inferred or extracted item retains provenance and supports correction.

### Phase 3 — Open Loops as a First-Class Primitive
Represent relationship commitments explicitly. Standing should detect when later correspondence resolves an open loop and propose closure.

### Phase 4 — Separate Relationship Dimensions
Internally distinguish strength, momentum, intent, urgency, attention required, and current state. Priority is derived from these dimensions, not treated as relationship strength.

### Phase 5 — Build the "Standing" Object
Every person gets a concise current-state summary. Preserve Standing snapshots over time.

Example:
> Active relationship. High investment intent. Technical diligence underway. Last interaction 12 minutes ago. Waiting on you for architecture answers. IC meets Thursday. Momentum increasing.

### Phase 6 — Relationship Diffs
Show what changed since the user's last meaningful interaction rather than forcing them to reread history.

### Phase 7 — Compose Preflight
Relationship-aware preflight before send — not primarily an AI writer:
```
✓ Tone consistent with prior correspondence
✓ Answers the architecture question
⚠ You promised to attach the execution ledger
⚠ One open question remains unanswered
```

### Phase 8 — Search Becomes Command
Support natural-language queries over structured relationship state:
- Who am I waiting on?
- Who is waiting on me?
- Who has gone cold this month?
- Who did I promise something before Friday?
- Who should I talk to today?

### Phase 9 — Calendar
Pre-meeting briefs and post-meeting state updates from calendar data.

### Phase 10 — Relationship Graph
Model relationships among relationships without prematurely introducing specialized graph infrastructure.

### Phase 11 — Production Hardening
Privacy review, tenant isolation, provenance integrity, provider reconnect behavior, deletion semantics, memory correction and forgetting, auditability, failure attribution, rate-limit handling, encrypted secret handling, data export/deletion.

### Phase 12 — Additional Providers
Only after the first provider and relationship model are proven.

## Suggested Milestone Order

1. Domain model + provenance
2. One production-quality mailbox adapter
3. Identity resolution
4. Interaction/event ingestion
5. Open-loop extraction
6. Fact extraction with provenance
7. Standing snapshot ← *useful enough for real-user testing around here*
8. Priority engine with explainability
9. Relationship diff
10. Compose preflight
11. Calendar
12. Natural-language command/search
13. Cross-relationship graph
14. Production/security/privacy hardening
15. Additional providers

## Features to Delay

Do not prioritize:
- Autonomous sending
- Team CRM workflows / sales stages
- Elaborate dashboards
- LinkedIn scraping
- Giant chatbot UI
- Graph database migration
- Broad provider matrix before first provider is proven
- Configurable automation builders
- Marketing automation
- Enterprise org-chart features

## AWS Deployment Target

The intended production stack is a containerized Next.js app on AWS ECS Fargate:

| Layer | Target |
|---|---|
| Runtime | ECS Fargate (Next.js standalone container) |
| Auth | Auth0 with server-side sessions (`@auth0/nextjs-auth0`) |
| Database | RDS / Aurora PostgreSQL via `DATABASE_URL` |
| Secrets | AWS Secrets Manager → ECS task environment |
| Load balancing | ALB with ACM TLS certificate |
| Images | ECR → ECS task definition (referenced by digest) |
| Logs | CloudWatch Log Group |

### Deployment Steps
1. `docker build` → push to ECR
2. Apply pending Drizzle migrations against target DB
3. Update ECS task definition with new image digest
4. Trigger ECS service rolling deploy (min healthy 100%)
5. ALB health checks confirm new tasks before draining old ones

### Rollback
ECS service can be reverted to the previous task definition revision in under two minutes. Schema changes must follow expand/contract pattern — backward-compatible across at least one deploy cycle.

### Deferred AWS Work
Actual AWS resource provisioning (VPC, RDS, ECS, ALB, ECR, ACM, Secrets Manager) requires separate explicit approval and is not performed in this repository. No CDK/Terraform/CloudFormation IaC exists yet.
