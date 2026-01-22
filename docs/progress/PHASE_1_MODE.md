# PHASE_1: Mode Abstraction Layer

## Status

| Field | Value |
|-------|-------|
| **Status** | `Not Started` |
| **Started** | - |
| **Target** | +20 days from start |
| **Completed** | - |
| **Owner** | Daniel + AI Assistants |

---

## Win Conditions

### Mode System (SPEC_1_MODE_SYSTEM.md)

- [ ] Mode can be switched via URL path (`/growth/*`, `/engineering/*`)
- [ ] Mode configuration loaded from TypeScript config files
- [ ] New entity types can be added by editing config file
- [ ] Pipeline stages configurable per mode via config
- [ ] All existing Growth functionality preserved (zero regression)

### Schema Split (SPEC_1_SCHEMA_SPLIT.md)

- [ ] Existing data migrated from `public.*` to `growth.*` without loss
- [ ] `engineering.*` schema created and empty
- [ ] `product.*` schema created and empty
- [ ] `shared.*` schema created with users and cross_links tables
- [ ] RLS policies updated for multi-schema access
- [ ] All existing queries work against new schema

### Theme System

- [ ] CSS variables defined for mode theming
- [ ] Mode-aware color switching works
- [ ] All hardcoded colors replaced with variables

**Progress:** 0/13 complete

---

## Decisions Made

| Decision | Options Considered | Rationale | Date | Impact |
|----------|-------------------|-----------|------|--------|
| Code-driven entity types | Code vs DB | Type-safe, simpler, future DB path documented | 2026-01-20 | Mode system design |
| Maintenance window | Zero-downtime vs window | Simpler, acceptable for internal tool | 2026-01-20 | Schema migration |
| Sequential pipeline | Sequential vs parallel | Keep simple, optimize later | 2026-01-20 | Pipeline config |
| Manual cross-links | Manual vs AI | Start simple, AI deferred | 2026-01-20 | Cross-linking scope |

---

## Learnings

| Learning | Context | Apply To | Priority |
|----------|---------|----------|----------|
| (To be filled during implementation) | | | |

---

## Blockers Encountered

| Blocker | Impact | Resolution | Days Blocked |
|---------|--------|------------|--------------|
| None yet | | | |

---

## Key Files Changed

| File | Change Type | Purpose |
|------|-------------|---------|
| (To be filled during implementation) | | |

---

## Metrics

| Metric | Target | Actual | Notes |
|--------|--------|--------|-------|
| Mode switch latency | < 100ms | TBD | |
| Zero regression | 100% tests pass | TBD | |
| Data integrity | 100% preserved | TBD | |

---

## Handoff Notes

### For Next Session

1. Read `CURSOR_PHASE_1_PAYLOAD.md` for implementation context
2. Start with Mode System foundation (Day 1-3)
3. Create types.ts first, then configs

### Outstanding Items

- [ ] All win conditions above

### Risks Identified

- Circular FK in schema (microsites ↔ generation_jobs)
- Enum hardcoding requires replacement strategy
- Component updates may have hidden dependencies

---

## Session Log

### 2026-01-20

- Phase 1 specs finalized with elicitation decisions
- Created CURSOR_PHASE_1_PAYLOAD.md for Cursor handoff
- Ready to begin implementation
