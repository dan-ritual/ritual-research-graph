// Prompt template for normalizing Google Meet (Gemini) transcripts

export function buildMeetingTranscriptPrompt(rawTranscript: string): string {
  return `You are a meeting transcript formatter.

Given a Google Meet transcript (Gemini-generated) or raw meeting notes, normalize it into a structured JSON object.

## Output JSON Schema
{
  "title": "Meeting title (string)",
  "date": "YYYY-MM-DD or null",
  "attendees": ["Name", "Name"],
  "summary": "Short summary paragraph or null",
  "transcript": "Normalized transcript with speaker labels and timestamps where available"
}

## Rules
- Preserve speaker labels and timestamps if present.
- If title or date is missing, infer from context or set to null.
- Attendees should be unique and ordered by first appearance.
- Keep transcript readable and clean, but do not invent content.
- Use ISO date format when possible.

## Input Transcript
${rawTranscript}

Return ONLY valid JSON. No markdown.`;
}
