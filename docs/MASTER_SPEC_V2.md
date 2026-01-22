# Ritual OS - Multi-Mode Architecture Specification

> **Version:** 2.0.0
> **Status:** Post-Audit, Elicitation Complete
> **Last Updated:** 2026-01-20

---

## Elicitation Decisions (2026-01-20)

Key decisions made after Phase 0 audit:

| Question | Decision | Rationale | Future Path |
|----------|----------|-----------|-------------|
| Entity type source | **Code-driven** (TypeScript config) | Type-safe, simpler Phase 1 | See `SPEC_FUTURE_DB_ENTITIES.md` |
| Schema migration | **Maintenance window** (5-15 min) | Acceptable for internal tool, simpler | N/A |
| Pipeline parallelism | **Sequential** | Current state, defer optimization | Future optimization |
| Cross-link creation | **Manual only** | Start simple, add AI later | See `SPEC_FUTURE_AI_CROSSLINKS.md` |
| Design overhaul | **During Phase 1 Theme System** | Natural fit, ~3 days | Parallel if ambitious |

---

## Executive Summary

Ritual OS is a three-mode knowledge system that transforms unstructured inputs (meeting transcripts, notes, ideas) into interconnected, searchable knowledge graphs with Wikipedia-style outputs.

### The Three Modes

| Mode | Name | Color | Domain | Input | Output |
|------|------|-------|--------|-------|--------|
| Blue | **Ritual Growth** | `#3B5FE6` | BD/CRM | Research transcripts | Microsites + Entity graph |
| Green | **Ritual Engineering Graph** | `#3BE65B` | Engineering | Meeting transcripts | Wiki + Feature tracking |
| Red | **Ritual Skunkworks** | `#E63B3B` | Product | Ideas, tweets, notes | Idea pipeline + Prototypes |

### Core Value Proposition

**Cross-mode linking**: An entity in Growth (e.g., "Ondo Finance") can link to an Idea in Skunkworks ("Treasury Integration") which links to a Feature in Engineering ("Treasury Module v2"). This creates an organizational nervous system.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           RITUAL OS PORTAL                               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                  │
│  │   GROWTH    │    │ ENGINEERING │    │ SKUNKWORKS  │   Mode Selector  │
│  │   (Blue)    │    │   (Green)   │    │    (Red)    │                  │
│  └─────────────┘    └─────────────┘    └─────────────┘                  │
├─────────────────────────────────────────────────────────────────────────┤
│                        SHARED UI COMPONENTS                              │
│         Cards • Grids • Navigation • Search • Cross-Links               │
├─────────────────────────────────────────────────────────────────────────┤
│                         MODE CONFIGURATIONS                              │
│    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│    │ GrowthConfig │  │ EngConfig    │  │ SkunkConfig  │                 │
│    │ - entities   │  │ - entities   │  │ - entities   │                 │
│    │ - stages     │  │ - stages     │  │ - stages     │                 │
│    │ - theme      │  │ - theme      │  │ - theme      │                 │
│    └──────────────┘  └──────────────┘  └──────────────┘                 │
├─────────────────────────────────────────────────────────────────────────┤
│                           SUPABASE                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │  growth.*    │  │engineering.* │  │  product.*   │  │  shared.*   │  │
│  │  - entities  │  │  - entities  │  │  - entities  │  │  - users    │  │
│  │  - artifacts │  │  - artifacts │  │  - artifacts │  │  - links    │  │
│  │  - jobs      │  │  - jobs      │  │  - jobs      │  │  - config   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Mode Specifications

### Mode 1: Ritual Growth (Blue)

> **Purpose:** Track external opportunities, relationships, and market research.

**Entity Types:**
| Type | Description | Key Fields |
|------|-------------|------------|
| Company | Organization being researched | name, sector, stage, website |
| Protocol | Crypto/DeFi protocol | name, chain, tvl, token |
| Person | Individual contact | name, title, company, relationship |
| Opportunity | BD pipeline item | company, stage, value, owner |

**Pipeline Stages:**
1. Transcript Ingestion
2. Entity Extraction (Claude)
3. Entity Enrichment (Grok real-time)
4. Deep Research (Perplexity)
5. Social Data (bird-cli)
6. Microsite Generation (Claude)

**Outputs:**
- Static microsites (Vite/React)
- Entity cards in portal
- Relationship graph
- Pipeline/CRM view

### Mode 2: Ritual Engineering Graph (Green)

> **Purpose:** Create living wiki of engineering knowledge from meetings.

**Entity Types:**
| Type | Description | Key Fields |
|------|-------------|------------|
| Feature | Product feature being built | name, status, owner, epic |
| Topic | Engineering concept/domain | name, description, related |
| Decision | Architectural decision | title, context, decision, consequences |
| Component | System component | name, type, dependencies |

