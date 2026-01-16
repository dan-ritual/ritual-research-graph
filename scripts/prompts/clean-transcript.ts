// Prompt template for cleaning and structuring a raw transcript

export function buildCleanTranscriptPrompt(topic: string, rawTranscript: string): string {
  return `You are cleaning and structuring a raw meeting transcript.

## Input
Raw transcript from a meeting about: ${topic}

## Task
1. Fix transcription errors and unclear passages
2. Add proper speaker attribution (use [Speaker Name] format at start of each turn)
3. Add section headers based on topic shifts using ## for major topics
4. Remove filler words and false starts while preserving meaning
5. Format as clean markdown
6. Preserve all substantive content - do not summarize or omit details

## Output Format
Return a well-structured markdown document with:
- Clear speaker attributions in **bold** at start of each speaking turn
- Logical section breaks with ## headers
- Preserved key quotes and insights
- Professional formatting

## Raw Transcript
---
${rawTranscript}
---

Generate the cleaned transcript:`;
}
