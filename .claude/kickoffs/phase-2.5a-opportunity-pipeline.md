# Phase 2.5a Kickoff Prompt

Copy everything below the line into a new Claude Code terminal:

---

## Context

I'm continuing work on the Ritual Research Graph project. Phase 2 (Portal MVP) is complete. I'm now starting Phase 2.5a: Opportunity Pipeline Core.

## Spec Location

Read the full spec: `docs/specs/SPEC_OPPORTUNITY_PIPELINE.md`

## What Phase 2.5a Delivers

A functional Kanban board for tracking business development opportunities:

1. **Database tables** (migration 006):
   - `pipeline_workflows` - BD, Product, Research workflows
   - `pipeline_stages` - Configurable stages per workflow
   - `opportunity_owners` - Multi-owner support
   - `opportunity_entities` - Entity linking
   - `opportunity_activity` - Audit log
   - Expand existing `opportunities` table with new fields

2. **Portal pages**:
   - `/pipeline` - Kanban board with columns per stage
   - `/pipeline/[id]` - Opportunity detail/edit modal
   - `/pipeline/new` - Create new opportunity

3. **Features**:
   - Workflow selection (BD is default)
   - Stage progression via button (not drag-drop)
   - Confidence score visualization (5-segment bar)
   - Basic filtering by stage
   - Supabase Realtime subscriptions

## NOT in Phase 2.5a (deferred to 2.5b)

- AI strategy generation
- AI email generation
- Duplicate detection
- Entity linking UI
- Multi-owner assignment UI
- Chat interface
- Opportunity extraction during pipeline

## Design System

Use Making Software aesthetic from `docs/design/DESIGN_LIBRARY_MAKING_SOFTWARE.md`:
- Fonts: JetBrains Mono (UI), Crimson Text (body), Space Grotesk (headings)
- Colors: #FBFBFB bg, #3B5FE6 accent, rgba(0,0,0,0.45) muted
- Dotted borders: `border-dotted border-[rgba(59,95,230,0.3)]`

## Implementation Order

1. Create migration `supabase/migrations/006_opportunity_pipeline.sql`
2. Create `/pipeline` page with Kanban layout
3. Create opportunity card component
4. Add workflow selector
5. Implement stage progression API
6. Add create opportunity form
7. Add opportunity detail modal
8. Enable Supabase Realtime
9. Build and test

## Existing Patterns to Follow

- API routes: `apps/portal/src/app/api/` - see jobs and microsites for patterns
- Client components: Use `"use client"` directive for interactive parts
- Supabase client: `@/lib/supabase/client` (client) or `@/lib/supabase/server` (server)
- UI components: `@/components/ui/` - Button, Card, Badge, etc.

## Start

Begin by:
1. Reading the spec: `docs/specs/SPEC_OPPORTUNITY_PIPELINE.md`
2. Creating the migration file
3. Building the `/pipeline` page

Do NOT ask questions via AskUserQuestionTool - the spec has been fully elicited. Implement end-to-end.
