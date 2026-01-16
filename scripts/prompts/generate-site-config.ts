// Prompt template for generating SITE_CONFIG from research artifacts

import type { ExtractedEntity, SiteConfig } from '../lib/types.js';

export function buildSiteConfigPrompt(
  intelligenceBrief: string,
  strategicQuestions: string,
  entities: ExtractedEntity[],
  options: {
    title?: string;
    subtitle?: string;
    accentColor?: string;
  }
): string {
  const entitySummary = entities
    .slice(0, 20)
    .map(e => `- ${e.canonicalName} (${e.type}): ${e.description.slice(0, 100)}`)
    .join('\n');

  return `You are generating a SITE_CONFIG for a research microsite. Extract structured data from the research documents.

## Research Documents

### Intelligence Brief
${intelligenceBrief}

### Strategic Questions
${strategicQuestions}

### Extracted Entities (top 20)
${entitySummary}

## Configuration Context
- Title: ${options.title || '(generate from content)'}
- Subtitle: ${options.subtitle || '(generate from content)'}
- Accent Color: ${options.accentColor || '#3B5FE6'}

## Task
Generate a SITE_CONFIG JSON object with this structure:

\`\`\`json
{
  "branding": {
    "title": "string - research title (e.g., 'RWA DeFi Market Intelligence')",
    "subtitle": "string - tagline (e.g., 'Q1 2026 Analysis')",
    "accentColor": "string - hex color for UI accent"
  },
  "thesis": "string - 2-3 sentence executive summary of the research thesis",
  "keyFindings": [
    {
      "title": "string - finding title",
      "content": "string - 2-3 sentences explaining the finding"
    }
  ],
  "recommendations": [
    {
      "title": "string - recommendation title",
      "content": "string - actionable recommendation with context"
    }
  ],
  "entities": {
    "EntityName": {
      "website": "string or null - official URL",
      "twitter": "string or null - handle without @",
      "tvSymbol": "string or null - TradingView symbol if applicable"
    }
  },
  "deepDives": [
    {
      "id": "string - kebab-case-id",
      "title": "string - section title",
      "subtitle": "string - brief description",
      "isContent": true,
      "content": "string - markdown content for this section"
    }
  ],
  "sourceArtifacts": [
    {
      "id": "string - kebab-case-id",
      "title": "string - artifact name",
      "subtitle": "string - artifact type",
      "file": "string - filename",
      "description": "string - what this artifact contains"
    }
  ]
}
\`\`\`

## Rules

1. **Key Findings**: Extract 4-6 most important findings from the research
2. **Recommendations**: Extract 3-5 actionable recommendations with priorities
3. **Entities**: Include top 10-15 entities with their URLs/Twitter if known
4. **Deep Dives**: Create 3-5 themed sections grouping related content:
   - Market Overview
   - Key Players
   - Opportunities
   - Risk Analysis (if applicable)
   - Strategic Implications

5. **Source Artifacts**: Reference the generated artifacts:
   - Transcript_Clean.md
   - Intelligence_Brief.md
   - Strategic_Questions.md
   - Narrative_Research.md (if available)
   - Entities.json

6. **Tone**: Professional, analytical, suitable for executive audience
7. **Content**: Base everything on the provided documents, don't hallucinate

Return ONLY the JSON object, no additional text.`;
}

export function validateSiteConfig(config: unknown): config is SiteConfig {
  if (!config || typeof config !== 'object') return false;

  const c = config as Record<string, unknown>;

  // Required fields
  if (!c.branding || typeof c.branding !== 'object') return false;
  if (!c.thesis || typeof c.thesis !== 'string') return false;
  if (!Array.isArray(c.keyFindings)) return false;
  if (!Array.isArray(c.recommendations)) return false;
  if (!c.entities || typeof c.entities !== 'object') return false;
  if (!Array.isArray(c.deepDives)) return false;
  if (!Array.isArray(c.sourceArtifacts)) return false;

  return true;
}
