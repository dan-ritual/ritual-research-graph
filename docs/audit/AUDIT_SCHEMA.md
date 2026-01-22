# Audit: Database Schema Analysis

> **Status:** Completed (Prompt 5)
> **Last Updated:** 2026-01-20

---

## Summary

All tables and enums live in `public` and encode Growth-specific values (entity_type, artifact_type, job_status, section_type). RLS policies and helper functions are bound to `public` tables. Pipeline tables (workflows/stages) and opportunities are also in `public`, with no mode scoping. Storage buckets are global (transcripts/artifacts/microsites).

---

## Current Schema

### Tables Inventory

| Table | Schema | Row Estimate | Purpose |
|-------|--------|--------------|---------|
| users | public | unknown | User profiles (auth extension) |
| entities | public | unknown | Global entity registry |
| microsites | public | unknown | Generated microsites |
| generation_jobs | public | unknown | Pipeline job tracking |
| artifacts | public | unknown | Generated artifacts |
| entity_appearances | public | unknown | Entity <-> microsite mentions |
| entity_relations | public | unknown | Entity co-occurrences |
| opportunities | public | unknown | Opportunity records |
| pipeline_workflows | public | unknown | Pipeline workflows |
| pipeline_stages | public | unknown | Workflow stages |
| opportunity_entities | public | unknown | Opportunity <-> entity links |
| opportunity_activity | public | unknown | Opportunity audit log |
| opportunity_owners | public | unknown | Opportunity owners |
| entity_aliases | public | unknown | Entity alias mapping |

### Relationships

```
users -> generation_jobs -> artifacts
users -> microsites
entities -> entity_appearances -> microsites
entities -> entity_relations (self-join)
opportunities -> opportunity_entities -> entities
pipeline_workflows -> pipeline_stages -> opportunities
```

---

## Migration Files

| Migration | Date | Purpose | Relevant to Multi-Mode? |
|-----------|------|---------|------------------------|
| 001_initial_schema.sql | 2026-01-16 | Core tables + enums | Yes (enums and public schema) |
| 002_rls_policies.sql | 2026-01-16 | RLS policies | Yes (mode-aware RLS needed) |
| 003_storage_buckets.sql | 2026-01-16 | Storage buckets | Yes (mode scoping) |
| 004_fix_rls_recursion.sql | 2026-01-16 | RLS helper functions | Yes (recreate per schema) |
| 005_soft_delete.sql | 2026-01-16 | Soft delete for entities/microsites | Yes (apply per mode schema) |
| 006_opportunity_pipeline.sql | 2026-01-16 | Pipeline workflows/stages | Yes (growth pipeline vs mode) |
| 007_spot_treatment.sql | 2026-01-16 | Artifact editing + entity merge | Yes (per mode entity tables) |

---

## RLS Policies

| Table | Policy | Rule | Mode-Aware? |
|-------|--------|------|-------------|
| public.microsites | Authenticated users can view internal | visibility + deleted_at | No |
| public.entities | Authenticated users can view entities | deleted_at | No |
| public.opportunities | Authenticated users can view active | status = active | No |
| public.artifacts | Users can view own job artifacts | job ownership | No |

---

## Foreign Key Analysis

| FK | From Table | To Table | Cross-Schema Safe? |
|----|------------|----------|-------------------|
| microsites.user_id | public.microsites | public.users | No (needs shared.users) |
| generation_jobs.microsite_id | public.generation_jobs | public.microsites | No (schema split) |
| artifacts.job_id | public.artifacts | public.generation_jobs | No |
| entity_appearances.entity_id | public.entity_appearances | public.entities | No |
| entity_appearances.microsite_id | public.entity_appearances | public.microsites | No |
| opportunity_entities.entity_id | public.opportunity_entities | public.entities | No |
| opportunities.source_microsite_id | public.opportunities | public.microsites | No |

---

## Schema Split Plan

### Target Structure

| Current Table | Target Schema | Migration Complexity |
|---------------|---------------|---------------------|
| public.users | shared.users | Medium |
| public.entities | growth.entities | High |
| public.microsites | growth.microsites | High |
| public.generation_jobs | growth.jobs | High |
| public.artifacts | growth.artifacts | High |
| public.entity_appearances | growth.entity_appearances | High |
| public.entity_relations | growth.entity_relations | High |
| public.entity_aliases | growth.entity_aliases | Medium |
| public.opportunities | growth.opportunities | High |
| public.pipeline_workflows | growth.pipeline_workflows | Medium |
| public.pipeline_stages | growth.pipeline_stages | Medium |
| public.opportunity_entities | growth.opportunity_entities | Medium |
| public.opportunity_activity | growth.opportunity_activity | Medium |
| public.opportunity_owners | growth.opportunity_owners | Medium |

### New Tables Needed

| Table | Schema | Purpose |
|-------|--------|---------|
| cross_links | shared | Cross-mode entity links |
| mode_config | shared | Mode configuration |
| audit_log | shared | Cross-mode change logging |

---

## Supabase Functions

| Function | Location | Mode-Specific? |
|----------|----------|----------------|
| update_updated_at | 001_initial_schema.sql | Yes (per schema tables) |
| update_entity_appearance_count | 001_initial_schema.sql | Yes |
| update_opportunity_counts | 001_initial_schema.sql | Yes |
| handle_new_user | 001_initial_schema.sql | Shared (users) |
| is_admin/is_editor_or_admin | 004_fix_rls_recursion.sql | Shared (users) |
| soft_delete_microsite/restore_microsite | 005_soft_delete.sql | Yes |
| soft_delete_entity/restore_entity | 005_soft_delete.sql | Yes |
| find_potential_duplicates | 007_spot_treatment.sql | Yes |
| merge_entities | 007_spot_treatment.sql | Yes |

---

## Triggers

| Trigger | Table | Purpose | Needs Update? |
|---------|-------|---------|---------------|
| update_users_updated_at | public.users | updated_at maintenance | Shared schema |
| update_microsites_updated_at | public.microsites | updated_at maintenance | Yes (growth.*) |
| update_entities_updated_at | public.entities | updated_at maintenance | Yes |
| update_opportunities_updated_at | public.opportunities | updated_at maintenance | Yes |
| trigger_entity_appearance_count | public.entity_appearances | maintain counts | Yes |
| trigger_opportunity_counts | public.entity_opportunities | maintain counts | Yes |
| on_auth_user_created | auth.users -> public.users | user profile creation | Shared schema |

---

## Search Path Considerations

**Current:** Explicit `public.*` table names in SQL and app queries.

**Recommendation:** Use explicit schema prefixes (`growth.*`, `engineering.*`, `shared.*`) rather than search_path to avoid cross-mode leakage.

---

## Data Migration Risks

| Risk | Mitigation | Severity |
|------|------------|----------|
| Enum types hardcoded (entity_type, artifact_type, job_status) | Replace enums with per-mode lookup tables or mode-specific enums | High |
| Circular FK between microsites and generation_jobs | Plan staged migration with temporary nulls | High |
| RLS policies tied to public schema | Recreate policies per schema | Medium |
| Storage buckets are global | Use per-mode folder prefixes or new buckets | Medium |

---

## Notes

[Additional observations]

---

## Audit Log

- 2026-01-20: Baseline indexing completed (package.json reviewed; no .env files found; key directories indexed).
- 2026-01-20: Prompt 5 completed with strict validation (migrations + RLS review).
