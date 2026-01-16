#!/usr/bin/env tsx
// ═══════════════════════════════════════════════════════════════════════════
// IMPORT EXISTING MICROSITE
// Imports the RWA×DeFi microsite into the research graph
// ═══════════════════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, cpSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_DIR = join(ROOT, 'data');
const MICROSITES_DIR = join(ROOT, 'microsites');

// Source microsite location
const SOURCE_DIR = '/Users/danielgosek/Downloads/defi-rwa';

interface EntityAppearance {
  micrositeId: string;
  micrositeTitle: string;
  context: string;
  section: 'keyFindings' | 'recommendations' | 'deepDives' | 'thesis';
}

function loadJSON<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function saveJSON(path: string, data: unknown): void {
  writeFileSync(path, JSON.stringify(data, null, 2));
}

function extractEntityMentions(content: string): string[] {
  // Extract entity names mentioned in content
  const entityNames = [
    'Ondo Finance', 'Ondo',
    'Maple Finance', 'Maple',
    'Goldfinch',
    'Centrifuge',
    'Zivoe',
    'Credix',
    'Aave',
    'Morpho', 'Morpho Blue',
    'Euler',
    'BlackRock BUIDL', 'BUIDL', 'BlackRock',
    'Hyperliquid',
    'EtherFi',
    'Alchemix',
    'Chainlink',
  ];

  const found: string[] = [];
  for (const name of entityNames) {
    if (content.includes(name)) {
      found.push(name);
    }
  }
  return found;
}

