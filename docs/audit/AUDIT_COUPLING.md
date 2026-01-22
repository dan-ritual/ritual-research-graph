# Audit: Coupling Analysis

> **Status:** Completed (Prompt 1)
> **Last Updated:** 2026-01-20

---

## Summary

Coupling is concentrated in portal UI copy/navigation, pipeline constants, and script stages. The UI and generated content use research/microsite terminology and Growth-centric entity types. Supabase queries are hardcoded to public tables (microsites, entities, opportunities) without mode scoping. Routes are single-mode (no /{mode} prefix), so multi-mode requires route and config extraction.

---

## Hardcoded "Research" References

| File | Line(s) | Code Snippet | Issue | Extraction Needed |
|------|---------|--------------|-------|-------------------|
| apps/portal/src/app/page.tsx | 81-82 | "Transform meeting transcripts into interconnected research microsites" | Research-specific UI copy | Move copy to mode config and render per mode |
| apps/portal/src/app/page.tsx | 133-142 | "Start a new research session" / "+ New Research" | CTA assumes research mode | Mode-aware CTA label and target route |
| apps/portal/src/app/microsites/page.tsx | 50-55 | "Browse all generated research microsites" / "+ New Research" | Microsite + research framing hardcoded | Mode-scoped copy and route |
| scripts/stages/site-config.ts | 59-95 | "Research" fallback + research-topic descriptions | Research-only pipeline vocabulary | Move artifact labels/descriptions to mode config |
| scripts/stages/microsite.ts | 212-233 | "Ritual Research Graph" / "generated research data" | Generated README locked to research mode | Mode-aware templating for generated outputs |

---

## Hardcoded "Entity" Assumptions

| File | Line(s) | Code Snippet | Issue | Extraction Needed |
|------|---------|--------------|-------|-------------------|
| apps/portal/src/app/entities/[slug]/page.tsx | 11-24 | getTypeColor switch (company/person/protocol/concept/opportunity) | Growth entity types hardcoded in UI | Use mode entity registry + theme mapping |
| scripts/stages/graph.ts | 36-43 | TYPE_MAP for entity types | Fixed entity taxonomy in pipeline | Pull types from mode config/registry |
| apps/portal/src/constants/index.ts | 41-47 | JobStatus includes extracting_entities/awaiting_entity_review | Status naming assumes entity extraction stage | Replace with mode-configured stage ids |
| scripts/stages/graph.ts | 266-276 | entityType = TYPE_MAP[entity.type] | Type coercion to fixed enums | Move to per-mode type validation |

---

## Hardcoded "Artifact" References

| File | Line(s) | Code Snippet | Issue | Extraction Needed |
|------|---------|--------------|-------|-------------------|
| scripts/stages/microsite.ts | 120-127 | artifactList fixed to transcript/brief/questions/etc | Artifact set fixed to research pipeline | Make artifact list stage-configurable |
| scripts/stages/site-config.ts | 65-104 | Artifact IDs/descriptions (intelligence-brief, strategic-questions) | Research-specific artifact taxonomy | Move artifact metadata to mode config |
| scripts/stages/graph.ts | 198-249 | artifactRecords types (cleaned_transcript, intelligence_brief, ...) | Fixed artifact types persisted | Define per-mode artifact registry |

---

## Hardcoded "Microsite" References

| File | Line(s) | Code Snippet | Issue | Extraction Needed |
|------|---------|--------------|-------|-------------------|
| apps/portal/src/components/features/microsite-card.tsx | 12-88 | Microsite model + /microsites links | UI output assumes microsite primary artifact | Replace with mode output card abstraction |
| apps/portal/src/components/microsites/related-research-panel.tsx | 20-83 | Related Research + /api/microsites/{id}/related | Microsite-specific relationship logic | Replace with mode-aware related-entities API |
| scripts/stages/graph.ts | 95-107,302-338 | createMicrosite(...) and microsite slugging | Pipeline persists microsite output | Mode-scoped output table or generic artifact output |

---

## Single-Mode Route Assumptions

| File | Route Pattern | Issue | Extraction Needed |
|------|---------------|-------|-------------------|
| apps/portal/src/app/microsites/page.tsx | /microsites | Single-mode microsite list | Introduce /{mode}/microsites or mode-aware routing |
| apps/portal/src/app/entities/page.tsx | /entities | Single-mode entity list | Mode-prefixed routing + mode data scope |
| apps/portal/src/app/pipeline/page.tsx | /pipeline | Growth pipeline baked into global route | Mode-specific pipeline route and nav |

---

## Database Query Assumptions

| File | Line(s) | Query Pattern | Issue | Extraction Needed |
|------|---------|---------------|-------|-------------------|
| apps/portal/src/app/page.tsx | 36-45 | supabase.from("microsites"|"entities"|"generation_jobs"|"opportunities") | Unscoped public tables | Add schema/mode scoping in queries |
| apps/portal/src/app/api/entities/route.ts | 22-35 | supabase.from("entities") with type filter | Entity queries assume single schema | Use mode-aware table/schema selection |
| apps/portal/src/app/api/microsites/route.ts | 9-20 | supabase.from("microsites") | Microsite list hardcoded to public | Replace with mode output table |
| scripts/stages/graph.ts | 253-270 | supabase.from('artifacts'|'entities') | CLI writes to public tables | Mode-scoped schema + config-driven table names |

---

## Priority Ranking

| Rank | Area | Files Affected | Risk | Recommendation |
|------|------|----------------|------|----------------|
| 1 | Supabase table/schema hardcoding | apps/portal/src/**, scripts/** | High | Introduce mode-aware DB access layer and schema prefixing |
| 2 | Entity type rigidity | apps/portal/src/**, scripts/stages/graph.ts | High | Centralize entity registry per mode and replace hardcoded maps |
| 3 | Research/microsite UI copy and routes | apps/portal/src/app/**, components/** | Medium | Add mode routes and copy via mode config |

---

## Notes

[Additional observations from audit]

---

## Audit Log

- 2026-01-20: Baseline indexing completed (package.json reviewed; no .env files found; key directories indexed).
- 2026-01-20: Prompt 1 completed with strict validation (grep scan + targeted reads).
