# PHASE_2: RLS Enhancement

## Status

| Field | Value |
|-------|-------|
| **Status** | Ready for Review |
| **Started** | 2026-01-22 |
| **Target** | 2026-01-23 |
| **Completed** |  |
| **Owner** | Claude |

---

## Summary

Added JWT/claims-based mode isolation and user-mode access control via migrations 014-016.

**Migration 014**: Added `user_mode_access` table and helper functions
**Migration 015**: Replaced ALL overly permissive policies with mode-gated versions
**Migration 016**: Closed public microsite leak in engineering/skunkworks

---

## Changes Made

### Migration 014: Mode Isolation via RLS

| Component | Description |
|-----------|-------------|
| `shared.user_mode_access` | New table tracking which users can access which modes |
| `shared.user_has_mode_access(mode)` | Function to check if current user has mode access |
| `shared.get_user_modes()` | Function to get all modes current user can access |
| `shared.get_jwt_mode()` | Extract mode from JWT app_metadata claims |
| `shared.get_request_mode()` | Get mode from request header or fall back to JWT |

### Migration 015: Tighten Mode Isolation

| Component | Description |
|-----------|-------------|
| Drop old engineering policies | Removed all policies from 013 that lacked mode checks |
| Drop old skunkworks policies | Removed all policies from 013 that lacked mode checks |
| Engineering mode-gated policies | 55 new policies covering SELECT/INSERT/UPDATE/DELETE |
| Skunkworks mode-gated policies | 55 new policies covering SELECT/INSERT/UPDATE/DELETE |
| Growth unchanged | Remains open to all authenticated users |

### Access Control Model

| Mode | Access Rule |
|------|-------------|
| `growth` | Open to all authenticated users (default) |
| `engineering` | Requires explicit grant in `user_mode_access` or admin role |
| `skunkworks` | Requires explicit grant in `user_mode_access` or admin role |

### API Route Verification

All 33 API routes that access mode-specific tables correctly use:
- `resolveMode()` - Resolve mode from param/header/cookie
- `getSchemaTable()` - Build schema-qualified table name

One route uses storage bucket `transcripts` (not a table) - this is correct.

---

## Policy Checklist

### Shared Schema

| Table | RLS Enabled | Policies |
|-------|-------------|----------|
| `shared.users` | Yes | Own profile read/update, admin read all |
| `shared.cross_links` | Yes | Authenticated read/create |
| `shared.mode_config` | Yes | Authenticated read, admin manage |
| `shared.user_mode_access` | Yes | Own access read, admin grant/revoke |

### Growth Schema (Open to all authenticated)

| Table | RLS Enabled | Mode Check | Operations |
|-------|-------------|------------|------------|
| `growth.generation_jobs` | Yes | N/A | All original policies |
| `growth.artifacts` | Yes | N/A | All original policies |
| `growth.microsites` | Yes | N/A | All original policies |
| `growth.entities` | Yes | N/A | All original policies |
| `growth.entity_appearances` | Yes | N/A | All original policies |
| `growth.entity_relations` | Yes | N/A | All original policies |
| `growth.opportunities` | Yes | N/A | All original policies |
| `growth.entity_opportunities` | Yes | N/A | All original policies |
| `growth.pipeline_workflows` | Yes | N/A | All original policies |
| `growth.pipeline_stages` | Yes | N/A | All original policies |
| `growth.opportunity_owners` | Yes | N/A | All original policies |
| `growth.opportunity_entities` | Yes | N/A | All original policies |
| `growth.opportunity_activity` | Yes | N/A | All original policies |
| `growth.entity_aliases` | Yes | N/A | All original policies |

### Engineering Schema (Requires mode access)

