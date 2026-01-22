// Stage: Google Meet transcript ingestion

import path from "path";
import { generateJsonWithClaude } from "../lib/claude.js";
import { buildMeetingTranscriptPrompt } from "../prompts/meeting-transcript.js";
import { readFile, writeFile, slugify } from "../utils/files.js";
import type { Artifact, GenerationConfig, MeetingTranscript } from "../lib/types.js";
import type { Ora } from "ora";

interface MeetingTranscriptOptions {
  config: GenerationConfig;
  spinner: Ora;
  outputDir: string;
}

interface MeetingTranscriptResult {
  meeting: MeetingTranscript;
  artifact: Artifact;
}

export async function ingestMeetingTranscript(
  options: MeetingTranscriptOptions
): Promise<MeetingTranscriptResult> {
  const { config, spinner, outputDir } = options;

  spinner.text = "Ingesting meeting transcript...";
  const rawTranscript = await readFile(config.transcript);

  const meeting = await generateJsonWithClaude<MeetingTranscript>({
    prompt: buildMeetingTranscriptPrompt(rawTranscript),
    maxTokens: 4096,
    temperature: 0.2,
  });

  const normalized: MeetingTranscript = {
    title: meeting.title || config.title || "Meeting",
    date: meeting.date ?? null,
    attendees: Array.isArray(meeting.attendees) ? meeting.attendees : [],
    summary: meeting.summary ?? null,
    transcript: meeting.transcript || rawTranscript,
  };

  const slug = slugify(normalized.title || "meeting");
  const artifactsDir = path.join(outputDir, "artifacts");

  const artifact: Artifact = {
    id: "meeting_transcript",
    name: "Meeting Transcript",
    filename: `${slug}_Meeting_Transcript.json`,
    content: JSON.stringify(normalized, null, 2),
  };
  artifact.path = path.join(artifactsDir, artifact.filename);

  if (!config.dryRun) {
    await writeFile(artifact.path, artifact.content);
  }

  return { meeting: normalized, artifact };
}
