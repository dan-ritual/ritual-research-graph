# Specification: Multi-AI Research Chain

**Parent:** [`MASTER_SPEC.md`](../MASTER_SPEC.md)
**Sequence:** Child Spec #3 of 8
**Phase:** 1b (Processing Pipeline - CLI)
**Status:** Draft
**Created:** 2026-01-16
**Last Updated:** 2026-01-16

> **Purpose:** This specification details the multi-provider AI research chain that generates the Narrative Research artifact using real-time data from multiple sources.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Provider Architecture](#2-provider-architecture)
3. [Chain Execution Flow](#3-chain-execution-flow)
4. [Step 1: Grok (Real-Time Context)](#4-step-1-grok-real-time-context)
5. [Step 2: Perplexity (Deep Research)](#5-step-2-perplexity-deep-research)
6. [Step 3: bird-cli (Twitter Data)](#6-step-3-bird-cli-twitter-data)
7. [Step 4: Claude (Synthesis)](#7-step-4-claude-synthesis)
8. [Error Handling & Fallbacks](#8-error-handling--fallbacks)
9. [Configuration](#9-configuration)
10. [Implementation Tasks](#10-implementation-tasks)

---

## 1. Overview

### Problem Statement

The original Narrative Research artifact relied on Claude to "research and compile notes" — but Claude API calls have no internet access. This created a gap where external research was simulated rather than real.

### Solution

A multi-provider AI chain that leverages:

1. **Grok (xAI)** — Real-time context from Twitter/X and current events
2. **Perplexity Sonar Pro** — Deep research with citations
3. **bird-cli** — Direct Twitter thread retrieval and engagement metrics
4. **Claude** — Final synthesis into structured Narrative Research Notes

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     WHY MULTIPLE PROVIDERS?                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Provider        Unique Capability                                       │
│  ────────        ─────────────────                                       │
│  Grok            Real-time Twitter/X data, current events               │
│  Perplexity      Citations, web search, verified sources                │
│  bird-cli        Thread trees, engagement metrics, account history      │
│  Claude          Superior synthesis, structured output, consistency     │
│                                                                          │
│  Combined: Comprehensive, cited, real-time research                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Provider Architecture

### Provider Configuration

```typescript
// scripts/lib/providers.ts

export interface ProviderConfig {
  grok: {
    apiKey: string;
    endpoint: string;
    model: 'grok-2' | 'grok-beta';
    maxTokens: number;
    temperature: number;
  };
  perplexity: {
    apiKey: string;
    endpoint: string;
    model: 'sonar-pro' | 'sonar';
    maxTokens: number;
  };
  bird: {
    sshHost: string;
    sshUser: string;
    projectPath: string;
    timeout: number;
  };
  claude: {
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
  };
}

export const DEFAULT_CONFIG: ProviderConfig = {
  grok: {
    apiKey: process.env.XAI_API_KEY!,
    endpoint: 'https://api.x.ai/v1/chat/completions',
    model: 'grok-2',
    maxTokens: 4096,
    temperature: 0.7,
  },
  perplexity: {
    apiKey: process.env.PERPLEXITY_API_KEY!,
    endpoint: 'https://api.perplexity.ai/chat/completions',
    model: 'sonar-pro',
    maxTokens: 4096,
  },
  bird: {
    sshHost: 'gcp-agentic',
    sshUser: 'default',
    projectPath: '/home/danielgosek/rite',
    timeout: 60000,
  },
  claude: {
    apiKey: process.env.ANTHROPIC_API_KEY!,
    model: 'claude-sonnet-4-20250514',
    maxTokens: 8192,
    temperature: 0.7,
  },
};
```

### Provider Interface

```typescript
// scripts/lib/provider-interface.ts

export interface ProviderResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  duration: number;
  provider: string;
}

export interface ResearchInput {
  topic: string;
  entities: string[];
  intelligenceBrief: string;
  context?: string;
}

export interface GrokOutput {
  realTimeContext: string;
  recentEvents: Array<{
    event: string;
    date: string;
    source: string;
  }>;
  sentiment: {
    overall: 'positive' | 'neutral' | 'negative';
    breakdown: Record<string, string>;
  };
}

export interface PerplexityOutput {
  research: string;
  citations: Array<{
    url: string;
    title: string;
    snippet: string;
  }>;
  entityInsights: Record<string, {
    summary: string;
    metrics?: Record<string, string>;
  }>;
}

export interface BirdOutput {
  threads: Array<{
    id: string;
    author: string;
    content: string;
    engagement: {
      likes: number;
      retweets: number;
      replies: number;
    };
    timestamp: string;
  }>;
  accounts: Array<{
    handle: string;
    relevance: string;
    recentActivity: string;
  }>;
}
```

---

## 3. Chain Execution Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      RESEARCH CHAIN EXECUTION                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  INPUT                                                                   │
│  ─────                                                                   │
│  • Intelligence Brief (from Stage 1)                                    │
│  • Extracted entity names (preliminary, from brief)                     │
│  • Topic description                                                    │
│                                                                          │
│       │                                                                  │
│       ▼                                                                  │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │ PARALLEL EXECUTION (Steps 1-3)                                  │    │
│  │                                                                 │    │
│  │  ┌──────────┐   ┌──────────────┐   ┌──────────────────┐       │    │
│  │  │  Grok    │   │  Perplexity  │   │    bird-cli      │       │    │
│  │  │ (async)  │   │   (async)    │   │     (async)      │       │    │
│  │  └────┬─────┘   └──────┬───────┘   └────────┬─────────┘       │    │
│  │       │                │                     │                 │    │
│  │       ▼                ▼                     ▼                 │    │
│  │   grok.json      perplexity.json        bird.json             │    │
│  │                                                                 │    │
│  └────────────────────────────────────────────────────────────────┘    │
│       │                                                                  │
│       ▼                                                                  │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │ STEP 4: Claude Synthesis (Sequential)                           │    │
│  │                                                                 │    │
│  │  All outputs ──► Synthesis Prompt ──► Narrative Research       │    │
│  │                                                                 │    │
│  └────────────────────────────────────────────────────────────────┘    │
│       │                                                                  │
│       ▼                                                                  │
│  OUTPUT                                                                  │
│  ──────                                                                  │
│  {slug}_Narrative_Research.md                                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Execution Code

```typescript
// scripts/stages/research.ts

import { generateWithGrok } from '../lib/grok';
import { searchWithPerplexity } from '../lib/perplexity';
import { queryBird } from '../lib/bird';
import { generateWithClaude } from '../lib/claude';

export async function executeResearchChain(input: ResearchInput): Promise<string> {
  const { topic, entities, intelligenceBrief } = input;

  console.log('Starting multi-AI research chain...');

  // Execute Steps 1-3 in parallel
  const [grokResult, perplexityResult, birdResult] = await Promise.allSettled([
    executeGrokStep(topic, entities, intelligenceBrief),
    executePerplexityStep(topic, entities),
    executeBirdStep(entities),
  ]);

  // Extract results (with fallbacks for failures)
  const grokOutput = grokResult.status === 'fulfilled'
    ? grokResult.value
    : { error: grokResult.reason.message };

  const perplexityOutput = perplexityResult.status === 'fulfilled'
    ? perplexityResult.value
    : { error: perplexityResult.reason.message };

  const birdOutput = birdResult.status === 'fulfilled'
    ? birdResult.value
    : { error: birdResult.reason.message };

  // Step 4: Claude synthesis
  const narrativeResearch = await synthesizeWithClaude({
    topic,
    intelligenceBrief,
    grokOutput,
    perplexityOutput,
    birdOutput,
  });

  return narrativeResearch;
}
```

---

## 4. Step 1: Grok (Real-Time Context)

### Purpose

Grok provides real-time context that other models lack:
- Current events and breaking news
- Twitter/X sentiment and discussions
- Recent developments not yet in training data

### Prompt Template

```typescript
const GROK_PROMPT = `
You are gathering real-time context for research on: {topic}

## Key Entities to Research
{entities}

## Intelligence Brief Context
{intelligenceBrief}

## Task
Provide real-time context including:

1. **Recent Events** (last 30 days)
   - Major announcements from these entities
   - Market developments
   - Partnership or integration news

2. **Current Sentiment**
   - How is each entity being discussed on Twitter/X?
   - Any controversies or concerns?
   - Community enthusiasm levels

3. **Trending Topics**
   - Related hashtags or discussions
   - Emerging narratives

## Output Format
Return JSON:
{
  "realTimeContext": "Summary paragraph...",
  "recentEvents": [
    { "event": "...", "date": "YYYY-MM-DD", "source": "..." }
  ],
  "sentiment": {
    "overall": "positive|neutral|negative",
    "breakdown": { "EntityName": "sentiment description" }
  }
}
`;
```

### Implementation

```typescript
// scripts/lib/grok.ts

export async function executeGrokStep(
  topic: string,
  entities: string[],
  intelligenceBrief: string
): Promise<GrokOutput> {
  const prompt = GROK_PROMPT
    .replace('{topic}', topic)
    .replace('{entities}', entities.map(e => `- ${e}`).join('\n'))
    .replace('{intelligenceBrief}', intelligenceBrief.slice(0, 2000));

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'grok-2',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4096,
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;

  // Parse JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in Grok response');

  return JSON.parse(jsonMatch[0]) as GrokOutput;
}
```

---

## 5. Step 2: Perplexity (Deep Research)

### Purpose

Perplexity provides:
- Deep research with web citations
- Verified facts and figures
- Entity-specific metrics (TVL, users, etc.)

### Prompt Template

```typescript
const PERPLEXITY_PROMPT = `
Research the following topic comprehensively: {topic}

## Specific Entities to Research
{entities}

## Required Research Areas

1. **Entity Deep Dives**
   For each entity, find:
   - Official description and mission
   - Key metrics (TVL, users, volume if applicable)
   - Recent news (last 90 days)
   - Competitive positioning

2. **Market Context**
   - Market size and growth
   - Key trends
   - Regulatory landscape

3. **Competitive Analysis**
   - Main competitors for each entity
   - Differentiation factors

Provide CITATIONS for all facts and figures.
`;
```

### Implementation

```typescript
// scripts/lib/perplexity.ts

export async function executePerplexityStep(
  topic: string,
  entities: string[]
): Promise<PerplexityOutput> {
  const prompt = PERPLEXITY_PROMPT
    .replace('{topic}', topic)
    .replace('{entities}', entities.map(e => `- ${e}`).join('\n'));

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'sonar-pro',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4096,
      return_citations: true,
    }),
  });

  const data = await response.json();

  return {
    research: data.choices[0].message.content,
    citations: data.citations || [],
    entityInsights: {}, // Parsed from response
  };
}
```

---

## 6. Step 3: bird-cli (Twitter Data)

### Purpose

bird-cli provides:
- Full thread trees from relevant accounts
- Engagement metrics (likes, retweets, replies)
- Account activity and influence

### bird-cli Commands

```bash
# Search for tweets about entities
bird search "Ondo Finance" --limit 20 --json

# Get specific thread
bird thread 1234567890 --json

# Get user's recent tweets
bird user OndoFinance --limit 10 --json

# Get engagement data
bird engagement 1234567890 --json
```

### Implementation

```typescript
// scripts/lib/bird.ts

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function executeBirdStep(entities: string[]): Promise<BirdOutput> {
  const threads: BirdOutput['threads'] = [];
  const accounts: BirdOutput['accounts'] = [];

  for (const entity of entities.slice(0, 5)) { // Limit to top 5
    try {
      // Search for relevant tweets
      const searchResult = await execAsync(
        `ssh gcp-agentic "cd ~/rite && bird search '${entity}' --limit 10 --json"`,
        { timeout: 30000 }
      );

      const searchData = JSON.parse(searchResult.stdout);
      threads.push(...searchData.tweets.map((t: any) => ({
        id: t.id,
        author: t.author,
        content: t.text,
        engagement: {
          likes: t.likes || 0,
          retweets: t.retweets || 0,
          replies: t.replies || 0,
        },
        timestamp: t.created_at,
      })));

    } catch (error) {
      console.warn(`bird-cli failed for ${entity}:`, error);
    }
  }

  return { threads, accounts };
}
```

### SSH Configuration

Requires `~/.ssh/config` entry:

```
Host gcp-agentic
  HostName <GCP-VM-IP>
  User danielgosek
  IdentityFile ~/.ssh/gcp-agentic
  StrictHostKeyChecking no
```

---

## 7. Step 4: Claude (Synthesis)

### Purpose

Claude synthesizes all research outputs into a cohesive Narrative Research document.

### Synthesis Prompt

```typescript
const SYNTHESIS_PROMPT = `
You are synthesizing multi-source research into a comprehensive Narrative Research document.

## Topic
{topic}

## Source 1: Real-Time Context (Grok)
{grokOutput}

## Source 2: Deep Research (Perplexity)
{perplexityOutput}

## Source 3: Twitter Data (bird-cli)
{birdOutput}

## Task
Create a Narrative Research Notes document with:

### 1. Current Market Narratives
- Synthesize key themes from all sources
- Note areas of consensus and divergence
- Highlight emerging trends

### 2. Entity-Specific Research
For each major entity:
- **Overview**: What they do (from Perplexity)
- **Recent Activity**: News and developments (from Grok)
- **Community Sentiment**: Twitter discussions (from bird-cli)
- **Key Metrics**: TVL, users, etc. (from Perplexity, cite sources)

### 3. Competitive Landscape
- Key competitors
- Positioning differences
- Market dynamics

### 4. Timeline of Key Events
- Recent milestones (with dates)
- Upcoming catalysts

### 5. Sources
- List all citations from Perplexity
- Reference key Twitter threads

## Output Format
Markdown with:
- Clear ## section headers
- **Bold** for emphasis
- [Title](URL) for all citations
- Dated entries where relevant
- Tables for comparing entities
`;
```

---

## 8. Error Handling & Fallbacks

### Fallback Strategy

```typescript
const FALLBACK_STRATEGY = {
  grok: {
    // If Grok fails, use Claude with web search context prompt
    fallback: 'claude-with-context',
    timeout: 30000,
    retries: 2,
  },
  perplexity: {
    // If Perplexity fails, use Grok for research
    fallback: 'grok',
    timeout: 60000,
    retries: 2,
  },
  bird: {
    // If bird-cli fails, skip Twitter data
    fallback: 'skip',
    timeout: 30000,
    retries: 1,
  },
  claude: {
    // If Claude fails, fatal error
    fallback: 'fatal',
    timeout: 120000,
    retries: 3,
  },
};
```

### Graceful Degradation

```typescript
async function executeWithFallback<T>(
  provider: keyof typeof FALLBACK_STRATEGY,
  primaryFn: () => Promise<T>,
  fallbackFn?: () => Promise<T>
): Promise<T | null> {
  const strategy = FALLBACK_STRATEGY[provider];

  for (let attempt = 0; attempt <= strategy.retries; attempt++) {
    try {
      return await Promise.race([
        primaryFn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), strategy.timeout)
        ),
      ]);
    } catch (error) {
      console.warn(`${provider} attempt ${attempt + 1} failed:`, error);

      if (attempt === strategy.retries) {
        if (strategy.fallback === 'skip') {
          console.warn(`Skipping ${provider} data`);
          return null;
        }
        if (strategy.fallback === 'fatal') {
          throw error;
        }
        if (fallbackFn) {
          return fallbackFn();
        }
      }
    }
  }

  return null;
}
```

---

## 9. Configuration

### Environment Variables

```bash
# Required
XAI_API_KEY=xai-...              # Grok API key
PERPLEXITY_API_KEY=pplx-...      # Perplexity API key
ANTHROPIC_API_KEY=sk-ant-...     # Claude API key

# Optional (for bird-cli)
BIRD_SSH_HOST=gcp-agentic        # SSH host alias
BIRD_PROJECT_PATH=~/rite         # Path on remote server
```

### Runtime Configuration

```typescript
interface ResearchChainConfig {
  // Provider enablement
  enableGrok: boolean;
  enablePerplexity: boolean;
  enableBird: boolean;

  // Limits
  maxEntities: number;           // Max entities to research (default: 10)
  maxTwitterThreads: number;     // Max threads per entity (default: 5)

  // Timeouts
  totalTimeout: number;          // Total chain timeout (default: 300000ms)

  // Output
  saveIntermediateResults: boolean;  // Save grok.json, perplexity.json, bird.json
}

const DEFAULT_CHAIN_CONFIG: ResearchChainConfig = {
  enableGrok: true,
  enablePerplexity: true,
  enableBird: true,
  maxEntities: 10,
  maxTwitterThreads: 5,
  totalTimeout: 300000,
  saveIntermediateResults: true,
};
```

---

## 10. Implementation Tasks

| # | Task | Priority | Status |
|---|------|----------|--------|
| 1 | Implement Grok API client | P0 | ⬚ |
| 2 | Implement Perplexity API client | P0 | ⬚ |
| 3 | Implement bird-cli SSH wrapper | P0 | ⬚ |
| 4 | Create Grok prompt template | P0 | ⬚ |
| 5 | Create Perplexity prompt template | P0 | ⬚ |
| 6 | Create Claude synthesis prompt | P0 | ⬚ |
| 7 | Implement parallel execution | P0 | ⬚ |
| 8 | Implement error handling & fallbacks | P1 | ⬚ |
| 9 | Add intermediate result caching | P1 | ⬚ |
| 10 | Add rate limiting per provider | P1 | ⬚ |
| 11 | Verify SSH to GCP VM | P0 | ⬚ |
| 12 | Test full chain with sample data | P0 | ⬚ |

---

## Related Specifications

| Spec | Relationship |
|------|--------------|
| [`MASTER_SPEC.md`](../MASTER_SPEC.md) | Parent specification |
| [`SPEC_PROCESSING_PIPELINE.md`](./SPEC_PROCESSING_PIPELINE.md) | This is Stage 2 of the pipeline |

---

*Specification created as part of Ritual Research Graph project.*
*See [`MASTER_SPEC.md`](../MASTER_SPEC.md) for full project context.*
