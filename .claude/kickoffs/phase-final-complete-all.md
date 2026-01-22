# FINAL IMPLEMENTATION PUSH: Phase 3 + Phase 4 + Deployment

**Mode:** Plan Mode → Non-Interactive Execution
**YOLO:** Enabled (bypass permission prompts)
**Goal:** Complete all remaining phases in one session

---

## CRITICAL: Session Continuity Protocol

### Before EVERY Compaction

You MUST create a handoff BEFORE context compaction occurs. Use the PreCompact hook or manually run:

```bash
cat << 'EOF' | npx tsx .claude/scripts/create-handoff.ts
{
  "phase": "final",
  "status": "in-progress",
  "summary": "[CURRENT PROGRESS - what was just completed]",
  "nextSteps": ["[EXACT next task to resume]"],
  "completedTasks": ["[list of completed tasks]"],
  "remainingTasks": ["[list of remaining tasks]"]
}
EOF
```

### After Session Resume

1. Read `.claude/handoffs/index.json` to find latest handoff
2. Read the handoff file to understand exact state
3. Continue from `nextSteps` — do not restart from beginning

---

## North Star

**Transform the Ritual Research Graph from a working pipeline with portal into a complete, deployed knowledge management system.**

End state:
- Users can browse entities Wikipedia-style (Phase 3)
- Users can surgically edit artifacts (Phase 4)
- System is live on Vercel at production URL (Phase 5)

---

## Phase Status (Current)

| Phase | Name | Status |
|-------|------|--------|
| 0 | Foundation | ✅ Complete |
| 1a | Database Setup | ✅ Complete |
| 1b | Processing Pipeline | ✅ Complete |
| 2 | Portal MVP | ✅ Complete |
| 2.5a | Opportunity Pipeline Core | ✅ Complete |
| 2.5b | Opportunity Pipeline Advanced | ✅ Complete |
| **3** | **Graph UI** | ⬚ **TO DO** |
| **4** | **Spot Treatment** | ⬚ **TO DO** |
| **5** | **Deployment** | ⬚ **TO DO** |

---

## Specifications (Read These First)

| Spec | Phase | Location |
|------|-------|----------|
| Graph UI | 3 | `docs/specs/SPEC_GRAPH_UI.md` |
| Spot Treatment | 4 | `docs/specs/SPEC_SPOT_TREATMENT.md` |
| Deployment | 5 | `docs/specs/SPEC_DEPLOYMENT.md` |
| Design System | All | `docs/design/DESIGN_LIBRARY_MAKING_SOFTWARE.md` |

---

## Implementation Plan

### PHASE 3: Knowledge Graph UI

**Deliverables:**
1. Entity list page (`/entities`)
2. Entity detail page (`/entities/[slug]`)
3. Related research panel on microsites
4. Navigation integration

**Implementation Order:**
```
1. API Routes
   └── /api/entities (GET - list with search/filter/pagination)
   └── /api/entities/[slug] (GET - detail with appearances, co-occurrences)
   └── /api/microsites/[slug]/related (GET - related by entity overlap)

2. Entity List Page
   └── apps/portal/src/app/entities/page.tsx
   └── components/entities/entity-card.tsx
   └── components/entities/entity-type-filter.tsx

3. Entity Detail Page
   └── apps/portal/src/app/entities/[slug]/page.tsx
   └── components/entities/appearance-list.tsx
   └── components/entities/co-occurrence-chips.tsx

4. Related Research Panel
   └── components/microsites/related-research-panel.tsx
   └── Add to /microsites/[slug] page

5. Navigation Updates
   └── Add "Entities" to header nav
   └── Make entity names clickable throughout
```

**Verification:**
- [ ] Entity list loads with pagination
- [ ] Search/filter works
- [ ] Entity detail shows appearances
- [ ] Co-occurrences link correctly
- [ ] Related research shows on microsites
- [ ] `npm run build` passes

---

### PHASE 4: Spot Treatment Editing

**Deliverables:**
1. Artifact editor with sections
2. Spot treatment regeneration
3. Entity review/merge flow
4. Microsite regeneration

