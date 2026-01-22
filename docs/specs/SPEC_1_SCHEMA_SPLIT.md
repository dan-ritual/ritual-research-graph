# SPEC_1_SCHEMA_SPLIT: Multi-Schema Database Migration

> **Status:** Ready for Implementation
> **Phase:** 1
> **Dependencies:** Phase 0 Audit Complete ✅, SPEC_1_MODE_SYSTEM (parallel)
> **Blocks:** Phase 3 (Engineering Mode)
> **Effort:** 12 days (from audit estimate, highest risk)

---

## Overview

Migrate from single `public` schema to multi-schema architecture supporting isolated data per mode with shared cross-linking capability.

---

## Elicitation Decisions Applied

| Decision | Value | Rationale |
|----------|-------|-----------|
| Migration strategy | **Maintenance window (5-15 min)** | Simpler than dual-write, acceptable for internal tool |
| Schema prefix approach | **Explicit prefixes** (not search_path) | Avoid cross-mode leakage, clearer queries |

---

## Audit Findings Applied

From `AUDIT_SCHEMA.md`:
- 14 tables in `public.*` need migration
- Enums hardcoded: `entity_type`, `artifact_type`, `job_status`, `section_type`
- Circular FK between `microsites` and `generation_jobs`
- RLS policies and helper functions bound to `public` tables
- Storage buckets are global (need mode folder prefixes)

---

## Win Conditions

- [ ] Existing data migrated from `public.*` to `growth.*` without loss
- [ ] `engineering.*` schema created and empty
- [ ] `product.*` schema created and empty
- [ ] `shared.*` schema created with users and cross_links tables
- [ ] RLS policies updated for multi-schema access
- [ ] All existing queries work against new schema

---

## Satisfaction Criteria

| Criterion | Measurement | Target |
|-----------|-------------|--------|
| Data integrity | Row count before/after migration | 100% preserved |
| Query compatibility | Existing API routes work | 100% |
| Downtime | Migration window | < 5 minutes |
| Rollback time | Time to revert if needed | < 10 minutes |

---

## Scope Boundaries

**In Scope:**
- Schema creation (growth, engineering, product, shared)
- Data migration from public to growth
- RLS policy updates
- Foreign key adjustments
- Supabase client configuration

**Out of Scope:**
- New tables for Engineering/Product modes
- Cross-link AI suggestions
- Mode-specific RLS policies beyond basic access

---

## Technical Approach

### Target Schema Structure

```sql
-- Growth schema (migrate from public)
CREATE SCHEMA IF NOT EXISTS growth;

-- Tables to migrate
-- growth.entities (from public.entities)
-- growth.artifacts (from public.artifacts)
-- growth.jobs (from public.jobs)
-- growth.microsites (from public.microsites)

-- Engineering schema (new)
CREATE SCHEMA IF NOT EXISTS engineering;

-- engineering.entities
-- engineering.artifacts
-- engineering.jobs
-- engineering.wiki_pages

-- Product schema (new, placeholder)
CREATE SCHEMA IF NOT EXISTS product;

-- Shared schema
CREATE SCHEMA IF NOT EXISTS shared;

-- shared.users (migrate from public.users or auth.users reference)
-- shared.cross_links (new)
-- shared.mode_config (new)
```

### Migration Strategy

1. **Preparation (no downtime)**
   - Create new schemas
   - Create tables in new schemas (empty)
   - Update application to read from both locations

2. **Migration (brief downtime)**
   - Copy data from public to growth
   - Update sequences
   - Switch application to new schemas

3. **Cleanup (no downtime)**
   - Verify data integrity
   - Drop public tables (after grace period)

### PostgREST Schema Exposure

Ensure Supabase API `db_schema` includes `growth, engineering, skunkworks, shared` so PostgREST can access mode schemas and shared tables. This is a required deployment step after migration, along with a PostgREST reload if needed.

### Cross-Links Table

```sql
CREATE TABLE shared.cross_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Source
  source_mode TEXT NOT NULL CHECK (source_mode IN ('growth', 'engineering', 'product')),
  source_type TEXT NOT NULL,
  source_id UUID NOT NULL,

  -- Target
  target_mode TEXT NOT NULL CHECK (target_mode IN ('growth', 'engineering', 'product')),
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,

  -- Metadata
  link_type TEXT NOT NULL,
  confidence FLOAT CHECK (confidence >= 0 AND confidence <= 1),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',

  -- Prevent duplicate links
  UNIQUE(source_mode, source_id, target_mode, target_id, link_type)
);

-- Index for fast lookups
CREATE INDEX idx_cross_links_source ON shared.cross_links(source_mode, source_id);
CREATE INDEX idx_cross_links_target ON shared.cross_links(target_mode, target_id);
```

### RLS Policies

```sql
-- Growth schema - authenticated users can read
ALTER TABLE growth.entities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read growth entities" ON growth.entities
  FOR SELECT TO authenticated USING (true);

-- Similar policies for other tables...

-- Cross-links - users need access to both sides
CREATE POLICY "Users can read cross_links" ON shared.cross_links
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create cross_links" ON shared.cross_links
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
```

---

## Open Questions

> To be resolved during Phase 0 audit.

1. Are there any hardcoded `public.` references in Supabase functions?
2. Do existing RLS policies need mode-specific adjustments?
3. Should we use Supabase's schema search_path or explicit schema prefixes?
4. What's the foreign key strategy across schemas?

---

## Migration Scripts

> To be created post-audit.

| Migration | Purpose |
|-----------|---------|
| `007_create_schemas.sql` | Create new schemas |
| `008_create_shared_tables.sql` | Users, cross_links, config |
| `009_migrate_to_growth.sql` | Copy public → growth |
| `010_update_sequences.sql` | Reset sequences |
| `011_create_engineering_tables.sql` | Engineering schema tables |

---

## Rollback Plan

```sql
-- If migration fails, restore from public
-- 1. Application reads from public (feature flag)
-- 2. Drop growth.* tables
-- 3. Investigate and retry
```

Keep `public.*` tables for 7 days post-migration as safety net.

---

## Testing Strategy

- Pre-migration: Snapshot row counts
- Post-migration: Verify row counts match
- Integration: Run full API test suite
- Load test: Ensure no performance regression
