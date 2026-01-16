"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StepUpload } from "@/components/wizard/step-upload";
import { StepConfigure } from "@/components/wizard/step-configure";
import { StepReview } from "@/components/wizard/step-review";
import { DEFAULT_ACCENT_COLOR } from "@/constants";
import type { WorkflowType } from "@/constants";
import Link from "next/link";

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
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [transcript, setTranscript] = useState<TranscriptData | null>(null);
  const [config, setConfig] = useState<GenerationConfig>({
    title: "",
    subtitle: "",
    workflow: "market-landscape",
    accentColor: DEFAULT_ACCENT_COLOR,
    skipBuild: false,
    skipResearch: false,
  });

  const handleUploadComplete = (data: TranscriptData) => {
    setTranscript(data);
    setCurrentStep(1);
  };

  const handleConfigComplete = (newConfig: GenerationConfig) => {
    setConfig(newConfig);
    setCurrentStep(2);
  };

  const handleSubmit = async () => {
    if (!transcript) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: transcript.content, config }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to start generation");
      }

      const { jobId } = await response.json();
      router.push(`/jobs/${jobId}`);
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
      {/* Header */}
      <header className="border-b border-[rgba(0,0,0,0.08)] bg-white">
        <div className="flex h-16 items-center px-6">
          <Link
            href="/"
            className="font-display font-semibold text-lg text-[#3B5FE6] tracking-tight"
          >
            Ritual Research Graph
          </Link>
        </div>
      </header>

      <main className="p-6 max-w-3xl mx-auto">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            New Research
          </h1>
          <p className="font-serif text-lg text-[rgba(0,0,0,0.45)] mt-1 italic">
            Transform your transcript into a research microsite
          </p>
        </div>

        {/* Step Indicator - Dotted Progress */}
        <div className="mb-8">
          <div className="flex items-center">
            {STEPS.map((label, index) => (
              <div key={label} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center justify-center w-8 h-8 font-mono text-xs font-medium border ${
                      index === currentStep
                        ? "bg-[#3B5FE6] text-white border-[#3B5FE6]"
                        : index < currentStep
                          ? "bg-[#3B5FE6] text-white border-[#3B5FE6]"
                          : "bg-white text-[rgba(0,0,0,0.45)] border-[rgba(0,0,0,0.15)]"
                    }`}
                  >
                    {index < currentStep ? "✓" : index + 1}
                  </div>
                  <span
                    className={`font-mono text-xs uppercase tracking-[0.08em] ${
                      index === currentStep
                        ? "text-[#3B5FE6]"
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
                        ? "border-[#3B5FE6]"
                        : "border-[rgba(0,0,0,0.15)]"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content - White Background for Forms */}
        <Card>
          <CardContent className="p-6 bg-white">
            {currentStep === 0 && (
              <StepUpload onComplete={handleUploadComplete} />
            )}
            {currentStep === 1 && (
              <StepConfigure
                transcript={transcript!}
                initialConfig={config}
                onComplete={handleConfigComplete}
                onBack={handleBack}
              />
            )}
            {currentStep === 2 && (
              <StepReview
                transcript={transcript!}
                config={config}
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
