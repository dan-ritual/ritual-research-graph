# Kickoff Prompt Template

This template is used to generate comprehensive kickoff prompts for any phase or continuation session in the Ritual Research Graph project.

**Location:** `.claude/templates/kickoff-prompt.md`
**Generator:** `.claude/scripts/generate-kickoff.ts`

---

## Template Structure

```markdown
I'm {{SESSION_TYPE}} **Phase {{PHASE_ID}}: {{PHASE_NAME}}** for the **Ritual Research Graph** project.

{{#if CONTINUATION}}
## Continuation Context

Resuming from session `{{PREVIOUS_SESSION_ID}}` (Claude: `{{PREVIOUS_CLAUDE_SLUG}}`).

Previous status: {{PREVIOUS_STATUS}}
Previous summary: {{PREVIOUS_SUMMARY}}
{{/if}}

## Project Location
`/Users/danielgosek/dev/projects/ritual/ritual-research-graph`

## Session Continuity System (CRITICAL)

This project has a bespoke handoff system that links to Claude Code's native session management. **USE IT.**

### Before Starting
Read the most recent handoff to understand prior context:
\`\`\`bash
cd /Users/danielgosek/dev/projects/ritual/ritual-research-graph
npx tsx .claude/scripts/resume-handoff.ts --latest
\`\`\`

### During Work
The project has a **PreCompact hook** that automatically creates handoffs before context compaction. The hook is registered in:
- `.claude/settings.json`

### Before Ending / Switching Windows
Create a handoff with full session linking:
\`\`\`bash
cat << 'EOF' | npx tsx .claude/scripts/create-handoff.ts
{
  "phase": "{{PHASE_ID}}",
  "status": "in-progress",
  "summary": "[FILL: What you accomplished]",
  "relevantFiles": [
    { "path": "[file]", "description": "[why relevant]" }
  ],
  "progress": [
    { "task": "[task]", "done": true/false }
  ],
  "nextSteps": ["[next step 1]", "[next step 2]"]
}
EOF
\`\`\`

### Kickoff Prompt Generation
To generate a new kickoff prompt (for yourself or parallel sessions):
\`\`\`bash
npx tsx .claude/scripts/generate-kickoff.ts --phase {{PHASE_ID}}
npx tsx .claude/scripts/generate-kickoff.ts --phase 1b --continuation
\`\`\`

### Session Linking
The handoff system captures:
- **Bespoke ID**: `rrg-{{PHASE_ID}}-YYYYMMDD-HHMM-N`
- **Claude Code UUID**: Native session ID
- **Claude Slug**: Human-readable name
- **JSONL Path**: Full transcript for context recovery

Lookup sessions:
\`\`\`bash
npx tsx .claude/scripts/session-linker.ts --list
npx tsx .claude/scripts/session-linker.ts --lookup <any-id>
\`\`\`

---

## Files to Read First

### Spec Documents (READ ALL BEFORE IMPLEMENTING)
1. `docs/MASTER_SPEC.md` — Master specification with all architecture decisions
2. `docs/{{PRIMARY_SPEC}}` — **PRIMARY SPEC FOR THIS PHASE**
{{#each RELATED_SPECS}}
3. `docs/{{this.path}}` — {{this.description}}
{{/each}}

### Canonical Maps (VISUAL SYSTEM REFERENCE)
These maps provide visual documentation of how components connect. **Read alongside specs.**

1. `docs/MASTER_MAP.md` — System topology overview, component relationships
2. `docs/maps/MAP_PIPELINE.md` — 6-stage processing flow, AI provider sequence
3. `docs/maps/MAP_DATA.md` — Full ERD, schema relationships, data lifecycle
4. `docs/maps/MAP_AUTH.md` — OAuth flow, role hierarchy, RLS policy matrix
5. `docs/maps/MAP_INFRASTRUCTURE.md` — Service topology, deployment flow

**Maps vs Specs:** Specs define *what* to build. Maps visualize *how* it connects.

### Project Context
- `CHANGELOG.md` — All elicitation decisions and version history
- `README.md` — Project overview and architecture diagram

### Handoff System (ALWAYS READ)
- `.claude/handoffs/index.json` — Session registry with Claude Code links
- `.claude/handoffs/session-links.json` — Bidirectional session lookup index
- `.claude/scripts/create-handoff.ts` — Creates handoffs with Claude session capture
- `.claude/scripts/resume-handoff.ts` — Displays resumption prompts
- `.claude/scripts/session-linker.ts` — Bidirectional session lookup utility
- `.claude/scripts/generate-kickoff.ts` — Generates kickoff prompts from this template
- `.claude/templates/kickoff-prompt.md` — THIS TEMPLATE (self-reference)
- `.claude/hooks/pre-compact-handoff.sh` — Auto-handoff on compaction
- `.claude/settings.json` — Hook registration

### Phase-Specific Files
{{#each PHASE_FILES}}
- `{{this.path}}` — {{this.description}}
{{/each}}

---

## Phase {{PHASE_ID}} Implementation Tasks

{{TASKS_TABLE}}

---

## Key Decisions (from CHANGELOG.md elicitation)

{{DECISIONS_TABLE}}

---

## Environment Variables

{{ENV_VARS}}

---

## North Star Alignment

**Mission:** Transform meeting transcripts into interconnected, Wikipedia-style microsites with bi-directional entity linking.

**Phase {{PHASE_ID}} Goal:** {{PHASE_GOAL}}

**Success Criteria:**
{{#each SUCCESS_CRITERIA}}
- [ ] {{this}}
{{/each}}

---

## Implementation Sequence

\`\`\`
Phase 1a ──► Phase 1b ──► Phase 2 ──► Phase 3 ──► Phase 4
Database     Pipeline     Portal      Graph       Edit
{{CURRENT_MARKER}}
\`\`\`

{{DEPENDENCY_NOTE}}

---

## Begin

1. Read all spec documents listed above
2. Use TodoWrite to track implementation tasks
3. Start with the first uncompleted task
4. Create handoffs at natural stopping points
5. Update CHANGELOG.md with progress
6. Generate continuation prompts for parallel work if needed

Let's build the {{PHASE_NAME}} for Ritual Research Graph.
```

