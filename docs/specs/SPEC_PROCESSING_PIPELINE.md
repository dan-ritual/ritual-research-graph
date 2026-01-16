# Specification: Processing Pipeline

**Parent:** [`MASTER_SPEC.md`](../MASTER_SPEC.md)
**Sequence:** Child Spec #1 of 8
**Phase:** 1b (Processing Pipeline - CLI) — Requires Phase 1a (Database) first
**Status:** Draft
**Created:** 2026-01-16
**Last Updated:** 2026-01-16

> **Key Decision (2026-01-16):** This spec now integrates with Supabase from the start (not local JSON). See [`SPEC_DATABASE_SCHEMA.md`](./SPEC_DATABASE_SCHEMA.md) for Phase 1a setup.

---

## Overview

This specification details the end-to-end processing pipeline that transforms a raw meeting transcript into a deployed microsite. Phase 1 implements this as a CLI tool; Phase 3 wraps it with the Portal UI.

### Deliverable

```bash
npm run generate -- --transcript ./input.md --workflow market-landscape --output ./outputs/microsites/my-research
```

---

## Table of Contents

1. [Pipeline Stages](#1-pipeline-stages)
2. [Workflow: Market Landscape](#2-workflow-market-landscape)
3. [Artifact Generation Prompts](#3-artifact-generation-prompts)
4. [Multi-AI Research Chain](#4-multi-ai-research-chain) ← **NEW**
5. [Entity Extraction](#5-entity-extraction)
6. [SITE_CONFIG Generation](#6-site_config-generation)
7. [AI Provider Integration](#7-ai-provider-integration) ← **EXPANDED**
8. [Microsite Template](#8-microsite-template) ← **NEW**
9. [CLI Interface](#9-cli-interface)
10. [Error Handling](#10-error-handling)
11. [Implementation Tasks](#11-implementation-tasks)

---

## 1. Pipeline Stages

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PROCESSING PIPELINE                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  INPUT                                                                   │
│  ─────                                                                   │
│  Raw transcript (.md or .txt)                                           │
│  Workflow type (e.g., "market-landscape")                               │
│  Configuration (title, accent color, etc.)                              │
│                                                                          │
│       │                                                                  │
│       ▼                                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ STAGE 1: Artifact Generation (Claude)                            │   │
│  │                                                                  │   │
│  │  Transcript ──► [Prompt 1] ──► Cleaned Transcript               │   │
│  │       │                                                          │   │
│  │       ├──────► [Prompt 2] ──► Intelligence Brief                │   │
│  │       │                                                          │   │
│  │       └──────► [Prompt 3] ──► Strategic Questions               │   │
│  │                                                                  │   │
│  │  Output: 3 markdown files                                        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│       │                                                                  │
│       ▼                                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ STAGE 2: Multi-AI Research Chain ◄── NEW                         │   │
│  │                                                                  │   │
│  │  Entities + Brief ──► [Grok] ──► Real-time context              │   │
│  │                           │                                      │   │
│  │                           ▼                                      │   │
│  │                      [Perplexity] ──► Deep research             │   │
│  │                           │                                      │   │
│  │                           ▼                                      │   │
│  │                      [bird-cli] ──► Twitter threads/engagement  │   │
│  │                           │                                      │   │
│  │                           ▼                                      │   │
│  │                      [Claude] ──► Narrative Research synthesis  │   │
│  │                                                                  │   │
│  │  Output: Narrative Research Notes (.md)                          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│       │                                                                  │
│       ▼                                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ STAGE 3: Entity Extraction (Claude)                              │   │
│  │                                                                  │   │
│  │  All artifacts ──► [Prompt] ──► Entity list with metadata       │   │
│  │                                                                  │   │
│  │  Output: entities → Supabase                                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│       │                                                                  │
│       ▼                                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ STAGE 4: SITE_CONFIG Generation (Claude)                         │   │
│  │                                                                  │   │
│  │  Artifacts + Entities ──► [Prompt] ──► SITE_CONFIG              │   │
│  │                                                                  │   │
│  │  Output: data.js + config → Supabase                             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│       │                                                                  │
│       ▼                                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ STAGE 5: Microsite Build                                         │   │
│  │                                                                  │   │
│  │  SITE_CONFIG ──► Template ──► React App ──► Vite Build          │   │
│  │  Template source: /Users/danielgosek/Downloads/defi-rwa          │   │
│  │                                                                  │   │
│  │  Output: dist/ folder (static site)                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│       │                                                                  │
│       ▼                                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ STAGE 6: Graph Integration (Supabase)                            │   │
│  │                                                                  │   │
│  │  • Register microsite in microsites table                        │   │
│  │  • Add entity_appearances records                                │   │
│  │  • Calculate entity_relations (co-occurrences)                   │   │
│  │  • Update appearance_count via trigger                           │   │
│  │                                                                  │   │
│  │  Output: Database updated                                        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│       │                                                                  │
│       ▼                                                                  │
│  OUTPUT                                                                  │
│  ──────                                                                  │
│  Complete microsite in Vercel Blob storage                              │
│  Job status → 'completed' in Supabase                                   │
│  Ready for portal access                                                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Workflow: Market Landscape

The "Market Landscape" workflow is designed for external-facing research on market categories.

### Workflow Configuration

```typescript
const MARKET_LANDSCAPE_WORKFLOW: WorkflowConfig = {
  id: 'market-landscape',
  name: 'Market Landscape',
  description: 'External-facing research on market categories and opportunities',

  // Stage 1: Claude-generated artifacts
  artifacts: [
    {
      id: 'cleaned-transcript',
      name: 'Cleaned Transcript',
      promptId: 'prompt-clean-transcript',
      outputFile: '{slug}_Transcript_Clean.md',
      provider: 'claude',
    },
    {
      id: 'intelligence-brief',
      name: 'Intelligence Brief',
      promptId: 'prompt-intelligence-brief',
      outputFile: '{slug}_Intelligence_Brief.md',
      provider: 'claude',
    },
    {
      id: 'strategic-questions',
      name: 'Strategic Questions & Explorations',
      promptId: 'prompt-strategic-questions',
      outputFile: '{slug}_Strategic_Questions.md',
      provider: 'claude',
    },
  ],

  // Stage 2: Multi-AI research chain (see SPEC_MULTI_AI_RESEARCH.md)
  researchChain: {
    id: 'narrative-research',
    name: 'Narrative Research Notes',
    outputFile: '{slug}_Narrative_Research.md',
    chain: [
      { provider: 'grok', purpose: 'real-time-context' },
      { provider: 'perplexity', purpose: 'deep-research' },
      { provider: 'bird-cli', purpose: 'twitter-threads' },
      { provider: 'claude', purpose: 'synthesis' },
    ],
  },

  // Stage 3: Entity extraction
  entityExtraction: {
    types: ['company', 'protocol', 'person', 'concept', 'opportunity'],
    promptId: 'prompt-extract-entities',
    provider: 'claude',
  },

  // Stage 4: Site config generation
  siteConfigGeneration: {
    promptId: 'prompt-generate-site-config',
    provider: 'claude',
  },

  // Stage 5: Microsite build
  microsite: {
    template: 'making-software',
    templateSource: '/Users/danielgosek/Downloads/defi-rwa',
    features: {
      textSizeControls: true,
      agentExport: true,
      sourceArtifactsPanel: true,
      entityHover: true,
      relatedResearch: true,
    },
    visibility: 'internal',
  },

  // Stage 6: Database integration
  database: {
    provider: 'supabase',
    tables: ['generation_jobs', 'artifacts', 'microsites', 'entities', 'entity_appearances'],
  },
};
```

---

## 3. Artifact Generation Prompts

### Prompt 1: Clean Transcript

```typescript
const PROMPT_CLEAN_TRANSCRIPT = `
You are cleaning and structuring a raw meeting transcript.

## Input
Raw transcript from a meeting about: {topic}

## Task
1. Fix transcription errors and unclear passages
2. Add proper speaker attribution (use [Speaker Name] format)
3. Add section headers based on topic shifts
4. Remove filler words and false starts while preserving meaning
5. Format as clean markdown

## Output Format
Return a well-structured markdown document with:
- Clear speaker attributions
- Logical section breaks
- Preserved key quotes and insights
- Professional formatting

## Raw Transcript
---
{transcript}
---

Generate the cleaned transcript:
`;
```

### Prompt 2: Intelligence Brief

```typescript
const PROMPT_INTELLIGENCE_BRIEF = `
You are a strategic analyst creating an intelligence brief from a meeting transcript.

## Input
Cleaned transcript from a meeting about: {topic}

## Task
Create a comprehensive intelligence brief covering:

1. **Executive Summary** (2-3 paragraphs)
   - Key thesis
   - Most important findings
   - Critical recommendations

2. **Market Context**
   - Current state of the market
   - Key players and their positions
   - Recent developments

3. **Protocol/Company Deep Dives**
   - For each major entity discussed:
     - What they do
     - Their position in the market
     - Strengths and weaknesses
     - Relevance to Ritual

4. **Opportunity Analysis**
   - Identified opportunities
   - Risk assessment
   - Prioritization

5. **Competitive Landscape**
   - Who else is playing in this space
   - Differentiation opportunities

6. **Primary Sources**
   - Links and references mentioned
   - Additional research recommendations

## Output Format
Return a detailed markdown document with:
- Clear section headers (##)
- **Bold** for emphasis
- Bullet points for lists
- Tables where appropriate

## Cleaned Transcript
---
{cleaned_transcript}
---

Generate the intelligence brief:
`;
```

### Prompt 3: Strategic Questions & Explorations

```typescript
const PROMPT_STRATEGIC_QUESTIONS = `
You are expanding on strategic questions raised in a meeting.

## Input
- Cleaned transcript about: {topic}
- Intelligence brief already generated

## Task
Identify 5-8 strategic questions that emerged from the discussion and provide deep explorations of each.

For each question:
1. **State the question** clearly
2. **Context** - Why this question matters
3. **Analysis** - Explore multiple perspectives
4. **Implications for Ritual** - Specific actionable insights
5. **Open threads** - What needs more research

## Output Format
Return markdown with:
- One ## section per question
- Substantive analysis (200-400 words per question)
- Specific, actionable insights
- Clear connection to Ritual's positioning

## Cleaned Transcript
---
{cleaned_transcript}
---

## Intelligence Brief
---
{intelligence_brief}
---

Generate strategic questions and explorations:
`;
```

---

## 4. Multi-AI Research Chain

> **Full specification:** See [`SPEC_MULTI_AI_RESEARCH.md`](./SPEC_MULTI_AI_RESEARCH.md) for complete details.

The Narrative Research artifact is generated through a multi-provider AI chain instead of a single Claude prompt. This enables real-time data access and deeper research capabilities.

### Chain Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     MULTI-AI RESEARCH CHAIN                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  INPUT: Intelligence Brief + Extracted Entity Names                      │
│                                                                          │
│       │                                                                  │
│       ▼                                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ STEP 1: Grok (xAI)                                               │   │
│  │ Purpose: Real-time context gathering                             │   │
│  │ • Current events and news about entities                         │   │
│  │ • Recent developments in the market                              │   │
│  │ • Twitter/X sentiment signals                                    │   │
│  │ Output: real_time_context.json                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│       │                                                                  │
│       ▼                                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ STEP 2: Perplexity Sonar Pro                                     │   │
│  │ Purpose: Deep research with citations                            │   │
│  │ • Detailed entity research with sources                          │   │
│  │ • Competitive analysis                                           │   │
│  │ • Market data and metrics                                        │   │
│  │ Output: deep_research.json (with citations)                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│       │                                                                  │
│       ▼                                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ STEP 3: bird-cli (GCP VM)                                        │   │
│  │ Purpose: Twitter thread retrieval                                │   │
│  │ • Relevant threads from key accounts                             │   │
│  │ • Engagement metrics                                             │   │
│  │ • Reply trees and discussions                                    │   │
│  │ Output: twitter_data.json                                        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│       │                                                                  │
│       ▼                                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ STEP 4: Claude (Synthesis)                                       │   │
│  │ Purpose: Compile into Narrative Research Notes                   │   │
│  │ • Synthesize all research inputs                                 │   │
│  │ • Format as structured markdown                                  │   │
│  │ • Include citations and links                                    │   │
│  │ Output: {slug}_Narrative_Research.md                             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Provider Configuration

```typescript
interface ResearchProviders {
  grok: {
    apiKey: string;  // XAI_API_KEY
    model: 'grok-beta' | 'grok-2';
    endpoint: 'https://api.x.ai/v1/chat/completions';
  };
  perplexity: {
    apiKey: string;  // PERPLEXITY_API_KEY
    model: 'sonar-pro';
    endpoint: 'https://api.perplexity.ai/chat/completions';
  };
  birdCli: {
    host: string;  // GCP VM address
    sshKey: string;  // Path to SSH key
    projectPath: '/Users/danielgosek/dev/projects/ritual/rite';
  };
  claude: {
    apiKey: string;  // ANTHROPIC_API_KEY
    model: 'claude-sonnet-4-20250514';
  };
}
```

### Synthesis Prompt (Claude - Final Step)

```typescript
const PROMPT_SYNTHESIZE_RESEARCH = `
You are synthesizing multi-source research into a coherent Narrative Research document.

## Input Sources
1. **Real-time Context (Grok):**
{grok_output}

2. **Deep Research (Perplexity):**
{perplexity_output}

3. **Twitter Threads (bird-cli):**
{twitter_output}

## Task
Compile into structured Narrative Research Notes covering:

1. **Current Market Narratives**
   - Synthesize thought leader perspectives from all sources
   - Recent trends and shifts
   - Emerging themes

2. **Entity-Specific Research**
   - For each key entity:
     - Recent news/developments (cite sources)
     - Community sentiment (Twitter data)
     - Key metrics (TVL, users, etc.)

3. **Competitive Context**
   - Market positioning
   - Cross-references

4. **Timeline of Key Events**
   - Recent milestones
   - Upcoming catalysts

## Output Format
Markdown with:
- Clear section headers
- **Bold** for emphasis
- [Title](URL) for all citations
- Dated entries where relevant

Generate Narrative Research Notes:
`;
```

---

## 5. Entity Extraction

### Prompt 5: Extract Entities

```typescript
const PROMPT_EXTRACT_ENTITIES = `
You are extracting named entities from research artifacts.

## Input
Multiple artifacts from a research session about: {topic}

## Task
Extract all named entities and classify them:

### Entity Types
- **company**: Traditional companies (BlackRock, Coinbase)
- **protocol**: DeFi/crypto protocols (Aave, Uniswap)
- **person**: Named individuals
- **concept**: Key concepts or mechanisms (self-repaying loans, isolated markets)
- **opportunity**: Market opportunities (private credit, tokenized treasuries)

### For Each Entity, Provide
- **canonicalName**: Official name
- **aliases**: Alternative names used
- **type**: Entity type from above
- **url**: Official website (if known)
- **twitter**: Twitter handle (if known)
- **category**: Sub-category (e.g., "DeFi Lending", "RWA Infrastructure")
- **description**: One-sentence description
- **sentiment**: How the entity was discussed (positive/neutral/negative)
- **mentions**: Key quotes/contexts where mentioned

## Output Format
Return JSON array:
\`\`\`json
{
  "entities": [
    {
      "canonicalName": "Ondo Finance",
      "aliases": ["Ondo", "ONDO"],
      "type": "protocol",
      "url": "https://ondo.finance",
      "twitter": "OndoFinance",
      "category": "Tokenized Treasuries",
      "description": "Leading tokenized treasury protocol",
      "sentiment": "positive",
      "mentions": [
        {
          "context": "Ondo partnership = BD win...",
          "section": "recommendations"
        }
      ]
    }
  ]
}
\`\`\`

## Artifacts
---
{all_artifacts}
---

Extract entities:
`;
```

### Entity Deduplication Logic

```typescript
interface DeduplicationSuggestion {
  existingEntity: string;  // Slug of existing entity
  newEntity: string;       // Name from extraction
  confidence: number;      // 0-1 confidence score
  reason: string;          // Why we think they match
}

async function suggestDeduplication(
  extracted: ExtractedEntity[],
  registry: EntityRegistry
): Promise<DeduplicationSuggestion[]> {
  // 1. Exact name match
  // 2. Alias match
  // 3. Fuzzy name match (Levenshtein distance)
  // 4. Same URL or Twitter handle
  // Return suggestions for human review
}
```

---

## 6. SITE_CONFIG Generation

### Prompt 6: Generate SITE_CONFIG

```typescript
const PROMPT_GENERATE_SITE_CONFIG = `
You are generating a SITE_CONFIG for a Making Software microsite.

## Input
- Intelligence Brief
- Strategic Questions
- Extracted Entities
- User-provided configuration (title, accent color)

## Task
Generate a complete SITE_CONFIG object with:

### Required Fields
1. **branding**
   - title: Short title (e.g., "RITUAL INTELLIGENCE")
   - subtitle: Context line (e.g., "RWA × DeFi × AI · January 2026")
   - accentColor: Hex color (default: "#3B5FE6")

2. **thesis**
   - Single sentence capturing the core insight
   - Should be informative, not esoteric
   - Summarize the spirit of the research

3. **keyFindings** (5-7 items)
   - Each with title and content
   - Content supports **bold** markdown
   - Should reference specific data points

4. **recommendations** (6-10 items)
   - Actionable items for Ritual
   - Each with title and content

5. **entities**
   - Map of entity names to metadata
   - Include url, twitter, providers (TradingView symbols)

6. **deepDives**
   - Expandable sections for detailed content
   - Reference artifact files

7. **sourceArtifacts**
   - List of source documents
   - Reference files in /public/

## Output Format
Return valid JavaScript:
\`\`\`javascript
const SITE_CONFIG = {
  branding: { ... },
  thesis: "...",
  keyFindings: [ ... ],
  recommendations: [ ... ],
  entities: { ... },
  deepDives: [ ... ],
  sourceArtifacts: [ ... ],
  features: { ... }
};

export default SITE_CONFIG;
\`\`\`

## Input Data
---
Intelligence Brief:
{intelligence_brief}

Entities:
{entities_json}

User Config:
{user_config}
---

Generate SITE_CONFIG:
`;
```

---

## 7. AI Provider Integration

> **Key Change:** This system uses multiple AI providers, not just Claude. See Section 4 for the multi-AI research chain.

### Provider Hierarchy

| Tier | Provider | API Key | Role | Stages Used |
|------|----------|---------|------|-------------|
| **PRIMARY** | Claude (Anthropic) | `ANTHROPIC_API_KEY` | Core reasoning, synthesis, structured output | 1, 2 (final), 3, 4 |
| **SECONDARY** | Grok (xAI) | `XAI_API_KEY` | Real-time context enrichment | 2 (parallel) |
| **SECONDARY** | Perplexity (Sonar) | `PERPLEXITY_API_KEY` | Deep research with citations | 2 (parallel) |
| **INTERNAL** | bird-cli | SSH key | Twitter data retrieval | 2 (parallel) |

**Key Principle:** Claude orchestrates and synthesizes. Secondary providers supply enrichment data that Claude transforms into final outputs. This ensures consistent quality, voice, and structured formatting across all artifacts.

### Claude API Client (Primary)

```typescript
// scripts/lib/claude.ts

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface GenerationOptions {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  onProgress?: (stage: string, percent: number) => void;
}

export async function generateWithClaude(
  options: GenerationOptions
): Promise<string> {
  const { prompt, maxTokens = 4096, temperature = 0.7, onProgress } = options;

  onProgress?.('sending', 0);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  onProgress?.('complete', 100);

  // Extract text from response
  const textBlock = response.content.find(block => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  return textBlock.text;
}
```

### Model Selection

| Stage | Model | Max Tokens | Rationale |
|-------|-------|------------|-----------|
| Clean Transcript | claude-sonnet-4-20250514 | 8192 | Balance of quality and speed |
| Intelligence Brief | claude-sonnet-4-20250514 | 8192 | Needs detailed analysis |
| Strategic Questions | claude-sonnet-4-20250514 | 8192 | Deep exploration |
| Narrative Research | claude-sonnet-4-20250514 | 4096 | Shorter, factual |
| Entity Extraction | claude-sonnet-4-20250514 | 4096 | Structured output |
| SITE_CONFIG | claude-sonnet-4-20250514 | 8192 | Complex structured output |

### Grok API Client (xAI)

```typescript
// scripts/lib/grok.ts

interface GrokOptions {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export async function generateWithGrok(options: GrokOptions): Promise<string> {
  const { prompt, maxTokens = 4096, temperature = 0.7 } = options;

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'grok-2',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}
```

### Perplexity API Client

```typescript
// scripts/lib/perplexity.ts

interface PerplexityOptions {
  prompt: string;
  maxTokens?: number;
}

export async function searchWithPerplexity(options: PerplexityOptions): Promise<{
  content: string;
  citations: string[];
}> {
  const { prompt, maxTokens = 4096 } = options;

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'sonar-pro',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
    }),
  });

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    citations: data.citations || [],
  };
}
```

### bird-cli Integration (SSH)

```typescript
// scripts/lib/bird.ts

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface BirdOptions {
  command: 'search' | 'thread' | 'user' | 'engagement';
  query: string;
  limit?: number;
}

export async function queryBird(options: BirdOptions): Promise<any> {
  const { command, query, limit = 20 } = options;

  // SSH to GCP VM and run bird-cli
  const sshCommand = `ssh gcp-agentic "cd /path/to/rite && bird ${command} '${query}' --limit ${limit} --json"`;

  const { stdout } = await execAsync(sshCommand);
  return JSON.parse(stdout);
}
```

### Rate Limiting

```typescript
const RATE_LIMITS = {
  claude: { requestsPerMinute: 50, tokensPerMinute: 40000 },
  grok: { requestsPerMinute: 60, tokensPerMinute: 100000 },
  perplexity: { requestsPerMinute: 20, tokensPerMinute: 30000 },
  bird: { requestsPerMinute: 100 },  // Self-hosted, more generous
};

// Use p-queue for rate limiting per provider
import PQueue from 'p-queue';

const queues = {
  claude: new PQueue({ intervalCap: 50, interval: 60000 }),
  grok: new PQueue({ intervalCap: 60, interval: 60000 }),
  perplexity: new PQueue({ intervalCap: 20, interval: 60000 }),
  bird: new PQueue({ intervalCap: 100, interval: 60000 }),
};
```

---

## 8. Microsite Template

> **DESIGN SYSTEM:** All generated microsites MUST use the Making Software aesthetic. See [`docs/design/DESIGN_LIBRARY_MAKING_SOFTWARE.md`](../design/DESIGN_LIBRARY_MAKING_SOFTWARE.md) for the full design library.

### Template Source

The microsite template is copied from the existing RWA×DeFi microsite:

```
Source: /Users/danielgosek/Downloads/defi-rwa
       OR: outputs/microsites/rwa-defi-jan-2026 (project-local copy)
```

**Design Tokens (from Making Software):**
```typescript
const FONTS = {
  mono: '"JetBrains Mono", "SF Mono", "Consolas", monospace',
  serif: '"Crimson Text", Georgia, "Times New Roman", serif',
  display: '"Space Grotesk", "Inter", system-ui, sans-serif',
};

const COLORS = {
  background: '#FBFBFB',
  text: '#171717',
  accent: '#3B5FE6',  // User can override via --accent flag
};
```

### Template Structure

```
defi-rwa/                          # Template source
├── index.html                     # Entry point (copy as-is)
├── package.json                   # Dependencies (copy, update name)
├── vite.config.js                 # Build config (copy as-is)
├── src/
│   ├── App.jsx                    # Main app (templated - inject SITE_CONFIG)
│   ├── main.jsx                   # React entry (copy as-is)
│   └── index.css                  # Styles (copy as-is)
├── public/
│   └── *.md                       # Artifact files (generated)
└── dist/                          # Build output (generated)
```

### Template Injection Points

```typescript
// The template App.jsx contains a SITE_CONFIG that gets replaced
const TEMPLATE_INJECTION_POINTS = {
  // Replace the entire SITE_CONFIG object in App.jsx
  siteConfig: {
    pattern: /const SITE_CONFIG = \{[\s\S]*?\};/,
    replacement: (config: SiteConfig) => `const SITE_CONFIG = ${JSON.stringify(config, null, 2)};`,
  },

  // Update package.json name
  packageName: {
    file: 'package.json',
    pattern: /"name": ".*"/,
    replacement: (slug: string) => `"name": "${slug}"`,
  },
};
```

### Build Process

```typescript
async function buildMicrosite(config: {
  slug: string;
  siteConfig: SiteConfig;
  artifacts: Artifact[];
  outputDir: string;
}) {
  const { slug, siteConfig, artifacts, outputDir } = config;
  const templateDir = '/Users/danielgosek/Downloads/defi-rwa';

  // 1. Copy template to output directory
  await fs.cp(templateDir, outputDir, { recursive: true });

  // 2. Inject SITE_CONFIG into App.jsx
  const appPath = path.join(outputDir, 'src/App.jsx');
  let appContent = await fs.readFile(appPath, 'utf-8');
  appContent = appContent.replace(
    TEMPLATE_INJECTION_POINTS.siteConfig.pattern,
    TEMPLATE_INJECTION_POINTS.siteConfig.replacement(siteConfig)
  );
  await fs.writeFile(appPath, appContent);

  // 3. Copy artifacts to public/
  for (const artifact of artifacts) {
    await fs.copyFile(artifact.path, path.join(outputDir, 'public', artifact.filename));
  }

  // 4. Update package.json
  const pkgPath = path.join(outputDir, 'package.json');
  let pkgContent = await fs.readFile(pkgPath, 'utf-8');
  pkgContent = pkgContent.replace(/"name": ".*"/, `"name": "${slug}"`);
  await fs.writeFile(pkgPath, pkgContent);

  // 5. Install dependencies and build
  await execAsync(`cd ${outputDir} && npm install && npm run build`);

  return path.join(outputDir, 'dist');
}
```

---

## 9. CLI Interface

### Command Structure

```bash
npm run generate -- \
  --transcript ./transcripts/rwa-defi-2026-01-15.md \
  --workflow market-landscape \
  --output ./outputs/microsites/rwa-defi-jan-2026 \
  --title "RITUAL INTELLIGENCE" \
  --subtitle "RWA × DeFi × AI · January 2026" \
  --accent "#3B5FE6"
```

### CLI Implementation

```typescript
// scripts/generate.ts

import { program } from 'commander';
import ora from 'ora';
import chalk from 'chalk';

program
  .name('generate')
  .description('Generate microsite from transcript')
  .requiredOption('-t, --transcript <path>', 'Path to transcript file')
  .requiredOption('-w, --workflow <type>', 'Workflow type', 'market-landscape')
  .requiredOption('-o, --output <path>', 'Output directory')
  .option('--title <title>', 'Microsite title')
  .option('--subtitle <subtitle>', 'Microsite subtitle')
  .option('--accent <color>', 'Accent color hex', '#3B5FE6')
  .option('--skip-build', 'Skip Vite build step')
  .option('--dry-run', 'Show what would be generated without running')
  .parse();

async function main() {
  const opts = program.opts();
  const spinner = ora();

  console.log(chalk.blue('\n🔬 Ritual Research Graph - Generator\n'));

  // Stage 1: Generate artifacts
  spinner.start('Stage 1/5: Generating artifacts...');
  // ... implementation
  spinner.succeed('Stage 1/5: Artifacts generated (4 files)');

  // Stage 2: Extract entities
  spinner.start('Stage 2/5: Extracting entities...');
  // ... implementation
  spinner.succeed('Stage 2/5: Entities extracted (14 entities)');

  // Stage 3: Generate SITE_CONFIG
  spinner.start('Stage 3/5: Generating SITE_CONFIG...');
  // ... implementation
  spinner.succeed('Stage 3/5: SITE_CONFIG generated');

  // Stage 4: Build microsite
  spinner.start('Stage 4/5: Building microsite...');
  // ... implementation
  spinner.succeed('Stage 4/5: Microsite built');

  // Stage 5: Update graph
  spinner.start('Stage 5/5: Updating entity graph...');
  // ... implementation
  spinner.succeed('Stage 5/5: Graph updated');

  console.log(chalk.green('\n✨ Generation complete!'));
  console.log(`   Output: ${opts.output}`);
  console.log(`   Preview: npm run preview --prefix ${opts.output}\n`);
}

main().catch(console.error);
```

### Progress Output

```
🔬 Ritual Research Graph - Generator

✔ Stage 1/5: Artifacts generated (4 files)
  ├── RWA_DeFi_Jan_2026_Transcript_Clean.md
  ├── RWA_DeFi_Jan_2026_Intelligence_Brief.md
  ├── RWA_DeFi_Jan_2026_Strategic_Questions.md
  └── RWA_DeFi_Jan_2026_Narrative_Research.md

✔ Stage 2/5: Entities extracted (14 entities)
  ├── 8 protocols
  ├── 2 companies
  ├── 4 concepts
  └── 3 suggested merges (review required)

✔ Stage 3/5: SITE_CONFIG generated
  ├── 6 key findings
  ├── 8 recommendations
  └── 3 deep dives

✔ Stage 4/5: Microsite built
  └── dist/ (1.2 MB)

✔ Stage 5/5: Graph updated
  ├── Microsite registered
  ├── 14 entity appearances added
  └── 91 co-occurrences calculated

✨ Generation complete!
   Output: ./outputs/microsites/rwa-defi-jan-2026
   Preview: npm run preview --prefix ./outputs/microsites/rwa-defi-jan-2026
```

---

## 10. Error Handling

### Error Types

```typescript
enum GenerationErrorType {
  TRANSCRIPT_NOT_FOUND = 'TRANSCRIPT_NOT_FOUND',
  INVALID_WORKFLOW = 'INVALID_WORKFLOW',
  CLAUDE_API_ERROR = 'CLAUDE_API_ERROR',
  CLAUDE_RATE_LIMIT = 'CLAUDE_RATE_LIMIT',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  BUILD_FAILED = 'BUILD_FAILED',
  ENTITY_EXTRACTION_FAILED = 'ENTITY_EXTRACTION_FAILED',
}

class GenerationError extends Error {
  constructor(
    public type: GenerationErrorType,
    message: string,
    public stage?: number,
    public recoverable: boolean = false
  ) {
    super(message);
  }
}
```

### Retry Logic

```typescript
const RETRY_CONFIG = {
  maxRetries: 3,
  backoffMs: 1000,
  backoffMultiplier: 2,
};

async function withRetry<T>(
  fn: () => Promise<T>,
  errorType: GenerationErrorType
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < RETRY_CONFIG.maxRetries - 1) {
        const delay = RETRY_CONFIG.backoffMs * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt);
        await sleep(delay);
      }
    }
  }

  throw new GenerationError(errorType, lastError!.message, undefined, false);
}
```

---

## 11. Implementation Tasks

### Task Checklist

| # | Task | Priority | Dependency |
|---|------|----------|------------|
| 1 | **Prerequisite:** Set up Supabase (Phase 1a) | P0 | — |
| 2 | Create `scripts/generate.ts` CLI skeleton | P0 | #1 |
| 3 | Implement Claude API client (`scripts/lib/claude.ts`) | P0 | — |
| 4 | Implement Grok API client (`scripts/lib/grok.ts`) | P0 | — |
| 5 | Implement Perplexity API client (`scripts/lib/perplexity.ts`) | P0 | — |
| 6 | Implement bird-cli SSH integration (`scripts/lib/bird.ts`) | P0 | — |
| 7 | Create prompt templates (`scripts/prompts/`) | P0 | — |
| 8 | Implement Stage 1: Artifact generation (Claude) | P0 | #2, #3, #7 |
| 9 | Implement Stage 2: Multi-AI research chain | P0 | #4, #5, #6 |
| 10 | Implement Stage 3: Entity extraction | P0 | #3, #7 |
| 11 | Implement Stage 4: SITE_CONFIG generation | P0 | #3, #7 |
| 12 | Implement Stage 5: Microsite build (template copy + inject) | P0 | — |
| 13 | Implement Stage 6: Supabase graph integration | P0 | #1 |
| 14 | Add Supabase client (`scripts/lib/supabase.ts`) | P0 | #1 |
| 15 | Add progress indicators (ora) | P1 | #2 |
| 16 | Add error handling and retries | P1 | #3-#6 |
| 17 | Add dry-run mode | P2 | #2 |
| 18 | Add entity deduplication suggestions | P2 | #10 |

### Environment Variables Required

```bash
# .env.local

# ═══════════════════════════════════════════════════════════════════════════════
# PRIMARY AI PROVIDER — Claude handles all core reasoning tasks
# ═══════════════════════════════════════════════════════════════════════════════
#
# Used for:
#   • Stage 1: Artifact generation (Cleaned Transcript, Intelligence Brief, Strategic Questions)
#   • Stage 2: Research synthesis (Narrative Research final output)
#   • Stage 3: Entity extraction and classification
#   • Stage 4: SITE_CONFIG generation
#
# Rationale: Original specifications developed with Opus 4.5. Claude provides
# consistent reasoning, structured output quality, and alignment with Ritual's
# voice and requirements.
#
ANTHROPIC_API_KEY=sk-ant-...

# ═══════════════════════════════════════════════════════════════════════════════
# SECONDARY AI PROVIDERS — Enrichment data that feeds into Claude synthesis
# ═══════════════════════════════════════════════════════════════════════════════
#
# XAI (Grok): Real-time context gathering
#   • Twitter/X sentiment and discussions
#   • Breaking news and current events
#   • Recent developments not in training data
#
XAI_API_KEY=xai-...

# Perplexity (Sonar Pro): Deep research with citations
#   • Verified facts and figures with URLs
#   • Entity metrics (TVL, users, volume)
#   • Competitive analysis
#
PERPLEXITY_API_KEY=pplx-...

# ═══════════════════════════════════════════════════════════════════════════════
# DATABASE — Supabase
# ═══════════════════════════════════════════════════════════════════════════════
#
SUPABASE_URL=https://xxx.supabase.co   # Supabase project URL
SUPABASE_SERVICE_KEY=eyJ...            # Service role key (CLI writes)
SUPABASE_ANON_KEY=eyJ...               # Anon key (portal client-side)
```

> **Note:** bird-cli requires SSH key authentication to `gcp-agentic`, not an API key.
> See `~/.ssh/config` for SSH configuration.

### File Structure After Implementation

```
scripts/
├── generate.ts                  # Main CLI entry point
├── lib/
│   ├── claude.ts                # Claude API client
│   ├── grok.ts                  # Grok (xAI) API client
│   ├── perplexity.ts            # Perplexity API client
│   ├── bird.ts                  # bird-cli SSH integration
│   ├── supabase.ts              # Supabase client
│   ├── workflow.ts              # Workflow configuration
│   └── errors.ts                # Error types
├── prompts/
│   ├── clean-transcript.ts
│   ├── intelligence-brief.ts
│   ├── strategic-questions.ts
│   ├── synthesize-research.ts   # Multi-AI synthesis prompt
│   ├── extract-entities.ts
│   └── generate-site-config.ts
├── stages/
│   ├── artifacts.ts             # Stage 1: Claude artifacts
│   ├── research.ts              # Stage 2: Multi-AI research chain
│   ├── entities.ts              # Stage 3: Entity extraction
│   ├── site-config.ts           # Stage 4: SITE_CONFIG
│   ├── build.ts                 # Stage 5: Microsite build
│   └── graph.ts                 # Stage 6: Supabase integration
└── utils/
    ├── files.ts
    ├── progress.ts
    └── template.ts              # Template injection utilities
```

---

## Dependencies

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.20.0",
    "@supabase/supabase-js": "^2.39.0"
  },
  "devDependencies": {
    "commander": "^12.0.0",
    "ora": "^8.0.0",
    "chalk": "^5.3.0",
    "p-queue": "^8.0.0",
    "dotenv": "^16.3.0"
  }
}
```

---

## Related Specifications

| Spec | Relationship |
|------|--------------|
| [`MASTER_SPEC.md`](../MASTER_SPEC.md) | Parent specification |
| [`SPEC_DATABASE_SCHEMA.md`](./SPEC_DATABASE_SCHEMA.md) | **Prerequisite** — Phase 1a setup required |
| [`SPEC_MULTI_AI_RESEARCH.md`](./SPEC_MULTI_AI_RESEARCH.md) | Detailed research chain specification |
| [`docs/design/DESIGN_LIBRARY_MAKING_SOFTWARE.md`](../design/DESIGN_LIBRARY_MAKING_SOFTWARE.md) | **Microsite design system** — MUST follow for all generated sites |
| `SPEC_SPOT_TREATMENT.md` | Extends editing of generated artifacts |

---

*Specification created as part of Ritual Research Graph project.*
*See [`MASTER_SPEC.md`](../MASTER_SPEC.md) for full project context.*
