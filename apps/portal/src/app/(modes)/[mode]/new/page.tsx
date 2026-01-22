"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StepUpload } from "@/components/wizard/step-upload";
import { StepConfigure } from "@/components/wizard/step-configure";
import { StepReview } from "@/components/wizard/step-review";
import { DEFAULT_ACCENT_COLOR } from "@/constants";
import type { WorkflowType } from "@/constants";
import Link from "next/link";
import { MODE_CONFIGS, type ModeId } from "@ritual-research/core";
import { useMode } from "@/components/providers/mode-provider";
import { fetchWithMode } from "@/lib/fetch-with-mode";

export interface GenerationConfig {
  title: string;
  subtitle: string;
  workflow: WorkflowType;
  accentColor: string;
  skipBuild: boolean;
  skipResearch: boolean;
}

export interface TranscriptData {
  content: string;
  filename: string;
}

const STEPS = ["Upload", "Configure", "Review"];

export default function NewResearchPage() {
  const router = useRouter();
  const params = useParams();
  const modeId = params.mode as ModeId;
  const { config } = useMode();
  const defaultWorkflow: WorkflowType = modeId === "engineering" ? "engineering-meeting" : "market-landscape";
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [transcript, setTranscript] = useState<TranscriptData | null>(null);
  const [generationConfig, setGenerationConfig] = useState<GenerationConfig>({
    title: "",
    subtitle: "",
    workflow: defaultWorkflow,
    accentColor: config.accent || DEFAULT_ACCENT_COLOR,
    skipBuild: false,
    skipResearch: false,
  });

  const pageTitle = modeId === "engineering" ? "New Meeting" : "New Research";
  const pageSubtitle =
    modeId === "engineering"
      ? "Transform meeting transcripts into wiki pages and feature tracking"
      : "Transform your transcript into a research microsite";

  const handleUploadComplete = (data: TranscriptData) => {
    setTranscript(data);
    setCurrentStep(1);
  };

  const handleConfigComplete = (newConfig: GenerationConfig) => {
    setGenerationConfig(newConfig);
    setCurrentStep(2);
  };

  const handleSubmit = async () => {
    if (!transcript) return;

    setIsSubmitting(true);
    try {
      const response = await fetchWithMode("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          transcript: transcript.content, 
          config: generationConfig,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to start generation");
      }

      const { jobId } = await response.json();
      router.push(`/${modeId}/jobs/${jobId}`);
    } catch (error) {
      console.error("Generation failed:", error);
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB]">
      <header className="border-b border-[rgba(0,0,0,0.08)] bg-white">
        <div className="flex h-16 items-center px-6">
          <Link
            href={`/${modeId}/dashboard`}
            className="font-display font-semibold text-lg text-[var(--mode-accent)] tracking-tight"
          >
            {config.name}
          </Link>
        </div>
      </header>

      <main className="p-6 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {pageTitle}
          </h1>
          <p className="font-serif text-lg text-[rgba(0,0,0,0.45)] mt-1 italic">
            {pageSubtitle}
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center">
            {STEPS.map((label, index) => (
              <div key={label} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center justify-center w-8 h-8 font-mono text-xs font-medium border ${
                      index === currentStep
                        ? "bg-[var(--mode-accent)] text-white border-[var(--mode-accent)]"
                        : index < currentStep
                          ? "bg-[var(--mode-accent)] text-white border-[var(--mode-accent)]"
                          : "bg-white text-[rgba(0,0,0,0.45)] border-[rgba(0,0,0,0.15)]"
                    }`}
                  >
                    {index < currentStep ? "✓" : index + 1}
                  </div>
                  <span
                    className={`font-mono text-xs uppercase tracking-[0.08em] ${
                      index === currentStep
                        ? "text-[var(--mode-accent)]"
                        : index < currentStep
                          ? "text-foreground"
                          : "text-[rgba(0,0,0,0.45)]"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`mx-4 h-px w-12 border-t border-dotted ${
                      index < currentStep
                        ? "border-[var(--mode-accent)]"
                        : "border-[rgba(0,0,0,0.15)]"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="p-6 bg-white">
            {currentStep === 0 && (
              <StepUpload onComplete={handleUploadComplete} />
            )}
            {currentStep === 1 && (
              <StepConfigure
                transcript={transcript!}
                initialConfig={generationConfig}
                onComplete={handleConfigComplete}
                onBack={handleBack}
                showAdvancedOptions={modeId !== "engineering"}
              />
            )}
            {currentStep === 2 && (
              <StepReview
                transcript={transcript!}
                config={generationConfig}
                onSubmit={handleSubmit}
                onBack={handleBack}
                isSubmitting={isSubmitting}
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
