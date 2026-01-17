# Phase 3: Knowledge Graph UI Specification

**Status:** Ready for Implementation
**Phase:** 3
**Depends On:** Phase 2 (Portal MVP), Phase 2.5b (Opportunity Pipeline)
**Blocks:** Phase 4 (Spot Treatment)

---

## Overview

Transform the entity registry from a backend data structure into a navigable, Wikipedia-style knowledge graph UI. Users should be able to:
- Browse all entities with search/filter
- View single entity pages showing all appearances across microsites
- See related research automatically surfaced
- Navigate seamlessly: microsite → entity → related microsites

---

## Deliverables

### 3.1 Entity Registry Browser (`/entities`)

**Route:** `apps/portal/src/app/entities/page.tsx`

**Features:**
- List all entities from `entities` table
- Search by name (debounced, 300ms)
- Filter by type (Company, Protocol, Person, Concept, Opportunity)
- Sort by: name, appearance count, last updated
- Pagination (20 per page)
- Click entity → navigate to detail page

**UI Components:**
```
┌─────────────────────────────────────────────────────────────────┐
│ ENTITIES                                    [Search...] [Filter▾]│
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ONDO FINANCE                              COMPANY    12 ↗ │  │
│  │ Tokenized treasury leader with OUSG product               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ BLACKROCK                                 COMPANY     8 ↗ │  │
│  │ Traditional finance giant entering tokenization           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  [1] [2] [3] ... [Next →]                                       │
└─────────────────────────────────────────────────────────────────┘
```

**Data Query:**
```sql
SELECT e.*, COUNT(ea.id) as appearance_count
FROM entities e
LEFT JOIN entity_appearances ea ON e.id = ea.entity_id
WHERE e.status = 'active'
GROUP BY e.id
ORDER BY appearance_count DESC
LIMIT 20 OFFSET ?
```

---

### 3.2 Entity Detail Page (`/entities/[slug]`)

**Route:** `apps/portal/src/app/entities/[slug]/page.tsx`

**Sections:**

#### Header
- Entity name (canonical)
- Type badge
- Metadata (website, twitter, etc.)
- Edit button (future: Phase 4)

#### Appearances
List all microsites where this entity appears:
```
┌─────────────────────────────────────────────────────────────────┐
│ ONDO FINANCE                                           COMPANY  │
│ ─────────────────────────────────────────────────────────────── │
│ Tokenized treasury market leader. Pioneer of OUSG product.     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ APPEARS IN                                              12 sites │
│ · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ RWA × DeFi × AI                              Jan 2026    │  │
│  │ "Ondo's dominant position in tokenized treasuries..."    │  │
│  │ Section: Protocol Analysis                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Treasury Innovation Deep Dive                 Dec 2025   │  │
│  │ "OUSG has captured 40% of the tokenized treasury..."     │  │
│  │ Section: Market Leaders                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ CO-OCCURS WITH                                          8 entities│
│ · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · │
│                                                                  │
│  [BlackRock] [Centrifuge] [MakerDAO] [RWA] [Tokenization]      │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ LINKED OPPORTUNITIES                                    3 opps  │
│ · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · │
│                                                                  │
│  → Ondo Finance Partnership (BD Pipeline - Qualified)           │
│  → Treasury Integration (Product Pipeline - Researching)        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Data Queries:**
```sql
-- Entity with metadata
SELECT * FROM entities WHERE slug = ?

-- Appearances with context
SELECT ea.*, m.title, m.slug as microsite_slug, m.created_at
FROM entity_appearances ea
JOIN microsites m ON ea.microsite_id = m.id
WHERE ea.entity_id = ?
ORDER BY m.created_at DESC

-- Co-occurrences
SELECT e2.*, er.co_occurrence_count
FROM entity_relations er
JOIN entities e2 ON er.entity_b_id = e2.id
WHERE er.entity_a_id = ?
ORDER BY er.co_occurrence_count DESC
LIMIT 10

