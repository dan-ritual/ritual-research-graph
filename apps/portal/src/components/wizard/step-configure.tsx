"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ACCENT_PRESETS, WORKFLOWS, DEFAULT_ACCENT_COLOR } from "@/constants";
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

interface StepConfigureProps {
  transcript: TranscriptData;
  initialConfig: GenerationConfig;
  onComplete: (config: GenerationConfig) => void;
  onBack: () => void;
}

export function StepConfigure({
  transcript,
  initialConfig,
  onComplete,
  onBack,
}: StepConfigureProps) {
  const [config, setConfig] = useState<GenerationConfig>(initialConfig);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateConfig = <K extends keyof GenerationConfig>(
    key: K,
    value: GenerationConfig[K]
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const handleNext = () => {
    if (!config.title.trim()) {
      setError("Title is required");
      return;
    }
    onComplete(config);
  };

  // Suggest a title from filename
  const suggestedTitle =
    transcript.filename
      .replace(/\.(md|txt)$/, "")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()) || "Research";

  const currentWorkflow = WORKFLOWS[config.workflow];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold mb-1">Configure Research</h2>
        <p className="font-serif text-sm text-[rgba(0,0,0,0.45)] italic">
          Set up your microsite title and options
        </p>
      </div>

      {/* Title */}
      <div>
        <Label htmlFor="title" className="font-mono text-xs uppercase tracking-[0.08em] text-[rgba(0,0,0,0.45)] mb-2 block">
          Title <span className="text-[#dc2626]">*</span>
        </Label>
        <Input
          id="title"
          value={config.title}
          onChange={(e) => updateConfig("title", e.target.value)}
          placeholder={suggestedTitle}
          className="font-display border-[rgba(0,0,0,0.08)]"
        />
        <p className="font-serif text-xs text-[rgba(0,0,0,0.45)] mt-1 italic">
          Main heading for your microsite
        </p>
      </div>

      {/* Subtitle */}
      <div>
        <Label htmlFor="subtitle" className="font-mono text-xs uppercase tracking-[0.08em] text-[rgba(0,0,0,0.45)] mb-2 block">
          Subtitle
        </Label>
        <Input
          id="subtitle"
          value={config.subtitle}
          onChange={(e) => updateConfig("subtitle", e.target.value)}
          placeholder="e.g., RWA × DeFi × AI · January 2026"
          className="font-display border-[rgba(0,0,0,0.08)]"
        />
        <p className="font-serif text-xs text-[rgba(0,0,0,0.45)] mt-1 italic">
          Optional tagline or date
        </p>
      </div>

      {/* Workflow (read-only for now) */}
      <div>
        <Label className="font-mono text-xs uppercase tracking-[0.08em] text-[rgba(0,0,0,0.45)] mb-2 block">
          Workflow
        </Label>
        <div className="bg-[#F5F5F5] px-4 py-3 border border-[rgba(0,0,0,0.05)]">
          <span className="font-mono text-sm font-medium">{currentWorkflow.name}</span>
          <span className="font-serif text-sm text-[rgba(0,0,0,0.45)] ml-2 italic">
            {currentWorkflow.description}
          </span>
        </div>
        <p className="font-serif text-xs text-[rgba(0,0,0,0.45)] mt-1 italic">
          More workflows coming soon
        </p>
      </div>

      {/* Accent Color */}
      <div>
        <Label className="font-mono text-xs uppercase tracking-[0.08em] text-[rgba(0,0,0,0.45)] mb-2 block">
          Accent Color
        </Label>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {ACCENT_PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => updateConfig("accentColor", preset.value)}
                className={`w-8 h-8 border-2 transition-transform ${
                  config.accentColor === preset.value
                    ? "border-foreground scale-110"
                    : "border-transparent hover:scale-105"
                }`}
                style={{ backgroundColor: preset.value }}
                title={preset.name}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Label htmlFor="customColor" className="font-mono text-xs text-[rgba(0,0,0,0.45)]">
              Custom:
            </Label>
            <input
              type="color"
              id="customColor"
              value={config.accentColor}
              onChange={(e) => updateConfig("accentColor", e.target.value)}
              className="w-8 h-8 cursor-pointer border-0"
            />
            <span className="font-mono text-xs text-[rgba(0,0,0,0.45)]">
              {config.accentColor}
            </span>
          </div>
        </div>
        {/* Preview */}
        <div className="mt-3 flex items-center gap-2">
          <span className="font-mono text-xs text-[rgba(0,0,0,0.45)] uppercase tracking-[0.05em]">
            Preview:
          </span>
          <span
            className="px-3 py-1 text-white font-mono text-xs uppercase tracking-[0.1em]"
            style={{ backgroundColor: config.accentColor }}
          >
            Button
          </span>
          <span
            className="font-mono text-xs font-medium border-b border-dotted"
            style={{ color: config.accentColor, borderColor: `${config.accentColor}50` }}
          >
            Link
          </span>
        </div>
      </div>

      {/* Advanced Options */}
      <div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="font-mono text-xs uppercase tracking-[0.05em] text-[rgba(0,0,0,0.45)] hover:text-[#3B5FE6] flex items-center gap-1 transition-colors"
        >
          {showAdvanced ? "▼" : "▶"} Advanced Options
        </button>
        {showAdvanced && (
          <div className="mt-3 pl-4 border-l border-dotted border-[rgba(59,95,230,0.3)] space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="skipResearch"
                checked={config.skipResearch}
                onCheckedChange={(checked) =>
                  updateConfig("skipResearch", !!checked)
                }
              />
              <Label htmlFor="skipResearch" className="font-mono text-sm font-normal">
                Skip multi-AI research (Stage 2)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="skipBuild"
                checked={config.skipBuild}
                onCheckedChange={(checked) =>
                  updateConfig("skipBuild", !!checked)
                }
              />
              <Label htmlFor="skipBuild" className="font-mono text-sm font-normal">
                Skip Vite build (Stage 5)
              </Label>
            </div>
            <p className="font-serif text-xs text-[rgba(0,0,0,0.45)] italic">
              Use these for testing or to speed up iteration
            </p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && <p className="font-mono text-sm text-[#dc2626]">{error}</p>}

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleNext}>Next</Button>
      </div>
    </div>
  );
}
