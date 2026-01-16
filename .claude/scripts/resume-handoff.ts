#!/usr/bin/env npx tsx
/**
 * resume-handoff.ts
 *
 * Reads a handoff file and outputs a resumption prompt for Claude.
 * Usage: npx tsx resume-handoff.ts [session-id]
 *        npx tsx resume-handoff.ts --latest
 *        npx tsx resume-handoff.ts --phase 1a
 */

import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = '/Users/danielgosek/dev/projects/ritual/ritual-research-graph';
const HANDOFFS_DIR = path.join(PROJECT_ROOT, '.claude/handoffs');
const INDEX_PATH = path.join(HANDOFFS_DIR, 'index.json');

interface Session {
  id: string;
  phase: string;
  status: string;
  created: string;
  file: string;
  summary: string;
  dependsOn: string[];
  blocks: string[];
}

interface Index {
  project: string;
  projectPath: string;
  phases: Record<string, { name: string; status: string; dependsOn?: string[] }>;
  sessions: Session[];
  lastUpdated: string;
}

function findSession(args: string[]): Session | null {
  const index: Index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'));

  if (args.includes('--latest')) {
    return index.sessions[0] || null;
  }

  const phaseIdx = args.indexOf('--phase');
  if (phaseIdx !== -1 && args[phaseIdx + 1]) {
    const targetPhase = args[phaseIdx + 1];
    return index.sessions.find(s => s.phase === targetPhase) || null;
  }

  // Direct session ID
  const sessionId = args.find(a => !a.startsWith('--'));
  if (sessionId) {
    return index.sessions.find(s => s.id === sessionId) || null;
  }

  // Default to latest
  return index.sessions[0] || null;
}

function extractResumptionPrompt(handoffContent: string): string {
  // Find the resumption prompt section
  const marker = '## Resumption Prompt for Session:';
  const startIdx = handoffContent.indexOf(marker);

  if (startIdx === -1) {
    // Return the whole document if no specific section
    return handoffContent;
  }

  // Extract from marker to end, removing the intro text
  const section = handoffContent.slice(startIdx);
  const dashLine = section.indexOf('---\n');

  if (dashLine !== -1) {
    // Extract the content between the first and last ---
    const afterFirstDash = section.slice(dashLine + 4);
    const lastDash = afterFirstDash.lastIndexOf('\n---');
    if (lastDash !== -1) {
      return afterFirstDash.slice(0, lastDash).trim();
    }
    return afterFirstDash.trim();
  }

  return section;
}

function listSessions(): void {
  const index: Index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'));

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  RITUAL RESEARCH GRAPH — Session History');
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (index.sessions.length === 0) {
    console.log('  No sessions recorded yet.\n');
    return;
  }

  index.sessions.forEach((session, i) => {
    const marker = i === 0 ? '→ ' : '  ';
    const statusIcon =
      session.status === 'complete' ? '✓' :
      session.status === 'blocked' ? '✗' : '○';

    console.log(`${marker}[${statusIcon}] ${session.id}`);
    console.log(`      Phase: ${session.phase} | Status: ${session.status}`);
    console.log(`      ${session.summary.slice(0, 80)}...`);
    console.log();
  });

  console.log('───────────────────────────────────────────────────────────────');
  console.log('  Usage: npx tsx resume-handoff.ts <session-id>');
  console.log('         npx tsx resume-handoff.ts --latest');
  console.log('         npx tsx resume-handoff.ts --phase 1a');
  console.log('───────────────────────────────────────────────────────────────\n');
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes('--list') || args.includes('-l')) {
    listSessions();
    return;
  }

  const session = findSession(args);

  if (!session) {
    console.error('No session found. Use --list to see available sessions.');
    process.exit(1);
  }

  const handoffPath = path.join(HANDOFFS_DIR, session.file);

  if (!fs.existsSync(handoffPath)) {
    console.error(`Handoff file not found: ${handoffPath}`);
    process.exit(1);
  }

  const handoffContent = fs.readFileSync(handoffPath, 'utf-8');
  const resumptionPrompt = extractResumptionPrompt(handoffContent);

  // Output for Claude to read or for user to copy
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`  Resuming Session: ${session.id}`);
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log(resumptionPrompt);
  console.log('\n═══════════════════════════════════════════════════════════════\n');
}

main();
