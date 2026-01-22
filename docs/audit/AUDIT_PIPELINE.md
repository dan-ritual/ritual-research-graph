# Audit: Pipeline Architecture Analysis

> **Status:** Completed (Prompt 3)
> **Last Updated:** 2026-01-20

---

## Summary

Pipeline is a single hardcoded 6-stage sequence in `scripts/generate.ts`, with optional Stage 2 (external research) and Stage 5b (blob upload). Orchestration is procedural and tightly couples artifact IDs, entity types, and microsite output. AI providers are embedded in stage implementations (Claude for stages 1/3/4 + synthesis, Grok/Perplexity/bird for research).

---

## Current Pipeline Flow

```
scripts/generate.ts (CLI entry)
    │
    ▼
Stage 1: Artifacts (Claude)
    │
    ▼
Stage 2: Research Chain (Grok/Perplexity/bird -> Claude synth) [optional]
    │
    ▼
Stage 3: Entity Extraction (Claude)
    │
    ▼
Stage 4: SITE_CONFIG (Claude)
    │
    ▼
Stage 5: Microsite Build (Vite)
    │
    ▼
Stage 5b: Upload to Blob (Vercel) [optional]
    │
    ▼
Stage 6: Graph Integration (Supabase)
```

---

## Stage Inventory

| Stage | File | Input | Output | AI Provider | Required? | Order |
|-------|------|-------|--------|-------------|-----------|-------|
| Artifacts | scripts/stages/artifacts.ts | Transcript file | cleaned transcript, intelligence brief, strategic questions | Claude | Yes | 1 |
| Research Chain | scripts/stages/research.ts | intelligence brief, preliminary entities | narrative research artifact | Grok, Perplexity, bird, Claude | Optional (keys) | 2 |
| Entity Extraction | scripts/stages/entities.ts | intelligence brief, narrative research | entities + opportunities artifacts | Claude | Yes | 3 |
| SITE_CONFIG | scripts/stages/site-config.ts | artifacts + entities | site_config artifact | Claude | Yes | 4 |
| Microsite Build | scripts/stages/microsite.ts | site_config + artifacts | static site dist | None (build tooling) | Yes | 5 |
| Blob Upload | scripts/generate.ts | dist path | blob path | Vercel Blob | Optional | 5b |
| Graph Integration | scripts/stages/graph.ts | artifacts + entities + site_config | DB records (jobs, artifacts, entities, microsites) | None (Supabase) | Optional | 6 |

---

## Entry Point Analysis

**Main Orchestrator:** `scripts/generate.ts`

**Invocation Pattern:**
```bash
npm run generate
# or
npx tsx scripts/generate.ts --transcript <path> [--workflow <type>]
```

**Configuration:**
Stage order and required stages are hardcoded in `generate.ts` (lines 344-490). A few flags control skipping (`--skip-build`, `--dry-run`, `--regenerate`) and environment keys gate Stage 2 and Stage 6/5b. No external pipeline config exists.

---

## Stage Dependencies

| Stage | Depends On | Blocking? | Can Skip? |
|-------|------------|-----------|-----------|
| Artifacts | Transcript input | Yes | No |
| Research Chain | Artifacts (intelligence brief) | No (optional) | Yes (if no external keys) |
| Entity Extraction | Artifacts + research output | Yes | No |
| SITE_CONFIG | Artifacts + entities | Yes | No |
| Microsite Build | SITE_CONFIG + artifacts | Yes | No |
| Blob Upload | Microsite build | No | Yes (if no blob token/skip build) |
| Graph Integration | Microsite build + artifacts | No (if Supabase missing) | Yes |

---

## AI Provider Integration

| Provider | Location | Usage | Mode-Specific? |
|----------|----------|-------|----------------|
| Claude | scripts/lib/claude.ts + stages 1/3/4/2 | Core generation + synthesis | No (hardcoded prompts are research-specific) |
| Grok | scripts/lib/grok.ts + research.ts | Real-time research input | No (prompt tied to research topic/entities) |
| Perplexity | scripts/lib/perplexity.ts + research.ts | Web research + citations | No (prompt tied to research topic/entities) |
| bird-cli | scripts/lib/bird.ts + research.ts | Twitter search via SSH | No (entity list assumption) |

---

## Rigidity Points

| File | Issue | Why It Blocks Multi-Mode |
|------|-------|--------------------------|
| scripts/generate.ts | Stage order and IDs hardcoded (Stage 1-6) | Cannot reorder or swap stages per mode |
| scripts/stages/research.ts | Hardcoded entity patterns for RWA/DeFi list | Skews research stage to Growth mode entities |
| scripts/stages/site-config.ts | SITE_CONFIG schema and artifact labels fixed | Output format tied to microsite research model |
| scripts/stages/graph.ts | Writes to public tables (microsites/entities/artifacts) | No mode-scoped pipeline outputs |

---

## Recommended Architecture

### For Mode-Configurable Pipeline

```typescript
interface PipelineConfig {
  mode: "growth" | "engineering" | "skunkworks";
  stages: Array<{
    id: string;
    name: string;
    provider?: "claude" | "grok" | "perplexity" | "bird" | "internal";
    optional?: boolean;
    config?: Record<string, unknown>;
  }>;
}
```

---

## Extraction Plan

| Item | Current | Target | Effort |
|------|---------|--------|--------|
| Stage orchestration | Hardcoded sequential flow | Config-driven pipeline runner | Medium |
| Stage configuration | Inline constants + env checks | Mode-based pipeline config | Medium |
| Provider abstraction | Providers embedded in stages | Provider adapter interface | Medium |

---

## Notes

[Additional observations]

---

## Audit Log

- 2026-01-20: Baseline indexing completed (package.json reviewed; no .env files found; key directories indexed).
- 2026-01-20: Prompt 3 completed with strict validation (stage and provider review).
