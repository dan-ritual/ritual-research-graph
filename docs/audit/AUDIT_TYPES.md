# Audit: Type System Analysis

> **Status:** Completed (Prompt 2)
> **Last Updated:** 2026-01-20

---

## Summary

Core types define a fixed Growth entity taxonomy and a microsite-centric data model. EntityType is a literal union, EntityAppearance sections are fixed, and Microsite/SiteConfig types assume the research pipeline. The registry is file-backed (data/entities.json) and not mode-aware. No Zod schemas exist in core and the schemas directory referenced in the audit spec is absent.

---

## Current Type Definitions

### Entity Types

| Type Name | Location | Definition Style | Extensible? |
|-----------|----------|------------------|-------------|
| EntityType | packages/core/src/types.ts | literal union | No (code change required) |
| Entity | packages/core/src/types.ts | interface (fixed fields) | Partial (metadata optional, type fixed) |
| Microsite | packages/core/src/types.ts | interface | No (microsite-specific) |
| Opportunity | packages/core/src/types.ts | interface | No (growth-only taxonomy) |

### Artifact Types

| Type Name | Location | Definition Style | Extensible? |
|-----------|----------|------------------|-------------|
| Artifact | N/A | Not defined in core | No (implicit in scripts) |

---

## Type Coupling Points

| File | Type | Coupling Issue | Impact |
|------|------|----------------|--------|
| packages/core/src/types.ts | EntityType | Hardcoded union of growth entity types | Blocks new mode entity types without code changes |
| packages/core/src/types.ts | EntityAppearance.section | Fixed section union (keyFindings/recommendations/deepDives/thesis) | Tied to microsite output structure |
| packages/core/src/types.ts | Microsite/SiteConfig | Data model assumes microsite outputs | Hard to support non-microsite modes |
| apps/portal/src/components/entities/entity-type-filter.tsx | ENTITY_TYPES | UI filter hardcodes growth entity list | UI cannot switch entity types per mode |
| scripts/stages/graph.ts | TYPE_MAP | Pipeline maps to fixed entity enums | Mode-specific entity types unsupported |

---

## Zod Schemas

| Schema | Location | Mode-Aware? | Notes |
|--------|----------|-------------|-------|
| (none) | packages/core/src | No | No Zod schemas present; schemas directory missing |

---

## Registry Analysis

**Current Pattern:**
File-backed registry in `data/entities.json` loaded/saved by `loadRegistry` and `saveRegistry` in `packages/core/src/registry.ts`. Entities are keyed by slug with reverse indexes for opportunities.

**Extensibility Assessment:**
- New entity types require editing `EntityType` union and UI filters.
- Registry is not mode-aware; single shared namespace.
- No runtime validation or Zod schema enforcement in core.

---

## Recommended Type Architecture

### For Multi-Mode Support

```typescript
export type ModeId = "growth" | "engineering" | "skunkworks";

export interface EntityTypeDefinition {
  id: string; // e.g. "company" | "feature"
  label: string;
  fields: Array<{ id: string; type: "string" | "number" | "enum" | "text" }>
}

export interface ModeConfig {
  id: ModeId;
  entityTypes: EntityTypeDefinition[];
  artifactTypes: Array<{ id: string; label: string }>;
}

export interface EntityRecord {
  id: string;
  mode: ModeId;
  type: string;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
```

---

## Extraction Plan

| Item | Current | Target | Effort |
|------|---------|--------|--------|
| Entity type definition | Literal union in core | Config-driven per-mode registry | Medium |
| Type validation | None in core | Zod or schema-driven validation per mode | Medium |
| Registry pattern | File-backed JSON | Mode-aware registry (DB-backed) | High |

---

## Notes

[Additional observations]

---

## Audit Log

- 2026-01-20: Baseline indexing completed (package.json reviewed; no .env files found; key directories indexed).
- 2026-01-20: Prompt 2 completed with strict validation (core type review + usage grep).
