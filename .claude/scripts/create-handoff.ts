#!/usr/bin/env npx tsx
/**
 * create-handoff.ts
 *
 * Creates a handoff document for session continuity.
 * Usage: npx tsx create-handoff.ts --phase 1a --status in-progress
 *
 * Or via stdin (for hook integration):
 * echo '{"phase": "1a", "summary": "...", "nextSteps": [...]}' | npx tsx create-handoff.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const PROJECT_ROOT = '/Users/danielgosek/dev/projects/ritual/ritual-research-graph';
const HANDOFFS_DIR = path.join(PROJECT_ROOT, '.claude/handoffs');
const INDEX_PATH = path.join(HANDOFFS_DIR, 'index.json');
const LINKS_PATH = path.join(HANDOFFS_DIR, 'session-links.json');
const CLAUDE_PROJECTS_DIR = path.join(process.env.HOME!, '.claude/projects');

interface HandoffInput {
  phase: string;
  status: 'in-progress' | 'complete' | 'blocked';
  summary: string;
  relevantFiles: Array<{ path: string; description: string }>;
  progress: Array<{ task: string; done: boolean }>;
  nextSteps: string[];
  blockers?: string[];
  notes?: string;
}

interface Session {
  id: string;
  phase: string;
  status: string;
  created: string;
  file: string;
  summary: string;
  dependsOn: string[];
  blocks: string[];
  claudeSessionId?: string;   // Native Claude Code UUID
  claudeSlug?: string;        // Human-readable slug
  jsonlPath?: string;         // Path to full transcript
}

interface SessionLink {
  handoffId: string;
  claudeSessionId: string;
  claudeSlug: string;
  jsonlPath: string;
  projectPath: string;
  created: string;
  lastAccessed: string;
}

interface LinksIndex {
  project: string;
  links: SessionLink[];
  lastUpdated: string;
}

interface Index {
  project: string;
  projectPath: string;
  phases: Record<string, { name: string; status: string; dependsOn: string[] }>;
  sessions: Session[];
  lastUpdated: string;
}

function generateSessionId(phase: string): string {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const timeStr = date.toISOString().split('T')[1].slice(0, 5).replace(':', '');

  // Count existing sessions for this phase today
  const index: Index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'));
  const todaySessions = index.sessions.filter(s =>
    s.id.startsWith(`rrg-${phase}-${dateStr}`)
  );
  const seq = todaySessions.length + 1;

  return `rrg-${phase}-${dateStr}-${timeStr}-${seq}`;
}

function generateResumptionPrompt(sessionId: string, input: HandoffInput): string {
  const filesSection = input.relevantFiles
    .map(f => `- Read: \`${f.path}\` — ${f.description}`)
    .join('\n');

  const progressSection = input.progress
    .map(p => `- [${p.done ? 'x' : ' '}] ${p.task}`)
    .join('\n');

  const nextStepsSection = input.nextSteps
    .map((s, i) => `${i + 1}. ${s}`)
    .join('\n');

  return `
## Resumption Prompt for Session: ${sessionId}

Copy and paste this into a new Claude Code session:

---

I'm resuming work on the **Ritual Research Graph** project from session \`${sessionId}\`.

**Phase:** ${input.phase} — ${getPhaseDescription(input.phase)}
**Status:** ${input.status}

### Context Summary
${input.summary}

### Files to Read First
${filesSection}

### Progress So Far
${progressSection}

### Next Steps (Continue From Here)
${nextStepsSection}

${input.blockers?.length ? `### Blockers\n${input.blockers.map(b => `- ${b}`).join('\n')}` : ''}

Please read the relevant files and continue with the next steps. The handoff document is at:
\`.claude/handoffs/${sessionId}.md\`

---
`.trim();
}

function getPhaseDescription(phase: string): string {
  const descriptions: Record<string, string> = {
    '0': 'Foundation',
    '1a': 'Database & Storage (Supabase)',
    '1b': 'Processing Pipeline (CLI + Multi-AI)',
    '2': 'Portal MVP (Next.js)',
    '3': 'Graph UI (Entity Pages)',
    '4': 'Spot Treatment (Editing)',
  };
  return descriptions[phase] || phase;
}

function findCurrentClaudeSession(): { sessionId: string; slug: string; jsonlPath: string } | null {
  // Strategy: Find the most recently modified JSONL across ALL Claude Code projects
  // This captures whatever session is currently active, regardless of which project

  if (!fs.existsSync(CLAUDE_PROJECTS_DIR)) return null;

  const allJsonlFiles: Array<{ name: string; path: string; mtime: number; projectDir: string }> = [];

  // Scan all project directories
  const projectDirs = fs.readdirSync(CLAUDE_PROJECTS_DIR)
    .filter(d => d.startsWith('-'))  // Claude encodes paths with leading dash
    .map(d => path.join(CLAUDE_PROJECTS_DIR, d))
    .filter(d => fs.statSync(d).isDirectory());

  for (const projectDir of projectDirs) {
    try {
      const files = fs.readdirSync(projectDir)
        .filter(f => f.endsWith('.jsonl'))
        .map(f => ({
          name: f,
          path: path.join(projectDir, f),
          mtime: fs.statSync(path.join(projectDir, f)).mtime.getTime(),
          projectDir
        }));
      allJsonlFiles.push(...files);
    } catch { continue; }
  }

  if (allJsonlFiles.length === 0) return null;

  // Sort by most recently modified and get the most recent
  allJsonlFiles.sort((a, b) => b.mtime - a.mtime);
  const mostRecent = allJsonlFiles[0];

  // Only consider sessions modified in the last 5 minutes as "current"
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  if (mostRecent.mtime < fiveMinutesAgo) {
    // Fall back to specifically looking for ritual-research-graph sessions
    const rrg = allJsonlFiles.find(f => f.projectDir.includes('ritual-research-graph'));
    if (rrg) {
      return extractSessionInfo(rrg);
    }
    return null;
  }

  return extractSessionInfo(mostRecent);
}

function extractSessionInfo(file: { name: string; path: string }): { sessionId: string; slug: string; jsonlPath: string } {
  const sessionId = file.name.replace('.jsonl', '');

  // Extract slug from JSONL (read last 100 lines for efficiency with large files)
  let slug = 'unknown';
  try {
    const content = fs.readFileSync(file.path, 'utf-8');
    const lines = content.split('\n');
    // Check both first and last lines for slug
    const checkLines = [...lines.slice(0, 50), ...lines.slice(-50)];
    for (const line of checkLines) {
      try {
        const parsed = JSON.parse(line);
        if (parsed.slug) {
          slug = parsed.slug;
          break;
        }
      } catch { continue; }
    }
  } catch { /* ignore */ }

  return { sessionId, slug, jsonlPath: file.path };
}

