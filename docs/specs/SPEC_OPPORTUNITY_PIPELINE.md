# Opportunity Pipeline — Specification

**Status:** Ready for Implementation
**Phase:** 2.5a (Core) + 2.5b (Advanced)
**Created:** 2026-01-16
**Depends On:** Phase 2 (Portal MVP)

> **Elicitation Complete (2026-01-16):** All architecture decisions finalized through recursive elicitation. Integration approach, data model, UI placement, and phase sequencing confirmed.

---

## Executive Summary

Integrate a **Kanban-style opportunity pipeline** into RRG, enabling users to track business development opportunities, product prototypes, and research-derived action items. This replaces/expands the existing `opportunities` table and adds a dedicated Portal page.

**Origin:** Extracted from Akilesh's OP-1 CRM prototype, rebuilt from first principles using RRG's architecture (Supabase, Claude, Making Software aesthetic).

---

## Table of Contents

1. [Goals & Non-Goals](#1-goals--non-goals)
2. [Data Model](#2-data-model)
3. [Pipeline Stages](#3-pipeline-stages)
4. [Portal UI](#4-portal-ui)
5. [AI Features](#5-ai-features)
6. [Integration Points](#6-integration-points)
7. [Implementation Phases](#7-implementation-phases)
8. [Database Migrations](#8-database-migrations)

---

## 1. Goals & Non-Goals

### 1.1 Goals

| Goal | Description |
|------|-------------|
| **Track opportunities** | Kanban board with configurable stages per workflow |
| **Link to research** | Optional connection to microsites that surfaced opportunities |
| **Entity integration** | Many-to-many linking to entity registry |
| **AI-assisted actions** | Generate strategy docs, outreach emails |
| **Team collaboration** | Multiple owners, Supabase Realtime sync |
| **Workflow flexibility** | BD, product prototyping, internal R&D all use same system |

### 1.2 Non-Goals (v1)

- [ ] Drag-and-drop Kanban (use button-based progression)
- [ ] External CRM integrations (Salesforce, HubSpot)
- [ ] Email sending (generate draft only, send externally)
- [ ] Revenue forecasting/analytics dashboards
- [ ] Mobile-optimized Kanban

---

## 2. Data Model

### 2.1 Canonical Terminology

| OP-1 CRM Term | RRG Term | Notes |
|---------------|----------|-------|
| Lead | **Opportunity** | Canonical term |
| status | **stage** | Pipeline position |
| companyName | Entity reference | Link via `opportunity_entities` |
| ritualHypothesis | **thesis** | Core value proposition |
| bdAngle | **angle** | Outreach hook |
| estimatedValue | (removed) | Not tracking $ values in v1 |
| confidenceScore | **confidence** | 0-100 score |

### 2.2 Schema: `opportunities` (Expanded)

```sql
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,

  -- Core fields
  name TEXT NOT NULL,
  thesis TEXT,                      -- Core value proposition (was ritualHypothesis)
  angle TEXT,                       -- Outreach hook (was bdAngle)
  notes TEXT,                       -- Freeform notes

  -- AI-generated content
  confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  strategy TEXT,                    -- Generated strategy doc
  email_draft JSONB,                -- {subject, body}

  -- Pipeline state
  workflow_id UUID REFERENCES pipeline_workflows(id),
  stage_id UUID REFERENCES pipeline_stages(id),

  -- Linking (optional)
  source_microsite_id UUID REFERENCES microsites(id),
  source_job_id UUID REFERENCES generation_jobs(id),

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  -- Soft delete
  archived_at TIMESTAMPTZ,
  archived_by UUID REFERENCES auth.users(id)
);
```

### 2.3 Schema: `opportunity_owners` (Many-to-Many)

```sql
CREATE TABLE opportunity_owners (
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  PRIMARY KEY (opportunity_id, user_id)
);
```

### 2.4 Schema: `opportunity_entities` (Many-to-Many)

```sql
CREATE TABLE opportunity_entities (
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
  relationship TEXT DEFAULT 'related',  -- 'primary', 'related', 'competitor'
  PRIMARY KEY (opportunity_id, entity_id)
);
```

### 2.5 Schema: `pipeline_workflows`

```sql
CREATE TABLE pipeline_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default workflows
INSERT INTO pipeline_workflows (slug, name, description, is_default) VALUES
  ('bd', 'Business Development', 'External partnerships and BD opportunities', true),
  ('product', 'Product Development', 'Internal product and prototype opportunities', false),
  ('research', 'Research Tracking', 'Research questions and explorations', false);
```

### 2.6 Schema: `pipeline_stages`

```sql
CREATE TABLE pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES pipeline_workflows(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL,  -- Order in pipeline
  color TEXT,                 -- Optional accent color

  UNIQUE (workflow_id, slug),
  UNIQUE (workflow_id, position)
);

-- Insert default BD workflow stages
INSERT INTO pipeline_stages (workflow_id, slug, name, position)
SELECT
  w.id,
  s.slug,
  s.name,
  s.position
FROM pipeline_workflows w
CROSS JOIN (VALUES
  ('surfaced', 'Surfaced', 1),
  ('researching', 'Researching', 2),
  ('qualified', 'Qualified', 3),
  ('engaged', 'Engaged', 4),
  ('closed', 'Closed', 5)
) AS s(slug, name, position)
WHERE w.slug = 'bd';
```

### 2.7 Schema: `opportunity_activity` (Audit Log)

```sql
CREATE TABLE opportunity_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,  -- 'created', 'stage_changed', 'edited', 'archived', 'owner_added', etc.
  details JSONB,         -- Action-specific data
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. Pipeline Stages

### 3.1 Default Stages (BD Workflow)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BD WORKFLOW PIPELINE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌────│
│   │ SURFACED  │───►│RESEARCHING│───►│ QUALIFIED │───►│  ENGAGED  │───►│CLOS│
│   └───────────┘    └───────────┘    └───────────┘    └───────────┘    └────│
│                                                                              │
│   AI extracted     Active research  Worth pursuing   In contact     Deal   │
│   or manually      underway         based on fit     with entity    done   │
│   added                                                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Product Workflow Stages (Example)

```
IDEATION → PROTOTYPING → VALIDATION → DEVELOPMENT → SHIPPED
```

### 3.3 Stage Transitions

- Users click "NEXT" button to advance to next stage
- Backward movement allowed (click any stage button)
- Stage changes logged to `opportunity_activity`
- Supabase Realtime broadcasts changes to all clients

---

## 4. Portal UI

### 4.1 Route Structure

```
/pipeline                  # Kanban board (default workflow)
/pipeline?workflow=bd      # BD workflow
/pipeline?workflow=product # Product workflow
/pipeline/[id]             # Opportunity detail/edit modal
/pipeline/new              # Create new opportunity
```

### 4.2 Kanban Board Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              /PIPELINE                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  WORKFLOW: [BD ▼]                              [+ NEW OPPORTUNITY]      ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────│
│  │  SURFACED   │  │ RESEARCHING │  │  QUALIFIED  │  │   ENGAGED   │  │CLOSE│
│  │  ────────── │  │  ────────── │  │  ────────── │  │  ────────── │  │─────│
│  │             │  │             │  │             │  │             │  │     │
│  │ ┌─────────┐ │  │ ┌─────────┐ │  │             │  │             │  │     │
│  │ │ Company │ │  │ │Protocol │ │  │             │  │             │  │     │
│  │ │  Alpha  │ │  │ │  Zeta   │ │  │             │  │             │  │     │
│  │ │ ──────  │ │  │ │ ──────  │ │  │             │  │             │  │     │
│  │ │ ████░░░ │ │  │ │ █████░░ │ │  │             │  │             │  │     │
│  │ │ 65%     │ │  │ │ 85%     │ │  │             │  │             │  │     │
│  │ │ [NEXT]  │ │  │ │ [NEXT]  │ │  │             │  │             │  │     │
│  │ └─────────┘ │  │ └─────────┘ │  │             │  │             │  │     │
│  │             │  │             │  │             │  │             │  │     │
│  │ ┌─────────┐ │  │             │  │             │  │             │  │     │
│  │ │ Person  │ │  │             │  │             │  │             │  │     │
│  │ │  Beta   │ │  │             │  │             │  │             │  │     │
│  │ │ ──────  │ │  │             │  │             │  │             │  │     │
│  │ │ ██░░░░░ │ │  │             │  │             │  │             │  │     │
│  │ │ 35%     │ │  │             │  │             │  │             │  │     │
│  │ │ [NEXT]  │ │  │             │  │             │  │             │  │     │
│  │ └─────────┘ │  │             │  │             │  │             │  │     │
│  │             │  │             │  │             │  │             │  │     │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  └─────│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Opportunity Card Design (Making Software Aesthetic)

```tsx
// Opportunity card following Making Software tokens
<div className="bg-white border border-[rgba(0,0,0,0.08)] p-4">
  {/* Header */}
  <div className="flex justify-between items-start mb-3">
    <h4 className="font-mono text-xs uppercase tracking-[0.12em] text-[#171717]">
      {opportunity.name}
    </h4>
    <span className="font-mono text-[10px] text-[#3B5FE6]">
      {opportunity.confidence}%
    </span>
  </div>

  {/* Thesis */}
  <p className="font-serif text-sm text-[rgba(0,0,0,0.65)] mb-3 line-clamp-2">
    {opportunity.thesis}
  </p>

  {/* Confidence Bar */}
  <div className="flex gap-0.5 h-1 mb-3">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className={`flex-1 ${
          opportunity.confidence >= (i+1)*20
            ? 'bg-[#3B5FE6]'
            : 'bg-[rgba(0,0,0,0.08)]'
        }`}
      />
    ))}
  </div>

  {/* Actions */}
  <div className="flex justify-between items-center pt-3 border-t border-dotted border-[rgba(59,95,230,0.3)]">
    <div className="flex gap-2">
      <button onClick={onStrategy}>STRATEGY</button>
      <button onClick={onEmail}>EMAIL</button>
    </div>
    <button onClick={onNext} className="font-mono text-[10px] uppercase tracking-[0.1em] bg-[#3B5FE6] text-white px-2 py-1">
      NEXT
    </button>
  </div>
</div>
```

### 4.4 Opportunity Detail Modal

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         OPPORTUNITY DETAIL                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  // EDIT OPPORTUNITY                                         [ARCHIVE] ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  NAME ─────────────────────────────────────────────────────────────────────  │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ Company Alpha Partnership                                               ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  THESIS ───────────────────────────────────────────────────────────────────  │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ Potential integration with their liquidity protocol...                  ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ANGLE ────────────────────────────────────────────────────────────────────  │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ Recent Series B positions them for infrastructure partnerships...      ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  STAGE ────────────────────────────────────────────────────────────────────  │
│  [SURFACED] [RESEARCHING ●] [QUALIFIED] [ENGAGED] [CLOSED]                  │
│                                                                              │
│  CONFIDENCE ───────────────────────────────────────────────────────────────  │
│  [████████████████████░░░░░░░░░░] 65%                                       │
│                                                                              │
│  OWNERS ───────────────────────────────────────────────────────────────────  │
│  [Dan] [Akilesh] [+ Add]                                                    │
│                                                                              │
│  LINKED ENTITIES ──────────────────────────────────────────────────────────  │
│  [Company Alpha] [Person: CEO Name] [+ Link Entity]                         │
│                                                                              │
│  SOURCE ───────────────────────────────────────────────────────────────────  │
│  📄 RWA DeFi Landscape (Jan 2026)                                           │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  [GENERATE STRATEGY]  [GENERATE EMAIL]              [CANCEL]  [SAVE]        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. AI Features

### 5.1 Opportunity Extraction (Stage 3 Enhancement)

During transcript processing, Claude extracts opportunities alongside entities.

**Prompt Addition:**

```
In addition to entities, identify potential opportunities:
- Business development targets (companies to partner with)
- Product ideas mentioned
- Research questions worth exploring

For each opportunity, provide:
- name: Short descriptive name
- thesis: Core value proposition (2-3 sentences)
- angle: Outreach hook or timing rationale
- confidence: 0-100 score based on evidence strength
- linked_entities: Entity slugs this relates to
```

### 5.2 Strategy Generation

**Trigger:** User clicks "STRATEGY" on opportunity card

**Prompt:**

```
Create a strategic approach document for this opportunity:

Opportunity: {name}
Thesis: {thesis}
Angle: {angle}
Linked Entities: {entities}
Source Research: {microsite_context}

Structure:
1. EXECUTIVE SUMMARY (2-3 sentences)
2. VALUE PROPOSITION (Why this matters for Ritual)
3. APPROACH STRATEGY (How to engage)
4. OBJECTION HANDLING (Anticipated concerns + responses)
5. NEXT STEPS (3 concrete actions)

Output as clean markdown.
```

### 5.3 Email Generation

**Trigger:** User clicks "EMAIL" on opportunity card

**Prompt:**

```
Generate an outreach email for this opportunity:

Opportunity: {name}
Thesis: {thesis}
Angle: {angle}
Linked Entities: {entities}
Stage: {current_stage}

Requirements:
- Professional but warm tone
- Reference specific value proposition
- Clear call to action
- Under 200 words

Return JSON: {subject: string, body: string}
```

### 5.4 Duplicate Detection

**Trigger:** During opportunity extraction or manual creation

**Prompt:**

```
Compare this new opportunity against existing opportunities:

New: {name} - {thesis}

Existing:
{list_of_existing}

Identify if this is a duplicate or near-duplicate.
Return: {is_duplicate: boolean, match_id?: string, confidence: number, reasoning: string}
```

---

## 6. Integration Points

### 6.1 With Entity Registry

```
┌───────────────┐         ┌───────────────────┐         ┌───────────────┐
│  Opportunity  │────────►│opportunity_entities│◄────────│    Entity     │
│               │         │                   │         │               │
│  - name       │         │  - relationship   │         │  - name       │
│  - thesis     │         │    (primary/      │         │  - type       │
│  - stage      │         │     related)      │         │  - slug       │
└───────────────┘         └───────────────────┘         └───────────────┘
```

### 6.2 With Microsites

```
┌───────────────┐         ┌───────────────┐
│  Opportunity  │────────►│   Microsite   │
│               │         │               │
│  source_      │         │  - title      │
│  microsite_id │         │  - slug       │
└───────────────┘         │  - url        │
                          └───────────────┘
```

### 6.3 With Processing Pipeline

Stage 3 (Entity Extraction) enhanced to also extract opportunities:

```
Stage 3: Entity + Opportunity Extraction
──────────────────────────────────────────
                    │
    ┌───────────────┴───────────────┐
    │                               │
    ▼                               ▼
┌─────────┐                   ┌─────────────┐
│Entities │                   │Opportunities│
│  (as    │                   │   (as       │
│ before) │                   │  JSON array)│
└────┬────┘                   └──────┬──────┘
     │                               │
     ▼                               ▼
┌─────────┐                   ┌─────────────┐
│ Human   │                   │   Human     │
│ Review  │                   │   Review    │
│(existing│                   │  (new)      │
└─────────┘                   └─────────────┘
```

---

## 7. Implementation Phases

### 7.1 Phase 2.5a: Core Pipeline (First)

**Scope:**
- Database migrations (all tables from Section 2)
- `/pipeline` page with Kanban UI
- Opportunity CRUD (create, read, update, archive)
- Stage progression (button-based)
- Workflow selection
- Basic filtering (by stage, workflow)
- Supabase Realtime subscriptions

**Deliverable:** Functional Kanban board with manual opportunity management

### 7.2 Phase 2.5b: Advanced Features (Second)

**Scope:**
- AI strategy generation
- AI email generation
- Duplicate detection during creation
- Entity linking UI
- Multiple owner assignment
- Chat interface (query opportunities conversationally)
- Opportunity extraction during Stage 3

**Deliverable:** Full AI-assisted opportunity management

### 7.3 Phase Sequence Update

```
Phase 0 ──► Phase 1a ──► Phase 1b ──► Phase 2 ──► Phase 2.5a ──► Phase 2.5b ──► Phase 3
(done)     Database     Pipeline     Portal      Pipeline       Pipeline       Graph
                                     MVP         Core           Advanced       UI
```

---

## 8. Database Migrations

### 8.1 Migration: `005_opportunity_pipeline.sql`

```sql
-- Migration: Add opportunity pipeline tables
-- Phase: 2.5a

-- 1. Workflows
CREATE TABLE pipeline_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Stages
CREATE TABLE pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES pipeline_workflows(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL,
  color TEXT,
  UNIQUE (workflow_id, slug),
  UNIQUE (workflow_id, position)
);

-- 3. Expand opportunities table
ALTER TABLE opportunities
  ADD COLUMN thesis TEXT,
  ADD COLUMN angle TEXT,
  ADD COLUMN notes TEXT,
  ADD COLUMN confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  ADD COLUMN strategy TEXT,
  ADD COLUMN email_draft JSONB,
  ADD COLUMN workflow_id UUID REFERENCES pipeline_workflows(id),
  ADD COLUMN stage_id UUID REFERENCES pipeline_stages(id),
  ADD COLUMN source_microsite_id UUID REFERENCES microsites(id),
  ADD COLUMN source_job_id UUID REFERENCES generation_jobs(id),
  ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  ADD COLUMN archived_at TIMESTAMPTZ,
  ADD COLUMN archived_by UUID REFERENCES auth.users(id),
  ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();

-- 4. Opportunity owners (many-to-many)
CREATE TABLE opportunity_owners (
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  PRIMARY KEY (opportunity_id, user_id)
);

-- 5. Opportunity-entity links (many-to-many)
CREATE TABLE opportunity_entities (
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
  relationship TEXT DEFAULT 'related',
  PRIMARY KEY (opportunity_id, entity_id)
);

-- 6. Activity log
CREATE TABLE opportunity_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Seed default workflows
INSERT INTO pipeline_workflows (slug, name, description, is_default) VALUES
  ('bd', 'Business Development', 'External partnerships and BD opportunities', true),
  ('product', 'Product Development', 'Internal product and prototype opportunities', false),
  ('research', 'Research Tracking', 'Research questions and explorations', false);

-- 8. Seed default stages for BD workflow
INSERT INTO pipeline_stages (workflow_id, slug, name, position)
SELECT
  w.id, s.slug, s.name, s.position
FROM pipeline_workflows w
CROSS JOIN (VALUES
  ('surfaced', 'Surfaced', 1),
  ('researching', 'Researching', 2),
  ('qualified', 'Qualified', 3),
  ('engaged', 'Engaged', 4),
  ('closed', 'Closed', 5)
) AS s(slug, name, position)
WHERE w.slug = 'bd';

-- 9. RLS Policies
ALTER TABLE pipeline_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_activity ENABLE ROW LEVEL SECURITY;

-- Read access for authenticated users
CREATE POLICY "Authenticated users can read workflows" ON pipeline_workflows
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read stages" ON pipeline_stages
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read opportunity owners" ON opportunity_owners
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read opportunity entities" ON opportunity_entities
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read activity" ON opportunity_activity
  FOR SELECT TO authenticated USING (true);

-- Write access for authenticated users (editors+)
CREATE POLICY "Editors can manage opportunity owners" ON opportunity_owners
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Editors can manage opportunity entities" ON opportunity_entities
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Users can log activity" ON opportunity_activity
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 10. Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE opportunities;
ALTER PUBLICATION supabase_realtime ADD TABLE opportunity_activity;

-- 11. Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER opportunities_updated_at
  BEFORE UPDATE ON opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## Appendix A: Decision Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Terminology | "Opportunities" (not leads) | Aligns with existing schema, broader than BD |
| Data model | Expand opportunities + junction tables | Reuse existing table, add relationships |
| Visibility | All Portal users | Team-wide transparency |
| Generation | Hybrid AI + manual | Flexibility for different use cases |
| Stages | Database-driven, configurable | Future workflow types |
| Microsite link | Optional | Some opportunities are manual |
| Card actions | Full CRM | Match OP-1 capabilities |
| Portal location | Dedicated /pipeline | First-class feature |
| AI controls | No knobs | Simplicity, consistent output |
| Realtime | Supabase Realtime | Native to our stack |
| Phase | 2.5a + 2.5b | Incremental delivery |
| Design | Pure Making Software | Consistency |
| Ownership | Multiple owners | Team collaboration |
| Prioritization | Confidence 0-100 | Simple, AI-compatible |
| Entity linking | Many-to-many | Complex relationships |
| Deduplication | AI suggest + human confirm | Balance automation and control |
| Deletion | Archive only | Audit trail, recoverability |
| Chat | Phase 2.5b | Advanced feature |

---

## Appendix B: OP-1 CRM Reference

**Files Analyzed:**
- `App.tsx` — Main application logic
- `types.ts` — Lead/status types
- `services/geminiService.ts` — AI integration (replaced)
- `services/firebaseService.ts` — Database (replaced)
- `components/SequencerView.tsx` — Kanban implementation
- `components/DealPatch.tsx` — Lead editor modal
- `components/ChatInterface.tsx` — Conversational AI
- `components/EmailSynthesizer.tsx` — Email generation

**Extracted Patterns:**
- Lane-based Kanban with status filtering
- Button-based stage progression (not drag-drop)
- Modal-based editing with full field access
- AI action buttons on cards (strategy, email)
- Confidence score visualization (5-segment bar)

**Replaced:**
- Gemini → Claude (our primary AI)
- Firebase → Supabase (our database)
- Teenage Engineering → Making Software (our design)
- Music terminology → Research terminology

---

*This specification was generated through recursive elicitation. All architecture decisions confirmed with stakeholder before drafting.*
