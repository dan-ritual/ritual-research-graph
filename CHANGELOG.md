# Changelog

All notable changes to the Ritual Research Graph project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Added
- `docs/specs/SPEC_PORTAL_UI.md` — **NEW** Portal UI specification (Phase 2)
  - Next.js 14+ with App Router
  - shadcn/ui component library
  - TanStack Query for state management
  - Supabase Realtime for job updates
  - 3-step generation wizard
  - Entity review before graph write

### Phase 2 Portal Elicitation Decisions (2026-01-16)

| Category | Decision |
|----------|----------|
| UI Library | **shadcn/ui** — accessible, customizable, matches Making Software aesthetic |
| Job Updates | **Supabase Realtime** — already configured, instant updates |
| Job Trigger | **API route → spawn CLI** — reuses existing Phase 1b pipeline |
| Site Hosting | **Vercel Blob + proxy** — single deployment, auth check |
| State Management | **TanStack Query** — async state, caching, Supabase integration |
| MVP Priority | **Generation-first** — Dashboard → Wizard → Status → List |
| Entity Review | **Before graph write** — job pauses at `awaiting_entity_review` |
| Theme | **Light only for MVP** — matches Making Software aesthetic |
| Repo Structure | **apps/portal in monorepo** — shares types from packages/core |
| Wizard Steps | **3 steps** — Upload → Configure → Review |
| Admin Pages | **Skip for MVP** — all @ritual.net users equal in v1 |
| Design Reference | **Making Software aesthetic** — clean, institutional, minimal |
| Failure UX | **Show error + retry button** — user stays in flow |
| Delete Action | **Soft delete (archive)** — hide from list, can restore |

---

## [1.0.0] - 2026-01-17 — Production Deployment

### Added

#### Phase 5: Vercel Deployment
- Vercel deployment at portal-delta-lilac.vercel.app
- Internal microsite hosting via Vercel Blob proxy
- `/sites/[slug]` route with auth check for internal microsites
- Blob upload script (`scripts/upload-to-blob.ts`)
- Environment configuration for production
- Auth callback URL configuration

---

## [0.4.0] - 2026-01-17 — Phase 3: Knowledge Graph UI

### Added

#### Entity Browsing
- Entity list page (`/entities`) with search, type filter, pagination
- Entity detail page (`/entities/[slug]`) with appearances, co-occurrences
- Entity search API (`/api/entities/search`)
- Related research panel on microsites
- "Entities" link in header navigation

#### Graph Features
- Co-occurrence display showing entities that appear together
- Bidirectional links between entities and microsites
- Entity type badges (Company, Protocol, Person, etc.)

---

## [0.3.1] - 2026-01-17 — Phase 2.5b: Pipeline Advanced

### Added

#### AI Features
- AI strategy generation (`/api/opportunities/[id]/generate-strategy`)
- AI email generation (`/api/opportunities/[id]/generate-email`)
- Chat interface with Claude (`/api/opportunities/chat`, `ChatPanel` component)
- Two-mode chat overlay (FAB + panel modes)

#### Entity Linking
- Entity linking UI in opportunity detail
- Search and link entities to opportunities
- Entity badges on opportunity cards

#### Duplicate Detection
- Duplicate opportunity detection (`/api/opportunities/check-duplicate`)
- Warning UI when similar opportunities exist

---

## [0.3.0] - 2026-01-16 — Phase 2 + 2.5a: Portal & Pipeline

### Added

#### Portal Foundation (`apps/portal/`)
- Next.js 14+ with App Router
- Making Software design system
- Google OAuth authentication with @ritual.net restriction
- Dashboard with recent activity

#### Opportunity Pipeline
- Pipeline Kanban board (`/pipeline`)
- 6-stage pipeline: Lead → Qualifying → Proposal → Negotiation → Closed Won → Closed Lost
- Opportunity detail page (`/pipeline/[id]`)
- Owner assignment for opportunities
- Realtime updates via Supabase subscriptions

#### Microsite Management
- Microsite list page (`/microsites`)
- Microsite detail page (`/microsites/[slug]`)
- Soft delete with restore capability

#### API Routes
- Opportunity CRUD (`/api/opportunities/*`)
- Job management (`/api/jobs/*`)
- Entity management (`/api/entities/*`)

---

## [0.2.0] - 2026-01-16 — Phase 1b Complete

### Added

#### 6-Stage Processing Pipeline (`scripts/`)
- `scripts/generate.ts` — Main CLI entry point
- `scripts/lib/claude.ts` — Claude API client (PRIMARY provider)
- `scripts/lib/grok.ts` — Grok (xAI) API client (SECONDARY)
- `scripts/lib/perplexity.ts` — Perplexity API client (SECONDARY)
- `scripts/lib/bird.ts` — bird-cli SSH wrapper (INTERNAL)
- `scripts/lib/supabase.ts` — Supabase client
- `scripts/prompts/` — 6 prompt templates
- `scripts/stages/` — 6 stage implementations

