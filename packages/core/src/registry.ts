// ═══════════════════════════════════════════════════════════════════════════
// ENTITY REGISTRY - Graph Management Utilities
// ═══════════════════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { Entity, EntityRegistry, EntityAppearance, EntityRelation } from './types.js';

const DATA_DIR = join(process.cwd(), 'data');

export function loadRegistry(): EntityRegistry {
  const raw = readFileSync(join(DATA_DIR, 'entities.json'), 'utf-8');
  return JSON.parse(raw);
}

export function saveRegistry(registry: EntityRegistry): void {
  registry.stats.totalEntities = Object.keys(registry.entities).length;
  registry.stats.lastUpdated = new Date().toISOString();
  writeFileSync(
    join(DATA_DIR, 'entities.json'),
    JSON.stringify(registry, null, 2)
  );
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function findEntity(registry: EntityRegistry, nameOrAlias: string): Entity | null {
  const slug = slugify(nameOrAlias);

  // Direct slug match
  if (registry.entities[slug]) {
    return registry.entities[slug];
  }

  // Search aliases
  for (const entity of Object.values(registry.entities)) {
    if (entity.aliases.some(a => slugify(a) === slug)) {
      return entity;
    }
    if (slugify(entity.canonicalName) === slug) {
      return entity;
    }
  }

  return null;
}

export function addEntity(
  registry: EntityRegistry,
  name: string,
  type: Entity['type'],
  metadata: Entity['metadata'] = {}
): Entity {
  const slug = slugify(name);

  if (registry.entities[slug]) {
    return registry.entities[slug];
  }

  const entity: Entity = {
    slug,
    canonicalName: name,
    aliases: [],
    type,
    metadata,
    appearances: [],
    relatedEntities: [],
    opportunities: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  registry.entities[slug] = entity;
  return entity;
}

export function addAppearance(
  registry: EntityRegistry,
  entitySlug: string,
  appearance: EntityAppearance
): void {
  const entity = registry.entities[entitySlug];
  if (!entity) {
    throw new Error(`Entity not found: ${entitySlug}`);
  }

  // Check for duplicate
  const exists = entity.appearances.some(
    a => a.micrositeId === appearance.micrositeId && a.section === appearance.section
  );

  if (!exists) {
    entity.appearances.push(appearance);
    entity.updatedAt = new Date().toISOString();
  }
}

export function updateCoOccurrences(
  registry: EntityRegistry,
  micrositeId: string,
  entitySlugs: string[]
): void {
  // For each pair of entities in the microsite, increment co-occurrence
  for (let i = 0; i < entitySlugs.length; i++) {
    for (let j = i + 1; j < entitySlugs.length; j++) {
      const slugA = entitySlugs[i];
      const slugB = entitySlugs[j];

      const entityA = registry.entities[slugA];
      const entityB = registry.entities[slugB];

      if (!entityA || !entityB) continue;

      // Update A's relation to B
      let relationAB = entityA.relatedEntities.find(r => r.slug === slugB);
      if (!relationAB) {
        relationAB = { slug: slugB, coOccurrenceCount: 0 };
        entityA.relatedEntities.push(relationAB);
      }
      relationAB.coOccurrenceCount++;

      // Update B's relation to A
      let relationBA = entityB.relatedEntities.find(r => r.slug === slugA);
      if (!relationBA) {
        relationBA = { slug: slugA, coOccurrenceCount: 0 };
        entityB.relatedEntities.push(relationBA);
      }
      relationBA.coOccurrenceCount++;
    }
  }
}

export function getTopRelatedEntities(
  registry: EntityRegistry,
  entitySlug: string,
  limit: number = 5
): EntityRelation[] {
  const entity = registry.entities[entitySlug];
  if (!entity) return [];

  return [...entity.relatedEntities]
    .sort((a, b) => b.coOccurrenceCount - a.coOccurrenceCount)
    .slice(0, limit);
}

export function getEntitiesByOpportunity(
  registry: EntityRegistry,
  opportunitySlug: string
): Entity[] {
  const slugs = registry.opportunityIndex[opportunitySlug] || [];
  return slugs.map(s => registry.entities[s]).filter(Boolean);
}

export function rebuildOpportunityIndex(registry: EntityRegistry): void {
  registry.opportunityIndex = {};

  for (const entity of Object.values(registry.entities)) {
    for (const opp of entity.opportunities) {
      if (!registry.opportunityIndex[opp]) {
        registry.opportunityIndex[opp] = [];
      }
      if (!registry.opportunityIndex[opp].includes(entity.slug)) {
        registry.opportunityIndex[opp].push(entity.slug);
      }
    }
  }
}
