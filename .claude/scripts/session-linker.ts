#!/usr/bin/env npx tsx
/**
 * session-linker.ts
 *
 * Links bespoke handoff session IDs to Claude Code's native session management.
 * Provides bidirectional lookup between:
 *   - Our handoff IDs (e.g., rrg-0-20260116-1655-1)
 *   - Claude Code native session IDs (UUIDs)
 *   - Claude Code session slugs (e.g., melodic-swinging-tarjan)
 *   - JSONL transcript file paths
 *
 * Usage:
 *   npx tsx session-linker.ts --capture           # Capture current session link
 *   npx tsx session-linker.ts --lookup <id>       # Lookup by any ID type
 *   npx tsx session-linker.ts --list              # List all linked sessions
 *   npx tsx session-linker.ts --jsonl <handoff>   # Get JSONL path for handoff
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const PROJECT_ROOT = '/Users/danielgosek/dev/projects/ritual/ritual-research-graph';
const CLAUDE_PROJECTS_DIR = path.join(process.env.HOME!, '.claude/projects');
const LINKS_PATH = path.join(PROJECT_ROOT, '.claude/handoffs/session-links.json');
const HANDOFFS_DIR = path.join(PROJECT_ROOT, '.claude/handoffs');

interface SessionLink {
  handoffId: string;           // Our bespoke ID (e.g., rrg-0-20260116-1655-1)
  claudeSessionId: string;     // Claude Code UUID
  claudeSlug: string;          // Human-readable slug (e.g., melodic-swinging-tarjan)
  jsonlPath: string;           // Path to full transcript JSONL
  projectPath: string;         // Encoded project path
  created: string;             // When link was created
  lastAccessed: string;        // When last accessed for context retrieval
}

interface LinksIndex {
  project: string;
  links: SessionLink[];
  lastUpdated: string;
}

function getEncodedProjectPath(projectPath: string): string {
  return projectPath.replace(/\//g, '-').replace(/^-/, '-');
}

function findCurrentSessionJsonl(): { sessionId: string; slug: string; jsonlPath: string; projectPath: string } | null {
  // Find the current session by looking at most recently modified JSONL
  const projectDir = path.join(CLAUDE_PROJECTS_DIR, getEncodedProjectPath(PROJECT_ROOT));

  if (!fs.existsSync(projectDir)) {
    // Try alternate encoding
    const altPath = path.join(CLAUDE_PROJECTS_DIR, `-Users-danielgosek-dev-projects-ritual-ritual-research-graph`);
    if (fs.existsSync(altPath)) {
      return findSessionInDir(altPath);
    }
    return null;
  }

  return findSessionInDir(projectDir);
}

function findSessionInDir(dir: string): { sessionId: string; slug: string; jsonlPath: string; projectPath: string } | null {
  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.jsonl'))
    .map(f => ({
      name: f,
      path: path.join(dir, f),
      mtime: fs.statSync(path.join(dir, f)).mtime.getTime()
    }))
    .sort((a, b) => b.mtime - a.mtime);

  if (files.length === 0) return null;

  const mostRecent = files[0];
  const sessionId = mostRecent.name.replace('.jsonl', '');

  // Read first few lines to get the slug
  const content = fs.readFileSync(mostRecent.path, 'utf-8');
  const firstLine = content.split('\n')[0];

  let slug = 'unknown';
  try {
    const parsed = JSON.parse(firstLine);
    slug = parsed.slug || 'unknown';
  } catch {
    // Try to find slug in any line
    const lines = content.split('\n').slice(0, 100);
    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        if (parsed.slug) {
          slug = parsed.slug;
          break;
        }
      } catch {
        continue;
      }
    }
  }

  return {
    sessionId,
    slug,
    jsonlPath: mostRecent.path,
    projectPath: dir
  };
}

function loadLinks(): LinksIndex {
  if (fs.existsSync(LINKS_PATH)) {
    return JSON.parse(fs.readFileSync(LINKS_PATH, 'utf-8'));
  }
  return {
    project: 'ritual-research-graph',
    links: [],
    lastUpdated: new Date().toISOString()
  };
}

function saveLinks(index: LinksIndex): void {
  index.lastUpdated = new Date().toISOString();
  fs.writeFileSync(LINKS_PATH, JSON.stringify(index, null, 2));
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
        resolve('');
      }
    }, 100);
  });
}

function captureCurrentSession(handoffId: string): SessionLink | null {
  const current = findCurrentSessionJsonl();
  if (!current) {
    console.error('Could not find current Claude Code session');
    return null;
  }

  const link: SessionLink = {
    handoffId,
    claudeSessionId: current.sessionId,
    claudeSlug: current.slug,
    jsonlPath: current.jsonlPath,
    projectPath: current.projectPath,
    created: new Date().toISOString(),
    lastAccessed: new Date().toISOString()
  };

  const index = loadLinks();

  // Remove existing link for this handoff ID if any
  index.links = index.links.filter(l => l.handoffId !== handoffId);

  // Add new link at the front
  index.links.unshift(link);

  // Keep only last 50 links
  index.links = index.links.slice(0, 50);

  saveLinks(index);

  return link;
}

function lookupSession(query: string): SessionLink | null {
  const index = loadLinks();

  // Try to match by handoff ID, Claude session ID, or slug
  const link = index.links.find(l =>
    l.handoffId === query ||
    l.claudeSessionId === query ||
    l.claudeSlug === query ||
    l.handoffId.includes(query) ||
    l.claudeSlug.includes(query)
  );

  if (link) {
    // Update last accessed
    link.lastAccessed = new Date().toISOString();
    saveLinks(index);
  }

  return link || null;
}

function listSessions(): void {
  const index = loadLinks();

  console.log('\n═══════════════════════════════════════════════════════════════════════');
  console.log('  SESSION LINKS — Bespoke ↔ Claude Code Native');
  console.log('═══════════════════════════════════════════════════════════════════════\n');

  if (index.links.length === 0) {
    console.log('  No sessions linked yet.');
    console.log('  Run: npx tsx session-linker.ts --capture <handoff-id>\n');
    return;
  }

  for (const link of index.links) {
    console.log(`  ┌─ Handoff: ${link.handoffId}`);
    console.log(`  │  Claude:  ${link.claudeSessionId}`);
    console.log(`  │  Slug:    ${link.claudeSlug}`);
    console.log(`  │  JSONL:   ${link.jsonlPath}`);
    console.log(`  └─ Created: ${link.created.split('T')[0]}`);
    console.log();
  }

  console.log('───────────────────────────────────────────────────────────────────────\n');
}

function getJsonlPath(handoffId: string): string | null {
  const link = lookupSession(handoffId);
  return link?.jsonlPath || null;
}

function extractContextFromJsonl(jsonlPath: string, lastN: number = 50): string[] {
  if (!fs.existsSync(jsonlPath)) return [];

  const content = fs.readFileSync(jsonlPath, 'utf-8');
  const lines = content.trim().split('\n');

  // Get last N lines
  const recent = lines.slice(-lastN);

  const summaries: string[] = [];
  for (const line of recent) {
    try {
      const entry = JSON.parse(line);
      if (entry.type === 'summary') {
        summaries.push(entry.summary || entry.content);
      } else if (entry.type === 'user' && entry.message?.content) {
        // Extract user message content
        const content = entry.message.content;
        if (typeof content === 'string') {
          summaries.push(`[USER] ${content.slice(0, 200)}`);
        }
      }
    } catch {
      continue;
    }
  }

  return summaries;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--list') || args.includes('-l')) {
    listSessions();
    return;
  }

  if (args.includes('--capture') || args.includes('-c')) {
    const handoffId = args[args.indexOf('--capture') + 1] || args[args.indexOf('-c') + 1];

    // If no handoff ID provided, try to read from stdin
    let id = handoffId;
    if (!id || id.startsWith('-')) {
      const stdinData = await readStdin();
      if (stdinData) {
        try {
          const parsed = JSON.parse(stdinData);
          id = parsed.handoffId || parsed.sessionId;
        } catch {
          id = stdinData.trim();
        }
      }
    }

    if (!id) {
      console.error('Usage: npx tsx session-linker.ts --capture <handoff-id>');
      process.exit(1);
    }

    const link = captureCurrentSession(id);
    if (link) {
      console.log(JSON.stringify({
        status: 'linked',
        handoffId: link.handoffId,
        claudeSessionId: link.claudeSessionId,
        claudeSlug: link.claudeSlug,
        jsonlPath: link.jsonlPath
      }, null, 2));
    }
    return;
  }

  if (args.includes('--lookup') || args.includes('-L')) {
    const query = args[args.indexOf('--lookup') + 1] || args[args.indexOf('-L') + 1];
    if (!query) {
      console.error('Usage: npx tsx session-linker.ts --lookup <id>');
      process.exit(1);
    }

    const link = lookupSession(query);
    if (link) {
      console.log(JSON.stringify(link, null, 2));
    } else {
      console.log(JSON.stringify({ error: 'Session not found', query }));
    }
    return;
  }

  if (args.includes('--jsonl')) {
    const handoffId = args[args.indexOf('--jsonl') + 1];
    if (!handoffId) {
      console.error('Usage: npx tsx session-linker.ts --jsonl <handoff-id>');
      process.exit(1);
    }

    const jsonlPath = getJsonlPath(handoffId);
    if (jsonlPath) {
      console.log(jsonlPath);
    } else {
      console.error(`No JSONL found for: ${handoffId}`);
      process.exit(1);
    }
    return;
  }

  if (args.includes('--context')) {
    const handoffId = args[args.indexOf('--context') + 1];
    const lastN = parseInt(args[args.indexOf('--last') + 1] || '50', 10);

    if (!handoffId) {
      console.error('Usage: npx tsx session-linker.ts --context <handoff-id> [--last N]');
      process.exit(1);
    }

    const link = lookupSession(handoffId);
    if (!link) {
      console.error(`Session not found: ${handoffId}`);
      process.exit(1);
    }

    const context = extractContextFromJsonl(link.jsonlPath, lastN);
    console.log(JSON.stringify({ sessionId: link.handoffId, context }, null, 2));
    return;
  }

  // Default: show help
  console.log(`
Session Linker — Bridge bespoke handoffs with Claude Code native sessions

Usage:
  npx tsx session-linker.ts --capture <handoff-id>   Link current session to handoff
  npx tsx session-linker.ts --lookup <id>            Find session by any ID type
  npx tsx session-linker.ts --list                   List all linked sessions
  npx tsx session-linker.ts --jsonl <handoff-id>     Get JSONL path for handoff
  npx tsx session-linker.ts --context <id> [--last N]  Extract context from JSONL
  `);
}

main().catch(console.error);
