# Standing Private PRD Addendum

## Brand, UI & Trust-Surface Architecture

**Parent document:** Standing Private PRD v0.1
**Addendum version:** 0.2
**Status:** Draft
**Date:** August 2026

---

# A1. Purpose

This addendum defines the visual identity, product-interface hierarchy, and trust-surface requirements for Standing Private and Standing Air-Gapped.

The objective is to align the product's presentation with its architectural positioning:

> **Relationship intelligence without relationship custody.**

Standing must appear credible in sensitive professional environments without becoming visually indistinguishable from generic enterprise software.

The product should communicate:

* precision;
* restraint;
* confidence;
* local control;
* operational clarity;
* human usefulness.

It should not communicate:

* consumer gamification;
* hacker cosplay;
* opaque AI authority;
* CRM busywork;
* whimsical treatment of security-sensitive workflows.

---

# A2. Brand Architecture

Standing shall use a three-layer brand hierarchy.

## A2.1 Corporate Identity

The official Standing corporate mark is the abstract geometric standing glyph:

* vertical torso;
* open, delta-like stance;
* no head;
* no facial elements;
* no literal anatomical detail;
* no shield, lock, circuit, fingerprint, or generic cybersecurity iconography.

The glyph should communicate posture and presence through geometry rather than illustration.

The corporate lockup consists of:

**Standing**
**Relationship Command**

The corporate mark is the authoritative identity used for:

* application icon;
* Windows installer;
* executable;
* taskbar;
* tray;
* login and activation surfaces;
* enterprise documentation;
* contracts;
* procurement materials;
* security documentation;
* website masthead;
* presentation decks;
* product packaging.

---

# A3. Mascot Policy

The existing Standing Man character is not part of the primary product trust surface.

The mascot must not appear in:

* authentication;
* licensing;
* encryption settings;
* account permissions;
* archive import warnings;
* security dialogs;
* error messages;
* compliance interfaces;
* enterprise administration;
* Air-Gapped deployment flows;
* core application navigation;
* relationship intelligence views.

The mascot may remain available as a secondary brand-culture asset for:

* merchandise;
* conference material;
* social content;
* community material;
* internal culture;
* optional Easter eggs;
* non-security-sensitive marketing.

The mascot must never substitute for the corporate mark.

**Principle:**

> Personality may exist around the product without weakening trust inside the product.

---

# A4. Color System

Standing shall retain its signature lime as a brand asset.

Primary accent target:

`#B3FF00`

The lime must be used with strict visual restraint.

Target accent density within ordinary application screens:

**approximately 5–10% of visible interface area or less.**

Approved uses include:

* primary corporate mark;
* selected navigation state;
* keyboard focus;
* active status;
* primary action emphasis;
* small state indicators;
* directional relationship signals;
* limited brand accents.

The lime should not be used for:

* paragraph text;
* large background fields;
* extensive borders;
* persistent glow effects;
* every icon;
* every badge;
* decorative noise.

---

# A5. Core Palette

Standing should support a restrained neutral palette.

Suggested dark-mode foundation:

```text
Accent              #B3FF00
Background          #0F1112
Surface             #171A1C
Raised Surface      #1E2225
Primary Text        #F5F6F7
Secondary Text      #A8ADB2
Border              #2B3034
```

Suggested light-mode foundation:

```text
Accent              #8CCF00 or calibrated equivalent
Background          #F7F7F4
Surface             #FFFFFF
Raised Surface      #F0F1EE
Primary Text        #161819
Secondary Text      #60666B
Border              #D8DAD6
```

The exact light-mode accent may be optically adjusted to preserve accessibility and avoid fluorescent overexposure on white surfaces.

---

# A6. Light and Dark Mode

Standing Private must provide first-class:

* Light;
* Dark;
* System;

appearance modes.

Neither mode may be treated as a secondary skin.

All core workflows must maintain equivalent:

* hierarchy;
* legibility;
* semantic emphasis;
* accessibility;
* information density.

Standing must not require a dark interface to preserve brand identity.

---

# A7. Product UX Principle

Standing is not primarily a CRM dashboard.

Standing is:

> **A correspondence environment that understands the relationship.**

Relationship intelligence should therefore be ambient to communication rather than presented as a parallel administrative system.

---

# A8. Primary Navigation

The primary navigation should converge around operational communication state.

Recommended top-level structure:

```text
Inbox
Attention
Waiting
Contacts
Archive
```

Optional secondary destinations may include:

```text
Snoozed
Sent
Drafts
Settings
```

The following concepts should not require permanent top-level destinations:

* Signals;
* Open Loops;
* Relationship Scores;
* Next Best Actions.

These should appear contextually where they matter.

---

# A9. Global State Summary

The compact top-level status summary is retained.

Example:

```text
2 Need Attention
1 Waiting
6 Open Loops
```

These indicators should function as operational summaries rather than gamified counters.

Requirements:

* low visual stress;
* compact presentation;
* keyboard navigable;
* each state explainable;
* counts derived from inspectable underlying evidence.

