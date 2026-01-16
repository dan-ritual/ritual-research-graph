/**
 * pre-compact-handoff.ts
 *
 * Hook handler that creates a handoff document before context compaction.
 * This ensures session state is preserved for resumption.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const PROJECT_ROOT = '/Users/danielgosek/dev/projects/ritual/ritual-research-graph';
const HANDOFFS_DIR = path.join(PROJECT_ROOT, '.claude/handoffs');
const INDEX_PATH = path.join(HANDOFFS_DIR, 'index.json');

interface PreCompactInput {
  summary: string;
}

interface HookOutput {
  result: 'continue' | 'block';
  message?: string;
}

async function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = '';
    const rl = readline.createInterface({ input: process.stdin });
    rl.on('line', (line) => { data += line + '\n'; });
    rl.on('close', () => resolve(data.trim()));

    setTimeout(() => {
      if (!data) {
        rl.close();
        resolve('{}');
      }
    }, 100);
  });
}

function generateAutoHandoffId(): string {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const timeStr = date.toISOString().split('T')[1].slice(0, 5).replace(':', '');
  return `rrg-auto-${dateStr}-${timeStr}`;
}

async function main() {
  const stdinData = await readStdin();
  let input: PreCompactInput = { summary: '' };

  try {
    input = JSON.parse(stdinData);
  } catch {
    // No input, create minimal handoff
  }

  const sessionId = generateAutoHandoffId();
  const now = new Date().toISOString();

  // Create minimal handoff document
  const handoffContent = `# Auto-Handoff: ${sessionId}

## Metadata

| Field | Value |
|-------|-------|
| **Session ID** | \`${sessionId}\` |
| **Type** | Auto (Pre-Compaction) |
| **Created** | ${now} |
| **Project** | ritual-research-graph |

---

## Summary (from compaction)

${input.summary || 'No summary provided. Check .claude/handoffs/index.json for session history.'}

---

## Resumption

To resume, read the latest handoff or check the session index:

\`\`\`bash
npx tsx .claude/scripts/resume-handoff.ts --latest
\`\`\`

---

## Project State

Check these files for current project state:
- \`.claude/handoffs/index.json\` — Session history
- \`docs/MASTER_SPEC.md\` — Architecture decisions
- \`CHANGELOG.md\` — Recent changes
- \`README.md\` — Project overview
`;

  // Write handoff file
  const handoffPath = path.join(HANDOFFS_DIR, `${sessionId}.md`);
  fs.writeFileSync(handoffPath, handoffContent);

  // Update index
  const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'));
  index.sessions.unshift({
    id: sessionId,
    phase: 'auto',
    status: 'in-progress',
    created: now,
    file: `${sessionId}.md`,
    summary: input.summary?.slice(0, 200) || 'Auto-generated before compaction',
    dependsOn: [],
    blocks: [],
  });
  index.sessions = index.sessions.slice(0, 20);
  index.lastUpdated = now;
  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));

  // Output hook response
  const output: HookOutput = {
    result: 'continue',
    message: `[Handoff Created] Session ${sessionId} saved to .claude/handoffs/. To resume: npx tsx .claude/scripts/resume-handoff.ts --latest. To generate kickoff: npx tsx .claude/scripts/generate-kickoff.ts --phase <phase> --continue`,
  };

  console.log(JSON.stringify(output));
}

main().catch((err) => {
  console.log(JSON.stringify({
    result: 'continue',
    message: `[Handoff Warning] Failed to create auto-handoff: ${err.message}`,
  }));
});
