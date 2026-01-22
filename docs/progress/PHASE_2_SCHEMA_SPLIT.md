# PHASE_2: Schema Split

## Status

| Field | Value |
|-------|-------|
| **Status** | In Progress |
| **Started** | 2026-01-22 |
| **Target** | 2026-02-03 |
| **Completed** |  |
| **Owner** | Codex |

---

## Win Conditions

- [ ] Existing data migrated from public.* to growth.* without loss
- [ ] engineering.* schema created and empty
- [ ] skunkworks.* schema created and empty
- [ ] shared.* schema created with users, cross_links, mode_config tables
- [ ] RLS policies updated for multi-schema access
- [ ] All existing queries work against new schema

**Progress:** 0/6 complete

---

## Decisions Made

| Decision | Options Considered | Rationale | Date | Impact |
|----------|-------------------|-----------|------|--------|
| Use shared schema for users and auth helpers | Keep users in growth | Aligns with cross-mode user access | 2026-01-22 | Shared functions and FK updates |
| RPC calls set schema explicitly | Keep RPC in public | Ensure mode-specific functions | 2026-01-22 | API/script updates |

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
| supabase/migrations/008_create_schemas.sql | Created | Create growth/engineering/skunkworks/shared schemas |
| supabase/migrations/009_create_shared_tables.sql | Created | Shared users + cross_links + mode_config |
| supabase/migrations/010_create_growth_tables.sql | Created | Growth table structure + drop FKs |
| supabase/migrations/011_create_mode_tables.sql | Created | Engineering/skunkworks table structure |
| supabase/migrations/012_migrate_public_to_growth.sql | Created | Copy public data into growth |
| supabase/migrations/013_add_constraints_functions_rls.sql | Created | Rebind FKs, functions, RLS, realtime |
| packages/core/src/db.ts | Modified | Mode schema map + explicit mode helpers |
| apps/portal/src/lib/db.ts | Modified | Explicit schema helpers + shared schema export |

---

## Metrics

| Metric | Target | Actual | Notes |
|--------|--------|--------|-------|
| | | | |

---

## Handoff Notes

### For Next Session

- Run migrations in Supabase and validate row counts + RLS.
- Verify RPC functions resolve in mode schemas.

### Outstanding Items

- [ ] Run migrations in target environment
- [ ] Smoke test portal queries per mode

### Risks Identified

- Realtime publication updates may need manual verification in Supabase

---

## Session Log

### 2026-01-22

- Added schema split migrations for shared + mode schemas and data copy
- Wired explicit schema mode handling across API, scripts, and worker
- Routed RPC calls through schema-aware clients
