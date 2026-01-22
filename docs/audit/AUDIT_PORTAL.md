# Audit: Portal UI Analysis

> **Status:** Completed (Prompt 4)
> **Last Updated:** 2026-01-20

---

## Summary

Portal routes and navigation are single-mode and Growth-centric (microsites, entities, pipeline). UI copy, entity filters, and type-specific styling assume the research domain. Theme tokens are centralized but hardcoded to blue accent with no mode switch. Supabase queries are unscoped to a mode/schema.

---

## Route Structure

### Current Routes

| Route | File | Purpose | Mode-Specific? |
|-------|------|---------|----------------|
| / | apps/portal/src/app/page.tsx | Dashboard | Yes (research microsites) |
| /microsites | apps/portal/src/app/microsites/page.tsx | Microsite list | Yes |
| /entities | apps/portal/src/app/entities/page.tsx | Entity list | Yes |
| /pipeline | apps/portal/src/app/pipeline/page.tsx | Opportunity pipeline | Yes |
| /jobs/[id] | apps/portal/src/app/jobs/[id]/page.tsx | Job status + review | Yes (pipeline-specific) |

### Route Assumptions

| Route | Assumption | Issue |
|-------|------------|-------|
| /microsites | Microsites are primary output | Engineering/Skunkworks outputs differ |
| /entities | Single global entity taxonomy | Needs mode-specific entity types |
| /pipeline | Growth opportunity pipeline is global | Engineering pipeline is different shape |

---

## Component Analysis

### Shared Components

| Component | File | Purpose | Mode-Agnostic? |
|-----------|------|---------|----------------|
| Header | apps/portal/src/components/layout/header.tsx | Global nav + branding | No (Growth naming, fixed routes) |
| StatusBadge | apps/portal/src/components/ui/status-badge.tsx | Job status display | Partially (statuses are growth-specific) |
| PipelineColumn | apps/portal/src/components/pipeline/pipeline-column.tsx | Pipeline layout | No (opportunity stages) |

### Entity-Specific Components

| Component | File | Entity Type Assumed | Needs Abstraction? |
|-----------|------|---------------------|-------------------|
| EntityTypeFilter | apps/portal/src/components/entities/entity-type-filter.tsx | company/protocol/person/concept/opportunity | Yes |
| EntityCard | apps/portal/src/components/entities/entity-card.tsx | Growth entity metadata | Yes |
| MicrositeCard | apps/portal/src/components/features/microsite-card.tsx | Microsite output | Yes |
| RelatedResearchPanel | apps/portal/src/components/microsites/related-research-panel.tsx | Microsite relationships | Yes |

---

## Theming Analysis

**Current Theme Location:** `apps/portal/src/styles/tokens.ts` and `apps/portal/src/app/globals.css`

**Color Hardcoding:**
| File | Line(s) | Hardcoded Value | Should Be Variable |
|------|---------|-----------------|-------------------|
| apps/portal/src/app/globals.css | 64-79 | --accent/#3B5FE6 | Mode accent variable |
| apps/portal/src/components/layout/header.tsx | 45-73 | text-[#3B5FE6] | Mode accent variable |
| apps/portal/src/app/page.tsx | 93-126 | text-[#3B5FE6] | Mode accent variable |

**CSS Variable Usage:**
| Variable | Value | Used In |
|----------|-------|---------|
| --accent | #3B5FE6 | global theme (accent) |
| --background | #FBFBFB | global page background |

---

## Data Fetching

| File | Query | Table/Schema | Mode-Aware? |
|------|-------|--------------|-------------|
| apps/portal/src/app/page.tsx | from("microsites"|"entities"|"generation_jobs") | public.* | No |
| apps/portal/src/app/pipeline/page.tsx | from("pipeline_workflows"|"pipeline_stages"|"opportunities") | public.* | No |
| apps/portal/src/app/api/entities/route.ts | from("entities") | public.* | No |

---

## Navigation

**Current Nav Structure:**
Header nav links to Dashboard, Microsites, Entities, Pipeline with fixed labels and brand "Ritual Research Graph".

**Mode-Awareness:**
- Navigation is hardcoded.
- No mode selector or per-mode nav definitions.

---

## Gap Analysis

| Need | Current State | Gap | Effort to Fill |
|------|---------------|-----|----------------|
| Mode selector | Not present | Add global mode switch + URL routing | Medium |
| Theme switching | Single blue accent | Mode-based CSS variables | Medium |
| Generic entity components | Growth-specific components | Config-driven entity rendering | High |
| Mode-scoped queries | public.* tables | Schema/mode-aware query layer | High |

---

## Notes

[Additional observations]

---

## Audit Log

- 2026-01-20: Baseline indexing completed (package.json reviewed; no .env files found; key directories indexed).
- 2026-01-20: Prompt 4 completed with strict validation (routes/components/theme/query review).