---

# A10. Correspondence-First Layout

The reading and composing experience is the primary visual object.

Default large-screen hierarchy:

```text
Navigation
    ↓
Conversation List
    ↓
Primary Correspondence Pane
    ↓
Contextual Relationship Rail
```

The relationship rail must not materially compromise comfortable message reading.

Recommended behavior:

* collapsible;
* keyboard-toggleable;
* adaptive width;
* optional auto-collapse while composing;
* persistent only when meaningful context exists.

The rail should support the correspondence rather than compete with it.

---

# A11. Relationship Rail

The relationship rail should prioritize concise, evidence-backed context.

Recommended sections:

```text
Relationship State
Why It Matters
Known Facts
Open Commitments
Waiting On
Recent Context
```

Avoid dense dashboarding.

The rail should answer:

> What matters about this person or thread right now?

not:

> How many metrics can Standing calculate about this person?

---

# A12. Remove Visible Relationship Numerology

Default user-facing numeric relationship scores such as:

```text
Relationship Strength: 86
```

are prohibited.

Standing may maintain continuous internal scores for:

* ranking;
* prioritization;
* model features;
* trend calculation.

The UI should expose qualitative state and supporting evidence.

Examples:

```text
Warming

3 substantive exchanges this week.
Response time has shortened.
A technical review was requested.
```

```text
Cooling

No reply in 19 days after weekly correspondence.
You still owe the revised architecture note.
```

Suggested states:

* New;
* Active;
* Warming;
* Cooling;
* Dormant;
* Re-engaged.

No state may be presented without an explainable basis.

---

# A13. Direction Over Score

Where useful, Standing should emphasize movement rather than absolute value.

Preferred:

```text
Warming ↑
```

```text
Cooling ↓
```

```text
Stable →
```

Avoid:

```text
86 / 100
```

Direction should be based on interpretable changes such as:

* cadence;
* reciprocity;
* response latency;
* substantive depth;
* commitments;
* recent activity.

---

# A14. AI Inference Visual Weight

AI-derived judgments must not visually present themselves as unquestionable facts.

Labels such as:

```text
HIGH INTENT
```

should be visually subordinate to source communication.

Preferred presentation:

```text
Likely technical diligence
```

or:

```text
Signal: increasing technical interest
```

with access to:

```text
Why?
```

The interface must distinguish:

* observed fact;
* deterministic extraction;
* probabilistic inference;
* generated suggestion.

---

# A15. Confidence Handling

Standing should not expose arbitrary model-confidence percentages unless they materially help an expert user.

Preferred behavior:

* high-confidence inference: display normally;
* medium-confidence inference: display softly with explanation;
* low-confidence inference: suppress or request confirmation.

The system should prefer abstention over confidently displaying weak interpretation.

---

# A16. Evidence Before Assertion

Every significant relationship inference must be traceable to supporting evidence.

Example:

```text
Warming

Why Standing thinks this:

• 4 substantive exchanges in 6 days
• response time fell from 2.1 days to 4 hours
• contact requested internal technical review
• contact requested two follow-up artifacts
```

The explanation should remain available without cluttering the default reading experience.

---

# A17. Exception-Driven Interaction Model

Standing should minimize administrative relationship maintenance.

Core principle:

> **Standing should reduce relationship-management work, not create relationship-management work.**

The product should surface exceptions such as:

* you promised something;
* they asked something;
* a deadline is near;
* a meaningful thread went quiet;
* an important person resurfaced;
* a pending decision changed state;
* a new relationship became materially active.

Routine relationships should require little or no explicit management.

---

# A18. Next Best Action Policy

"Next Best Action" should not become a permanent CRM task queue.

Recommendations should appear only when:

* sufficiently high confidence exists;
* evidence is available;
* the action is materially useful;
* the user has not already resolved it.

Preferred:

```text
You promised the execution ledger tomorrow.
```

Less preferred:

```text
NEXT BEST ACTION:
Increase engagement with Nora.
```

The first is observable and operational.

The second is algorithmic theater.

---

# A19. Typography

Standing should use a modern, highly legible sans-serif family suitable for long reading sessions.

Requirements:

* excellent Windows rendering;
* clear distinction between weights;
* comfortable paragraph reading;
* compact interface labels;
* no novelty typography in core product surfaces.

Brand character should come from:

* composition;
* spacing;
* geometry;
* accent usage;

not decorative type.

---

# A20. Iconography

Product iconography should be:

* geometric;
* restrained;
* consistent in stroke;
* visually subordinate to content.

The Standing glyph may be used selectively for:

* application identity;
* tray;
* Attention;
* relationship-state affordances where semantically appropriate.

Do not force the glyph into every feature.

---

# A21. Motion

Motion should communicate state rather than decoration.

Examples:

* sync ring rotates only while actively synchronizing;
* subtle state transition when an item becomes resolved;
* no gratuitous glowing, pulsing, or cyber-terminal animation.

