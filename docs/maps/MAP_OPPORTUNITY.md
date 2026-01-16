# Opportunity Pipeline — Visual Map

**Type:** Child Map
**Phase:** 2.5a/2.5b
**Created:** 2026-01-16
**Spec:** [SPEC_OPPORTUNITY_PIPELINE.md](../specs/SPEC_OPPORTUNITY_PIPELINE.md)

> **Purpose:** Visual documentation for the Kanban-style opportunity tracking system, including data relationships, UI layout, and AI action flows.

---

## 1. Opportunity Data Model

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                         OPPORTUNITY DATA RELATIONSHIPS                         ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                                ║
║                         ┌───────────────────────┐                              ║
║                         │  pipeline_workflows   │                              ║
║                         │  ───────────────────  │                              ║
║                         │  • id (PK)            │                              ║
║                         │  • slug               │                              ║
║                         │  • name               │                              ║
║                         │  • is_default         │                              ║
║                         └───────────┬───────────┘                              ║
║                                     │                                          ║
║                                     │ 1:N                                      ║
║                                     ▼                                          ║
║                         ┌───────────────────────┐                              ║
║                         │   pipeline_stages     │                              ║
║                         │  ───────────────────  │                              ║
║                         │  • id (PK)            │                              ║
║                         │  • workflow_id (FK)   │                              ║
║                         │  • slug               │                              ║
║                         │  • name               │                              ║
║                         │  • position           │                              ║
║                         └───────────┬───────────┘                              ║
║                                     │                                          ║
║                                     │ 1:N                                      ║
║                                     ▼                                          ║
║  ┌───────────────┐      ┌───────────────────────┐      ┌───────────────┐      ║
║  │    users      │      │     opportunities     │      │   entities    │      ║
║  │  ───────────  │      │  ───────────────────  │      │  ───────────  │      ║
║  │  • id (PK)    │      │  • id (PK)            │      │  • id (PK)    │      ║
║  │  • email      │◄─────│  • workflow_id (FK)   │─────►│  • slug       │      ║
║  │  • name       │ N:M  │  • stage_id (FK)      │ N:M  │  • name       │      ║
║  └───────┬───────┘      │  • name               │      │  • type       │      ║
║          │              │  • thesis             │      └───────┬───────┘      ║
║          │              │  • angle              │              │              ║
║          │              │  • confidence         │              │              ║
║          │              │  • strategy           │              │              ║
║          │              │  • email_draft        │              │              ║
║          │              │  • source_microsite_id│──┐           │              ║
║          │              │  • status             │  │           │              ║
║          │              └───────────┬───────────┘  │           │              ║
║          │                          │              │           │              ║
║          │                          │              │           │              ║
║          ▼                          ▼              ▼           ▼              ║
║  ┌─────────────────┐    ┌─────────────────┐    ┌────────┐  ┌────────────────┐ ║
║  │opportunity_owners│    │opportunity_     │    │micro-  │  │opportunity_    │ ║
║  │  ───────────────│    │   activity      │    │sites   │  │   entities     │ ║
║  │  • opp_id (FK)  │    │  ─────────────  │    │        │  │  ────────────  │ ║
║  │  • user_id (FK) │    │  • opp_id (FK)  │    │(source)│  │  • opp_id (FK) │ ║
║  │  • assigned_at  │    │  • action       │    │        │  │  • entity_id   │ ║
║  │  • assigned_by  │    │  • details      │    │        │  │  • relationship│ ║
║  └─────────────────┘    └─────────────────┘    └────────┘  └────────────────┘ ║
║                                                                                ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

---

