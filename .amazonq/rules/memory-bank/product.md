# Standing — Product Overview

## Purpose

Standing is a relationship intelligence workspace that preserves the context, commitments, signals, and history that normally disappear across inboxes, messages, notes, and human memory.

Core question: **Where do I stand with this person, and what matters next?**

Standing treats a relationship as a persistent object rather than a contact record. Conversations create state. State becomes memory. Memory informs the next interaction.

## Value Proposition

Traditional CRMs are built around records, pipelines, and data entry. Standing is built around relationships. It maintains a durable working model of the people you interact with — not another place to manually maintain contact data.

## Key Features (Current)

- **Authenticated workspace** — Auth0-based identity; all data is owner-scoped server-side
- **Thread state persistence** — inbox / waiting / snoozed / archived states, starred, unread flags per user
- **Contact notes** — private, durable notes attached to a contact (max 2,000 chars)
- **Draft persistence** — unfinished correspondence saved as workspace state
- **Relationship panel** — known facts, open loops, relationship strength score, last touch
- **Contacts view** — relationship memory list with health indicators
- **Compose modal** — draft correspondence with recipient, subject, body
- **Provider connection UI** — placeholder for future mailbox adapters (AWS SES, M365, Gmail)
- **Health endpoint** — `GET /api/health` returns `{ status: "ok" }`

## Target Users

Professionals who manage meaningful relationships across correspondence — operators, founders, executives, advisors — who need relationship context to be persistent and actionable rather than scattered across inboxes.

## Intended Direction

```
interaction → structured state → relationship memory → signals → prioritization → next action
```

Future capability targets:
- Who needs my attention?
- What am I waiting on? / Who is waiting on me?
- What should I remember before contacting this person?
- Which relationships are going cold or becoming more active?
- What commitments remain unresolved?

## Current State

Active development. The current build is a functional workspace UI backed by PostgreSQL persistence. Signal ingestion, live mailbox adapters, and AI-derived relationship signals are not yet implemented. The UI runs on example/seed data with durable persistence layered on top.
