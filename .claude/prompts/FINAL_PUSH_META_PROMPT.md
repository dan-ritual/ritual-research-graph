# META-PROMPT: Final Implementation Push

**Copy everything below the line into a new Claude Code terminal with YOLO mode enabled.**

---

## PROMPT START

I need you to complete the final phases of the Ritual Research Graph project. This is a comprehensive, non-interactive implementation session.

### Your Mission

Complete **Phase 3 (Graph UI)**, **Phase 4 (Spot Treatment)**, and **Phase 5 (Deployment)** in one push.

### Step 1: Enter Plan Mode

First, enter plan mode to create a detailed implementation plan. You must:

1. Read all three specifications:
   - `docs/specs/SPEC_GRAPH_UI.md`
   - `docs/specs/SPEC_SPOT_TREATMENT.md`
   - `docs/specs/SPEC_DEPLOYMENT.md`

2. Read the design system:
   - `docs/design/DESIGN_LIBRARY_MAKING_SOFTWARE.md`

3. Read the kickoff guide:
   - `.claude/kickoffs/phase-final-complete-all.md`

4. Check current project state:
   - `.claude/handoffs/index.json` (phase status)
   - `git log --oneline -5` (recent commits)

5. Create a comprehensive plan file at `.claude/plans/final-push-plan.md` with:
   - Exact files to create/modify for each phase
   - Implementation order with dependencies
   - Database migrations needed
   - API routes to create
   - Components to build
   - Verification steps after each phase

### Step 2: Exit Plan Mode and Execute

After your plan is approved, execute it non-interactively:

1. **Phase 3:** Build entity pages, API routes, navigation
2. **Phase 4:** Build artifact editor, spot treatment, entity merge
3. **Phase 5:** Deploy to Vercel

### Critical Requirements

**Handoffs:** Before ANY context compaction, create a handoff:
```bash
cat << 'EOF' | npx tsx .claude/scripts/create-handoff.ts
{
  "phase": "final",
  "status": "in-progress",
  "summary": "[what was just completed]",
  "nextSteps": ["[exact next task]"],
  "completedTasks": ["[list]"],
  "remainingTasks": ["[list]"]
}
EOF
```

**Design:** ALL UI must follow Making Software aesthetic. Sharp edges, mono headers, accent #3B5FE6, dotted borders.

**Commits:** Use `/commit` after each logical unit. No Claude attribution.

**Build:** Run `npm run build` after each phase to verify no regressions.

### Phase 3 Deliverables

| Deliverable | Route/File |
|-------------|------------|
| Entity list API | `/api/entities` |
| Entity detail API | `/api/entities/[slug]` |
| Related microsites API | `/api/microsites/[slug]/related` |
| Entity list page | `/entities` |
| Entity detail page | `/entities/[slug]` |
| Related research panel | Component on `/microsites/[slug]` |
| Header nav update | Add "Entities" link |

### Phase 4 Deliverables

| Deliverable | Route/File |
|-------------|------------|
| Sections migration | `supabase/migrations/007_artifact_sections.sql` |
| Aliases migration | `supabase/migrations/008_entity_aliases.sql` |
| Markdown parser | `packages/core/src/markdown-parser.ts` |
| Artifact editor page | `/jobs/[id]/edit` |
| Spot treatment modal | Component |
| Regenerate section API | `/api/jobs/[id]/artifacts/[artifactId]/regenerate-section` |
| Entity merge API | `/api/jobs/[id]/entities/merge` |
| Regenerate microsite API | `/api/jobs/[id]/regenerate-microsite` |

### Phase 5 Deliverables

| Deliverable | Action |
|-------------|--------|
| Vercel project | Link and configure |
| Environment vars | Set in Vercel dashboard |
| Blob storage | Create and configure |
| Microsite proxy | `/sites/[slug]/[[...path]]/route.ts` |
| Production deploy | `npx vercel --prod` |
| Verification | Test all flows on production |

### Success Criteria

- [ ] `/entities` page lists all entities with search/filter
- [ ] `/entities/[slug]` shows appearances and co-occurrences
- [ ] Microsites show related research panel
- [ ] `/jobs/[id]/edit` shows artifact sections
- [ ] Spot treatment regenerates individual sections
- [ ] Entity merge works
- [ ] Production URL is live and functional
- [ ] All builds pass
- [ ] Final handoff created marking phases complete

### Begin

Enter plan mode now. Read the specs, create your plan, then execute.

```
/plan
```
