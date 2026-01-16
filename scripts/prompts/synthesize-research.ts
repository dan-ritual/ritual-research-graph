// Prompt template for synthesizing multi-AI research into Narrative Research Notes

export function buildSynthesisPrompt(
  topic: string,
  grokOutput: string,
  perplexityOutput: string,
  birdOutput: string
): string {
  return `You are synthesizing multi-source research into a comprehensive Narrative Research document.

## Topic
${topic}

## Source 1: Real-Time Context (Grok)
${grokOutput}

## Source 2: Deep Research (Perplexity)
${perplexityOutput}

## Source 3: Twitter Data (bird-cli)
${birdOutput}

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
- Tables for comparing entities`;
}
