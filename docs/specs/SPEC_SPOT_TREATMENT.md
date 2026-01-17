# Phase 4: Spot Treatment Editing Specification

**Status:** Ready for Implementation
**Phase:** 4
**Depends On:** Phase 3 (Graph UI)
**Blocks:** None (final feature phase)

---

## Overview

Enable surgical editing of generated artifacts without regenerating entire documents. Users can:
- View artifacts in a structured editor
- Select specific sections to regenerate
- Provide edit instructions while freezing surrounding content
- Review entity extractions before committing to registry
- Merge duplicate entities with AI assistance

---

## Deliverables

### 4.1 Artifact Viewer/Editor (`/jobs/[id]/edit`)

**Route:** `apps/portal/src/app/jobs/[id]/edit/page.tsx`

**Features:**
- Display all artifacts for a generation job
- Section-based view (parsed from markdown headers)
- Read-only by default, sections become editable on click
- Track which sections have been edited

**UI Structure:**
```
┌─────────────────────────────────────────────────────────────────┐
│ EDIT ARTIFACTS                           [Save] [Regenerate All]│
│ Job: RWA × DeFi × AI                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ARTIFACT: Intelligence Brief                                    │
│ · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ## Executive Summary                              [FROZEN]│  │
│  │                                                           │  │
│  │ The RWA market has reached an inflection point with      │  │
│  │ TVL crossing $35B in January 2026...                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ## Market Analysis                        [EDIT] [REGEN] │  │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│  │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│  │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ## Recommendations                                [FROZEN]│  │
│  │                                                           │  │
│  │ 1. Position Ritual as hybrid infrastructure...           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 4.2 Spot Treatment Regeneration

**Interaction Flow:**

1. User clicks [REGEN] on a section
2. Modal opens with:
   - Current section content (read-only preview)
   - Text area for edit instructions
   - Preview of frozen context (collapsed)
3. User enters instructions: "Focus more on Zivoe's spigot mechanism"
4. System calls Claude with spot treatment prompt
5. New content replaces section
6. Section marked as "edited"

**Spot Treatment Modal:**
```
┌─────────────────────────────────────────────────────────────────┐
│ REGENERATE SECTION                                         [✕]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ CURRENT CONTENT                                                 │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ The protocol landscape shows three dominant players:     │   │
│ │ Ondo Finance (45% share), Centrifuge (25%), and...      │   │
│ └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│ EDIT INSTRUCTIONS                                               │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ Focus more specifically on Zivoe's spigot mechanism      │   │
│ │ and how it differs from traditional yield distribution.  │   │
│ │                                                          │   │
│ └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│ [▸ Show frozen context]                                         │
│                                                                  │
│                              [Cancel]  [Regenerate Section]     │
└─────────────────────────────────────────────────────────────────┘
```

**Claude Prompt Template:**
```
You are editing a specific section of a research document.

CONTEXT (frozen, for reference only):
---
{frozen_before_summary}
---

SECTION TO REGENERATE:
Current content:
---
{current_section}
---

User instructions: {edit_instructions}

CONTEXT (frozen, for reference only):
---
{frozen_after_summary}
---

