# Phase 2.5a: Opportunity Pipeline Core — COMPLETE

**Date:** 2026-01-16
**Phase:** 2.5a
**Status:** ✅ Complete
**Duration:** Single session

---

## Summary

Implemented the complete Opportunity Pipeline Core feature set, enabling manual opportunity tracking through a Kanban board interface with workflow/stage architecture and Supabase Realtime subscriptions.

---

## Deliverables

### Database Migration

**File:** `supabase/migrations/006_opportunity_pipeline.sql`

Tables created:
- `pipeline_workflows` — BD, Product, Research workflows
- `pipeline_stages` — 5 stages per workflow (15 total)
- `opportunity_owners` — Many-to-many user assignment
- `opportunity_entities` — Junction to entity registry
- `opportunity_activity` — Audit log for all changes

Extended `opportunities` table with 14 new columns:
- `thesis`, `angle`, `notes`, `confidence`
- `strategy`, `email_draft` (JSONB)
- `workflow_id`, `stage_id`, `source_microsite_id`, `source_job_id`
- `status`, `archived_at`, `archived_by`, `updated_at`

Features:
- RLS policies for authenticated users
- Realtime enabled on opportunities table
- Seed data for 3 workflows with 5 stages each
- Proper indexes on foreign keys

### Portal Pages

| Route | File | Purpose |
|-------|------|---------|
| `/pipeline` | `apps/portal/src/app/pipeline/page.tsx` | Kanban board with workflow selector |
| `/pipeline/new` | `apps/portal/src/app/pipeline/new/page.tsx` | Create opportunity form |
| `/pipeline/[id]` | `apps/portal/src/app/pipeline/[id]/page.tsx` | Detail/edit page with activity log |

### Components Created

| Component | File | Purpose |
|-----------|------|---------|
| `OpportunityCard` | `components/pipeline/opportunity-card.tsx` | Card display with NEXT button |
| `ConfidenceBar` | `components/pipeline/confidence-bar.tsx` | 5-segment visual indicator |
| `PipelineColumn` | `components/pipeline/pipeline-column.tsx` | Kanban column with stage header |
| `WorkflowSelector` | `components/pipeline/workflow-selector.tsx` | Workflow dropdown |

### Modified Files

- `components/layout/header.tsx` — Added Pipeline nav link
- `app/page.tsx` — Added opportunities count stat card, 4-column grid

---

## Technical Decisions

### Suspense Boundaries
Next.js 16 requires `useSearchParams()` to be wrapped in Suspense. Implemented pattern:
```tsx
function PageContent() {
  const searchParams = useSearchParams();
  // ...
}

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <PageContent />
    </Suspense>
  );
}
```

### Realtime Subscriptions
Subscribed to `opportunities` table changes filtered by `workflow_id`:
- INSERT → Prepend to opportunities array
- UPDATE → Map and replace matching ID
- DELETE → Filter out matching ID

### Stage Progression
- NEXT button advances to next stage (index + 1)
- Stage buttons on detail page allow direct stage selection
- All stage changes logged to `opportunity_activity`

### URL-based Workflow State
- Default workflow determined by `is_default` flag or first in list
- URL param `?workflow=bd` syncs workflow selection
- Workflow change updates URL for shareable links

---

## Verification

1. ✅ Migration executed via Supabase Dashboard SQL Editor
2. ✅ Tables verified in Table Editor
3. ✅ Build passes with `npm run build`
4. ✅ Pages accessible at `/pipeline`, `/pipeline/new`, `/pipeline/[id]`
5. ✅ Design follows Making Software aesthetic

---

## NOT Implemented (Deferred to 2.5b)

Per spec, these features are explicitly out of scope for 2.5a:
- [ ] AI strategy generation
- [ ] AI email generation
- [ ] Duplicate detection during creation
- [ ] Entity linking UI
- [ ] Multiple owner assignment UI
- [ ] Chat interface (query opportunities conversationally)
- [ ] Opportunity extraction during Stage 3

---

## Next Phase

**Phase 2.5b: Opportunity Pipeline Advanced**

Key features:
1. AI-powered strategy document generation
2. AI-powered outreach email generation
3. Duplicate detection with Claude matching
4. Entity linking UI with search
5. Owner assignment (multi-select users)
6. Chat interface for querying opportunities
7. Stage 3 pipeline integration (auto-extract opportunities from transcripts)

See: `docs/specs/SPEC_OPPORTUNITY_PIPELINE.md` Section 5 (AI Features)