#### Multi-AI Research Chain
- Grok → Perplexity → bird-cli → Claude synthesis
- Graceful degradation (secondaries can fail, pipeline continues)
- Parallel execution with Promise.allSettled

#### Documentation
- `docs/SPEC_MULTI_AI_RESEARCH.md` — Multi-AI chain specification
- `docs/design/API_PROVIDER_HIERARCHY.md` — Provider roles documentation
- `docs/design/MASTER_MAP.md` — Canonical mapping system

### Changed
- `docs/SPEC_PROCESSING_PIPELINE.md` — Updated to 6 stages
- `docs/SPEC_DATABASE_SCHEMA.md` — Phase 1a prerequisite
- `docs/MASTER_SPEC.md` — Status: Ready for Implementation

### Phase 1b Elicitation Decisions (2026-01-16)
| Question | Decision |
|----------|----------|
| Microsite template source | Copy from `/Downloads/defi-rwa` |
| Narrative Research | Multi-AI chain (Grok → Perplexity → bird-cli) |
| Storage for Phase 1 | Supabase from start (not local JSON) |
| Test data | Use existing RWA transcript |
| Primary research provider | Grok (xAI) first, then Perplexity |
| Supabase project | Create new |
| Domain restriction | Enforced at Supabase level |
| CLI authentication | Service role key |

---

## [0.1.0] - 2026-01-16

### Added

#### Project Foundation
- Initial project structure at `/Users/danielgosek/dev/projects/ritual/ritual-research-graph/`
- Monorepo setup with `packages/core`, `packages/portal`, `packages/design-system`
- TypeScript configuration with path aliases

#### Core Types (`packages/core/src/types.ts`)
- `Entity` type with appearances, co-occurrences, and opportunity links
- `EntityRegistry` type with opportunity index
- `Microsite` type with backlinks
- `MicrositeIndex` type with stats
- `Opportunity` type with hierarchical taxonomy
- `SiteConfig` type for microsite generation

#### Graph Utilities (`packages/core/src/`)
- `registry.ts` — Entity CRUD, co-occurrence calculation, opportunity indexing
- `index-manager.ts` — Microsite CRUD, backlink calculation

#### Data Layer
- `data/entities.json` — Initial registry with 14 entities from RWA×DeFi microsite
- `data/index.json` — Microsite index with first entry
- `data/opportunities.json` — Opportunity taxonomy with 7 categories

#### Scripts
- `scripts/import-existing.ts` — Import existing microsite into graph

#### Imported Content
- RWA×DeFi January 2026 microsite imported to `microsites/rwa-defi-jan-2026/`
- Entity appearances and co-occurrences populated from imported content

### Documentation

#### Specifications Created
- `docs/MASTER_SPEC.md` — Master specification with all architecture decisions
- `docs/SPEC_PROCESSING_PIPELINE.md` — Phase 1: Processing pipeline specification
- `docs/SPEC_DATABASE_SCHEMA.md` — Phase 2: Database schema specification

#### Key Decisions Made (via elicitation)
| Decision | Choice |
|----------|--------|
| Database | Supabase |
| Portal Framework | Next.js |
| Authentication | Google OAuth (@ritual.net) |
| Processing | Direct Claude API calls |
| Microsite Visibility | Internal-only (v1) |
| Human Review | Entities only |
| Entity Deduplication | AI suggest + human confirm |
| Workflow Modularity | Full (visibility + artifacts + entity types) |
| MVP Scope | Full graph experience |
| Microsite Hosting | Static export to Vercel Blob |
| Build Order | Processing first, then portal |
| Prompt Storage | Hybrid (code defaults, DB overrides) |
| Editing | Yes - "spot treatment" capability |
| Exclusions | No collaboration, no analytics (v1) |

---

## Version History

| Version | Date | Summary |
|---------|------|---------|
| 1.0.0 | 2026-01-17 | Production deployment to Vercel |
| 0.4.0 | 2026-01-17 | Phase 3: Knowledge Graph UI, entity pages |
| 0.3.1 | 2026-01-17 | Phase 2.5b: AI features, chat interface, entity linking |
| 0.3.0 | 2026-01-16 | Phase 2 + 2.5a: Portal MVP, opportunity pipeline, Kanban UI |
| 0.2.0 | 2026-01-16 | Phase 1b: 6-stage processing pipeline, multi-AI research chain |
| 0.1.0 | 2026-01-16 | Project foundation, types, import script, master spec, child specs |

---

## Upcoming

### 1.1.0 (Planned)
- Spot Treatment Editing (Phase 4)
- Surgical artifact editing
- Section regeneration with Claude
- Version history tracking

---

*This changelog is maintained as part of the Ritual Research Graph project.*
