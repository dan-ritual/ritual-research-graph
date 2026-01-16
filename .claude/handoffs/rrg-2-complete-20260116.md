## 2026-01-16 21:45 - Phase 2 Portal MVP Complete

**Task:** Complete Phase 2 Portal MVP
**Status:** complete
**Branch:** main

### Summary

Phase 2 Portal MVP is complete. All P1 and P2 features implemented:

1. **Entity Review** (`/jobs/[id]/review`) - Review extracted entities before graph integration
2. **Microsite Proxy** (`/sites/[slug]/[[...path]]`) - Serve microsites from Vercel Blob
3. **Vercel Blob Upload** (CLI Stage 5b) - Upload built microsites to blob storage
4. **Soft Delete** - `deleted_at` column for microsites/entities with restore capability
5. **Job Controls** - Retry failed jobs, cancel running jobs

### Files Created/Modified

**Migrations:**
- `supabase/migrations/005_soft_delete.sql` - Soft delete columns and RLS policies

**API Routes:**
- `apps/portal/src/app/api/microsites/[id]/delete/route.ts`
- `apps/portal/src/app/api/microsites/[id]/restore/route.ts`
- `apps/portal/src/app/api/entities/[id]/delete/route.ts`
- `apps/portal/src/app/api/entities/[id]/restore/route.ts`
- `apps/portal/src/app/api/jobs/[id]/cancel/route.ts`
- `apps/portal/src/app/api/jobs/[id]/retry/route.ts`
- `apps/portal/src/app/api/jobs/[id]/approve-entities/route.ts`
- `apps/portal/src/app/sites/[slug]/[[...path]]/route.ts`

**Pages:**
- `apps/portal/src/app/jobs/[id]/review/page.tsx`

**Components:**
- `apps/portal/src/components/ui/alert-dialog.tsx`
- `apps/portal/src/components/microsites/delete-button.tsx`
- `apps/portal/src/components/jobs/job-actions.tsx`

**CLI:**
- `scripts/lib/blob.ts` - Vercel Blob upload utility
- `scripts/stages/graph.ts` - Added blobPath support
- `scripts/generate.ts` - Added Stage 5b blob upload

### Learnings

1. Optional catch-all routes use `[[...path]]` syntax for paths that may or may not have segments
2. Soft delete with RLS: Admin policy without `deleted_at IS NULL` filter allows recovery
3. AlertDialog requires `@radix-ui/react-alert-dialog` package

### Database Migration Pending

Run in Supabase SQL editor:
```sql
-- supabase/migrations/005_soft_delete.sql
```

### Next Steps

1. Apply 005_soft_delete.sql migration
2. Begin Phase 2.5a: Opportunity Pipeline Core
   - See: `docs/specs/SPEC_OPPORTUNITY_PIPELINE.md`
   - Migration: 006_opportunity_pipeline.sql
   - `/pipeline` Kanban page
   - Opportunity CRUD
   - Stage progression
