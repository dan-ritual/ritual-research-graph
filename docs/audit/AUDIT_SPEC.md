# Phase 0: Codebase Audit Specification

## Overview

Before building the multi-mode system (Growth/Engineering/Skunkworks), we must understand the current codebase's coupling points, assumptions, and extraction opportunities.

## Win Conditions

- [ ] All hardcoded "research" assumptions identified and cataloged
- [ ] Entity type system coupling points mapped
- [ ] Pipeline stage dependencies documented
- [ ] Database schema constraints identified
- [ ] Portal UI mode assumptions flagged
- [ ] Effort estimates produced for each extraction area
- [ ] Extraction priority order established

## Audit Areas

### 1. Type System (`packages/core/`)

**Goal:** Identify where entity/artifact types are rigid vs extensible.

**Files to analyze:**
- `packages/core/src/types.ts`
- `packages/core/src/registry.ts`
- `packages/core/src/schemas/`

**Questions:**
- Are entity types an enum or extensible union?
- Can new entity types be added without code changes?
- Is the registry mode-aware or single-mode?

### 2. Database Schema (`supabase/migrations/`)

**Goal:** Understand schema assumptions blocking multi-mode.

**Files to analyze:**
- All files in `supabase/migrations/`
- Any seed files

**Questions:**
- Are tables namespaced or flat?
- Do RLS policies assume single mode?
- Can we split to multi-schema without data loss?
- Are foreign keys cross-mode safe?

### 3. Pipeline Execution (`scripts/`)

**Goal:** Map pipeline rigidity and extraction points.

**Files to analyze:**
- `scripts/generate.ts` (main orchestrator)
- `scripts/stages/*.ts` (individual stages)
- `scripts/lib/*.ts` (AI provider wrappers)

**Questions:**
- Are stages hardcoded in sequence or configurable?
- Can stages be skipped/reordered per mode?
- Are AI calls mode-aware?
- What's the stage → output mapping?

### 4. Portal Application (`apps/portal/`)

**Goal:** Identify UI assumptions that block multi-mode.

**Files to analyze:**
- `apps/portal/src/app/` (routes)
- `apps/portal/src/components/` (shared components)
- `apps/portal/src/lib/` (utilities)

**Questions:**
- Are routes mode-agnostic or research-specific?
- Is theming centralized or scattered?
- Do components assume entity types?
- Is navigation mode-aware?

### 5. Configuration & Environment

**Goal:** Understand current config patterns.

**Files to analyze:**
- `.env.example` or `.env.local`
- `package.json` (scripts)
- Any config files

**Questions:**
- Is mode selectable via env/config?
- Are API keys mode-specific?
- Can pipelines be configured externally?

---

## Codex Prompts

Use these prompts in Cursor with Codex to conduct the audit.

### Prompt 1: Global Coupling Scan

```
Analyze this codebase for a multi-mode refactor. We're converting a single-mode
"research" application into a three-mode system (Growth, Engineering, Skunkworks).

Scan ALL files and identify:

1. **Hardcoded strings**: Find all occurrences of "research", "entity", "artifact",
   "microsite" that assume single-mode operation.

2. **Type rigidity**: Find type definitions that would need generalization
   (enums, literal unions, interface names).

3. **Database assumptions**: Find Supabase queries that assume single schema.

4. **Route assumptions**: Find Next.js routes that assume single mode.

Output a table for each category:
| File | Line | Code Snippet | Issue | Extraction Needed |
```

### Prompt 2: Entity Type System Deep Dive

```
Focus on the entity/type system in this codebase.

Analyze:
- packages/core/src/types.ts
- packages/core/src/registry.ts
- packages/core/src/schemas/

Answer:
1. How are entity types currently defined? (enum, union, interface)
2. What would it take to make entity types mode-specific?
3. Is there a registry pattern? Is it extensible?
4. What validation (Zod?) exists and is it mode-aware?

Produce a recommendation for making the type system support:
- Growth mode entities: Company, Protocol, Person, Opportunity
- Engineering mode entities: Feature, Topic, Decision, Component
- Skunkworks mode entities: Idea, Spec, Prototype, Experiment
```