| Table | RLS Enabled | Mode Check | Operations Covered |
|-------|-------------|------------|-------------------|
| `engineering.generation_jobs` | Yes | ✅ | SELECT, INSERT, UPDATE |
| `engineering.artifacts` | Yes | ✅ | SELECT, INSERT, UPDATE, DELETE |
| `engineering.microsites` | Yes | ✅ | SELECT (incl. public), INSERT, UPDATE, DELETE |
| `engineering.entities` | Yes | ✅ | SELECT, INSERT, UPDATE, DELETE |
| `engineering.entity_appearances` | Yes | ✅ | SELECT, INSERT, UPDATE, DELETE |
| `engineering.entity_relations` | Yes | ✅ | SELECT, INSERT, UPDATE, DELETE |
| `engineering.opportunities` | Yes | ✅ | SELECT, INSERT, UPDATE, DELETE |
| `engineering.entity_opportunities` | Yes | ✅ | SELECT, INSERT, UPDATE, DELETE |
| `engineering.pipeline_workflows` | Yes | ✅ | SELECT, INSERT, UPDATE, DELETE |
| `engineering.pipeline_stages` | Yes | ✅ | SELECT, INSERT, UPDATE, DELETE |
| `engineering.opportunity_owners` | Yes | ✅ | SELECT, INSERT, UPDATE, DELETE |
| `engineering.opportunity_entities` | Yes | ✅ | SELECT, INSERT, UPDATE, DELETE |
| `engineering.opportunity_activity` | Yes | ✅ | SELECT, INSERT |
| `engineering.entity_aliases` | Yes | ✅ | SELECT, INSERT, DELETE |

### Skunkworks Schema (Requires mode access)

| Table | RLS Enabled | Mode Check | Operations Covered |
|-------|-------------|------------|-------------------|
| `skunkworks.generation_jobs` | Yes | ✅ | SELECT, INSERT, UPDATE |
| `skunkworks.artifacts` | Yes | ✅ | SELECT, INSERT, UPDATE, DELETE |
| `skunkworks.microsites` | Yes | ✅ | SELECT (incl. public), INSERT, UPDATE, DELETE |
| `skunkworks.entities` | Yes | ✅ | SELECT, INSERT, UPDATE, DELETE |
| `skunkworks.entity_appearances` | Yes | ✅ | SELECT, INSERT, UPDATE, DELETE |
| `skunkworks.entity_relations` | Yes | ✅ | SELECT, INSERT, UPDATE, DELETE |
| `skunkworks.opportunities` | Yes | ✅ | SELECT, INSERT, UPDATE, DELETE |
| `skunkworks.entity_opportunities` | Yes | ✅ | SELECT, INSERT, UPDATE, DELETE |
| `skunkworks.pipeline_workflows` | Yes | ✅ | SELECT, INSERT, UPDATE, DELETE |
| `skunkworks.pipeline_stages` | Yes | ✅ | SELECT, INSERT, UPDATE, DELETE |
| `skunkworks.opportunity_owners` | Yes | ✅ | SELECT, INSERT, UPDATE, DELETE |
| `skunkworks.opportunity_entities` | Yes | ✅ | SELECT, INSERT, UPDATE, DELETE |
| `skunkworks.opportunity_activity` | Yes | ✅ | SELECT, INSERT |
| `skunkworks.entity_aliases` | Yes | ✅ | SELECT, INSERT, DELETE |

---

## Risk Notes

### Current Architecture Trade-offs

| Aspect | Current State | Risk Level | Notes |
|--------|---------------|------------|-------|
| Service client usage | API routes use `service_role` | Low | RLS bypassed by design for performance; mode isolation via application code |
| Mode from headers | Mode resolved from request param/header/cookie | Medium | Header spoofing possible if client compromised |
| JWT claims | Prepared but not yet populated | Low | `get_jwt_mode()` ready when Supabase custom claims are configured |

### When RLS Actually Applies

| Client Type | RLS Enforced? | Mode Isolation Method |
|-------------|---------------|----------------------|
| `service_role` | No | Application code (`getSchemaTable`) |
| `authenticated` | Yes | RLS policies + application code |
| `anon` | Yes | RLS policies (read-only public content) |

