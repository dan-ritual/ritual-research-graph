// ═══════════════════════════════════════════════════════════════════════════
// MICROSITE INDEX - Index Management Utilities
// ═══════════════════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { Microsite, MicrositeIndex, MicrositeBacklink } from './types.js';

const DATA_DIR = join(process.cwd(), 'data');

export function loadIndex(): MicrositeIndex {
  const raw = readFileSync(join(DATA_DIR, 'index.json'), 'utf-8');
  return JSON.parse(raw);
}

export function saveIndex(index: MicrositeIndex): void {
  index.stats.totalMicrosites = Object.keys(index.microsites).length;
  index.stats.lastUpdated = new Date().toISOString();
  writeFileSync(
    join(DATA_DIR, 'index.json'),
    JSON.stringify(index, null, 2)
  );
}

export function addMicrosite(index: MicrositeIndex, microsite: Microsite): void {
  index.microsites[microsite.id] = microsite;
}

export function getMicrosite(index: MicrositeIndex, id: string): Microsite | null {
  return index.microsites[id] || null;
}

export function getMicrositesByEntity(
  index: MicrositeIndex,
  entitySlug: string
): Microsite[] {
  return Object.values(index.microsites).filter(m =>
    m.entities.includes(entitySlug)
  );
}

export function getMicrositesByOpportunity(
  index: MicrositeIndex,
  opportunitySlug: string
): Microsite[] {
  return Object.values(index.microsites).filter(m =>
    m.opportunities.includes(opportunitySlug)
  );
}

export function calculateBacklinks(index: MicrositeIndex): void {
  const microsites = Object.values(index.microsites);

  for (const microsite of microsites) {
    microsite.backlinks = [];

    for (const other of microsites) {
      if (other.id === microsite.id) continue;

      // Find shared entities
      const sharedEntities = microsite.entities.filter(e =>
        other.entities.includes(e)
      );

      if (sharedEntities.length > 0) {
        microsite.backlinks.push({
          micrositeId: other.id,
          sharedEntities,
          relevanceScore: sharedEntities.length,
        });
      }
    }

    // Sort by relevance
    microsite.backlinks.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
}

export function getRelatedMicrosites(
  index: MicrositeIndex,
  micrositeId: string,
  limit: number = 5
): MicrositeBacklink[] {
  const microsite = index.microsites[micrositeId];
  if (!microsite) return [];

  return microsite.backlinks.slice(0, limit);
}

export function getEntityBacklinkCounts(
  index: MicrositeIndex
): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const microsite of Object.values(index.microsites)) {
    for (const entitySlug of microsite.entities) {
      counts[entitySlug] = (counts[entitySlug] || 0) + 1;
    }
  }

  return counts;
}

export function updateStats(index: MicrositeIndex): void {
  const allEntities = new Set<string>();
  const allOpportunities = new Set<string>();

  for (const microsite of Object.values(index.microsites)) {
    microsite.entities.forEach(e => allEntities.add(e));
    microsite.opportunities.forEach(o => allOpportunities.add(o));
  }

  index.stats = {
    totalMicrosites: Object.keys(index.microsites).length,
    totalEntities: allEntities.size,
    totalOpportunities: allOpportunities.size,
    lastUpdated: new Date().toISOString(),
  };
}