-- Linked opportunities
SELECT o.* FROM opportunities o
JOIN opportunity_entities oe ON o.id = oe.opportunity_id
WHERE oe.entity_id = ?
```

---

### 3.3 Related Research Panel (Microsite Enhancement)

**Location:** Add to existing microsite detail page (`/microsites/[slug]`)

**Component:** `RelatedResearchPanel`

Shows:
- Other microsites that share entities with current microsite
- Ranked by entity overlap count
- Quick navigation links

```
┌─────────────────────────────────────────────────────────────────┐
│ RELATED RESEARCH                                                │
│ · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · │
│                                                                  │
│  Treasury Innovation Deep Dive         5 shared entities        │
│  Stablecoin Market Analysis            3 shared entities        │
│  DeFi Infrastructure Report            2 shared entities        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Query:**
```sql
-- Find microsites with overlapping entities
WITH current_entities AS (
  SELECT entity_id FROM entity_appearances WHERE microsite_id = ?
)
SELECT m.*, COUNT(ea.entity_id) as shared_count
FROM microsites m
JOIN entity_appearances ea ON m.id = ea.microsite_id
WHERE ea.entity_id IN (SELECT entity_id FROM current_entities)
  AND m.id != ?
GROUP BY m.id
ORDER BY shared_count DESC
LIMIT 5
```

---

### 3.4 Navigation Integration

**Header Updates:**
Add "Entities" link to main navigation in `components/layout/header.tsx`

**Entity Links:**
Anywhere an entity name appears, make it clickable → `/entities/[slug]`

**Microsite Links:**
On entity pages, microsite names link to `/microsites/[slug]`

---

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/entities` | GET | List entities with pagination, search, filter |
| `/api/entities/[slug]` | GET | Single entity with appearances, co-occurrences |
| `/api/microsites/[slug]/related` | GET | Related microsites by entity overlap |

---

## Components to Create

| Component | File | Purpose |
|-----------|------|---------|
| `EntityCard` | `components/entities/entity-card.tsx` | Card display for entity list |
| `EntityTypeFilter` | `components/entities/entity-type-filter.tsx` | Type dropdown filter |
| `AppearanceList` | `components/entities/appearance-list.tsx` | List of microsite appearances |
| `CoOccurrenceChips` | `components/entities/co-occurrence-chips.tsx` | Linked entity chips |
| `RelatedResearchPanel` | `components/microsites/related-research-panel.tsx` | Related microsites sidebar |

---

## Database Considerations

The following tables already exist from Phase 1a:
- `entities` — Entity registry
- `entity_appearances` — Junction: entity ↔ microsite
- `entity_relations` — Co-occurrence counts

Ensure indexes exist for common queries:
```sql
CREATE INDEX IF NOT EXISTS idx_entity_appearances_entity ON entity_appearances(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_appearances_microsite ON entity_appearances(microsite_id);
CREATE INDEX IF NOT EXISTS idx_entity_relations_a ON entity_relations(entity_a_id);
```

---

## Design Requirements

All UI must follow **Making Software aesthetic**:

| Element | Style |
|---------|-------|
| Page headers | `font-mono text-xs uppercase tracking-[0.12em] text-[#3B5FE6]` |
| Entity cards | Sharp edges, 1px border, white bg |
| Type badges | Mono, uppercase, muted color |
| Section dividers | Dotted border, 0.3 opacity accent |
| Links | Accent color, dotted underline on hover |

Reference: `docs/design/DESIGN_LIBRARY_MAKING_SOFTWARE.md`

---

## Testing Checklist

- [ ] Entity list loads with pagination
- [ ] Search filters entities by name
- [ ] Type filter works correctly
- [ ] Entity detail shows all appearances
- [ ] Co-occurrences display and link correctly
- [ ] Related research panel shows on microsite detail
- [ ] Navigation between entity ↔ microsite works
- [ ] Empty states handled gracefully
- [ ] Build passes

---

## Implementation Order

1. API routes (`/api/entities`, `/api/entities/[slug]`)
2. Entity list page (`/entities`)
3. Entity detail page (`/entities/[slug]`)
4. Related research panel (add to microsites)
5. Navigation updates (header, entity links)
6. Polish and testing

---

*Spec created: 2026-01-16*