Requirements:
- Generate ONLY the replacement for the target section
- Maintain consistent tone and formatting with surrounding content
- Do not include the section header (## Market Analysis) - just the body
- Keep similar length unless instructions specify otherwise

Output the new section content:
```

---

### 4.3 Entity Review Flow (`/jobs/[id]/review`)

**Route:** `apps/portal/src/app/jobs/[id]/review/page.tsx`

This page already exists but needs enhancement for:
- Showing extracted entities before committing
- Allow approve/reject/edit each entity
- Detect potential duplicates

**Enhanced UI:**
```
┌─────────────────────────────────────────────────────────────────┐
│ REVIEW ENTITIES                                    [Approve All]│
│ Job: RWA × DeFi × AI                          14 entities found │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ✓  ONDO FINANCE                               COMPANY    │  │
│  │    Extracted: "Ondo Finance"                             │  │
│  │    ⚠ Possible duplicate: "Ondo" (existing)              │  │
│  │                        [Merge] [Keep Separate] [Reject]  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ✓  BLACKROCK                                  COMPANY    │  │
│  │    Extracted: "BlackRock"                                │  │
│  │    ✓ Matches existing entity                             │  │
│  │                                    [Edit] [Reject]       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ○  ZIVOE PROTOCOL                             PROTOCOL   │  │
│  │    Extracted: "Zivoe"                                    │  │
│  │    ✓ New entity (no duplicates found)                    │  │
│  │                                    [Edit] [Reject]       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  [Approve 12 Selected]  [Skip Review]                           │
└─────────────────────────────────────────────────────────────────┘
```

---

### 4.4 Entity Merge UI

When user clicks [Merge] on a potential duplicate:

**Merge Modal:**
```
┌─────────────────────────────────────────────────────────────────┐
│ MERGE ENTITIES                                             [✕]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ EXTRACTED                          EXISTING                     │
│ ┌─────────────────────────┐       ┌─────────────────────────┐  │
│ │ Ondo Finance            │  ──►  │ Ondo                    │  │
│ │ Type: Company           │       │ Type: Company           │  │
│ │ Appearances: 0          │       │ Appearances: 8          │  │
│ └─────────────────────────┘       └─────────────────────────┘  │
│                                                                  │
│ MERGED RESULT                                                   │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ Canonical Name: [Ondo Finance            ]               │   │
│ │ Type: Company                                            │   │
│ │ Aliases: Ondo, Ondo Finance                              │   │
│ └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│                                      [Cancel]  [Confirm Merge]  │
└─────────────────────────────────────────────────────────────────┘
```

**Merge Logic:**
1. Update existing entity with merged metadata
2. Add extracted name as alias
3. Point new appearance to existing entity
4. No duplicate created

---

### 4.5 Partial Microsite Regeneration

After editing artifacts, user can regenerate the microsite with updated content.

**Button:** "Regenerate Microsite" on `/jobs/[id]/edit`

**Process:**
1. Read updated artifacts from database
2. Re-run SITE_CONFIG generation (Stage 4)
3. Re-build microsite with new content
4. Deploy updated version
5. Keep same slug/URL

---

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/jobs/[id]/artifacts` | GET | List all artifacts for job |
| `/api/jobs/[id]/artifacts/[artifactId]` | GET | Single artifact with sections |
| `/api/jobs/[id]/artifacts/[artifactId]` | PATCH | Update artifact content |
| `/api/jobs/[id]/artifacts/[artifactId]/regenerate-section` | POST | Spot treatment regeneration |
| `/api/jobs/[id]/entities` | GET | Extracted entities with duplicate detection |
| `/api/jobs/[id]/entities/[entityId]/approve` | POST | Approve entity |
| `/api/jobs/[id]/entities/[entityId]/reject` | POST | Reject entity |
| `/api/jobs/[id]/entities/merge` | POST | Merge two entities |
| `/api/jobs/[id]/regenerate-microsite` | POST | Rebuild microsite from artifacts |

---

## Components to Create

| Component | File | Purpose |
|-----------|------|---------|
| `ArtifactEditor` | `components/artifacts/artifact-editor.tsx` | Main editor with sections |
| `ArtifactSection` | `components/artifacts/artifact-section.tsx` | Single editable section |
| `SpotTreatmentModal` | `components/artifacts/spot-treatment-modal.tsx` | Regeneration modal |
| `EntityReviewCard` | `components/entities/entity-review-card.tsx` | Review card with actions |
| `EntityMergeModal` | `components/entities/entity-merge-modal.tsx` | Merge confirmation |
| `DuplicateWarning` | `components/entities/duplicate-warning.tsx` | Duplicate indicator |

---

## Database Changes

### New columns on `artifacts` table:
```sql
ALTER TABLE artifacts ADD COLUMN IF NOT EXISTS
  sections JSONB DEFAULT '[]';
  -- Array of {header, content, edited_at, original_content}

ALTER TABLE artifacts ADD COLUMN IF NOT EXISTS
  last_edited_at TIMESTAMP WITH TIME ZONE;
```

### New table for entity aliases:
```sql
CREATE TABLE IF NOT EXISTS entity_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
  alias TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_entity_aliases_entity ON entity_aliases(entity_id);
CREATE INDEX idx_entity_aliases_alias ON entity_aliases(alias);
```

---

## Markdown Section Parsing

**Parser Function:**
```typescript
interface Section {
  id: string;           // Generated from header
  header: string;       // "## Market Analysis"
  level: number;        // 2 for ##, 3 for ###
  content: string;      // Body text
  startLine: number;
  endLine: number;
}

function parseMarkdownSections(markdown: string): Section[] {
  // Split by ## or ### headers
  // Track line numbers for each section
  // Return array of sections
}
```

---

## Design Requirements

All UI must follow **Making Software aesthetic**:

| Element | Style |
|---------|-------|
| Section cards | Sharp edges, 1px border, hover state |
| Frozen indicator | Muted text, italic, lock icon |
| Edit mode | Accent border highlight |
| Regenerate button | Accent color, mono uppercase |
| Modal | White bg, no border-radius, shadow-xl |

Reference: `docs/design/DESIGN_LIBRARY_MAKING_SOFTWARE.md`

---

## Testing Checklist

- [ ] Artifact viewer displays all sections
- [ ] Click section enables edit mode
- [ ] Spot treatment modal opens correctly
- [ ] Claude regeneration produces valid content
- [ ] Section updates persist to database
- [ ] Entity review shows all extracted entities
- [ ] Duplicate detection works
- [ ] Merge flow updates entity correctly
- [ ] Microsite regeneration works
- [ ] Build passes

---

## Implementation Order

1. Markdown section parser utility
2. Artifact viewer page (`/jobs/[id]/edit`)
3. Section editing (manual text edit)
4. Spot treatment modal + Claude integration
5. Enhanced entity review page
6. Duplicate detection
7. Entity merge flow
8. Microsite regeneration
9. Polish and testing

---

*Spec created: 2026-01-16*
