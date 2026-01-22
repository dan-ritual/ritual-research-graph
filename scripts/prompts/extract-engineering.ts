// Prompt template for extracting engineering entities from meeting transcripts

import type { MeetingTranscript } from "../lib/types.js";

export function buildEngineeringExtractionPrompt(meeting: MeetingTranscript): string {
  const summary = meeting.summary ? `## Summary\n${meeting.summary}` : "";

  return `You are an engineering knowledge extraction specialist. Extract structured entities from the meeting transcript.

## Meeting Context
Title: ${meeting.title}
Date: ${meeting.date ?? "Unknown"}
Attendees: ${meeting.attendees.length ? meeting.attendees.join(", ") : "Unknown"}

${summary}

## Transcript
${meeting.transcript}

## Task
Extract the following entity types with strict schemas:

### Topics
- name: string
- description: string (1-2 sentences)
- category: one of ["architecture","infrastructure","frontend","backend","devops","process","other"]
- mentions: array of { timestamp?: string | null, context: string }
- related_features: array of feature names
- related_decisions: array of decision titles

### Decisions (ADR style)
- title: string
- status: one of ["proposed","accepted","deprecated","superseded"]
- context: string
- decision: string
- consequences: string
- related_topics: array of topic names
- superseded_by?: string | null
- decided_at?: string | null (YYYY-MM-DD if available)

### Features
- name: string
- description: string
- status: one of ["planning","in_progress","review","done","blocked"]
- owner: string | null
- epic?: string | null
- asana_task_id?: string | null
- related_topics: array of topic names
- related_decisions: array of decision titles

### Components
- name: string
- type: one of ["service","library","api","ui","database","infrastructure"]
- description: string
- repository?: string | null
- dependencies: array of component names
- owned_by?: string | null
- related_features: array of feature names

## Output JSON
Return a JSON object with this exact structure:
{
  "topics": [ ... ],
  "decisions": [ ... ],
  "features": [ ... ],
  "components": [ ... ]
}

## Rules
- Use ONLY the allowed enum values (lowercase).
- Keep arrays empty instead of null.
- Deduplicate by name/title if possible.
- Do not invent Asana IDs or repositories.

Return ONLY valid JSON. No markdown.`;
}
