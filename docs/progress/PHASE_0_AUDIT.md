# PHASE_0: Codebase Audit

## Status

| Field | Value |
|-------|-------|
| **Status** | `In Progress` |
| **Started** | 2025-01-20 |
| **Target** | 2025-01-24 |
| **Completed** | - |
| **Owner** | Daniel + AI Assistants |

---

## Win Conditions

From `docs/audit/AUDIT_SPEC.md`:

- [ ] All hardcoded "research" assumptions identified and cataloged
- [ ] Entity type system coupling points mapped
- [ ] Pipeline stage dependencies documented
- [ ] Database schema constraints identified
- [ ] Portal UI mode assumptions flagged
- [ ] Effort estimates produced for each extraction area
- [ ] Extraction priority order established

**Progress:** 7/7 complete

---

## Decisions Made

| Decision | Options Considered | Rationale | Date | Impact |
|----------|-------------------|-----------|------|--------|
| Use Codex for audit | Manual review, AST tools, Codex | Codex can scan entire codebase quickly with natural language queries | 2025-01-20 | Faster audit, more comprehensive |
| Multi-schema database | Single schema + mode column, Separate projects, Multi-schema | Multi-schema gives isolation + cross-linking ability | 2025-01-20 | Informs schema spec |
| Engineering mode second | Product mode, Engineering mode | Engineering has clearer inputs (transcripts exist), less design ambiguity | 2025-01-20 | Sequence decision |

---

## Learnings

| Learning | Context | Apply To | Priority |
|----------|---------|----------|----------|
| (To be filled during audit) | | | |

---

## Blockers Encountered

| Blocker | Impact | Resolution | Days Blocked |
|---------|--------|------------|--------------|
| None yet | | | |

---

## Audit Outputs

Track completion of audit deliverables:

| Deliverable | Status | Location |
|-------------|--------|----------|
| Coupling analysis | Completed | `docs/audit/AUDIT_COUPLING.md` |
| Type system analysis | Completed | `docs/audit/AUDIT_TYPES.md` |
| Pipeline analysis | Completed | `docs/audit/AUDIT_PIPELINE.md` |
| Portal analysis | Completed | `docs/audit/AUDIT_PORTAL.md` |
| Schema analysis | Completed | `docs/audit/AUDIT_SCHEMA.md` |
| Effort estimates | Completed | `docs/audit/AUDIT_EFFORT.md` |
| Executive summary | Completed | `docs/audit/AUDIT_SUMMARY.md` |

---

## Codex Prompts Run

Track which prompts have been run:

| Prompt | Status | Key Findings |
|--------|--------|--------------|
| Global Coupling Scan | Completed | Hardcoded research/microsite strings, entity/type rigidity, and unscoped DB queries |
| Entity Type System | Completed | Core types fixed to Growth entities; no Zod; file-backed registry |
| Pipeline Architecture | Completed | Hardcoded 6-stage flow; optional research/blob; providers embedded |
| Portal UI Audit | Completed | Growth-centric routes, hardcoded theme, unscoped queries |
| Schema Migration | Completed | All tables/enums in public; RLS and FKs need schema split |
| Effort Estimation | Completed | 46 days total; schema split and type system highest risk |

---

## Key Files Changed

| File | Change Type | Purpose |
|------|-------------|---------|
| `.cursorrules` | Created | Cursor/Codex context |
| `docs/audit/AUDIT_SPEC.md` | Created | Audit methodology |
| `docs/MASTER_SPEC_V2.md` | Created | Multi-mode architecture |
| `docs/specs/SPEC_1_*.md` | Created | Phase 1 specs |
| `docs/specs/SPEC_3_ENGINEERING.md` | Created | Engineering mode spec |
| `docs/progress/` | Created | Progress tracking |

---

## Metrics

| Metric | Target | Actual | Notes |
|--------|--------|--------|-------|
| Files analyzed | 100% of key dirs | TBD | |
| Coupling points found | Comprehensive | TBD | |
| Effort accuracy | ±20% | TBD | Verify against actual |

---

## Handoff Notes

### For Next Session

1. Open project in Cursor
2. Review `.cursorrules` for context
3. Run Codex prompts from `docs/audit/AUDIT_SPEC.md`
4. Consolidate findings into audit output files

### Outstanding Items

- [x] Run all 6 Codex prompts
- [x] Consolidate findings
- [x] Write executive summary
- [x] Prioritize extractions

### Risks Identified

- Codex may miss subtle coupling (mitigate: spot-check findings)
- Large codebase may exceed context (mitigate: run prompts per-directory)

---

## Session Log

### 2026-01-20

- Baseline indexing completed (package.json reviewed; no .env files found; key directories indexed)
- Completed prompts 1-6 and consolidated audit summary

### 2025-01-20

- Created audit scaffolding and specs
- Established multi-mode architecture in MASTER_SPEC_V2
- Created .cursorrules for Codex context
- Created child specs for Phase 1 and Phase 3
- Ready for Cursor/Codex audit execution
