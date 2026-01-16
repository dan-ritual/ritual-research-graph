# Ritual Research Graph

Transform meeting transcripts into interconnected, Wikipedia-style microsites.

---

## Mode

**Current:** `/dev-mode` (default)

| Command | Purpose |
|---------|---------|
| `/dev-mode` | Building the system — full codebase access |
| `/op-mode` | Using the system — research operations |

Mode state: `.claude/mode.json`

---

## CRITICAL: Phase Transition Protocol

**MANDATORY:** Before starting ANY new phase (1a→1b, 1b→2, 2→3, etc.), you MUST run an exhaustive elicitation loop with the user using AskUserQuestionTool.

### Why This Exists
Phases build on each other. Misalignment at phase boundaries compounds into wasted work. The elicitation ensures:
- Requirements are fully understood
- Edge cases are surfaced
- User preferences are captured
- Spec gaps are identified before implementation

### Elicitation Protocol

When transitioning to a new phase:

1. **Read the phase spec** (`docs/specs/SPEC_*.md`)
2. **Identify decision points** — anything ambiguous or with multiple valid approaches
3. **Run recursive elicitation** — use AskUserQuestionTool in a loop:
   - Ask 2-4 questions per round
   - Dig deeper on answers that reveal complexity
   - Continue until user says "proceed" or all ambiguity is resolved
4. **Document decisions** — Update CHANGELOG.md with elicitation outcomes
5. **Only then begin implementation**

### Example Elicitation Questions

- "The spec mentions X — should this be [option A] or [option B]?"
- "I see a dependency on Y — is that already in place?"
- "There are 3 approaches to Z: [list]. Which aligns with your priorities?"
- "The spec doesn't address [edge case]. How should we handle it?"

### Enforcement

This rule is enforced in:
- `CLAUDE.md` (this file) — Claude reads this on every session
- `.claude/scripts/generate-kickoff.ts` — New phase kickoffs include elicitation reminder
- Phase handoffs — Must include "elicitation complete" confirmation

**DO NOT SKIP THIS.** If you find yourself starting implementation without asking questions, STOP and elicit.

---

## Shared Context

### What This Project Does

1. **Input:** Meeting transcripts
2. **Process:** 6-stage multi-AI pipeline (Claude → Grok → Perplexity → bird-cli → Claude)
3. **Output:** Static microsite + entities in knowledge graph
4. **Result:** Interconnected research where entities link across sessions

### Quick Reference

| What | Where |
|------|-------|
| Master Spec | `docs/MASTER_SPEC.md` |
| Project Overview | `docs/project-overview.html` |
| Phase Specs | `docs/specs/SPEC_*.md` |
| **Canonical Maps** | `docs/MASTER_MAP.md` + `docs/maps/` |
| Design Docs | `docs/design/` |

### Documentation Hierarchy

```
CLAUDE.md                    ← You are here (project instructions)
    │
    ├── docs/MASTER_SPEC.md  ← Architecture decisions, requirements
    │   └── docs/specs/      ← Phase-specific specifications
    │
    ├── docs/MASTER_MAP.md   ← Visual system topology (ASCII/Mermaid)
    │   └── docs/maps/       ← Detailed visual documentation
    │       ├── MAP_PIPELINE.md      (6-stage processing flow)
    │       ├── MAP_DATA.md          (ERD, schema relationships)
    │       ├── MAP_AUTH.md          (OAuth, RLS, role hierarchy)
    │       └── MAP_INFRASTRUCTURE.md (deployment, connections)
    │
    └── docs/project-overview.html   ← Single-page summary (v0.1.2)
```

**Maps vs Specs:** Specs define *what* to build and *why*. Maps visualize *how* it all connects. Always read both when implementing.

### Key Decisions

