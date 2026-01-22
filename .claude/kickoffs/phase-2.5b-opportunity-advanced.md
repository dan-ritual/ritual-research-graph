# Phase 2.5b Kickoff: Opportunity Pipeline Advanced

**Phase:** 2.5b
**Prerequisite:** Phase 2.5a (complete)
**Spec:** `docs/specs/SPEC_OPPORTUNITY_PIPELINE.md` Sections 5-6

---

## Context

Phase 2.5a delivered the core Kanban pipeline with manual opportunity management. Phase 2.5b adds AI-powered features that transform the pipeline from a tracking tool into an intelligent BD assistant.

**What exists:**
- Database tables: `pipeline_workflows`, `pipeline_stages`, `opportunity_owners`, `opportunity_entities`, `opportunity_activity`
- Extended `opportunities` table with `strategy`, `email_draft` (JSONB), `confidence` columns
- Portal pages: `/pipeline` (Kanban), `/pipeline/new` (create), `/pipeline/[id]` (detail/edit)
- Components: `OpportunityCard`, `ConfidenceBar`, `PipelineColumn`, `WorkflowSelector`
- Supabase Realtime subscriptions on opportunities table

---

## Deliverables

### 1. AI Strategy Generation

**Location:** Add "STRATEGY" button to `OpportunityCard` and `/pipeline/[id]` page

**Behavior:**
1. User clicks "STRATEGY" button
2. Show loading state on button
3. Call Claude API with strategy prompt (see spec Section 5.2)
4. Store result in `opportunities.strategy` column
5. Display strategy in expandable section on detail page

**Prompt Template:**
```
Create a strategic approach document for this opportunity:

Opportunity: {name}
Thesis: {thesis}
Angle: {angle}
Linked Entities: {entities from opportunity_entities}
Source Research: {fetch context from source_microsite if linked}

Structure:
1. EXECUTIVE SUMMARY (2-3 sentences)
2. VALUE PROPOSITION (Why this matters for Ritual)
3. APPROACH STRATEGY (How to engage)
4. OBJECTION HANDLING (Anticipated concerns + responses)
5. NEXT STEPS (3 concrete actions)

Output as clean markdown.
```

**API Route:** `POST /api/opportunities/[id]/generate-strategy`

---

### 2. AI Email Generation

**Location:** Add "EMAIL" button to `OpportunityCard` and `/pipeline/[id]` page

**Behavior:**
1. User clicks "EMAIL" button
2. Show loading state
3. Call Claude API with email prompt (see spec Section 5.3)
4. Store result in `opportunities.email_draft` as `{subject: string, body: string}`
5. Display in modal with copy-to-clipboard buttons

**Prompt Template:**
```
Generate an outreach email for this opportunity:

Opportunity: {name}
Thesis: {thesis}
Angle: {angle}
Linked Entities: {entities}
Stage: {current_stage}

Requirements:
- Professional but warm tone
- Reference specific value proposition
- Clear call to action
- Under 200 words

Return JSON: {subject: string, body: string}
```

**API Route:** `POST /api/opportunities/[id]/generate-email`

---

### 3. Duplicate Detection

**Location:** Integrate into `/pipeline/new` creation flow

**Behavior:**
1. After user fills name/thesis, check for duplicates before submit
2. Call Claude API with duplicate detection prompt (see spec Section 5.4)
3. If duplicate found (confidence > 0.7):
   - Show warning modal with match details
   - Options: "Create Anyway", "View Existing", "Cancel"
4. If no duplicate, proceed normally

**Prompt Template:**
```
Compare this new opportunity against existing opportunities:

New: {name} - {thesis}

Existing:
{list_of_existing_opportunities}

Identify if this is a duplicate or near-duplicate.
Return JSON: {is_duplicate: boolean, match_id?: string, confidence: number, reasoning: string}
```

**API Route:** `POST /api/opportunities/check-duplicate`

---

### 4. Entity Linking UI

**Location:** Add entity linking section to `/pipeline/[id]` detail page

**Components to create:**
- `EntityLinker` — Search and link entities to opportunity
- `LinkedEntityList` — Display linked entities with relationship type

**Behavior:**
1. Search input with debounced entity search
2. Results dropdown showing entity name, type, slug
3. Click to add with relationship type (primary/related)
4. Linked entities displayed as chips with remove button
5. Changes write to `opportunity_entities` junction table