**Pipeline Stages:**
1. Transcript Ingestion (Google Meet/Gemini)
2. Topic Extraction (Claude)
3. Decision Identification (Claude)
4. Feature Linking (Claude)
5. Wiki Generation (Claude)
6. Asana Sync (one-way import)

**Outputs:**
- Wiki pages per topic
- Decision log (ADR-style)
- Feature status board
- Component dependency graph

**Integrations:**
- Google Meet (transcript source)
- Google Drive (file access)
- Asana (task import)

### Mode 3: Ritual Skunkworks (Red)

> **Purpose:** Track product ideas from spark to prototype.

**Entity Types:**
| Type | Description | Key Fields |
|------|-------------|------------|
| Idea | Raw product idea | title, source, submitter, tags |
| Spec | Detailed specification | idea_id, author, status, doc |
| Prototype | Working proof of concept | spec_id, repo, demo_url, status |
| Experiment | A/B test or validation | prototype_id, hypothesis, results |

**Pipeline Stages:**
1. Idea Capture (manual, tweet, meeting)
2. Idea Enrichment (Claude)
3. Competitive Scan (Perplexity)
4. Spec Generation (Claude)
5. Prototype Tracking (manual)

**Outputs:**
- Idea backlog
- Spec documents
- Prototype gallery
- Experiment results

**Status:** Design phase required before implementation.

---

## Cross-Mode Linking

### Link Types

| Link Type | From | To | Example |
|-----------|------|-----|---------|
| `inspired_by` | Idea | Entity | "Treasury Integration" inspired by "Ondo Finance" |
| `implements` | Feature | Idea | "Treasury Module" implements "Treasury Integration" |
| `relates_to` | Any | Any | Generic relationship |
| `blocks` | Feature | Feature | Dependency tracking |
| `derived_from` | Decision | Topic | ADR derived from discussion topic |

### Shared Links Table

```sql
CREATE TABLE shared.cross_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_mode TEXT NOT NULL,  -- 'growth', 'engineering', 'product'
  source_type TEXT NOT NULL,  -- entity type within mode
  source_id UUID NOT NULL,
  target_mode TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  link_type TEXT NOT NULL,
  confidence FLOAT,           -- for AI-suggested links
  created_by UUID REFERENCES shared.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);
```

### Link Discovery

**Phase 1-4 Mode:** Manual only
- User creates all cross-mode links explicitly
- No AI involvement in link creation

**Future Mode (SPEC_FUTURE_AI_CROSSLINKS.md):** AI-assisted
- **Suggested:** AI suggests, user approves
- **Automatic:** AI creates links above confidence threshold
- Requires separate elicitation for thresholds and UX

---

## Database Architecture

### Schema Strategy: Multi-Schema

Each mode gets its own PostgreSQL schema within the same Supabase project.

```
public (deprecated, migrate out)
├── growth
│   ├── entities
│   ├── artifacts
│   ├── jobs
│   └── pipeline_stages
├── engineering
│   ├── entities
│   ├── artifacts
│   ├── jobs
│   └── wiki_pages
├── product
│   ├── entities
│   ├── artifacts
│   ├── jobs
│   └── experiments
└── shared
    ├── users
    ├── cross_links
    ├── mode_config
    └── audit_log
```

### RLS Strategy

- Mode-specific RLS policies per schema
- Shared schema accessible to all authenticated users
- Cross-links require read access to both source and target modes

---

## Theme System

### CSS Variables

```css
:root {
  /* Mode-agnostic */
  --font-mono: 'JetBrains Mono', monospace;
  --font-serif: 'Crimson Text', serif;
  --font-display: 'Space Grotesk', sans-serif;
  --bg-primary: #FBFBFB;
  --text-primary: #171717;

  /* Mode-specific (set by JS on mode change) */
  --accent-primary: var(--mode-accent);
  --accent-light: var(--mode-accent-light);
}

/* Mode themes */
[data-mode="growth"] {
  --mode-accent: #3B5FE6;
  --mode-accent-light: #E8EDFC;
}

[data-mode="engineering"] {
  --mode-accent: #3BE65B;
  --mode-accent-light: #E8FCE8;
}

[data-mode="skunkworks"] {
  --mode-accent: #E63B3B;
  --mode-accent-light: #FCE8E8;
}
```

### Theme Switching

Mode is stored in:
1. URL path (`/growth/...`, `/engineering/...`)
2. User preference (localStorage)
3. Session state (Supabase)

Portal reads mode from URL, applies `data-mode` attribute to root element.

---

## Configuration System

### Mode Configuration Interface