function captureSessionLink(handoffId: string): SessionLink | null {
  const current = findCurrentClaudeSession();
  if (!current) return null;

  const link: SessionLink = {
    handoffId,
    claudeSessionId: current.sessionId,
    claudeSlug: current.slug,
    jsonlPath: current.jsonlPath,
    projectPath: path.dirname(current.jsonlPath),
    created: new Date().toISOString(),
    lastAccessed: new Date().toISOString()
  };

  // Load or create links index
  let linksIndex: LinksIndex;
  if (fs.existsSync(LINKS_PATH)) {
    linksIndex = JSON.parse(fs.readFileSync(LINKS_PATH, 'utf-8'));
  } else {
    linksIndex = { project: 'ritual-research-graph', links: [], lastUpdated: '' };
  }

  // Remove existing link for this handoff
  linksIndex.links = linksIndex.links.filter(l => l.handoffId !== handoffId);
  linksIndex.links.unshift(link);
  linksIndex.links = linksIndex.links.slice(0, 50);
  linksIndex.lastUpdated = new Date().toISOString();

  fs.writeFileSync(LINKS_PATH, JSON.stringify(linksIndex, null, 2));

  return link;
}

function createHandoffDocument(sessionId: string, input: HandoffInput, claudeSession?: { sessionId: string; slug: string; jsonlPath: string }): string {
  const now = new Date().toISOString();

  const filesSection = input.relevantFiles
    .map(f => `- \`${f.path}\`\n  ${f.description}`)
    .join('\n');

  const progressSection = input.progress
    .map(p => `- [${p.done ? 'x' : ' '}] ${p.task}`)
    .join('\n');

  const nextStepsSection = input.nextSteps
    .map((s, i) => `${i + 1}. ${s}`)
    .join('\n');

  const resumptionPrompt = generateResumptionPrompt(sessionId, input);

  const claudeInfo = claudeSession
    ? `| **Claude Code Session** | \`${claudeSession.sessionId}\` |
| **Claude Slug** | \`${claudeSession.slug}\` |
| **JSONL Transcript** | \`${claudeSession.jsonlPath}\` |`
    : '';

  return `# Handoff: ${sessionId}

## Metadata

| Field | Value |
|-------|-------|
| **Session ID** | \`${sessionId}\` |
| **Phase** | ${input.phase} — ${getPhaseDescription(input.phase)} |
| **Status** | ${input.status} |
| **Created** | ${now} |
| **Project** | ritual-research-graph |
${claudeInfo}

---

## Context Summary

${input.summary}

---

## Relevant Files

${filesSection}

---

## Progress

${progressSection}

---

## Next Steps

${nextStepsSection}

${input.blockers?.length ? `---\n\n## Blockers\n\n${input.blockers.map(b => `- ${b}`).join('\n')}` : ''}

${input.notes ? `---\n\n## Notes\n\n${input.notes}` : ''}

---

${resumptionPrompt}
`;
}

function updateIndex(sessionId: string, input: HandoffInput, claudeSession?: { sessionId: string; slug: string; jsonlPath: string }): void {
  const index: Index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'));

  // Find dependencies based on phase
  const phase = index.phases[input.phase];
  const dependsOn = phase?.dependsOn || [];

  // Find what this session blocks
  const blocks = Object.entries(index.phases)
    .filter(([_, p]) => p.dependsOn?.includes(input.phase))
    .map(([k, _]) => k);

  const session: Session = {
    id: sessionId,
    phase: input.phase,
    status: input.status,
    created: new Date().toISOString(),
    file: `${sessionId}.md`,
    summary: input.summary.slice(0, 200) + (input.summary.length > 200 ? '...' : ''),
    dependsOn,
    blocks,
    // Link to Claude Code native session
    claudeSessionId: claudeSession?.sessionId,
    claudeSlug: claudeSession?.slug,
    jsonlPath: claudeSession?.jsonlPath,
  };

  // Remove any existing session with same ID (update case)
  index.sessions = index.sessions.filter(s => s.id !== sessionId);

  // Add new session
  index.sessions.unshift(session);

  // Keep only last 20 sessions
  index.sessions = index.sessions.slice(0, 20);

  index.lastUpdated = new Date().toISOString();

  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));
}

async function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = '';
    const rl = readline.createInterface({ input: process.stdin });
    rl.on('line', (line) => { data += line + '\n'; });
    rl.on('close', () => resolve(data.trim()));

    // If no stdin after 100ms, resolve with empty
    setTimeout(() => {
      if (!data) {
        rl.close();
        resolve('');
      }
    }, 100);
  });
}

async function main() {
  // Check for stdin input
  const stdinData = await readStdin();

  let input: HandoffInput;

  if (stdinData) {
    input = JSON.parse(stdinData);
  } else {
    // Parse command line args
    const args = process.argv.slice(2);
    const phase = args.find((_, i, a) => a[i - 1] === '--phase') || '1a';
    const status = (args.find((_, i, a) => a[i - 1] === '--status') || 'in-progress') as HandoffInput['status'];

    // Default input (should be provided via stdin in practice)
    input = {
      phase,
      status,
      summary: 'Session handoff (details not provided)',
      relevantFiles: [],
      progress: [],
      nextSteps: ['Continue from where left off'],
    };
  }

  const sessionId = generateSessionId(input.phase);

  // Capture Claude Code native session FIRST (before creating document)
  const claudeSession = findCurrentClaudeSession();

  // Create handoff document with Claude session info
  const document = createHandoffDocument(sessionId, input, claudeSession || undefined);

  // Write handoff file
  const handoffPath = path.join(HANDOFFS_DIR, `${sessionId}.md`);
  fs.writeFileSync(handoffPath, document);
  const link = captureSessionLink(sessionId);

  // Update index with Claude session info
  updateIndex(sessionId, input, claudeSession || undefined);

  // Output the session ID, path, and Claude Code link
  console.log(JSON.stringify({
    sessionId,
    handoffPath,
    resumptionPromptPath: handoffPath,
    message: `Handoff created: ${sessionId}`,
    // Claude Code native session link
    claudeCode: claudeSession ? {
      sessionId: claudeSession.sessionId,
      slug: claudeSession.slug,
      jsonlPath: claudeSession.jsonlPath,
    } : null,
  }));
}

main().catch(console.error);
