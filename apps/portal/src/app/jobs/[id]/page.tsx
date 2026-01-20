"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Loading } from "@/components/ui/loading";
import { RetryJobButton, CancelJobButton } from "@/components/jobs/job-actions";
import { PIPELINE_STAGES } from "@/constants";

interface Job {
  id: string;
  status: string;
  workflow_type: string;
  current_stage: number;
  config: {
    title: string;
    subtitle?: string;
    accentColor?: string;
  };
  error_message?: string;
  created_at: string;
  completed_at?: string;
  microsite_id?: string;
}

export default function JobStatusPage() {
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchJob() {
      const { data, error } = await supabase
        .from("generation_jobs")
        .select("*")
        .eq("id", jobId)
        .single();

      if (error) {
        setError("Job not found");
        setLoading(false);
        return;
      }

      setJob(data);
      setLoading(false);
    }

    fetchJob();

    const channel = supabase
      .channel(`job-${jobId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "generation_jobs",
          filter: `id=eq.${jobId}`,
        },
        (payload) => {
          setJob(payload.new as Job);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFB] flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-[#FBFBFB]">
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
          <Card>
            <CardContent className="p-8 text-center">
              <p className="font-mono text-sm text-[rgba(0,0,0,0.45)] uppercase tracking-[0.05em]">
                {error || "Job not found"}
              </p>
              <Link href="/">
                <Button variant="outline" className="mt-4">
                  Back to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const currentStageIndex = job.current_stage || 0;
  const progressPercent = Math.round(
    ((currentStageIndex + 1) / PIPELINE_STAGES.length) * 100
  );

  const isCompleted = job.status === "completed";
  const isFailed = job.status === "failed";
  const isAwaitingReview = job.status === "awaiting_entity_review";

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
        {/* Back Link */}
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-[0.05em] text-[rgba(0,0,0,0.45)] hover:text-[#3B5FE6] mb-6 inline-block transition-colors"
        >
          ← Back to Dashboard
        </Link>

        {/* Job Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-display text-2xl font-semibold tracking-tight">
              {job.config?.title || "Untitled Research"}
            </h1>
            <StatusBadge status={job.status} />
          </div>
          {job.config?.subtitle && (
            <p className="font-serif text-lg text-[rgba(0,0,0,0.65)] italic">
              {job.config.subtitle}
            </p>
          )}
          <p className="font-mono text-xs text-[rgba(0,0,0,0.45)] mt-2">
            Job ID: {job.id.slice(0, 8)}...
          </p>
        </div>

        {/* Progress Card */}
        {!isCompleted && !isFailed && (
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="font-mono text-sm uppercase tracking-[0.05em]">
                  Stage {currentStageIndex + 1} of {PIPELINE_STAGES.length}:{" "}
                  {PIPELINE_STAGES[currentStageIndex]?.name}
                </CardTitle>
                {!isAwaitingReview && <CancelJobButton jobId={job.id} />}
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={progressPercent} className="h-1 mb-2" />
              <p className="font-serif text-sm text-[rgba(0,0,0,0.65)] italic">
                {PIPELINE_STAGES[currentStageIndex]?.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Failed State */}
        {isFailed && (
          <Card className="mb-6 border-[#ef4444]/20 bg-[#ef4444]/5">
            <CardHeader className="pb-2">
              <CardTitle className="font-mono text-sm uppercase tracking-[0.05em] text-[#dc2626]">
                Generation Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-serif text-sm text-[#dc2626]/80 mb-4">
                {job.error_message || "An unknown error occurred"}
              </p>
              <div className="flex gap-2">
                <RetryJobButton jobId={job.id} />
                <Link href="/new">
                  <Button variant="outline" size="sm">
                    Start Over
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completed State */}
        {isCompleted && job.microsite_id && (
          <Card className="mb-6 border-[#22c55e]/20 bg-[#22c55e]/5">
            <CardHeader className="pb-2">
              <CardTitle className="font-mono text-sm uppercase tracking-[0.05em] text-[#16a34a]">
                Generation Complete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-serif text-sm text-[#16a34a]/80 mb-4 italic">
                Your microsite is ready to view.
              </p>
              <div className="flex gap-2">
                <Link href={`/microsites/${job.microsite_id}`}>
                  <Button>View Microsite</Button>
                </Link>
                <Link href={`/jobs/${jobId}/edit`}>
                  <Button variant="outline">Edit Artifacts</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Awaiting Review State */}
        {isAwaitingReview && (
          <Card className="mb-6 border-[#eab308]/20 bg-[#eab308]/5">
            <CardHeader className="pb-2">
              <CardTitle className="font-mono text-sm uppercase tracking-[0.05em] text-[#ca8a04]">
                Review Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-serif text-sm text-[#ca8a04]/80 mb-4 italic">
                Please review the extracted entities before continuing to graph
                integration.
              </p>
              <Link href={`/jobs/${jobId}/review`}>
                <Button>Review Entities</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Pipeline Stages */}
        <div>
          <SectionHeader>Pipeline Stages</SectionHeader>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-[rgba(0,0,0,0.05)]">
                {PIPELINE_STAGES.map((stage, index) => {
                  const isComplete = index < currentStageIndex || isCompleted;
                  const isCurrent =
                    index === currentStageIndex && !isCompleted && !isFailed;
                  const isPending = index > currentStageIndex;

                  return (
                    <div
                      key={stage.name}
                      className={`flex items-center gap-4 px-6 py-4 ${
                        isCurrent ? "bg-[#3B5FE6]/5" : ""
                      }`}
                    >
                      <div
                        className={`w-6 h-6 flex items-center justify-center font-mono text-xs ${
                          isComplete
                            ? "bg-[#22c55e] text-white"
                            : isCurrent
                              ? "bg-[#3B5FE6] text-white animate-pulse"
                              : "bg-[#F5F5F5] text-[rgba(0,0,0,0.45)]"
                        }`}
                      >
                        {isComplete ? "✓" : index + 1}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`font-mono text-sm font-medium ${
                            isPending ? "text-[rgba(0,0,0,0.45)]" : ""
                          }`}
                        >
                          Stage {index + 1}: {stage.name}
                        </p>
                        <p className="font-serif text-sm text-[rgba(0,0,0,0.45)] italic">
                          {stage.description}
                        </p>
                      </div>
                      <div className="font-mono text-xs text-[rgba(0,0,0,0.45)] uppercase tracking-[0.05em]">
                        {isComplete && "Complete"}
                        {isCurrent && "Running..."}
                        {isPending && "Waiting"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Created timestamp */}
        <p className="font-mono text-xs text-[rgba(0,0,0,0.45)] mt-6 text-center">
          Started {new Date(job.created_at).toLocaleString()}
        </p>
      </main>
    </div>
  );
}
