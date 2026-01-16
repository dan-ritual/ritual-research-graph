#!/usr/bin/env npx tsx
/**
 * Lightweight hook: Checks if phase status changed
 * Only fires reminder when a phase transitions to complete
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd().replace('/.claude/hooks', '');
const CACHE_FILE = join(PROJECT_ROOT, '.claude/cache/phase-status.json');

// Minimal phase markers (just check key files)
const PHASE_MARKERS: Record<string, string[]> = {
  '0': ['CLAUDE.md'],
  '1a': ['supabase/migrations/001_initial_schema.sql'],
  '1b': ['scripts/generate.ts', 'scripts/stages/artifacts.ts'],
  '2': ['apps/portal/package.json', 'apps/portal/src/app/layout.tsx'],
  '2.5a': ['apps/portal/src/components/pipeline/opportunity-card.tsx'],
  '2.5b': ['apps/portal/src/components/pipeline/opportunity-chat.tsx'],
  '3': ['apps/portal/src/components/entity-graph.tsx'],
  '4': ['apps/portal/src/components/spot-editor.tsx'],
};

function isPhaseComplete(markers: string[]): boolean {
  return markers.every(m => existsSync(join(PROJECT_ROOT, m)));
}

function getCompletedPhases(): string[] {
  return Object.entries(PHASE_MARKERS)
    .filter(([_, markers]) => isPhaseComplete(markers))
    .map(([id]) => id);
}

function loadCachedStatus(): string[] {
  try {
    if (existsSync(CACHE_FILE)) {
      return JSON.parse(readFileSync(CACHE_FILE, 'utf-8')).completed || [];
    }
  } catch {}
  return [];
}

function saveCachedStatus(completed: string[]): void {
  const dir = join(PROJECT_ROOT, '.claude/cache');
  if (!existsSync(dir)) {
    require('fs').mkdirSync(dir, { recursive: true });
  }
  writeFileSync(CACHE_FILE, JSON.stringify({ completed, updated: Date.now() }));
}

async function main() {
  // Read stdin (required by hook protocol)
  await new Promise<void>(resolve => {
    process.stdin.on('data', () => {});
    process.stdin.on('end', resolve);
  });

  const current = getCompletedPhases();
  const cached = loadCachedStatus();

  // Find newly completed phases
  const newlyCompleted = current.filter(p => !cached.includes(p));

  if (newlyCompleted.length > 0) {
    saveCachedStatus(current);
    console.log(JSON.stringify({
      result: 'continue',
      message: `Phase ${newlyCompleted.join(', ')} completed! Run /progress-update to update project-overview.html`
    }));
  } else {
    saveCachedStatus(current);
    console.log(JSON.stringify({ result: 'continue' }));
  }
}

main().catch(() => console.log(JSON.stringify({ result: 'continue' })));