### Prompt 3: Pipeline Architecture Analysis

```
Analyze the pipeline/execution system in scripts/.

Map the current flow:
1. What is the entry point? (scripts/generate.ts?)
2. What stages exist in scripts/stages/?
3. How are stages orchestrated (sequential, parallel, configurable)?
4. Which AI providers are called where?

For each stage, document:
| Stage | Input | Output | AI Provider | Mode-Specific? | Can Skip? |

Then answer:
- Can we add a new pipeline for Engineering mode without duplicating code?
- What abstraction would allow mode-specific stage configuration?
- Where are the tight couplings that block this?
```

### Prompt 4: Portal UI Audit

```
Analyze the Next.js portal in apps/portal/.

Focus on:
1. **Routing**: Are routes generic or research-specific?
2. **Components**: Do components assume entity types?
3. **Theming**: Is color/styling centralized?
4. **Data fetching**: Are Supabase calls mode-aware?

For multi-mode support, we need:
- Mode selector in navigation
- Theme switching (blue/green/red)
- Generic entity components that work across modes
- Mode-scoped data queries

Identify what exists vs what needs building.
Output a gap analysis table.
```

### Prompt 5: Schema Migration Planning

```
Analyze supabase/migrations/ for multi-schema refactor.

Current state: Single schema (public.*)
Target state: Multi-schema (research.*, engineering.*, product.*, shared.*)

For each existing table, determine:
| Table | Current Schema | Target Schema | Migration Complexity | Data Preservation |

Identify:
1. Tables that should stay in shared.* (users, cross_links)
2. Tables that should split per mode
3. Foreign key constraints that complicate splitting
4. RLS policies that need mode-awareness

Produce a migration sequence recommendation.
```

### Prompt 6: Effort Estimation

```
Based on your analysis, produce effort estimates for the multi-mode refactor.

Categories:
1. Type system extraction
2. Database schema split
3. Pipeline configuration system
4. Portal mode support
5. Theme system
6. Cross-mode linking

For each, estimate:
| Area | Files Affected | Complexity | Risk | Duration (days) | Dependencies |

Flag any areas where:
- Extraction is blocked by another area
- Risk of breaking existing functionality is high
- Design decisions are needed before implementation
```

---

## Output Files

After running Codex prompts, consolidate findings into:

1. `docs/audit/AUDIT_COUPLING.md` - All coupling points
2. `docs/audit/AUDIT_TYPES.md` - Type system analysis
3. `docs/audit/AUDIT_PIPELINE.md` - Pipeline architecture
4. `docs/audit/AUDIT_PORTAL.md` - UI/Portal findings
5. `docs/audit/AUDIT_SCHEMA.md` - Database analysis
6. `docs/audit/AUDIT_EFFORT.md` - Effort estimates
7. `docs/audit/AUDIT_SUMMARY.md` - Executive summary with priorities

---

## Success Criteria

| Criterion | Measurement | Target |
|-----------|-------------|--------|
| Coverage | % of codebase analyzed | 100% of key directories |
| Actionability | Findings have clear next steps | All findings actionable |
| Prioritization | Clear extraction order | Priority 1-5 ranked |
| Accuracy | Spot-check findings | 95% accurate |

---

## Timeline

- **Day 1:** Run Codex prompts 1-3 (coupling, types, pipeline)
- **Day 2:** Run Codex prompts 4-6 (portal, schema, effort)
- **Day 3:** Consolidate into output files, write summary
- **Day 4:** Review with team, finalize priorities

---

## Post-Audit

Once audit is complete, proceed to:
1. `MASTER_SPEC_V2.md` - Informed by audit findings
2. Child specs - Scoped by audit effort estimates
3. Phase 1 implementation - Starting with highest-impact extractions
