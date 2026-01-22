# Audit: Effort Estimates

> **Status:** Completed (Prompt 6)
> **Last Updated:** 2026-01-20

---

## Summary

Largest effort centers on schema split and mode-aware type/pipeline extraction. Portal mode support and theme switching are moderate, while cross-mode linking is gated by schema and mode config. Estimates assume 1-2 engineers with focused effort and light QA.

---

## Effort by Area

### 1. Type System Extraction

| Task | Files Affected | Complexity | Risk | Duration | Dependencies |
|------|----------------|------------|------|----------|--------------|
| Mode config + entity registry | packages/core/**, docs/specs | High | Med | 4d | None |
| Update scripts to use registry | scripts/** | Med | Med | 3d | Mode config |
| Update portal entity components | apps/portal/src/** | High | Med | 3d | Mode config |

**Subtotal:** 10 days

---

### 2. Database Schema Split

| Task | Files Affected | Complexity | Risk | Duration | Dependencies |
|------|----------------|------------|------|----------|--------------|
| Define schemas + enums replacement | supabase/migrations/** | High | High | 4d | Mode config |
| Data migration + FK updates | supabase/migrations/** | High | High | 5d | Schema definition |
| Update app/query layer | apps/portal/src/**, scripts/** | High | High | 3d | Data migration |

**Subtotal:** 12 days

---

### 3. Pipeline Configuration System

| Task | Files Affected | Complexity | Risk | Duration | Dependencies |
|------|----------------|------------|------|----------|--------------|
| Extract stage registry | scripts/generate.ts, scripts/stages/** | Med | Med | 3d | Mode config |
| Add pipeline config per mode | packages/core/**, scripts/** | Med | Med | 2d | Stage registry |
| Provider adapters + tests | scripts/lib/** | Med | Med | 2d | Stage registry |

**Subtotal:** 7 days

---

### 4. Portal Mode Support

| Task | Files Affected | Complexity | Risk | Duration | Dependencies |
|------|----------------|------------|------|----------|--------------|
| Mode-prefixed routing + nav | apps/portal/src/app/**, components/layout/** | Med | Med | 3d | Mode config |
| Mode-scoped queries | apps/portal/src/** | High | High | 3d | Schema split |
| UI copy + labels per mode | apps/portal/src/** | Low | Low | 2d | Mode config |

**Subtotal:** 8 days

---

### 5. Theme System

| Task | Files Affected | Complexity | Risk | Duration | Dependencies |
|------|----------------|------------|------|----------|--------------|
| Mode-aware CSS variables | apps/portal/src/app/globals.css | Med | Low | 2d | Mode config |
| Theme switcher UI | apps/portal/src/components/** | Med | Low | 1d | Mode config |

**Subtotal:** 3 days

---

### 6. Cross-Mode Linking

| Task | Files Affected | Complexity | Risk | Duration | Dependencies |
|------|----------------|------------|------|----------|--------------|
| Shared cross_links schema | supabase/migrations/** | Med | Med | 2d | Schema split |
| Link UI + API | apps/portal/src/**, scripts/** | Med | Med | 2d | Mode routing |
| Link discovery rules | packages/core/** | Med | Med | 2d | Mode config |

**Subtotal:** 6 days

---

## Totals

| Area | Duration | Risk | Priority |
|------|----------|------|----------|
| Type System | 10d | Med | 1 |
| Schema Split | 12d | High | 2 |
| Pipeline Config | 7d | Med | 3 |
| Portal Mode | 8d | Med | 4 |
| Theme System | 3d | Low | 4 |
| Cross-Linking | 6d | Med | 5 |
| **TOTAL** | **46 days** | | |

---

## Dependency Graph

```
Type System ──► Pipeline Config
     │
     ▼
Schema Split ──► Portal Mode
     │
     ▼
Theme System (parallel)
     │
     ▼
Cross-Linking (after all above)
```

---

## Risk Matrix

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Schema split breaks RLS or queries | Med | High | Stage migrations + comprehensive query audit |
| Entity type expansion breaks UI | Med | Med | Config-driven rendering + fallback types |
| Pipeline config regressions | Low | Med | Golden-path tests for Growth pipeline |

---

## Recommended Sequence

1. **First:** Type system + mode config (unblocks everything else)
2. **Second:** Schema split (locks in DB shape and RLS)
3. **Parallel:** Pipeline config + portal mode support + theme system
4. **Last:** Cross-mode linking (depends on shared schema and mode IDs)

---

## Resource Requirements

| Phase | Skills Needed | Availability |
|-------|---------------|--------------|
| Type system + pipeline | TypeScript, AI pipeline | 1 engineer |
| Schema split | SQL/Supabase, migrations | 1 engineer |
| Portal mode support | Next.js/React | 1 engineer |

---

## Notes

[Additional observations]

---

## Audit Log

- 2026-01-20: Baseline indexing completed (package.json reviewed; no .env files found; key directories indexed).
- 2026-01-20: Prompt 6 completed with strict validation (effort synthesis).
