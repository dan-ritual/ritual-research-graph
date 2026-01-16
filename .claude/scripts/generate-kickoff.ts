#!/usr/bin/env npx tsx
/**
 * generate-kickoff.ts
 *
 * Generates comprehensive kickoff prompts for any phase or continuation session.
 * Uses the template at .claude/templates/kickoff-prompt.md
 *
 * Usage:
 *   npx tsx generate-kickoff.ts --phase 1a              # New phase kickoff
 *   npx tsx generate-kickoff.ts --phase 1a --continue   # Continuation
 *   npx tsx generate-kickoff.ts --phase 1b --parallel   # Parallel prep
 */

import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = '/Users/danielgosek/dev/projects/ritual/ritual-research-graph';
const HANDOFFS_DIR = path.join(PROJECT_ROOT, '.claude/handoffs');
const INDEX_PATH = path.join(HANDOFFS_DIR, 'index.json');

interface PhaseConfig {
  name: string;
  primarySpec: string;
  goal: string;
  relatedSpecs?: Array<{ path: string; description: string }>;
  files?: Array<{ path: string; description: string }>;
  tasks?: Array<{ id: number; task: string; priority: string }>;
  successCriteria?: string[];
  dependencyNote?: string;
  envVars?: string;
  status?: string;
}

const PHASE_CONFIG: Record<string, PhaseConfig> = {
  '0': {
    name: 'Foundation',
    primarySpec: 'MASTER_SPEC.md',
    goal: 'Establish project structure, types, and specifications',
    status: 'complete'
  },
  '1a': {
    name: 'Database & Storage (Supabase)',
    primarySpec: 'specs/SPEC_DATABASE_SCHEMA.md',
    goal: 'Set up the Supabase foundation so Phase 1b can write directly to the database',
    relatedSpecs: [
      { path: 'specs/SPEC_PROCESSING_PIPELINE.md', description: 'Phase 1b (DEPENDS on 1a)' },
      { path: 'specs/SPEC_MULTI_AI_RESEARCH.md', description: 'Will use Supabase for caching' }
    ],
    files: [
      { path: 'packages/core/src/types.ts', description: 'Entity, Microsite, Opportunity types' },
      { path: 'packages/core/src/registry.ts', description: 'Entity registry operations' },
      { path: 'packages/core/src/index-manager.ts', description: 'Microsite index operations' },
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
    primarySpec: 'specs/SPEC_PROCESSING_PIPELINE.md',
    goal: 'Build the CLI that transforms transcripts into artifacts and microsites using multi-AI research',
    relatedSpecs: [
      { path: 'specs/SPEC_DATABASE_SCHEMA.md', description: 'Phase 1a (REQUIRED COMPLETE)' },
      { path: 'specs/SPEC_MULTI_AI_RESEARCH.md', description: 'Multi-AI chain implementation' }
    ],
    files: [
      { path: 'packages/core/src/types.ts', description: 'Shared types' },
      { path: 'packages/core/src/registry.ts', description: 'Entity registry (update for Supabase)' },
      { path: 'packages/cli/', description: 'CLI package (to be created)' }
    ],
    tasks: [
      { id: 1, task: 'Create packages/cli structure', priority: 'P0' },
      { id: 2, task: 'Implement Supabase client', priority: 'P0' },
      { id: 3, task: 'Implement Grok API client', priority: 'P0' },
      { id: 4, task: 'Implement Perplexity API client', priority: 'P0' },
      { id: 5, task: 'Implement bird-cli SSH client', priority: 'P0' },
      { id: 6, task: 'Build 6-stage pipeline', priority: 'P0' },
      { id: 7, task: 'Implement artifact generation prompts', priority: 'P1' },
      { id: 8, task: 'Implement entity extraction', priority: 'P1' },
      { id: 9, task: 'Build microsite template injection', priority: 'P1' },
      { id: 10, task: 'Test end-to-end with RWA transcript', priority: 'P1' }
    ],
    successCriteria: [
      'CLI can process a transcript end-to-end',
      'Multi-AI research chain working (Grok → Perplexity → bird-cli)',
      'Artifacts written to Supabase',
      'Entities extracted and linked',
      'Microsite generated with Making Software aesthetic',
      'Job status tracked in real-time'
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
    primarySpec: 'specs/SPEC_PORTAL_UI.md',
    goal: 'Build the web interface for contributors to upload transcripts and trigger generation',
    relatedSpecs: [
      { path: 'specs/SPEC_DATABASE_SCHEMA.md', description: 'Database schema' },
      { path: 'specs/SPEC_PROCESSING_PIPELINE.md', description: 'CLI integration' }
    ],
    files: [
      { path: 'apps/portal/', description: 'Next.js portal (to be created)' },
      { path: 'packages/core/src/types.ts', description: 'Shared types' }
    ],
    successCriteria: [
      'Google OAuth login working',
      'Transcript upload UI',
      'Generation wizard',
      'Job status dashboard',
      'Microsite preview'
    ],
    dependencyNote: 'Phases 1a and 1b **MUST BE COMPLETE** before starting Phase 2.'
  },
  '3': {
    name: 'Graph UI (Entity Pages)',
    primarySpec: 'specs/SPEC_GRAPH_UI.md',
    goal: 'Build Wikipedia-style entity pages with bi-directional linking',
    relatedSpecs: [
      { path: 'MASTER_SPEC.md', description: 'Entity relationship model' }
    ],
    successCriteria: [
      'Entity detail pages',
      'Bi-directional link navigation',
      'Co-occurrence visualization',
      'Cross-microsite aggregation'
    ],
    dependencyNote: 'Phase 2 **MUST BE COMPLETE** before starting Phase 3.'
  },
  '4': {
    name: 'Spot Treatment (Editing)',
    primarySpec: 'specs/SPEC_SPOT_TREATMENT.md',
    goal: 'Enable surgical editing of generated artifacts without full regeneration',
    successCriteria: [
      'Inline artifact editing',
      'Entity correction UI',
      'Regeneration of single sections',
      'Version history'
    ],
    dependencyNote: 'Phase 3 **MUST BE COMPLETE** before starting Phase 4.'
  }
};

const KEY_DECISIONS = `| Decision | Choice |
|----------|--------|
| Database | Supabase (Postgres) |
| Auth | Google OAuth, @ritual.net domain restriction |
| Domain restriction enforcement | Supabase level |
| CLI authentication | Service role key (bypasses RLS) |
| Supabase project | Create new |
| Primary research provider | Grok first, then Perplexity |
| Template source | Copy from defi-rwa microsite |
| Storage | Supabase from start (not local JSON) |`;

function getLatestHandoff(phase?: string): any {
  if (!fs.existsSync(INDEX_PATH)) return null;

  const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'));
  if (index.sessions.length === 0) return null;

  if (phase) {
    return index.sessions.find((s: any) => s.phase === phase) || null;
  }
  return index.sessions[0];
}

function generateTasksTable(tasks?: Array<{ id: number; task: string; priority: string }>): string {
  if (!tasks || tasks.length === 0) return '*Tasks to be defined in spec document.*';

  const header = '| # | Task | Priority |\n|---|------|----------|';
  const rows = tasks.map(t => `| ${t.id} | ${t.task} | ${t.priority} |`).join('\n');
  return `${header}\n${rows}`;
}

function generateFilesSection(files?: Array<{ path: string; description: string }>): string {
  if (!files || files.length === 0) return '';
  return files.map(f => `- \`${f.path}\` — ${f.description}`).join('\n');
}

function generateSuccessCriteria(criteria?: string[]): string {
  if (!criteria || criteria.length === 0) return '- [ ] Phase goals achieved';
  return criteria.map(c => `- [ ] ${c}`).join('\n');
}

function generateSequenceMarker(phase: string): string {
  const markers: Record<string, string> = {
    '0':  '(DONE)',
    '1a': '(THIS)    (next)    (...)     (...)     (...)',
    '1b': '(DONE)    (THIS)    (next)    (...)     (...)',
    '2':  '(DONE)    (DONE)    (THIS)    (next)    (...)',
    '3':  '(DONE)    (DONE)    (DONE)    (THIS)    (next)',
    '4':  '(DONE)    (DONE)    (DONE)    (DONE)    (THIS)'
  };
  return markers[phase] || '';
}

function generateKickoffPrompt(phase: string, isContinuation: boolean = false): string {
  const config = PHASE_CONFIG[phase];
  if (!config) {
    return `Error: Unknown phase "${phase}". Valid phases: ${Object.keys(PHASE_CONFIG).join(', ')}`;
  }

  const latestHandoff = isContinuation ? getLatestHandoff(phase) : null;
  const sessionType = isContinuation ? 'continuing' : 'starting';

  let continuationSection = '';
  if (isContinuation && latestHandoff) {
    continuationSection = `
## Continuation Context

Resuming from session \`${latestHandoff.id}\`${latestHandoff.claudeSlug ? ` (Claude: \`${latestHandoff.claudeSlug}\`)` : ''}.

**Previous status:** ${latestHandoff.status}
**Previous summary:** ${latestHandoff.summary}

Read the full handoff:
\`\`\`bash
cat .claude/handoffs/${latestHandoff.file}
\`\`\`

---
`;
  }

  const relatedSpecsSection = config.relatedSpecs
    ? config.relatedSpecs.map((s, i) => `${i + 3}. \`docs/${s.path}\` — ${s.description}`).join('\n')
    : '';

  // Add elicitation section for NEW phases (not continuations)
  const elicitationSection = !isContinuation ? `
## MANDATORY: Phase Transition Elicitation

**STOP.** Before implementing ANYTHING, you must run an exhaustive elicitation loop with the user.

### Protocol
1. Read the phase spec (\`docs/${config.primarySpec}\`)
2. Identify ALL decision points, ambiguities, and edge cases
3. Use **AskUserQuestionTool** in a recursive loop:
   - Ask 2-4 focused questions per round
   - Dig deeper on complex answers
   - Continue until user says "proceed" or all ambiguity resolved
4. Document decisions in CHANGELOG.md
5. Only THEN begin implementation

### Questions to Consider
- What's the priority order for the ${config.tasks?.length || 0} tasks?
- Are there any existing patterns/conventions I should follow?
- What are the acceptance criteria beyond the spec?
- Any edge cases the spec doesn't address?
- Integration points with existing code?

**DO NOT SKIP THIS.** Starting implementation without elicitation violates project protocol.

---
` : '';

  const prompt = `I'm ${sessionType} **Phase ${phase}: ${config.name}** for the **Ritual Research Graph** project.
${continuationSection}
## Project Location
\`/Users/danielgosek/dev/projects/ritual/ritual-research-graph\`
${elicitationSection}
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
- \`.claude/settings.json\`

### Before Ending / Switching Windows
Create a handoff with full session linking:
\`\`\`bash
cat << 'EOF' | npx tsx .claude/scripts/create-handoff.ts
{
  "phase": "${phase}",
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
npx tsx .claude/scripts/generate-kickoff.ts --phase ${phase}
npx tsx .claude/scripts/generate-kickoff.ts --phase ${phase} --continue
\`\`\`

### Session Linking
The handoff system captures:
- **Bespoke ID**: \`rrg-${phase}-YYYYMMDD-HHMM-N\`
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
1. \`docs/MASTER_SPEC.md\` — Master specification with all architecture decisions
2. \`docs/${config.primarySpec}\` — **PRIMARY SPEC FOR THIS PHASE**
${relatedSpecsSection}

### Project Context
- \`CHANGELOG.md\` — All elicitation decisions and version history
- \`README.md\` — Project overview and architecture diagram

### Handoff System (ALWAYS READ)
- \`.claude/handoffs/index.json\` — Session registry with Claude Code links
- \`.claude/handoffs/session-links.json\` — Bidirectional session lookup index
- \`.claude/scripts/create-handoff.ts\` — Creates handoffs with Claude session capture
- \`.claude/scripts/resume-handoff.ts\` — Displays resumption prompts
- \`.claude/scripts/session-linker.ts\` — Bidirectional session lookup utility
- \`.claude/scripts/generate-kickoff.ts\` — Generates kickoff prompts from template
- \`.claude/templates/kickoff-prompt.md\` — Template reference (self-referential)
- \`.claude/hooks/pre-compact-handoff.sh\` — Auto-handoff on compaction
- \`.claude/settings.json\` — Hook registration

### Phase-Specific Files
${generateFilesSection(config.files)}

---

## Phase ${phase} Implementation Tasks

${generateTasksTable(config.tasks)}

---

## Key Decisions (from CHANGELOG.md elicitation)

${KEY_DECISIONS}

---

## Environment Variables

${config.envVars || '*See spec document for required environment variables.*'}

---

## North Star Alignment

**Mission:** Transform meeting transcripts into interconnected, Wikipedia-style microsites with bi-directional entity linking.

**Phase ${phase} Goal:** ${config.goal}

**Success Criteria:**
${generateSuccessCriteria(config.successCriteria)}

---

## Implementation Sequence

\`\`\`
Phase 1a ──► Phase 1b ──► Phase 2 ──► Phase 3 ──► Phase 4
Database     Pipeline     Portal      Graph       Edit
${generateSequenceMarker(phase)}
\`\`\`

${config.dependencyNote || ''}

---

## Begin

1. Read all spec documents listed above
2. Use TodoWrite to track implementation tasks
3. Start with the first uncompleted task
4. Create handoffs at natural stopping points
5. Update CHANGELOG.md with progress
6. Generate continuation prompts for parallel work if needed

Let's build the ${config.name} for Ritual Research Graph.`;

  return prompt;
}

function main() {
  const args = process.argv.slice(2);

  const phaseIdx = args.indexOf('--phase');
  const phase = phaseIdx !== -1 ? args[phaseIdx + 1] : null;

  const isContinuation = args.includes('--continue') || args.includes('--continuation');
  const listPhases = args.includes('--list');

  if (listPhases) {
    console.log('\nAvailable Phases:\n');
    for (const [id, config] of Object.entries(PHASE_CONFIG)) {
      const status = config.status || 'pending';
      console.log(`  ${id}: ${config.name} [${status}]`);
    }
    console.log('\nUsage:');
    console.log('  npx tsx generate-kickoff.ts --phase 1a');
    console.log('  npx tsx generate-kickoff.ts --phase 1a --continue\n');
    return;
  }

  if (!phase) {
    console.log('Usage: npx tsx generate-kickoff.ts --phase <phase-id> [--continue]');
    console.log('       npx tsx generate-kickoff.ts --list');
    console.log('\nExample: npx tsx generate-kickoff.ts --phase 1a');
    return;
  }

  const prompt = generateKickoffPrompt(phase, isContinuation);
  console.log(prompt);
}

main();
