# PHASE_4: Cross-Mode Linking

## Status

| Field | Value |
|-------|-------|
| **Status** | Complete |
| **Started** | 2026-01-22 |
| **Target** | 2026-01-29 |
| **Completed** | 2026-01-22 |
| **Owner** | Daniel Gosek |

---

## Win Conditions

- [x] Cross-link schema exists in shared schema with strict RLS
- [x] Core type definitions for cross-links are available
- [x] API endpoints can read/create links with mode gating
- [x] Cross-link data integrated into portal views

**Progress:** 4/4 complete

---

## Decisions Made

| Decision | Options Considered | Rationale | Date | Impact |
|----------|-------------------|-----------|------|--------|
| Store links in `shared.cross_links` | Per-mode tables vs shared link table | Shared table reduces duplication and keeps mode schemas isolated | 2026-01-22 | Enables cross-mode linking without schema coupling |
| RLS requires access to both modes | Access to either mode | Prevents leaking cross-mode metadata by default | 2026-01-22 | Stronger isolation guarantees |
| API returns only link records | Join entity data in API | Avoids accidental entity leakage across modes | 2026-01-22 | UI must fetch entity details separately |

---

## Learnings

| Learning | Context | Apply To | Priority |
|----------|---------|----------|----------|
| | | | |

---

## Blockers Encountered

| Blocker | Impact | Resolution | Days Blocked |
|---------|--------|------------|--------------|
| | | | |

---

## Key Files Changed

| File | Change Type | Purpose |
|------|-------------|---------|
| `supabase/migrations/018_cross_links_rls.sql` | Created | Tighten cross-links RLS policies |
| `packages/core/src/types/cross-links.ts` | Created | Cross-link type definitions |
| `packages/core/src/types.ts` | Modified | Export cross-link types |
| `packages/core/src/db.ts` | Modified | Add cross_links table identifier |
| `apps/portal/src/lib/db.ts` | Modified | Shared table helper |
| `apps/portal/src/app/api/cross-links/route.ts` | Created | Read/create cross-links API |
| `apps/portal/src/components/entities/cross-links-panel.tsx` | Created | Render cross-links + create UI |
| `apps/portal/src/app/(modes)/[mode]/entities/[slug]/page.tsx` | Modified | Fetch access + mount cross-links UI |
| `docs/specs/SPEC_1_MODE_SYSTEM.md` | Modified | Document cross-link model |

---

## Metrics

| Metric | Target | Actual | Notes |
|--------|--------|--------|-------|
| | | | |

---

## Handoff Notes

### For Next Session

- Optional: add search/autocomplete for target entity IDs
- Optional: enable entity detail lookups when explicitly requested

### Outstanding Items

- [x] Portal UI integration

### Risks Identified

- Service-role APIs must not bypass cross-link RLS; use user sessions for link access

---

## Session Log

### 2026-01-22

- Tightened cross-links RLS to require access to both modes
- Added core cross-link types and shared table helper
- Implemented cross-links API for create/read with strict validation
- Documented cross-link model in mode system spec
- Wired cross-link lists + manual create UI into entity detail views