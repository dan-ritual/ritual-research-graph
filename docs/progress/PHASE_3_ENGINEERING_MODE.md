# PHASE_3: Engineering Mode

## Status

| Field | Value |
|-------|-------|
| **Status** | In Progress |
| **Started** | 2026-01-22 |
| **Target** | 2026-02-05 |
| **Completed** |  |
| **Owner** | Ritual Core |

---

## Win Conditions

- [x] Google Meet transcripts ingestable via pipeline (Gemini-formatted text)
- [x] Topics, Decisions, Features, Components extracted from transcripts
- [x] Wiki pages generated per topic with linked content
- [x] Decision log output in ADR-style markdown
- [x] Feature tracking output generated
- [x] One-way Asana task import
- [x] Engineering UI in green theme

**Progress:** 7/7 complete

---

## Decisions Made

| Decision | Options Considered | Rationale | Date | Impact |
|----------|-------------------|-----------|------|--------|
| Store engineering outputs as entities + metadata | New tables vs entity metadata | Aligns with existing schema split | 2026-01-22 | Faster shipping, no new tables |
| Pipeline stages per-mode | Single pipeline vs mode configs | Keeps Growth stable and enables Engineering stage flow | 2026-01-22 | Mode-specific stage control |
| Asana import as optional stage | Separate worker vs pipeline stage | Simplifies one-way sync integration | 2026-01-22 | Env-gated import support |

---

## Learnings

| Learning | Context | Apply To | Priority |
|----------|---------|----------|----------|
| Engineering entities require enum extensions | entity_type and artifact_type were Growth-only | Schema migrations | High |

---

## Blockers Encountered

| Blocker | Impact | Resolution | Days Blocked |
|---------|--------|------------|--------------|
| None |  |  | 0 |

---

## Key Files Changed

| File | Change Type | Purpose |
|------|-------------|---------|
| `packages/core/src/modes/engineering.config.ts` | Modified | Add engineering entity config + pipeline stages |
| `scripts/generate.ts` | Modified | Add engineering pipeline stages + status mapping |
| `scripts/stages/meeting-transcript.ts` | Created | Gemini transcript normalization |
| `scripts/stages/engineering-entities.ts` | Created | Engineering entity extraction |
| `scripts/stages/engineering-wiki.ts` | Created | Wiki + feature tracking outputs |
| `scripts/stages/engineering-sync.ts` | Created | Sync engineering outputs to DB |
| `scripts/stages/asana-import.ts` | Created | One-way Asana import stage |
| `apps/portal/src/app/(modes)/[mode]/wiki/page.tsx` | Created | Engineering wiki list |
| `apps/portal/src/app/(modes)/[mode]/features/page.tsx` | Created | Feature tracking view |
| `apps/portal/src/app/(modes)/[mode]/decisions/page.tsx` | Created | Decision log view |
| `apps/portal/src/app/(modes)/[mode]/components/page.tsx` | Created | Components view |
| `supabase/migrations/017_add_engineering_enums.sql` | Created | Extend enums for engineering types |

---

## Metrics

| Metric | Target | Actual | Notes |
|--------|--------|--------|-------|
| Pipeline stages per mode | Config-driven | Config-driven | Verified in core config |

---

## Handoff Notes

### For Next Session
- Add Google Drive API ingestion (folder polling) if required beyond transcript uploads.
- Consider adding wiki markdown rendering in entity detail view.

### Outstanding Items
- [ ] Wire Google Drive API ingestion (Drive API, auth, folder config)
- [ ] Add feature board kanban view (optional)

### Risks Identified
- Enum migrations must be applied before engineering entity inserts.

---

## Session Log

### 2026-01-22

- Added engineering mode pipeline stages and portal views.
- Implemented transcript ingestion, extraction, wiki output, Asana import, and DB sync.
- Extended enums for new entity/artifact/status values.
