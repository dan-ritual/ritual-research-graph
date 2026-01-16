# Ritual Research Graph — Master Specification

**Status:** Complete (Ready for Implementation)
**Created:** 2026-01-16
**Last Updated:** 2026-01-16

> **Elicitation Complete (2026-01-16):** All architecture decisions finalized. Child specifications created for Phase 1a (Database), Phase 1b (Pipeline + Multi-AI Research). Ready to begin implementation.

---

## Executive Summary

Build a production system that transforms meeting transcripts into interconnected, Wikipedia-style microsites. The system must:

1. **Process end-to-end within Claude Code** — From raw transcript to deployed microsite
2. **Provide a GUI for internal contributors** — Any Ritual team member can generate microsites
3. **Support multiple workflow types** — Market landscape first, modular for future categories
4. **Maintain a knowledge graph** — Bi-directional entity linking across all microsites

---

## Table of Contents

1. [Vision & Goals](#1-vision--goals)
2. [System Architecture](#2-system-architecture)
3. [Workflow Types](#3-workflow-types)
4. [Processing Pipeline](#4-processing-pipeline)
5. [Data Model](#5-data-model)
6. [Key Feature: Spot Treatment Editing](#6-key-feature-spot-treatment-editing)
7. [Portal UI](#7-portal-ui)
8. [Infrastructure](#8-infrastructure)
9. [Security & Access](#9-security--access)
10. [Implementation Phases](#10-implementation-phases)
11. [Open Questions](#11-open-questions)
12. [Child Specifications](#12-child-specifications)

---

## 1. Vision & Goals

### 1.1 Problem Statement

Ritual generates valuable insights through internal meetings and research sessions. Currently:
- Transcripts live in scattered documents
- No systematic way to extract and present insights
- No cross-referencing between research sessions
- Knowledge is trapped, not compounding

### 1.2 Solution

A system where:
- Contributors upload a transcript
- System generates structured artifacts + microsite
- Microsite is deployed with entity linking
- Knowledge graph grows with each addition
- Related research surfaces automatically

### 1.3 Success Criteria

| Metric | Target |
|--------|--------|
| Transcript → Deployed microsite | < 10 minutes |
| Entity extraction accuracy | > 90% (with human review) |
| Cross-microsite linking | Automatic |
| Contributor onboarding | Self-service via GUI |

### 1.4 Non-Goals (v1)

- [ ] Public-facing microsites (internal only for v1)
- [ ] Real-time collaboration
- [ ] Mobile-optimized portal
- [ ] Automated transcript capture

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           RITUAL RESEARCH GRAPH                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────────────────┐   │
│  │   PORTAL    │     │  PROCESSING │     │      MICROSITES         │   │
│  │    (GUI)    │────►│    LAYER    │────►│    (Generated Sites)    │   │
│  └─────────────┘     └─────────────┘     └─────────────────────────┘   │
│         │                   │                        │                   │
│         │                   │                        │                   │
│         ▼                   ▼                        ▼                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        DATABASE                                  │   │
│  │  • Entity Registry    • Microsite Index    • User Sessions      │   │
│  │  • Opportunity Graph  • Generation Jobs    • Audit Logs         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Component Breakdown

| Component | Technology | Purpose |
|-----------|------------|---------|
| Portal | [TBD - Next.js likely] | GUI for contributors |
| Processing | Claude API (direct calls) | Artifact + microsite generation |
| Database | **Supabase** ✓ | Postgres + Auth + Storage |
| Microsites | React/Vite | Generated static sites |
| Hosting | Vercel | Portal + microsites |

### 2.3 Key Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Database** | Supabase | Hosted Postgres + built-in auth + realtime + storage. Fast setup, good DX. |
| **Authentication** | Google OAuth | Restricted to @ritual.net domain. Simple, no password management. |
| **Processing** | Direct API calls | Portal backend calls Claude API directly. Simplest architecture. |
| **Visibility (v1)** | Internal-only | All microsites require authentication. Safer for sensitive content. |
| **Visual Design** | Making Software Aesthetic | Institutional, research-grade design. See [Design System](#213-design-system). |

### 2.4 Design System (CANONICAL)

> **All frontend work MUST follow the Making Software aesthetic.** This is the canonical design standard for both the Portal UI and generated Microsites.

**Reference Documents:**
- [`docs/design/DESIGN_LIBRARY_MAKING_SOFTWARE.md`](./design/DESIGN_LIBRARY_MAKING_SOFTWARE.md) — Full design library specification
- [`docs/specs/SPEC_PORTAL_DESIGN_OVERHAUL.md`](./specs/SPEC_PORTAL_DESIGN_OVERHAUL.md) — Portal implementation with elicitation decisions
- `outputs/microsites/rwa-defi-jan-2026/src/App.jsx` — Reference implementation

**Design Tokens:**

```typescript
const FONTS = {
  mono: '"JetBrains Mono", "SF Mono", "Consolas", monospace',  // UI elements, headers
  serif: '"Crimson Text", Georgia, "Times New Roman", serif',   // Body text
  display: '"Space Grotesk", "Inter", system-ui, sans-serif',   // Display/hero text
};

const COLORS = {
  background: '#FBFBFB',           // Off-white paper
  text: '#171717',                 // Near-black
  accent: '#3B5FE6',               // Cobalt blue
  muted: 'rgba(0,0,0,0.45)',       // Secondary text
  border: 'rgba(0,0,0,0.08)',      // Subtle borders
};

const PATTERNS = {
  gridBackground: '20px grid, rgba(0,0,0,0.018)',
  dottedBorder: '1px dotted rgba(59,95,230,0.3)',
};
```

**Key Visual Patterns:**
| Element | Style |
|---------|-------|
| Section Headers | Mono, uppercase, 0.12em letter-spacing, accent color, dotted bottom border |
| Cards | Sharp edges (no border-radius), 1px solid border, white background |
| Thesis/Hero | Serif italic, centered, dotted top/bottom borders |
| Buttons | Mono, uppercase, 0.1em letter-spacing, accent primary |
| Links | Accent color, dotted underline |
| Loading | Mono, uppercase "LOADING...", 0.12em letter-spacing |

**Enforcement:** All frontend PRs must align with this aesthetic. When in doubt, reference the existing microsite implementation.

### 2.5 Additional Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Portal Framework** | Next.js | App Router, API routes, best Vercel integration |
| **Human Review** | Entities only | Artifacts auto-approved, entities need review to protect registry |
| **Entity Deduplication** | AI suggest + human confirm | Claude suggests merges, human confirms |
| **Workflow Modularity** | Full modularity | Workflows differ in visibility, artifacts, AND entity types |

---

## 3. Workflow Types

### 3.1 Modular Workflow System

The system supports multiple "workflow types" — each defining:
- Input format expectations
- Artifact generation prompts
- Output structure
- Entity extraction rules

### 3.2 Workflow: Market Landscape (v1)

**Purpose:** External-facing research on market categories
**Input:** Meeting transcript discussing market landscape
**Outputs:**
1. Cleaned Transcript (.md)
2. Intelligence Brief (.md)
3. Strategic Questions & Explorations (.md)
4. Narrative Research Notes (.md)
5. Deployed Microsite

**Entity Types:** Companies, protocols, people, concepts, opportunities

### 3.3 Future Workflows (Anticipated)

Each workflow can customize **visibility**, **artifacts**, and **entity types**:

| Workflow | Visibility | Artifact Types | Entity Types |
|----------|------------|----------------|--------------|
| Market Landscape | Internal (→ Public later) | Brief, Questions, Narrative | Companies, Protocols, Opportunities |
| Internal Strategy | Internal only | Action Items, Owners, Timelines | People, Projects, Initiatives |
| Technical Deep Dive | Internal (→ Public later) | Architecture, Code Refs, Benchmarks | Protocols, Libraries, Patterns |
| Competitive Intel | Internal only | SWOT, Positioning, Risks | Competitors, Products, Features |

### 3.4 Workflow Configuration Schema

```typescript
interface WorkflowConfig {
  id: string;
  name: string;
  description: string;

  // What artifacts to generate
  artifacts: ArtifactConfig[];

  // How to extract entities
  entityExtraction: {
    types: EntityType[];
    promptOverrides?: string;
  };

  // Microsite configuration
  microsite: {
    template: string;
    features: SiteFeatures;
    visibility: 'internal' | 'public';
  };

  // Human review requirements
  review: {
    required: boolean;
    stages: ('artifacts' | 'entities' | 'microsite')[];
  };
}
```

---

## 4. Processing Pipeline

### 4.1 End-to-End Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         GENERATION PIPELINE                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  STAGE 1: INTAKE                                                        │
│  ───────────────                                                        │
│  User uploads transcript via Portal                                      │
│  → Validate format                                                       │
│  → Select workflow type                                                  │
│  → Create generation job                                                 │
│                                                                          │
│  STAGE 2: ARTIFACT GENERATION (Claude API)                              │
│  ─────────────────────────────────────────                              │
│  For each artifact in workflow:                                          │
│  → Apply prompt template                                                 │
│  → Generate with Claude                                                  │
│  → Store artifact                                                        │
│  → [Optional] Human review checkpoint                                    │
│                                                                          │
│  STAGE 3: ENTITY EXTRACTION (Claude API)                                │
│  ───────────────────────────────────────                                │
│  From all artifacts:                                                     │
│  → Extract entities with metadata                                        │
│  → Deduplicate against registry                                          │
│  → [Optional] Human review checkpoint                                    │
│                                                                          │
│  STAGE 4: MICROSITE GENERATION                                          │
│  ─────────────────────────────                                          │
│  → Populate SITE_CONFIG from artifacts                                   │
│  → Generate React app from template                                      │
│  → Place artifacts in /public/                                           │
│  → [Optional] Human review checkpoint                                    │
│                                                                          │
│  STAGE 5: GRAPH INTEGRATION                                             │
│  ──────────────────────────                                             │
│  → Register microsite in index                                           │
│  → Add entity appearances                                                │
│  → Calculate co-occurrences                                              │
│  → Compute backlinks                                                     │
│                                                                          │
│  STAGE 6: DEPLOYMENT                                                    │
│  ────────────────────                                                   │
│  → Build microsite                                                       │
│  → Deploy to Vercel                                                      │
│  → Update portal with link                                               │
│  → Notify contributor                                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Processing Options

**Option A: Synchronous API Route**
- User waits while generation happens
- Simpler implementation
- Timeout concerns for long generations

**Option B: Background Job Queue**
- User submits, gets notified when done
- More complex (needs job queue)
- Better UX for long operations

**Option C: Hybrid**
- Quick operations synchronous
- Long operations (Claude calls) background

### 4.3 Claude API Integration

- [ ] **API Key Management**: Env var vs secrets manager
- [ ] **Rate Limiting**: How to handle API limits
- [ ] **Cost Tracking**: Per-generation cost attribution
- [ ] **Model Selection**: Claude 3.5 Sonnet vs Opus for different stages

---

## 5. Data Model

### 5.1 Core Entities

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            DATA MODEL                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐         ┌─────────────┐         ┌─────────────┐       │
│  │    User     │────────►│GenerationJob│────────►│  Microsite  │       │
│  └─────────────┘         └─────────────┘         └─────────────┘       │
│                                 │                       │                │
│                                 │                       │                │
│                                 ▼                       ▼                │
│                          ┌─────────────┐         ┌─────────────┐       │
│                          │  Artifact   │         │   Entity    │       │
│                          └─────────────┘         └─────────────┘       │
│                                                        │                │
│                                                        │                │
│                                                        ▼                │
│                                                 ┌─────────────┐        │
│                                                 │ Opportunity │        │
│                                                 └─────────────┘        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Table Schemas (Draft)

```sql
-- Users (if not using external auth)
users (
  id, email, name, role, created_at
)

-- Generation Jobs
generation_jobs (
  id, user_id, workflow_type, status,
  input_transcript, created_at, completed_at
)

-- Artifacts
artifacts (
  id, job_id, type, content, file_path, created_at
)

-- Microsites
microsites (
  id, job_id, slug, title, subtitle, thesis,
  url, local_path, visibility, created_at
)

-- Entities
entities (
  id, slug, canonical_name, type, metadata,
  created_at, updated_at
)

-- Entity Appearances (join table)
entity_appearances (
  entity_id, microsite_id, section, context, sentiment
)

-- Entity Relations (co-occurrences)
entity_relations (
  entity_a_id, entity_b_id, co_occurrence_count
)

-- Opportunities
opportunities (
  id, slug, name, description, parent_id
)
```

---

## 6. Key Feature: Spot Treatment Editing

### 6.1 Concept

After generation, users can surgically edit specific sections of artifacts without regenerating the entire document.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SPOT TREATMENT UI                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ARTIFACT: Intelligence Brief                                            │
│  ─────────────────────────────                                          │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ## Market Position                                               │   │
│  │                                                                  │   │
│  │ RWA TVL crossed $35B in January 2026, representing 7x growth    │   │
│  │ from $5B at start of 2025...                                    │   │
│  │                                                          [FROZEN]│   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ## Protocol Analysis                              [SELECTED] ✏️  │   │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│   │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│   │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ## Recommendations                                               │   │
│  │                                                                  │   │
│  │ Position as hybrid infrastructure + category enabler...         │   │
│  │                                                          [FROZEN]│   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Edit Instructions:                                               │   │
│  │ ┌─────────────────────────────────────────────────────────────┐ │   │
│  │ │ Make this section more focused on Zivoe specifically,       │ │   │
│  │ │ include their spigot mechanism details                       │ │   │
│  │ └─────────────────────────────────────────────────────────────┘ │   │
│  │                                            [Regenerate Section]  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Implementation

```typescript
interface SpotEditRequest {
  artifactId: string;

  // What to preserve (frozen sections)
  frozenSections: {
    startLine: number;
    endLine: number;
    content: string;  // Exact content to preserve
  }[];

  // What to regenerate
  targetSection: {
    startLine: number;
    endLine: number;
    currentContent: string;
  };

  // User instructions for regeneration
  editInstructions: string;
}
```

### 6.3 Prompt Strategy

```
You are editing a specific section of a document.

FROZEN CONTENT (do not modify):
---
{frozen_before}
---

SECTION TO REGENERATE:
Current content:
---
{current_section}
---

User instructions: {edit_instructions}

FROZEN CONTENT (do not modify):
---
{frozen_after}
---

Generate ONLY the replacement for the target section.
Maintain consistent tone and formatting with frozen sections.
```

---

## 7. Portal UI

### 7.1 User Flows

**Flow 1: Generate New Microsite**
1. Log in to portal
2. Click "New Research"
3. Select workflow type
4. Upload/paste transcript
5. Configure options (title, accent color, etc.)
6. Submit for generation
7. Monitor progress
8. Review generated artifacts (if review enabled)
9. Approve/edit entities
10. Deploy microsite
11. View deployed site

**Flow 2: Browse Knowledge Graph**
1. Dashboard shows all microsites
2. Click entity to see all mentions
3. Navigate between related research
4. Filter by opportunity area

**Flow 3: Edit Existing Microsite**
1. Select microsite from list
2. Edit metadata/content
3. Regenerate specific artifacts
4. Redeploy

### 7.2 Portal Pages

| Page | Purpose |
|------|---------|
| Dashboard | Overview, recent microsites, stats |
| New Research | Generation wizard |
| Job Status | Monitor generation progress |
| Microsites | List all microsites |
| Microsite Detail | View/edit single microsite |
| Entities | Browse entity registry |
| Entity Detail | Single entity with all appearances |
| Opportunities | Browse opportunity taxonomy |
| Settings | User preferences, API keys |

### 7.3 UI Framework

**Decision: Next.js** (App Router)

- Server components for data fetching
- API routes for Claude integration
- Best Vercel integration
- Supabase Auth helpers available

---

## 8. Infrastructure

### 8.1 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DEPLOYMENT ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                           VERCEL                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  research.ritual.net (Portal)                                    │   │
│  │  ├── /                    Dashboard                              │   │
│  │  ├── /new                 Generation wizard                      │   │
│  │  ├── /microsites          List                                   │   │
│  │  ├── /microsites/[slug]   Detail                                 │   │
│  │  ├── /entities            Registry                               │   │
│  │  └── /api/*               Backend routes                         │   │
│  │                                                                  │   │
│  │  research.ritual.net/sites/[slug] (Microsites)                   │   │
│  │  └── Static generated sites                                      │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│                           DATABASE (Supabase)                            │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Postgres: entities, microsites, jobs, users                    │   │
│  │  Auth: Google OAuth with @ritual.net restriction                │   │
│  │  Realtime: Job status updates                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│                           STORAGE (Vercel Blob)                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  /transcripts/[job-id].md       - Uploaded transcripts          │   │
│  │  /artifacts/[job-id]/*.md       - Generated artifacts           │   │
│  │  /microsites/[slug]/            - Built static sites            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Environment Strategy

| Environment | Purpose | URL |
|-------------|---------|-----|
| Development | Local development | localhost:3000 |
| Preview | PR previews | pr-*.vercel.app |
| Staging | Pre-production testing | staging.research.ritual.net |
| Production | Live system | research.ritual.net |

---

## 9. Security & Access

### 9.1 Authentication

**Decision: Google OAuth** restricted to @ritual.net domain

- Supabase Auth with Google provider
- Domain restriction in Supabase config
- Auto-create user on first login

### 9.2 Authorization

| Role | Capabilities |
|------|--------------|
| Contributor | Generate microsites, view all, edit own |
| Editor | Edit any microsite, manage entities |
| Admin | All above + manage users, settings |

### 9.3 Data Privacy

- Transcripts may contain sensitive internal discussions
- Microsites have visibility setting (internal/public)
- Internal microsites require authentication to view
- Audit log for all generation actions

---

## 10. Implementation Phases

### Build Order: Database First → Processing → Portal UI → Pipeline → Graph

> **Key Decision (2026-01-16):** Supabase setup is now Phase 1a, executed BEFORE the Processing Pipeline. The CLI will write directly to Supabase rather than using local JSON files.
>
> **Updated (2026-01-16):** Added Phase 2.5a/2.5b for Opportunity Pipeline integration (Kanban tracking, AI actions).

```
Phase 1a ──► Phase 1b ──► Phase 2 ──► Phase 2.5a ──► Phase 2.5b ──► Phase 3 ──► Phase 4
Database     Pipeline     Portal      Pipeline      Pipeline       Graph       Edit
(Supabase)   (CLI)        (Next.js)   Core          Advanced       (UI)        (Spot)
```

### Phase 0: Foundation (Current) ✅
- [x] Project structure
- [x] Type definitions
- [x] Entity registry (JSON - will migrate)
- [x] Import existing microsite
- [x] Master specification
- [x] Child specifications (Pipeline, Database, Multi-AI Research)

### Phase 1a: Database & Storage (PREREQUISITE)
**Goal:** Supabase foundation ready for CLI

- [ ] Create Supabase project
- [ ] Run table creation migrations (all 9 tables)
- [ ] Configure Google OAuth (restrict to @ritual.net)
- [ ] Set up RLS policies
- [ ] Create storage buckets (transcripts, artifacts, microsites)
- [ ] Generate TypeScript client types
- [ ] Obtain service role key for CLI

**Deliverable:** `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` in `.env.local`

### Phase 1b: Processing Pipeline (CLI)
**Goal:** End-to-end transcript → microsite via command line

- [ ] Artifact generation prompts (3 Claude prompts)
- [ ] **Multi-AI research chain** (Grok → Perplexity → bird-cli → Claude)
- [ ] Entity extraction from artifacts
- [ ] SITE_CONFIG generation
- [ ] Microsite build (Vite, template from defi-rwa)
- [ ] Supabase graph integration (write to database)

**Deliverable:** `npm run generate -- --transcript ./input.md --workflow market-landscape`

### Phase 2: Portal MVP
**Goal:** Web UI for generation workflow

- [ ] Next.js project setup
- [ ] Authentication (Google OAuth @ritual.net)
- [ ] Generation wizard (upload → configure → submit)
- [ ] Job status page (progress indicators)
- [ ] Microsite list/detail views
- [ ] Static site serving from Blob

**Deliverable:** Contributors can generate microsites via web UI

### Phase 2.5a: Opportunity Pipeline (Core)
**Goal:** Kanban-style opportunity tracking

- [ ] Database migrations (pipeline_workflows, pipeline_stages, expanded opportunities)
- [ ] `/pipeline` page with Kanban UI
- [ ] Opportunity CRUD (create, read, update, archive)
- [ ] Stage progression (button-based, not drag-drop)
- [ ] Workflow selection dropdown
- [ ] Supabase Realtime subscriptions

**Deliverable:** Functional Kanban board with manual opportunity management

### Phase 2.5b: Opportunity Pipeline (Advanced)
**Goal:** AI-assisted opportunity management

- [ ] AI strategy generation (Claude)
- [ ] AI email generation (Claude)
- [ ] Duplicate detection during creation
- [ ] Entity linking UI (many-to-many)
- [ ] Multiple owner assignment
- [ ] Chat interface (query opportunities conversationally)
- [ ] Opportunity extraction during Stage 3

**Deliverable:** Full AI-assisted opportunity management with chat

### Phase 3: Knowledge Graph UI
**Goal:** Full Wikipedia-style navigation

- [ ] Entity pages (all appearances, co-occurrences)
- [ ] Entity registry browser (search, filter)
- [ ] Related research panel on microsites
- [ ] Opportunity taxonomy pages
- [ ] Co-occurrence visualization (optional)

**Deliverable:** Can navigate: microsite → entity → related microsites

### Phase 5: Editing & Refinement
**Goal:** Post-generation editing with spot treatment

- [ ] Artifact viewer/editor
- [ ] "Spot treatment" UI (highlight section → regenerate)
- [ ] Entity review/approval flow
- [ ] Entity merge suggestions (AI + human confirm)
- [ ] Microsite regeneration (partial)

**Deliverable:** Can edit artifacts surgically without full regeneration

### Phase 6: Workflow Expansion (Future)
- [ ] Additional workflow types (Internal Strategy, etc.)
- [ ] Workflow configuration UI
- [ ] Public visibility option
- [ ] Analytics (if needed)

---

## 11. Open Questions

### Infrastructure
- [x] Q1: Which database? → **Supabase**
- [x] Q2: Which portal framework? → **Next.js**
- [x] Q3: How to trigger Claude processing from GUI? → **Direct API calls**

### Workflows
- [x] Q4: What differentiates "internal" vs "external" workflows? → **Full modularity** (visibility + artifacts + entity types)
- [x] Q5: Should entities be auto-approved or require review? → **Review entities only**
- [x] Q6: How to handle entity deduplication/merging? → **AI suggest + human confirm**

### Access
- [x] Q7: How do Ritual employees authenticate? → **Google OAuth (@ritual.net)**
- [x] Q8: Should microsites be public or internal-only initially? → **Internal-only (v1)**

### Processing
- [x] Q9: Human review at which stages? → **Entity review only** (artifacts auto-approved)
- [ ] Q10: How to handle generation failures/retries?
- [x] Q11: Streaming responses for long operations? → **Progress indicators only** (not full streaming)
- [x] Q12: Cost tracking per generation? → **Absorb internally (v1)**, no tracking yet

### Scope & Deployment
- [x] Q13: MVP scope? → **Full graph experience** (generation + browse + entity pages + co-occurrence)
- [x] Q14: Microsite deployment? → **Static export to Vercel Blob**
- [x] Q15: Build order? → **Processing first**, then portal UI
- [x] Q16: Prompt storage? → **Hybrid** (defaults in code, overrides in DB)
- [x] Q17: Microsite access? → **Under portal domain** (research.ritual.net/sites/[slug])

### v1 Exclusions
- [x] Q18: What to exclude? → **No collaboration, no analytics**
- [x] Q19: Editing? → **YES - include artifact editing with "spot treatment"** (highlight section to regenerate while freezing rest)

---

## 12. Child Specifications

### Specification Sequence

Child specs should be implemented in this order (matches implementation phases):

```
SPEC_DATABASE_SCHEMA ──► SPEC_PROCESSING_PIPELINE ──► SPEC_PORTAL_UI ──► SPEC_OPPORTUNITY_PIPELINE
    (Phase 1a)                 (Phase 1b)                (Phase 2)         (Phase 2.5a/2.5b)
        │                          │                         │                    │
        │                          ▼                         │                    │
        │            SPEC_MULTI_AI_RESEARCH                  │                    │
        │                   (Phase 1b)                       │                    │
        │                                                    │                    │
        ▼                                                    ▼                    ▼
SPEC_AUTHENTICATION                                    SPEC_GRAPH_UI ◄───────────┘
   (merged w/ 1a)                                       (Phase 3)
                                                            │
                                                            ▼
                                                   SPEC_SPOT_TREATMENT
                                                       (Phase 4)
```

### Specification Registry

| # | Spec | Status | Phase | Purpose |
|---|------|--------|-------|---------|
| 1 | [`SPEC_PROCESSING_PIPELINE.md`](./specs/SPEC_PROCESSING_PIPELINE.md) | ✅ Complete | 1b | Artifact generation, multi-AI research chain, Supabase integration |
| 2 | [`SPEC_DATABASE_SCHEMA.md`](./specs/SPEC_DATABASE_SCHEMA.md) | ✅ Complete | 1a | Supabase schema, RLS policies, Google OAuth config |
| 3 | [`SPEC_MULTI_AI_RESEARCH.md`](./specs/SPEC_MULTI_AI_RESEARCH.md) | ✅ Complete | 1b | Grok → Perplexity → bird-cli → Claude chain |
| 4 | [`SPEC_PORTAL_UI.md`](./specs/SPEC_PORTAL_UI.md) | ✅ Complete | 2 | Portal wireframes, components, routing, shadcn/ui |
| 4a | [`SPEC_PORTAL_DESIGN_OVERHAUL.md`](./specs/SPEC_PORTAL_DESIGN_OVERHAUL.md) | ✅ Ready | 2 | **Making Software aesthetic** — visual design for Portal |
| 5 | [`SPEC_OPPORTUNITY_PIPELINE.md`](./specs/SPEC_OPPORTUNITY_PIPELINE.md) | ✅ Ready | 2.5 | **Kanban pipeline** — opportunity tracking, AI actions, chat |
| 6 | `SPEC_GRAPH_UI.md` | ⬚ Not started | 3 | Entity pages, co-occurrence visualization |
| 7 | `SPEC_SPOT_TREATMENT.md` | ⬚ Not started | 4 | Surgical editing UI, prompt strategy |
| 8 | `SPEC_DEPLOYMENT.md` | ⬚ Not started | All | CI/CD, environments, Vercel config |
| — | [`DESIGN_LIBRARY_MAKING_SOFTWARE.md`](./design/DESIGN_LIBRARY_MAKING_SOFTWARE.md) | ✅ Active | All | **CANONICAL design library** — applies to all frontend work |

### Next Steps

1. ✅ Complete `MASTER_SPEC.md` (this document)
2. ✅ Create `SPEC_PROCESSING_PIPELINE.md` — Phase 1b specification
3. ✅ Create `SPEC_DATABASE_SCHEMA.md` — Phase 1a specification
4. ✅ Create `SPEC_MULTI_AI_RESEARCH.md` — Multi-AI chain specification
5. 🔲 **Begin Phase 1a implementation** — Create Supabase project
6. ⬚ Begin Phase 1b after Supabase setup complete

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| Artifact | Generated document (transcript, brief, etc.) |
| Entity | Named thing tracked in registry (company, person, concept) |
| Microsite | Generated static website for a research session |
| Opportunity | Thematic tag for entity categorization |
| Workflow | Configuration defining generation process |

---

## Appendix B: References

- Existing microsite: https://rit-internal-rwa-defi-jan152025.vercel.app
- Making Software Skill: `~/.claude/skills/making-software-microsite/`
- Initialization Payload: `/Users/danielgosek/Downloads/RITUAL_RESEARCH_GRAPH_INIT_PAYLOAD.md`

---

*This specification is a living document. Update as decisions are made.*