### Migration Risks

| Risk | Mitigation |
|------|------------|
| Existing engineering/skunkworks users blocked | Migration 014 seeds admin users with all mode access |
| Policy conflicts | Migration 015 drops ALL old policies before creating new ones |
| Function permission issues | `GRANT EXECUTE` explicitly given to authenticated role |
| Old FOR ALL policies bypass | **FIXED** - Migration 015 replaces all permissive policies |

### Issues Fixed in Migration 015

| Issue | Resolution |
|-------|------------|
| Editors could modify engineering data without mode access | Replaced `FOR ALL` policies with mode-gated versions |
| Only 4 tables had mode checks | All 14 tables now have complete mode-gated policies |
| UPDATE/DELETE not covered | All operations now require `shared.user_has_mode_access()` |

### Issues Fixed in Migration 016

| Issue | Resolution |
|-------|------------|
| Public microsites in engineering/skunkworks readable by anon | Added mode access check + `TO authenticated` scope |
| Visibility='public' bypassed mode isolation | Now requires `shared.user_has_mode_access()` |

---

## Verification SQL

After running migration, verify with:

```sql
-- Check mode access table exists
SELECT * FROM shared.user_mode_access LIMIT 5;

-- Test helper function (run as authenticated user)
SELECT shared.user_has_mode_access('growth');     -- Should return true
SELECT shared.user_has_mode_access('engineering'); -- Depends on user's access

-- Check policies are created
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname IN ('engineering', 'skunkworks')
ORDER BY schemaname, tablename;

-- Check admin users were seeded with mode access
SELECT u.email, uma.mode
FROM shared.user_mode_access uma
JOIN shared.users u ON u.id = uma.user_id;
```

---

## Files Changed

| File | Change Type | Purpose |
|------|-------------|---------|
| `supabase/migrations/014_mode_isolation_rls.sql` | Created | Mode access table + helper functions |
| `supabase/migrations/015_tighten_mode_isolation.sql` | Created | Complete mode-gated policies for all tables |
| `supabase/migrations/016_close_public_microsite_leak.sql` | Created | Fix public microsite isolation leak |
| `docs/progress/PHASE_2_RLS.md` | Created | This progress doc |

---

## Next Steps

- [ ] Run migration in Supabase dev environment
- [ ] Test mode access with authenticated client
- [ ] Verify growth mode remains open to all
- [ ] Test engineering/skunkworks require explicit access
- [ ] Configure Supabase custom JWT claims if header-based mode is insufficient
- [ ] Consider switching select API routes to authenticated client for full RLS enforcement

---

## Session Log

### 2026-01-22

- Audited existing RLS policies in migration 013
- Identified gap: no user-mode access control table
- Identified gap: RLS doesn't enforce mode isolation (relies on application code)
- Created migration 014 with mode isolation enhancements
- Verified all 33 API routes correctly use resolveMode() and getSchemaTable()
- Created progress documentation

### 2026-01-22 (Phase 10b - Tightening)

- Identified critical gap: `FOR ALL` policies from 013 lacked mode checks
- Example: "Editors can modify entities" allowed any editor to modify engineering/skunkworks data
- Created migration 015 to drop and replace ALL engineering/skunkworks policies
- Added mode-gated policies for all 14 tables per schema (110 total new policies)
- Operations covered: SELECT, INSERT, UPDATE, DELETE with appropriate role checks
- Growth schema unchanged (remains open to all authenticated users)
- Updated policy checklist to show complete coverage

### 2026-01-22 (Phase 10c - Public Microsite Leak)

- Identified leak: `engineering_microsites_select_public` and `skunkworks_microsites_select_public` omitted mode check
- These policies had no `TO authenticated` clause, allowing anon access to public microsites
- Created migration 016 to replace with mode-gated policies scoped to authenticated
- Growth public microsites remain globally visible (intentional - default open mode)