## 2. Kanban UI Layout

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              /PIPELINE                                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │ // OPPORTUNITY PIPELINE                                                      ││
│  │ ─────────────────────────────────────────────────────────────────────────── ││
│  │ WORKFLOW: [Business Development ▼]                    [+ NEW OPPORTUNITY]   ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌─────┤
│  │   SURFACED    │ │  RESEARCHING  │ │   QUALIFIED   │ │    ENGAGED    │ │CLOSE│
│  │   ─────────── │ │   ────────── │ │   ────────── │ │   ────────── │ │─────│
│  │ ●             │ │ ●             │ │               │ │               │ │     │
│  │ ┌───────────┐ │ │ ┌───────────┐ │ │               │ │               │ │     │
│  │ │ COMPANY   │ │ │ │ PROTOCOL  │ │ │               │ │               │ │     │
│  │ │ ALPHA     │ │ │ │ ZETA      │ │ │               │ │               │ │     │
│  │ │ ───────── │ │ │ │ ───────── │ │ │               │ │               │ │     │
│  │ │           │ │ │ │           │ │ │               │ │               │ │     │
│  │ │ Potential │ │ │ │ Their new │ │ │               │ │               │ │     │
│  │ │ liquidity │ │ │ │ staking   │ │ │               │ │               │ │     │
│  │ │ partner...│ │ │ │ mechanism │ │ │               │ │               │ │     │
│  │ │           │ │ │ │ aligns... │ │ │               │ │               │ │     │
│  │ │           │ │ │ │           │ │ │               │ │               │ │     │
│  │ │ ████████░ │ │ │ │ █████████ │ │ │               │ │               │ │     │
│  │ │ 80%       │ │ │ │ 95%       │ │ │               │ │               │ │     │
│  │ │ ......... │ │ │ │ ......... │ │ │               │ │               │ │     │
│  │ │ STRAT│MAIL│ │ │ │ STRAT│MAIL│ │ │               │ │               │ │     │
│  │ │     [NEXT]│ │ │ │     [NEXT]│ │ │               │ │               │ │     │
│  │ └───────────┘ │ │ └───────────┘ │ │               │ │               │ │     │
│  │               │ │               │ │               │ │               │ │     │
│  │ ┌───────────┐ │ │               │ │               │ │               │ │     │
│  │ │ PERSON    │ │ │               │ │               │ │               │ │     │
│  │ │ BETA      │ │ │               │ │               │ │               │ │     │
│  │ │ ───────── │ │ │               │ │               │ │               │ │     │
│  │ │ Key       │ │ │               │ │               │ │               │ │     │
│  │ │ advisor...│ │ │               │ │               │ │               │ │     │
│  │ │ ████░░░░░ │ │ │               │ │               │ │               │ │     │
│  │ │ 45%       │ │ │               │ │               │ │               │ │     │
│  │ │ ......... │ │ │               │ │               │ │               │ │     │
│  │ │     [NEXT]│ │ │               │ │               │ │               │ │     │
│  │ └───────────┘ │ │               │ │               │ │               │ │     │
│  │               │ │               │ │               │ │               │ │     │
│  └───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘ └─────┤
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

Legend:
  ●       Stage indicator (has items)
  ████    Confidence bar (filled)
  ░░░░    Confidence bar (empty)
  .....   Dotted border separator (Making Software aesthetic)
  [NEXT]  Stage progression button
