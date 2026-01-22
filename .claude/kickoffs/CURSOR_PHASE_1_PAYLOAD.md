# Cursor Payload: Phase 1 Implementation

> **Created:** 2026-01-20
> **Models:** Opus 4.5, GPT 5.2 Codex, Claude Code CLI
> **Project:** Ritual OS Multi-Mode Architecture

---

## Context Summary

You're implementing Phase 1 of Ritual OS — a three-mode knowledge system. The audit is complete, decisions are made, specs are ready.

### The Three Modes

| Mode | Name | Color | Domain |
|------|------|-------|--------|
| Blue | Ritual Growth | #3B5FE6 | BD/CRM, external opportunities |
| Green | Ritual Engineering Graph | #3BE65B | Engineering wiki, meeting ingestion |
| Red | Ritual Skunkworks | #E63B3B | Product ideas, prototypes |

### Key Decisions Made

1. **Entity types:** Code-driven (TypeScript config files)
2. **Schema migration:** Maintenance window (5-15 min) acceptable
3. **Pipeline:** Sequential execution (no parallelism for now)
4. **Cross-linking:** Manual only (AI-assisted deferred to future spec)

---

## Phase 1 Components

Phase 1 has three parallel work streams:

### 1. Mode System (SPEC_1_MODE_SYSTEM.md) — 10 days

**Goal:** Extract mode abstraction layer, URL-based routing, config-driven entities.

**Key files to create:**
```
packages/core/src/modes/
├── types.ts              # ModeConfig, EntityTypeConfig, StageConfig
├── growth.config.ts      # Growth mode configuration
├── engineering.config.ts # Engineering mode (placeholder)
├── product.config.ts     # Skunkworks mode (placeholder)
└── index.ts              # Mode registry, getModeConfig()

apps/portal/src/
├── contexts/ModeContext.tsx    # Mode context provider
├── app/page.tsx                # Mode selector landing
├── app/[mode]/layout.tsx       # Mode layout (theme, nav)
└── app/[mode]/dashboard/page.tsx
```

**Migration steps:**
1. Create mode system (no breaking changes)
2. Add mode routing with `/[mode]/` structure
3. Migrate existing routes under `/growth/`
4. Update components to use mode config

### 2. Schema Split (SPEC_1_SCHEMA_SPLIT.md) — 12 days

**Goal:** Migrate from `public.*` to multi-schema (`growth.*`, `engineering.*`, `product.*`, `shared.*`).

**Key migrations to create:**
```
supabase/migrations/
├── 008_create_schemas.sql           # Create new schemas
├── 009_create_shared_tables.sql     # users, cross_links
├── 010_migrate_to_growth.sql        # Copy public → growth
├── 011_update_rls_policies.sql      # New RLS per schema
└── 012_create_engineering_schema.sql # Empty engineering tables
```

**Risks from audit:**
- Circular FK between `microsites` and `generation_jobs`
- Enums hardcoded (need per-mode replacement strategy)
- Helper functions bound to `public` tables

### 3. Theme System (SPEC_1_THEME_SYSTEM.md) — 3 days

**Goal:** CSS variable theming with mode-aware color switching.

**Key changes:**
```css
/* Mode themes via data-mode attribute */
[data-mode="growth"] { --mode-accent: #3B5FE6; }
[data-mode="engineering"] { --mode-accent: #3BE65B; }
[data-mode="skunkworks"] { --mode-accent: #E63B3B; }
```

**Files to modify:**
- `apps/portal/src/app/globals.css` — Add mode CSS variables
- `apps/portal/src/app/[mode]/layout.tsx` — Set data-mode attribute
- All components using hardcoded `#3B5FE6` — Replace with `var(--mode-accent)`

---

## File References

### Specs (read these first)
- `docs/MASTER_SPEC_V2.md` — Architecture and decisions
- `docs/specs/SPEC_1_MODE_SYSTEM.md` — Mode system details
- `docs/specs/SPEC_1_SCHEMA_SPLIT.md` — Schema migration details
- `docs/specs/SPEC_3_ENGINEERING.md` — Engineering mode (for context)

### Audit Findings (understand the codebase)
- `docs/audit/AUDIT_COUPLING.md` — Hardcoded references to fix
- `docs/audit/AUDIT_TYPES.md` — Type system to extract
- `docs/audit/AUDIT_PIPELINE.md` — Pipeline architecture
- `docs/audit/AUDIT_PORTAL.md` — UI components to update
- `docs/audit/AUDIT_SCHEMA.md` — Database structure

### Existing Code (key files)
- `packages/core/src/types.ts` — Current type definitions
- `packages/core/src/registry.ts` — Current entity registry
- `apps/portal/src/app/` — Current route structure
- `apps/portal/src/components/` — Current components
- `supabase/migrations/` — Current migrations (001-007)

---

## Implementation Order

### Week 1-2: Foundation

**Day 1-3:** Mode System Foundation
- [ ] Create `packages/core/src/modes/types.ts`
- [ ] Create `packages/core/src/modes/growth.config.ts`
- [ ] Create placeholder configs for engineering/product
- [ ] Create mode registry index

**Day 4-5:** Mode Context
- [ ] Create `ModeContext.tsx` and `useMode()` hook
- [ ] Add ModeProvider to root layout
- [ ] Test mode detection from URL

**Day 6-8:** Schema Foundation
- [ ] Create migration `008_create_schemas.sql`
- [ ] Create `shared.*` tables (users, cross_links)
- [ ] Test schema creation in dev

**Day 9-10:** Route Migration
- [ ] Create `/[mode]/layout.tsx`
- [ ] Create mode selector landing page
- [ ] Begin migrating routes to `/growth/*`

### Week 3-4: Migration & Integration

**Day 11-14:** Schema Migration
- [ ] Create data migration scripts
- [ ] Handle circular FK issue
- [ ] Update app queries to use `growth.*`
- [ ] Test full migration in staging

**Day 15-17:** Component Updates
- [ ] Update Header for mode-aware nav
- [ ] Update entity components for config-driven types
- [ ] Remove hardcoded entity type references
- [ ] Add theme system CSS variables

**Day 18-20:** Testing & Polish
- [ ] Run full regression tests
- [ ] Fix any issues found
- [ ] Update documentation
- [ ] Prepare for Phase 2

---

## Commands

### Development
```bash
# Start portal
cd apps/portal && npm run dev

# Run migrations (local)
cd supabase && npx supabase db push

# Type check
npm run typecheck

# Test
npm test
```

### Useful Searches
```bash
# Find hardcoded entity types
rg "company|protocol|person|concept|opportunity" --type ts

# Find hardcoded colors
rg "#3B5FE6" --type css --type tsx

# Find public.* table references
rg "from\(['\"]" --type ts

# Find microsite assumptions
rg "microsite" --type ts
```

---

## Critical Warnings

1. **Don't break Growth mode** — All existing functionality must keep working
2. **Don't change data** — Schema split must preserve all existing data
3. **Explicit schema prefixes** — Use `growth.entities`, not search_path
4. **No AI cross-linking yet** — Manual only for Phase 1

---

## Progress Tracking

Update `docs/progress/PHASE_1_MODE.md` as you work:
- Mark win conditions complete
- Log decisions made
- Note blockers encountered
- Capture learnings

---

## Questions?

If blocked or uncertain:
1. Check the specs first
2. Check the audit reports
3. Ask in chat with context

Good luck! 🚀
