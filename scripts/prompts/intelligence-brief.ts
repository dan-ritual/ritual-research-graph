// Prompt template for generating an intelligence brief

export function buildIntelligenceBriefPrompt(topic: string, cleanedTranscript: string): string {
  return `You are a strategic analyst creating an intelligence brief from a meeting transcript.

## Input
Cleaned transcript from a meeting about: ${topic}

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
- Specific data points and metrics where discussed

## Cleaned Transcript
---
${cleanedTranscript}
---

Generate the intelligence brief:`;
}
