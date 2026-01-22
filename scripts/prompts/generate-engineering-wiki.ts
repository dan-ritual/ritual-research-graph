// Prompt template for generating engineering wiki pages

import type { EngineeringExtractionResult, MeetingTranscript } from "../lib/types.js";

export function buildEngineeringWikiPrompt(
  meeting: MeetingTranscript,
  extraction: EngineeringExtractionResult
): string {
  return `You are generating concise engineering wiki pages from meeting context.

## Meeting Summary
${meeting.summary ?? "(No summary provided)"}

## Transcript (excerpted)
${meeting.transcript}

## Entities
Topics: ${extraction.topics.map((t) => t.name).join(", ")}
Decisions: ${extraction.decisions.map((d) => d.title).join(", ")}
Features: ${extraction.features.map((f) => f.name).join(", ")}

## Task
Generate a wiki page for EACH topic listed. Use this template:

# {Topic Name}

## Overview
{Short summary}

## Related Features
- {Feature} — {status}

## Key Decisions
- {Decision title} — {status}

## Recent Discussions
- {Short transcript excerpt(s)}

## See Also
- {Related topics}

## Output JSON
Return a JSON object with this structure:
{
  "pages": [
    { "topic": "Topic Name", "content": "# Topic Name..." }
  ]
}

## Rules
- Use markdown headings exactly as shown.
- Keep pages concise (max ~250 words each).
- If a section has no data, include a brief "None noted" line.

Return ONLY valid JSON. No markdown.`;
}