```typescript
interface ModeConfig {
  id: string;                    // 'growth' | 'engineering' | 'product'
  name: string;                  // Display name
  color: string;                 // Hex color

  entityTypes: EntityTypeConfig[];
  pipelineStages: StageConfig[];

  features: {
    crossLinking: 'manual' | 'suggested' | 'automatic';
    externalIntegrations: string[];  // ['asana', 'gdrive', etc.]
  };

  ui: {
    navigation: NavItem[];
    defaultView: string;
  };
}

interface EntityTypeConfig {
  type: string;
  displayName: string;
  icon: string;
  fields: FieldConfig[];
  searchable: boolean;
}

interface StageConfig {
  id: string;
  name: string;
  provider: 'claude' | 'grok' | 'perplexity' | 'bird' | 'internal';
  required: boolean;
  order: number;
  config: Record<string, unknown>;
}
```

---

## Implementation Phases

### Phase 0: Audit (Current)
- Codebase coupling analysis
- Extraction point identification
- Effort estimation

### Phase 1: Mode Abstraction
- Extract mode configuration system
- Implement theme switching
- Create multi-schema foundation

### Phase 2: Growth Mode Completion
- Complete existing research features
- Rename to "Growth"
- Full pipeline operational

### Phase 3: Engineering Mode
- Google Meet integration
- Topic/Decision extraction
- Wiki generation
- Asana one-way sync

### Phase 4: Cross-Linking
- Shared links table
- AI suggestion system
- Admin configuration

### Phase 5: Skunkworks Mode
- Full design phase
- Implementation TBD

---

## Child Specifications

### Active Specs

| Spec | Phase | Purpose | Status |
|------|-------|---------|--------|
| `SPEC_0_AUDIT.md` | 0 | Audit methodology and prompts | ✅ Complete |
| `SPEC_1_MODE_SYSTEM.md` | 1 | Mode abstraction architecture | Ready |
| `SPEC_1_THEME_SYSTEM.md` | 1 | CSS variable theming | Ready |
| `SPEC_1_SCHEMA_SPLIT.md` | 1 | Database multi-schema migration | Ready |
| `SPEC_2_GROWTH.md` | 2 | Growth mode completion | Pending |
| `SPEC_3_ENGINEERING.md` | 3 | Engineering mode full spec | Draft |
| `SPEC_3_GMEET_INTEGRATION.md` | 3 | Google Meet/Drive integration | Pending |
| `SPEC_3_ASANA_SYNC.md` | 3 | Asana one-way import | Pending |
| `SPEC_4_CROSS_LINKING.md` | 4 | Cross-mode entity linking (manual) | Pending |
| `SPEC_5_SKUNKWORKS.md` | 5 | Skunkworks mode (design phase) | Pending |

### Future Specs (Scalability Path)

| Spec | Purpose | Trigger |
|------|---------|---------|
| `SPEC_FUTURE_DB_ENTITIES.md` | DB-driven entity types | When code-driven becomes limiting |
| `SPEC_FUTURE_AI_CROSSLINKS.md` | AI-suggested/automatic cross-links | After Phase 4 manual linking works |

---

## Resolved Questions

> Resolved during Phase 0 audit and elicitation (2026-01-20).

| # | Question | Resolution |
|---|----------|------------|
| 1 | Schema migration downtime? | ✅ Maintenance window (5-15 min) acceptable |
| 2 | Entity types: DB or code? | ✅ Code-driven (TypeScript), DB-driven deferred to future spec |
| 3 | Pipeline parallelism? | ✅ Sequential for now, optimize later |
| 4 | Cross-link confidence threshold? | ✅ Manual only for Phase 1-4, AI deferred to future spec |
| 5 | Asana sync frequency? | ⏳ To be resolved in Phase 3 (likely periodic poll) |
| 6 | Skunkworks input sources? | ⏳ To be resolved in Phase 5 design |

---

## Appendices

### A. Naming Alternatives Considered

| Umbrella | Blue | Green | Red |
|----------|------|-------|-----|
| Ritual OS | Ritual Growth | Ritual Engineering Graph | Ritual Skunkworks |
| Ritual | Ritual Intel | Ritual Build | Ritual Labs |
| Ritual Graph | Growth Graph | Engineering Graph | Product Graph |

**Decision:** Ritual Growth / Ritual Engineering Graph / Ritual Skunkworks

### B. Color Palette

| Mode | Primary | Light | Dark |
|------|---------|-------|------|
| Growth | #3B5FE6 | #E8EDFC | #2A4BC4 |
| Engineering | #3BE65B | #E8FCE8 | #2AC44A |
| Skunkworks | #E63B3B | #FCE8E8 | #C42A2A |

### C. Related Documents

- `docs/MASTER_SPEC.md` (v1, deprecated)
- `docs/design/DESIGN_LIBRARY_MAKING_SOFTWARE.md`
- `docs/maps/MAP_PIPELINE.md`
- `docs/audit/AUDIT_SPEC.md`