function slugify(name: string): string {
  // Map common names to their canonical slugs
  const slugMap: Record<string, string> = {
    'Ondo Finance': 'ondo-finance',
    'Ondo': 'ondo-finance',
    'Maple Finance': 'maple-finance',
    'Maple': 'maple-finance',
    'Goldfinch': 'goldfinch',
    'Centrifuge': 'centrifuge',
    'Zivoe': 'zivoe',
    'Credix': 'credix',
    'Aave': 'aave',
    'Morpho': 'morpho',
    'Morpho Blue': 'morpho',
    'Euler': 'euler',
    'BlackRock BUIDL': 'blackrock-buidl',
    'BUIDL': 'blackrock-buidl',
    'BlackRock': 'blackrock-buidl',
    'Hyperliquid': 'hyperliquid',
    'EtherFi': 'etherfi',
    'Alchemix': 'alchemix',
    'Chainlink': 'chainlink',
  };

  return slugMap[name] || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

async function main() {
  console.log('📦 Importing RWA×DeFi microsite into research graph...\n');

  // 1. Copy microsite files
  const destDir = join(MICROSITES_DIR, 'rwa-defi-jan-2026');
  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true });
  }

  console.log(`📁 Copying microsite to ${destDir}`);
  cpSync(join(SOURCE_DIR, 'src'), join(destDir, 'src'), { recursive: true });
  cpSync(join(SOURCE_DIR, 'public'), join(destDir, 'public'), { recursive: true });
  cpSync(join(SOURCE_DIR, 'index.html'), join(destDir, 'index.html'));
  cpSync(join(SOURCE_DIR, 'package.json'), join(destDir, 'package.json'));
  cpSync(join(SOURCE_DIR, 'vite.config.js'), join(destDir, 'vite.config.js'));

  // 2. Read App.jsx to extract content
  const appJsx = readFileSync(join(SOURCE_DIR, 'src/App.jsx'), 'utf-8');

  // 3. Load and update entity registry
  const registry = loadJSON<any>(join(DATA_DIR, 'entities.json'));

  // Extract key findings and recommendations from the JSX
  const keyFindingsMatch = appJsx.match(/keyFindings:\s*\[([\s\S]*?)\],\s*recommendations:/);
  const recommendationsMatch = appJsx.match(/recommendations:\s*\[([\s\S]*?)\]\s*\};/);

  const micrositeId = 'rwa-defi-jan-2026';
  const micrositeTitle = 'RWA × DeFi × AI · January 2026';

  // Process thesis
  const thesisMatch = appJsx.match(/thesis:\s*['"](.+?)['"]/);
  const thesis = thesisMatch?.[1] || '';

  // Add appearances for thesis mentions
  const thesisMentions = extractEntityMentions(thesis);
  for (const mention of thesisMentions) {
    const slug = slugify(mention);
    if (registry.entities[slug]) {
      const exists = registry.entities[slug].appearances.some(
        (a: any) => a.micrositeId === micrositeId && a.section === 'thesis'
      );
      if (!exists) {
        registry.entities[slug].appearances.push({
          micrositeId,
          micrositeTitle,
          context: thesis.substring(0, 200),
          section: 'thesis',
        });
      }
    }
  }

  // Process key findings
  if (keyFindingsMatch) {
    const findings = keyFindingsMatch[1];
    // Extract each finding's content
    const contentMatches = findings.matchAll(/content:\s*['"]([^'"]+)/g);
    for (const match of contentMatches) {
      const content = match[1];
      const mentions = extractEntityMentions(content);
      for (const mention of mentions) {
        const slug = slugify(mention);
        if (registry.entities[slug]) {
          const exists = registry.entities[slug].appearances.some(
            (a: any) => a.micrositeId === micrositeId && a.section === 'keyFindings'
          );
          if (!exists) {
            registry.entities[slug].appearances.push({
              micrositeId,
              micrositeTitle,
              context: content.substring(0, 200),
              section: 'keyFindings',
            });
          }
        }
      }
    }
  }

  // Process recommendations
  if (recommendationsMatch) {
    const recommendations = recommendationsMatch[1];
    const contentMatches = recommendations.matchAll(/content:\s*['"]([^'"]+)/g);
    for (const match of contentMatches) {
      const content = match[1];
      const mentions = extractEntityMentions(content);
      for (const mention of mentions) {
        const slug = slugify(mention);
        if (registry.entities[slug]) {
          const exists = registry.entities[slug].appearances.some(
            (a: any) => a.micrositeId === micrositeId && a.section === 'recommendations'
          );
          if (!exists) {
            registry.entities[slug].appearances.push({
              micrositeId,
              micrositeTitle,
              context: content.substring(0, 200),
              section: 'recommendations',
            });
          }
        }
      }
    }
  }

  // 4. Update co-occurrences
  const entitySlugs = Object.keys(registry.entities);
  for (let i = 0; i < entitySlugs.length; i++) {
    for (let j = i + 1; j < entitySlugs.length; j++) {
      const slugA = entitySlugs[i];
      const slugB = entitySlugs[j];

      const entityA = registry.entities[slugA];
      const entityB = registry.entities[slugB];

      // Check if both appear in this microsite
      const aAppears = entityA.appearances.some((a: any) => a.micrositeId === micrositeId);
      const bAppears = entityB.appearances.some((a: any) => a.micrositeId === micrositeId);

      if (aAppears && bAppears) {
        // Update A's relation to B
        let relationAB = entityA.relatedEntities.find((r: any) => r.slug === slugB);
        if (!relationAB) {
          relationAB = { slug: slugB, coOccurrenceCount: 0 };
          entityA.relatedEntities.push(relationAB);
        }
        relationAB.coOccurrenceCount = 1;

        // Update B's relation to A
        let relationBA = entityB.relatedEntities.find((r: any) => r.slug === slugA);
        if (!relationBA) {
          relationBA = { slug: slugA, coOccurrenceCount: 0 };
          entityB.relatedEntities.push(relationBA);
        }
        relationBA.coOccurrenceCount = 1;
      }
    }
  }

  // 5. Save updated registry
  registry.stats.lastUpdated = new Date().toISOString();
  saveJSON(join(DATA_DIR, 'entities.json'), registry);
  console.log('✅ Updated entity registry with appearances and co-occurrences');

  // 6. Summary
  console.log('\n📊 Import Summary:');
  console.log(`   Microsite: ${micrositeId}`);
  console.log(`   Entities with appearances: ${Object.values(registry.entities).filter((e: any) => e.appearances.length > 0).length}`);
  console.log(`   Location: ${destDir}`);
  console.log('\n✨ Import complete!');
}

main().catch(console.error);
