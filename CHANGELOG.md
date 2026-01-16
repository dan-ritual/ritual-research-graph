# Changelog

All notable changes to the Ritual Research Graph project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Added
- `docs/SPEC_MULTI_AI_RESEARCH.md` — **NEW** Multi-AI research chain specification
  - Grok (xAI) → Perplexity Sonar Pro → bird-cli → Claude synthesis
  - Provider configuration and API clients
  - Parallel execution with fallback strategy
  - Full prompt templates for each step

### Changed
- **Implementation sequence reordered** — Database (Phase 1a) now comes BEFORE Pipeline (Phase 1b)
- `docs/SPEC_PROCESSING_PIPELINE.md` — Major update
  - Now Phase 1b (requires Phase 1a database setup)
  - Removed local JSON storage, now writes to Supabase
  - Added multi-AI research chain (Stage 2)
  - Added Grok, Perplexity, bird-cli API clients
  - Added microsite template injection (from defi-rwa)
  - Updated to 6 pipeline stages
- `docs/SPEC_DATABASE_SCHEMA.md` — Updated
  - Now Phase 1a (prerequisite for Pipeline)
  - Added authentication decisions (Google OAuth at Supabase level)
  - Added CLI authentication (service role key)
- `docs/MASTER_SPEC.md` — Major update
  - Status changed to "Complete (Ready for Implementation)"
  - Implementation phases restructured (1a, 1b, 2, 3, 4)
  - Child specification registry updated
  - Added SPEC_MULTI_AI_RESEARCH.md to registry

### Elicitation Decisions (2026-01-16)
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
| 0.1.0 | 2026-01-16 | Project foundation, types, import script, master spec, child specs |

---

## Upcoming

### 0.2.0 (Planned)
- Processing pipeline (CLI-based generation)
- Artifact generation prompts
- Entity extraction

### 0.3.0 (Planned)
- Supabase database setup
- API routes
- Vercel Blob storage

### 0.4.0 (Planned)
- Portal MVP (Next.js)
- Authentication
- Generation wizard

---

*This changelog is maintained as part of the Ritual Research Graph project.*