- **Database**: Supabase (Postgres)
- **Auth**: Google OAuth, @ritual.net restriction
- **Portal**: Next.js (Phase 2)
- **Microsites**: React/Vite, Making Software aesthetic
- **AI Providers**: Claude PRIMARY (reasoning), Grok/Perplexity SECONDARY (enrichment)

### AI Provider Hierarchy

| Tier | Provider | API Key | Role |
|------|----------|---------|------|
| **PRIMARY** | Claude | `ANTHROPIC_API_KEY` | All core reasoning: artifacts, extraction, synthesis, config |
| SECONDARY | Grok | `XAI_API_KEY` | Real-time context enrichment (can fail gracefully) |
| SECONDARY | Perplexity | `PERPLEXITY_API_KEY` | Deep research with citations (can fail gracefully) |
| INTERNAL | bird-cli | SSH key | Twitter data retrieval |

See `docs/maps/MAP_PIPELINE.md` for the full provider sequence diagram.

---

## Dev Mode

> **For building the system.** Full access to specs, code, migrations.

### Current Phase

**Phase 1a: Database & Storage** — Supabase foundation

```
Phase 0 ──► Phase 1a ──► Phase 1b ──► Phase 2 ──► Phase 3 ──► Phase 4
(done)      (current)    Pipeline     Portal      Graph       Edit
```

### Session Continuity

Dev sessions use `.claude/handoffs/` for state preservation.

**Before starting:**
```bash
npx tsx .claude/scripts/resume-handoff.ts --latest
```

**Before ending:**
```bash
cat << 'EOF' | npx tsx .claude/scripts/create-handoff.ts
{
  "phase": "1a",
  "status": "in-progress",
  "summary": "[What you accomplished]",
  "nextSteps": ["[Next step]"]
}
EOF
```

**Auto-handoff:** PreCompact hook creates handoffs before context compaction.

### Dev Resources

| Resource | Location |
|----------|----------|
| Source Transcripts | `inputs/transcripts/` |
| Generated Microsites | `outputs/microsites/` |
| Dev Handoffs | `.claude/handoffs/` |
| Core Types | `packages/core/src/types.ts` |
| Entity Registry | `packages/core/src/registry.ts` |
| Migrations | `supabase/migrations/` |

### Generate Kickoff Prompts

```bash
npx tsx .claude/scripts/generate-kickoff.ts --phase 1a
npx tsx .claude/scripts/generate-kickoff.ts --phase 1a --continue
```

### Anti-Patterns

- Don't create specs without updating MASTER_SPEC.md
- Don't bypass handoff system — always create handoffs at stopping points
- Don't hardcode paths — use PROJECT_ROOT pattern
- Don't store secrets in code — use .env

---

## Op Mode

> **For using the system.** Research operations only — dev tooling hidden.

### Capability Status

Capabilities unlock as phases complete:

| Capability | Phase | Status |
|------------|-------|--------|
| Generate microsite from transcript | 1b | Pending |
| Manage entity registry | 2 | Pending |
| Browse knowledge graph | 3 | Pending |
| Edit artifacts (spot treatment) | 4 | Pending |

### Research Workflows

**Generate Microsite (Phase 1b+):**
```bash
npm run generate -- \
  --transcript ./path/to/transcript.md \
  --workflow market-landscape \
  --title "Research Title"
```

**Conversational:**
- "I have notes from our research call about Ondo Finance"
- "Generate a microsite from the Q1 strategy transcript"
- "Show me all entities related to tokenized treasuries"

### Op Logs

Research sessions use `.claude/op-logs/` (separate from dev handoffs).

---

## File Conventions

| Type | Pattern |
|------|---------|
| Specs | `docs/specs/SPEC_*.md` |
| Dev Handoffs | `.claude/handoffs/rrg-{phase}-{date}-{seq}.md` |
| Op Logs | `.claude/op-logs/op-{date}-{seq}.md` |
| Scripts | TypeScript with `npx tsx` |
| Hooks | Shell wrapper → TypeScript handler |