```

---

## 3. Stage Progression Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           STAGE PROGRESSION                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│                              BD WORKFLOW                                         │
│                                                                                  │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│   │             │    │             │    │             │    │             │     │
│   │  SURFACED   │───►│ RESEARCHING │───►│  QUALIFIED  │───►│   ENGAGED   │──┐  │
│   │   (pos 1)   │    │   (pos 2)   │    │   (pos 3)   │    │   (pos 4)   │  │  │
│   │             │    │             │    │             │    │             │  │  │
│   └──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘  │  │
│          │                  │                  │                  │         │  │
│          │                  │                  │                  │         │  │
│   ┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐  │  │
│   │ AI extract  │    │ Active      │    │ Worth       │    │ In contact  │  │  │
│   │ or manual   │    │ research    │    │ pursuing    │    │ with target │  │  │
│   │ entry       │    │ underway    │    │ based on fit│    │             │  │  │
│   └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │  │
│                                                                              │  │
│                                                              ┌───────────────┼──┘
│                                                              │               │
│                                                              ▼               │
│                                                       ┌─────────────┐       │
│                                                       │             │       │
│                                                       │   CLOSED    │◄──────┘
│                                                       │   (pos 5)   │
│                                                       │             │
│                                                       └──────┬──────┘
│                                                              │
│                                                       ┌──────▼──────┐
│                                                       │ Deal done,  │
│                                                       │ archived,   │
│                                                       │ or declined │
│                                                       └─────────────┘
│                                                                                  │
│   ACTIONS AT EACH STAGE:                                                         │
│   ──────────────────────                                                         │
│   • SURFACED    → Review, assign owners, generate initial strategy              │
│   • RESEARCHING → Deep research, enrich context, link entities                  │
│   • QUALIFIED   → Final strategy, prepare outreach email                        │
│   • ENGAGED     → Track communication, update notes                             │
│   • CLOSED      → Archive with outcome (success/declined/deferred)              │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. AI Action Flows

### 4.1 Strategy Generation

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         STRATEGY GENERATION FLOW                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   USER ACTION                                                                    │
│   ───────────                                                                    │
│                                                                                  │
│   [STRAT] button click on opportunity card                                       │
│         │                                                                        │
│         ▼                                                                        │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │  PROMPT ASSEMBLY                                                         │   │
│   │  ─────────────────                                                       │   │
│   │                                                                          │   │
│   │  Context gathered:                                                       │   │
│   │  • opportunity.name                                                      │   │
│   │  • opportunity.thesis                                                    │   │
│   │  • opportunity.angle                                                     │   │
│   │  • linked entities (via opportunity_entities)                            │   │
│   │  • source microsite content (if linked)                                  │   │
│   │                                                                          │   │
│   └────────────────────────────┬────────────────────────────────────────────┘   │
│                                │                                                 │
│                                ▼                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │  CLAUDE API CALL                                                         │   │
│   │  ─────────────────                                                       │   │
│   │                                                                          │   │
│   │  Model: claude-sonnet-4-*                                                │   │
│   │  System: "You are a strategic business development advisor..."          │   │
│   │                                                                          │   │
│   │  Output structure:                                                       │   │
│   │  1. EXECUTIVE SUMMARY                                                    │   │
│   │  2. VALUE PROPOSITION                                                    │   │
│   │  3. APPROACH STRATEGY                                                    │   │
│   │  4. OBJECTION HANDLING                                                   │   │
│   │  5. NEXT STEPS                                                           │   │
│   │                                                                          │   │
│   └────────────────────────────┬────────────────────────────────────────────┘   │
│                                │                                                 │
│                                ▼                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │  DATABASE UPDATE                                                         │   │
│   │  ─────────────────                                                       │   │
│   │                                                                          │   │
│   │  UPDATE opportunities                                                    │   │
│   │  SET strategy = {generated_markdown}                                     │   │
│   │  WHERE id = {opportunity_id}                                             │   │
│   │                                                                          │   │
│   │  INSERT INTO opportunity_activity                                        │   │
│   │  (opportunity_id, action, details)                                       │   │
│   │  VALUES ({id}, 'strategy_generated', {timestamp, model, tokens})         │   │
│   │                                                                          │   │
│   └────────────────────────────┬────────────────────────────────────────────┘   │
│                                │                                                 │
│                                ▼                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │  UI UPDATE (Realtime)                                                    │   │
│   │  ──────────────────────                                                  │   │
│   │                                                                          │   │
│   │  Supabase Realtime broadcasts update                                     │   │
│   │  → All connected clients see updated strategy                            │   │
│   │  → Strategy modal opens automatically                                    │   │
│   │                                                                          │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Opportunity Extraction (Stage 3)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    OPPORTUNITY EXTRACTION (Phase 2.5b)                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   PROCESSING PIPELINE - STAGE 3 ENHANCEMENT                                     │
│   ──────────────────────────────────────────                                     │
│                                                                                  │
│   ┌─────────────┐                                                                │
│   │  Artifacts  │   Generated from Stage 1 + 2                                   │
│   │  (.md files)│                                                                │
│   └──────┬──────┘                                                                │
│          │                                                                       │
│          ▼                                                                       │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │  STAGE 3: ENTITY + OPPORTUNITY EXTRACTION                               │   │
│   │  ────────────────────────────────────────                               │   │
│   │                                                                          │   │
│   │  Claude analyzes all artifacts and extracts:                             │   │
│   │                                                                          │   │
│   │  ┌───────────────────────┐      ┌───────────────────────┐               │   │
│   │  │      ENTITIES         │      │    OPPORTUNITIES      │               │   │
│   │  │  (existing behavior)  │      │    (new in 2.5b)      │               │   │
│   │  │                       │      │                       │               │   │
│   │  │  • Companies          │      │  • BD targets         │               │   │
│   │  │  • People             │      │  • Product ideas      │               │   │
│   │  │  • Protocols          │      │  • Research questions │               │   │
│   │  │  • Concepts           │      │                       │               │   │
│   │  └───────────┬───────────┘      └───────────┬───────────┘               │   │
│   │              │                              │                            │   │
│   └──────────────┼──────────────────────────────┼────────────────────────────┘   │
│                  │                              │                                │
│                  ▼                              ▼                                │
│   ┌───────────────────────┐      ┌───────────────────────┐                      │
│   │    HUMAN REVIEW       │      │    HUMAN REVIEW       │                      │
│   │   (Entity Approval)   │      │ (Opportunity Approval)│                      │
│   │                       │      │                       │                      │
│   │  • Confirm entity     │      │  • Confirm opportunity│                      │
│   │  • Merge duplicates   │      │  • Assign workflow    │                      │
│   │  • Edit metadata      │      │  • Set initial stage  │                      │
│   └───────────┬───────────┘      └───────────┬───────────┘                      │
│               │                              │                                   │
│               ▼                              ▼                                   │
│   ┌───────────────────────┐      ┌───────────────────────┐                      │
│   │   entities table      │      │  opportunities table  │                      │
│   │   entity_appearances  │      │  opportunity_entities │                      │
│   └───────────────────────┘      └───────────────────────┘                      │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Realtime Collaboration

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE REALTIME PATTERN                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   SUBSCRIPTIONS                                                                  │
│   ─────────────                                                                  │
│                                                                                  │
│   ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐             │
│   │    Client A     │    │    Client B     │    │    Client C     │             │
│   │   (Dan's tab)   │    │ (Akilesh's tab) │    │  (Portal API)   │             │
│   └────────┬────────┘    └────────┬────────┘    └────────┬────────┘             │
│            │                      │                      │                       │
│            │                      │                      │                       │
│            └──────────────────────┼──────────────────────┘                       │
│                                   │                                              │
│                                   ▼                                              │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                      SUPABASE REALTIME                                   │   │
│   │                                                                          │   │
│   │   Subscribed tables:                                                     │   │
│   │   • opportunities (INSERT, UPDATE, DELETE)                               │   │
│   │   • opportunity_activity (INSERT)                                        │   │
│   │                                                                          │   │
│   │   Channel: realtime:public:opportunities                                 │   │
│   │                                                                          │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│   BROADCAST EVENTS                                                               │
│   ────────────────                                                               │
│                                                                                  │
│   Dan moves opportunity from SURFACED → RESEARCHING                              │
│         │                                                                        │
│         ▼                                                                        │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │  1. UPDATE opportunities SET stage_id = {researching_id}                │   │
│   │  2. Supabase broadcasts: { type: 'UPDATE', table: 'opportunities', ... }│   │
│   │  3. Akilesh's client receives broadcast                                 │   │
│   │  4. UI state updated via React Query invalidation                       │   │
│   │  5. Akilesh sees opportunity move to RESEARCHING column instantly       │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Entity Linking

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         ENTITY LINKING PATTERN                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   OPPORTUNITY                           ENTITIES                                 │
│   ───────────                           ────────                                 │
│                                                                                  │
│   ┌─────────────────────┐               ┌─────────────────────┐                 │
│   │                     │               │                     │                 │
│   │  Company Alpha      │               │  Company Alpha      │                 │
│   │  Partnership        │               │  (type: company)    │                 │
│   │                     │               │                     │                 │
│   │  ─────────────────  │               └─────────────────────┘                 │
│   │                     │                          ▲                            │
│   │  Linked Entities:   │   PRIMARY                │                            │
│   │  ┌───────────────┐  │──────────────────────────┘                            │
│   │  │ Company Alpha │  │                                                        │
│   │  │   [PRIMARY]   │  │               ┌─────────────────────┐                 │
│   │  └───────────────┘  │               │                     │                 │
│   │  ┌───────────────┐  │   RELATED     │  John Smith         │                 │
│   │  │ John Smith    │  │──────────────►│  (type: person)     │                 │
│   │  │   [RELATED]   │  │               │                     │                 │
│   │  └───────────────┘  │               └─────────────────────┘                 │
│   │  ┌───────────────┐  │                                                        │
│   │  │ Competitor X  │  │               ┌─────────────────────┐                 │
│   │  │  [COMPETITOR] │  │   COMPETITOR  │                     │                 │
│   │  └───────────────┘  │──────────────►│  Competitor X       │                 │
│   │                     │               │  (type: company)    │                 │
│   │  [+ Link Entity]    │               │                     │                 │
│   │                     │               └─────────────────────┘                 │
│   └─────────────────────┘                                                        │
│                                                                                  │
│   RELATIONSHIP TYPES                                                             │
│   ──────────────────                                                             │
│   • primary    — Main entity this opportunity is about                           │
│   • related    — Supporting entities mentioned                                   │
│   • competitor — Competitive context                                             │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Related Documents

| Document | Purpose |
|----------|---------|
| [SPEC_OPPORTUNITY_PIPELINE.md](../specs/SPEC_OPPORTUNITY_PIPELINE.md) | Full specification |
| [MASTER_SPEC.md](../MASTER_SPEC.md) | Project specification |
| [MASTER_MAP.md](../MASTER_MAP.md) | System overview |
| [MAP_DATA.md](./MAP_DATA.md) | Database relationships |

---

*This is a child map of the Ritual Research Graph documentation system.*