**Implementation Order:**
```
1. Database Changes
   └── Migration: Add sections JSONB to artifacts
   └── Migration: Create entity_aliases table

2. Markdown Parser
   └── packages/core/src/markdown-parser.ts
   └── Parse sections from ## headers

3. Artifact Editor Page
   └── apps/portal/src/app/jobs/[id]/edit/page.tsx
   └── components/artifacts/artifact-editor.tsx
   └── components/artifacts/artifact-section.tsx

4. Spot Treatment
   └── components/artifacts/spot-treatment-modal.tsx
   └── /api/jobs/[id]/artifacts/[artifactId]/regenerate-section

5. Entity Review Enhancement
   └── Enhance /jobs/[id]/review page
   └── components/entities/entity-review-card.tsx
   └── components/entities/entity-merge-modal.tsx
   └── /api/jobs/[id]/entities/merge

6. Microsite Regeneration
   └── /api/jobs/[id]/regenerate-microsite
```

**Verification:**
- [ ] Artifact viewer shows sections
- [ ] Manual edit works
- [ ] Spot treatment regenerates section
- [ ] Entity review shows duplicates
- [ ] Merge flow works
- [ ] `npm run build` passes

---

### PHASE 5: Deployment

**Deliverables:**
1. Vercel project setup
2. Environment configuration
3. Microsite proxy route
4. Domain configuration
5. Production verification

**Implementation Order:**
```
1. Vercel Setup
   └── Link project to Vercel
   └── Configure build settings

2. Environment Variables
   └── Set all env vars in Vercel dashboard
   └── SUPABASE_*, ANTHROPIC_API_KEY, XAI_*, PERPLEXITY_*

3. Blob Storage
   └── Create Vercel Blob store
   └── Set BLOB_READ_WRITE_TOKEN

4. Microsite Proxy
   └── apps/portal/src/app/sites/[slug]/[[...path]]/route.ts

5. Deploy & Verify
   └── npx vercel --prod
   └── Test all functionality on production URL

6. Domain (if configured)
   └── Add custom domain in Vercel
   └── Update Supabase OAuth URLs
```

**Verification:**
- [ ] Portal accessible on production URL
- [ ] Auth flow works
- [ ] Generation flow completes
- [ ] Microsites load via /sites/[slug]
- [ ] Pipeline updates in realtime

---

## Design Requirements (All Phases)

**MANDATORY:** Follow Making Software aesthetic throughout.

```
FONTS:     JetBrains Mono (UI) | Crimson Text (body) | Space Grotesk (display)
COLORS:    #FBFBFB (bg) | #171717 (text) | #3B5FE6 (accent)
PATTERNS:  20px grid background | 1px dotted borders | sharp card edges
```

Reference: `docs/design/DESIGN_LIBRARY_MAKING_SOFTWARE.md`

---

## Handoff Checkpoints

Create a handoff at these milestones:

| Checkpoint | Trigger |
|------------|---------|
| Phase 3 API routes complete | After all 3 routes working |
| Phase 3 complete | After navigation updates |
| Phase 4 editor working | After sections display |
| Phase 4 complete | After merge flow |
| Deployed to Vercel | After production verification |

---

## Error Handling

If you encounter blocking errors:

1. Log the error clearly
2. Create a handoff with current state
3. Note the error in `nextSteps`
4. Continue with non-blocking tasks if possible

---

## Commit Strategy

Commit after each logical unit:
- "Implement entity API routes (Phase 3)"
- "Add entity list and detail pages (Phase 3)"
- "Complete Phase 3: Knowledge Graph UI"
- "Add artifact editor with spot treatment (Phase 4)"
- "Complete Phase 4: Spot Treatment"
- "Deploy to Vercel (Phase 5)"

Use `/commit` skill for all commits.

---

## Final Verification

Before marking complete:

1. Run `npm run build` — must pass
2. Test generation flow end-to-end
3. Test entity navigation flow
4. Test artifact editing flow
5. Verify production deployment works

---

## BEGIN

1. Enter plan mode
2. Read all three specs thoroughly
3. Create detailed implementation plan
4. Exit plan mode
5. Execute non-interactively until complete
6. Create final handoff marking all phases complete

**Go.**