---

## Phase Configuration

The generator script uses this configuration to populate the template:

```typescript
const PHASE_CONFIG = {
  '0': {
    name: 'Foundation',
    primarySpec: 'MASTER_SPEC.md',
    goal: 'Establish project structure, types, and specifications',
    status: 'complete'
  },
  '1a': {
    name: 'Database & Storage (Supabase)',
    primarySpec: 'SPEC_DATABASE_SCHEMA.md',
    goal: 'Set up the Supabase foundation so Phase 1b can write directly to the database',
    relatedSpecs: [
      { path: 'SPEC_PROCESSING_PIPELINE.md', description: 'Phase 1b (DEPENDS on 1a)' },
      { path: 'SPEC_MULTI_AI_RESEARCH.md', description: 'Will use Supabase for caching' }
    ],
    files: [
      { path: 'packages/core/src/types.ts', description: 'Entity, Microsite, Opportunity types' },
      { path: 'data/entities.json', description: 'Current entity data (will migrate)' },
      { path: 'data/index.json', description: 'Current microsite index (will migrate)' },
      { path: 'data/opportunities.json', description: 'Opportunity taxonomy (will migrate)' }
    ],
    tasks: [
      { id: 1, task: 'Create Supabase project', priority: 'P0' },
      { id: 2, task: 'Run table creation migrations', priority: 'P0' },
      { id: 3, task: 'Configure Google OAuth (@ritual.net)', priority: 'P0' },
      { id: 4, task: 'Set up RLS policies', priority: 'P0' },
      { id: 5, task: 'Create storage buckets', priority: 'P0' },
      { id: 6, task: 'Write migration script from JSON', priority: 'P1' },
      { id: 7, task: 'Run migration for existing data', priority: 'P1' },
      { id: 8, task: 'Create TypeScript client types', priority: 'P1' },
      { id: 9, task: 'Add indexes for common queries', priority: 'P2' },
      { id: 10, task: 'Add full-text search', priority: 'P2' }
    ],
    successCriteria: [
      'Supabase project created and accessible',
      'All tables from spec created with correct schemas',
      'RLS policies enabled and configured',
      'Google OAuth configured with @ritual.net restriction',
      'Storage buckets created for microsites and artifacts',
      'Migration script written and tested',
      'Existing JSON data migrated to Supabase',
      'TypeScript types generated from schema',
      'Environment variables documented'
    ],
    dependencyNote: 'Phase 1b **BLOCKS** on Phase 1a completion.',
    envVars: `After creating the Supabase project, set these:
\`\`\`bash
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_KEY=[service-role-key]
\`\`\`
Store in \`.env\` and add to \`.gitignore\`.`
  },
  '1b': {
    name: 'Processing Pipeline (CLI + Multi-AI)',
    primarySpec: 'SPEC_PROCESSING_PIPELINE.md',
    goal: 'Build the CLI that transforms transcripts into artifacts and microsites using multi-AI research',
    relatedSpecs: [
      { path: 'SPEC_DATABASE_SCHEMA.md', description: 'Phase 1a (REQUIRED COMPLETE)' },
      { path: 'SPEC_MULTI_AI_RESEARCH.md', description: 'Multi-AI chain implementation' }
    ],
    files: [
      { path: 'packages/core/src/types.ts', description: 'Shared types' },
      { path: 'packages/core/src/registry.ts', description: 'Entity registry (update for Supabase)' }
    ],
    dependencyNote: 'Phase 1a **MUST BE COMPLETE** before starting Phase 1b.',
    envVars: `Requires Phase 1a env vars PLUS:
\`\`\`bash
XAI_API_KEY=[grok-api-key]
PERPLEXITY_API_KEY=[perplexity-key]
ANTHROPIC_API_KEY=[claude-key]
\`\`\``
  },
  '2': {
    name: 'Portal MVP (Next.js)',
    primarySpec: 'SPEC_PORTAL_UI.md',
    goal: 'Build the web interface for contributors to upload transcripts and trigger generation',
    dependencyNote: 'Phases 1a and 1b **MUST BE COMPLETE** before starting Phase 2.'
  },
  '3': {
    name: 'Graph UI (Entity Pages)',
    primarySpec: 'SPEC_GRAPH_UI.md',
    goal: 'Build Wikipedia-style entity pages with bi-directional linking',
    dependencyNote: 'Phase 2 **MUST BE COMPLETE** before starting Phase 3.'
  },
  '4': {
    name: 'Spot Treatment (Editing)',
    primarySpec: 'SPEC_SPOT_TREATMENT.md',
    goal: 'Enable surgical editing of generated artifacts without full regeneration',
    dependencyNote: 'Phase 3 **MUST BE COMPLETE** before starting Phase 4.'
  }
};
```

---

## Usage

```bash
# Generate kickoff for a new phase
npx tsx .claude/scripts/generate-kickoff.ts --phase 1a

# Generate continuation prompt (reads latest handoff)
npx tsx .claude/scripts/generate-kickoff.ts --phase 1a --continuation

# Generate for parallel work
npx tsx .claude/scripts/generate-kickoff.ts --phase 1b --parallel-prep
```
