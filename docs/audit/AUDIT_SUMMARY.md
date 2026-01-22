# Audit: Executive Summary

> **Status:** Completed
> **Last Updated:** 2026-01-20

---

## TL;DR

The current system is tightly coupled to a single Growth mode: fixed entity types, microsite outputs, and public-schema tables. Moving to multi-mode requires a mode-config layer, schema split, and pipeline configuration extraction. Effort is moderate-to-high (est. ~46 days) with the highest risk in schema migration and type system refactors.

---

## Key Findings

### 1. Schema Coupling in public.*

**Severity:** High
**Impact:** Blocks mode isolation and safe RLS separation
**Recommendation:** Split to growth/engineering/product/shared schemas and update queries

### 2. Fixed Entity Types and Artifacts

**Severity:** High
**Impact:** Prevents adding new mode entity types without code change
**Recommendation:** Introduce mode config + registry, replace unions/enums

### 3. Portal Single-Mode Assumptions

**Severity:** Medium
**Impact:** Routes, nav, UI copy, and queries assume microsites + growth
**Recommendation:** Add mode selector, mode-prefixed routes, and config-driven UI

---

## Architecture Assessment

### Current State

Single Next.js portal, single pipeline, and a `public.*` schema with microsites as the primary output. Entity types and artifact types are fixed to Growth.

### Target State

Mode-configured portal with selector, multi-schema database (growth/engineering/product/shared), configurable pipelines per mode, and cross-mode linking.

### Gap

Missing mode config layer, schema split, pipeline configuration system, and UI routing/theme abstraction.

---

## Extraction Priority Order

Based on dependencies, risk, and value:

| Priority | Area | Rationale | Blocks |
|----------|------|-----------|--------|
| 1 | Type system + mode config | Unblocks all other layers | Pipeline, Portal, Schema decisions |
| 2 | Schema split | Enables mode isolation + RLS | Portal mode queries, cross-links |
| 3 | Pipeline configuration | Needed for Engineering mode | Engineering mode build |
| 4 | Portal mode support | Route + nav + UI abstractions | Theme + mode UX |
| 5 | Cross-mode linking | Depends on shared schema | None |

---

## Effort Summary

| Phase | Effort | Risk | Dependencies |
|-------|--------|------|--------------|
| Phase 1: Mode Abstraction | ~32 days | High | Audit |
| Phase 2: Growth Completion | TBD | Med | Phase 1 |
| Phase 3: Engineering Mode | TBD | Med | Phase 1, 2 |
| Phase 4: Cross-Linking | ~6 days | Med | Phase 1-3 |
| **Total** | **~38+ days** | | |

---

## Go/No-Go Assessment

### Proceed with Multi-Mode

**Recommendation:** CAUTION

**Rationale:**
Feasible but requires careful schema migration and type system refactor to avoid regressions.

**Conditions for GO:**
- [ ] Decide entity type source of truth (config vs DB)
- [ ] Approve schema split plan with migration sequence
- [ ] Define mode configuration contract

---

## Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| Schema migration breaks RLS or queries | High | Staged migrations + full query audit |
| Entity type changes break UI | Medium | Config-driven rendering + fallback types |
| Pipeline refactor slows delivery | Medium | Golden-path tests for Growth pipeline |

---

## Open Questions for Elicitation

After audit, these questions need answers before implementation:

1. Should entity types be database-driven or code-driven per mode?
2. Can schema migration happen without downtime or in read-only windows?
3. Should pipeline stages run in parallel where possible?
4. What confidence threshold for cross-mode link auto-creation?

---

## Next Steps

1. [ ] Review audit findings with team
2. [ ] Resolve open questions via elicitation
3. [ ] Update MASTER_SPEC_V2.md with audit insights
4. [ ] Finalize child specs for Phase 1
5. [ ] Begin Phase 1 implementation

---

## Detailed Reports

| Report | Purpose | Link |
|--------|---------|------|
| Coupling Analysis | Hardcoded assumptions | [AUDIT_COUPLING.md](./AUDIT_COUPLING.md) |
| Type System | Entity/type architecture | [AUDIT_TYPES.md](./AUDIT_TYPES.md) |
| Pipeline | Execution chain analysis | [AUDIT_PIPELINE.md](./AUDIT_PIPELINE.md) |
| Portal | UI/UX assumptions | [AUDIT_PORTAL.md](./AUDIT_PORTAL.md) |
| Schema | Database structure | [AUDIT_SCHEMA.md](./AUDIT_SCHEMA.md) |
| Effort | Time estimates | [AUDIT_EFFORT.md](./AUDIT_EFFORT.md) |

---

## Audit Log

- 2026-01-20: Baseline indexing completed (package.json reviewed; no .env files found; key directories indexed).
- 2026-01-20: Audit summary consolidated.
