// Prompt template for generating strategic questions and explorations

export function buildStrategicQuestionsPrompt(
  topic: string,
  cleanedTranscript: string,
  intelligenceBrief: string
): string {
  return `You are expanding on strategic questions raised in a meeting.

## Input
- Cleaned transcript about: ${topic}
- Intelligence brief already generated

## Task
Identify 5-8 strategic questions that emerged from the discussion and provide deep explorations of each.

For each question:
1. **State the question** clearly as a ## header
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
- References to specific entities or data points from the meeting

## Cleaned Transcript
---
${cleanedTranscript.slice(0, 8000)}...
---

## Intelligence Brief
---
${intelligenceBrief}
---

Generate strategic questions and explorations:`;
}
