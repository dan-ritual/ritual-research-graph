"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { WORKFLOWS } from "@/constants";
import type { WorkflowType } from "@/constants";

interface GenerationConfig {
  title: string;
  subtitle: string;
  workflow: WorkflowType;
  accentColor: string;
  skipBuild: boolean;
  skipResearch: boolean;
}

interface TranscriptData {
  content: string;
  filename: string;
}

interface StepReviewProps {
  transcript: TranscriptData;
  config: GenerationConfig;
  onSubmit: () => Promise<void>;
  onBack: () => void;
  isSubmitting: boolean;
}

export function StepReview({
  transcript,
  config,
  onSubmit,
  onBack,
  isSubmitting,
}: StepReviewProps) {
  const preview = transcript.content.slice(0, 200);
  const hasMore = transcript.content.length > 200;

  const workflow = WORKFLOWS[config.workflow];
  const workflowLabel = `${workflow.name} — ${workflow.description}`;

  const skipOptions = [];
  if (config.skipResearch) skipOptions.push("Skip Stage 2 (Multi-AI Research)");
  if (config.skipBuild) skipOptions.push("Skip Stage 5 (Vite Build)");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold mb-1">Review & Submit</h2>
        <p className="font-serif text-sm text-[rgba(0,0,0,0.45)] italic">
          Confirm your settings before starting generation
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-[#F5F5F5] p-4 space-y-4 border border-[rgba(0,0,0,0.05)]">
        {/* Transcript */}
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.08em] text-[rgba(0,0,0,0.45)] mb-1">
            Transcript
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-medium">{transcript.filename}</span>
            <span className="font-mono text-xs text-[rgba(0,0,0,0.45)]">
              ({transcript.content.length.toLocaleString()} chars)
            </span>
          </div>
          <div className="mt-2 font-mono text-xs text-[rgba(0,0,0,0.45)] whitespace-pre-wrap line-clamp-3">
            {preview}
            {hasMore && "..."}
          </div>
        </div>

        <Separator className="bg-[rgba(0,0,0,0.08)]" />

        {/* Title & Subtitle */}
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.08em] text-[rgba(0,0,0,0.45)] mb-1">
            Title
          </div>
          <div className="font-display text-lg font-semibold">{config.title}</div>
          {config.subtitle && (
            <div className="font-serif text-sm text-[rgba(0,0,0,0.65)] italic">
              {config.subtitle}
            </div>
          )}
        </div>

        <Separator className="bg-[rgba(0,0,0,0.08)]" />

        {/* Workflow */}
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.08em] text-[rgba(0,0,0,0.45)] mb-1">
            Workflow
          </div>
          <div className="font-mono text-sm">{workflowLabel}</div>
        </div>

        <Separator className="bg-[rgba(0,0,0,0.08)]" />

        {/* Accent Color */}
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.08em] text-[rgba(0,0,0,0.45)] mb-1">
            Accent Color
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6"
              style={{ backgroundColor: config.accentColor }}
            />
            <span className="font-mono text-sm">{config.accentColor}</span>
          </div>
        </div>

        {/* Advanced Options (if any) */}
        {skipOptions.length > 0 && (
          <>
            <Separator className="bg-[rgba(0,0,0,0.08)]" />
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.08em] text-[rgba(0,0,0,0.45)] mb-1">
                Advanced Options
              </div>
              <ul className="font-mono text-sm text-[rgba(0,0,0,0.65)] space-y-1">
                {skipOptions.map((opt) => (
                  <li key={opt}>• {opt}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>

      {/* Warning / Info */}
      <div className="bg-[#eab308]/10 border border-[#eab308]/20 p-4">
        <p className="font-mono text-sm uppercase tracking-[0.05em] text-[#ca8a04] font-medium">
          Generation will begin immediately after submission
        </p>
        <p className="font-serif text-sm text-[#ca8a04]/80 mt-1 italic">
          The pipeline typically takes a few minutes. You can monitor progress
          on the job status page.
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="font-mono">STARTING...</span>
          ) : (
            "Start Generation"
          )}
        </Button>
      </div>
    </div>
  );
}