**API Routes:**
- `GET /api/entities/search?q=` — Search entities
- `POST /api/opportunities/[id]/entities` — Link entity
- `DELETE /api/opportunities/[id]/entities/[entityId]` — Unlink entity

---

### 5. Multiple Owner Assignment

**Location:** Add owner selector to `/pipeline/[id]` detail page

**Components to create:**
- `OwnerSelector` — Multi-select dropdown for team members
- `OwnerList` — Display assigned owners

**Behavior:**
1. Fetch team members from `users` table
2. Multi-select dropdown with search
3. Changes write to `opportunity_owners` junction table
4. Activity logged for owner changes

**API Routes:**
- `GET /api/users` — Fetch team members
- `POST /api/opportunities/[id]/owners` — Add owner
- `DELETE /api/opportunities/[id]/owners/[userId]` — Remove owner

---

### 6. Chat Interface

**Location:** New route `/pipeline/chat` or sidebar component

**Components to create:**
- `OpportunityChat` — Chat interface component
- Message history display
- Input with send button

**Behavior:**
1. User asks natural language questions about opportunities
2. System retrieves relevant opportunities from database
3. Claude generates response with context
4. Example queries:
   - "What opportunities are in the Qualified stage?"
   - "Show me all opportunities related to RWA"
   - "Which opportunities haven't been updated in a week?"

**API Route:** `POST /api/opportunities/chat`

**Implementation Note:** Consider using function calling or RAG pattern to query database.

---

### 7. Stage 3 Integration (Opportunity Extraction)

**Location:** Modify `scripts/stages/stage3-extract.ts`

**Behavior:**
1. Enhance Stage 3 prompt to extract opportunities alongside entities
2. Extracted opportunities stored with `source_job_id` reference
3. Auto-assigned to default workflow (BD) with "Surfaced" stage
4. Confidence from AI extraction mapped directly

**Prompt Addition:**
```
In addition to entities, identify potential opportunities:
- Business development targets (companies to partner with)
- Product ideas mentioned
- Research questions worth exploring

For each opportunity, provide:
- name: Short descriptive name
- thesis: Core value proposition (2-3 sentences)
- angle: Outreach hook or timing rationale
- confidence: 0-100 score based on evidence strength
- linked_entities: Entity slugs this relates to
```

**Files to modify:**
- `scripts/stages/stage3-extract.ts` — Add opportunity extraction
- `packages/core/src/types.ts` — Add `ExtractedOpportunity` type
- Pipeline orchestrator — Handle opportunity insertion

---

## Design Requirements

All new UI must follow **Making Software aesthetic**:

| Element | Pattern |
|---------|---------|
| Buttons | `font-mono text-xs uppercase tracking-[0.05em]` |
| Modals | Sharp edges, 1px border, white bg |
| Form labels | `font-mono text-xs uppercase tracking-[0.08em]` |
| Loading states | "GENERATING..." mono uppercase |
| Section headers | Dotted border top, accent color |

Reference: `docs/design/DESIGN_LIBRARY_MAKING_SOFTWARE.md`

---

## API Architecture

```
/api/opportunities/
├── [id]/
│   ├── generate-strategy   POST → Claude API → Update strategy column
│   ├── generate-email      POST → Claude API → Update email_draft column
│   ├── entities/
│   │   └── [entityId]      POST/DELETE → opportunity_entities
│   └── owners/
│       └── [userId]        POST/DELETE → opportunity_owners
├── check-duplicate         POST → Claude API → Return match analysis
└── chat                    POST → RAG/Claude → Return response
```

---

## Testing Checklist

- [ ] Strategy generation produces well-structured markdown
- [ ] Email generation returns valid JSON with subject/body
- [ ] Duplicate detection triggers on similar opportunities
- [ ] Entity search returns relevant results
- [ ] Entity linking persists to database
- [ ] Owner assignment works with multiple users
- [ ] Chat responds to natural language queries
- [ ] Stage 3 extracts opportunities from transcripts
- [ ] All UI follows Making Software aesthetic
- [ ] Error states handled gracefully

---

## Instructions

1. Read the full spec: `docs/specs/SPEC_OPPORTUNITY_PIPELINE.md`
2. Review existing components: `apps/portal/src/components/pipeline/`
3. Review existing pages: `apps/portal/src/app/pipeline/`
4. Implement features in order (1-7) — each builds on previous
5. Test after each feature before proceeding
6. Run build verification: `npm run build`

**Do NOT ask questions — the spec is fully elicited. Implement end-to-end.**