Users must be able to understand current state without relying on animation.

Respect reduced-motion system preferences.

---

# A22. Sync Indicator

The synchronization affordance should be compact instrumentation.

Target:

```text
overall control: ~18 × 18 px
status dot:      ~6 px
sync ring:       ~14–16 px
stroke:          ~1.5 px
```

Behavior:

* synchronized: static ring + healthy center dot;
* syncing: ring rotates around dot;
* degraded: amber state;
* failed: red/error state.

No persistent large "SYNCED" label is required.

---

# A23. Trust Surfaces

The following are classified as **high-trust surfaces**:

* first run;
* account connection;
* permissions;
* local-data-location selection;
* encryption;
* BYOK configuration;
* inference-provider disclosure;
* licensing;
* archive import;
* security settings;
* network transparency;
* software update;
* Air-Gapped activation;
* error recovery.

These surfaces must use:

* corporate glyph;
* neutral palette;
* precise language;
* no mascot;
* no jokes;
* no gamification;
* no ambiguous AI claims.

---

# A24. Network Transparency UI

The Network Activity interface should visually reinforce the privacy architecture.

Example:

```text
MAIL_SYNC
Microsoft Graph
Direct connection
Last activity: 2 min ago

INFERENCE
Local
No content transmitted

LICENSE
Standing Licensing
Entitlement only
No communication data
```

The interface should make data boundaries inspectable rather than merely promised.

---

# A25. Local/Cloud Indicator

Standing should always make execution topology discoverable.

Suggested compact state:

```text
LOCAL
```

```text
BYOK · ANTHROPIC
```

```text
AIR-GAPPED
```

The state need not dominate the interface, but the user should never have to guess where inference occurs.

---

# A26. Air-Gapped Visual Treatment

Standing Air-Gapped should not become a separate visual brand.

It should use the same Standing identity with a restrained deployment indicator.

Example:

**Standing Private**
`AIR-GAPPED`

Avoid:

* camouflage;
* military motifs;
* shields;
* classified-document cosplay;
* exaggerated "secure" styling.

Security credibility should come from architecture and evidence.

---

# A27. Marketing Claims

Standing must avoid vague terminology such as:

* military-grade;
* unhackable;
* perfectly private;
* zero risk.

Preferred claims:

> **Local data plane.**

> **Standing does not receive your communications.**

> **No cloud inference required.**

> **Your models. Your keys. Your machine.**

> **Offline-capable.**

> **Signed offline entitlement.**

> **Your inbox is not our database.**

These claims are preferable because they describe verifiable architecture.

---

# A28. Brand Usage Matrix

| Surface            | Corporate Glyph | Lime Accent |   Mascot |
| ------------------ | --------------: | ----------: | -------: |
| Application shell  |             Yes |  Restrained |       No |
| Tray icon          |             Yes |         Yes |       No |
| MSI installer      |             Yes |  Restrained |       No |
| Security settings  |             Yes |  Restrained |       No |
| Error dialogs      |             Yes |     Minimal |       No |
| Enterprise deck    |             Yes |  Restrained |       No |
| Procurement docs   |             Yes |     Minimal |       No |
| Website            |             Yes |         Yes | Optional |
| Social content     |             Yes |         Yes | Optional |
| Merchandise        |        Optional |         Yes |      Yes |
| Community material |             Yes |         Yes | Optional |

---

# A29. Product Identity Invariant

The application must remain recognizable as Standing even when:

* mascot is absent;
* lime usage is reduced;
* light mode is active;
* relationship scores are hidden;
* AI labels are visually subdued.

If removing these elements makes the identity disappear, the underlying design system is insufficient.

The identity should survive through:

* glyph;
* typography;
* spacing;
* interaction model;
* information hierarchy;
* controlled accent usage.

---

# A30. Design Acceptance Test

Before release, evaluate Standing in the following contexts:

### Executive Office

Standing open beside Outlook, Excel, PowerPoint, and Teams.

### Legal

Long-form correspondence and attachment-heavy threads.

### Finance / M&A

Sensitive diligence correspondence with multiple open commitments.

### Security-Constrained Environment

No internet inference and visible local processing state.

### Standard Corporate Laptop

Light mode, 1080p display, default Windows scaling.

### High-Density Workstation

Large display with expanded relationship context.

The product must feel coherent in each context without requiring a visual "cybersecurity" aesthetic.

---

# A31. North-Star Interface

The ideal Standing screen should communicate, at a glance:

1. what communication needs attention;
2. what the actual person said;
3. what Standing knows that materially changes the response;
4. what obligation or opportunity exists;
5. why Standing reached that conclusion.

Everything else is secondary.

---

# A32. Final Design Principle

Standing should feel less like a relationship dashboard and more like:

> **An extremely attentive chief of staff embedded inside the correspondence layer.**

It notices what matters.

It explains why.

It stays out of the way when nothing requires intervention.

And it never makes the user administrate the intelligence system simply because the intelligence system exists.
