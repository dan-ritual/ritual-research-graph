"use client";

import { Suspense, useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ConfidenceBar } from "@/components/pipeline/confidence-bar";
import { Workflow } from "@/components/pipeline/workflow-selector";
import { PipelineStage } from "@/components/pipeline/pipeline-column";

interface DuplicateResult {
  is_duplicate: boolean;
  match_id: string | null;
  confidence: number;
  reasoning: string;
}

interface MatchedOpportunity {
  id: string;
  name: string;
  thesis: string | null;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 50);
}

function NewOpportunityContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workflowParam = searchParams.get("workflow");

  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Duplicate detection state
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [duplicateResult, setDuplicateResult] = useState<DuplicateResult | null>(null);
  const [matchedOpportunity, setMatchedOpportunity] = useState<MatchedOpportunity | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const duplicateCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [thesis, setThesis] = useState("");
  const [angle, setAngle] = useState("");
  const [notes, setNotes] = useState("");
  const [confidence, setConfidence] = useState(60);
  const [workflowId, setWorkflowId] = useState("");
  const [stageId, setStageId] = useState("");

  const supabase = createClient();

  // Check for duplicates
  const checkDuplicate = useCallback(async (nameValue: string, thesisValue: string) => {
    if (!nameValue || nameValue.length < 3) {
      setDuplicateResult(null);
      return;
    }

    setCheckingDuplicate(true);
    try {
      const res = await fetch("/api/opportunities/check-duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameValue, thesis: thesisValue }),
      });

      if (res.ok) {
        const data: DuplicateResult = await res.json();
        setDuplicateResult(data);

        // If duplicate found with high confidence, fetch the match details
        if (data.is_duplicate && data.match_id && data.confidence > 70) {
          const { data: matchData } = await supabase
            .from("opportunities")
            .select("id, name, thesis")
            .eq("id", data.match_id)
            .single();

          if (matchData) {
            setMatchedOpportunity(matchData);
          }
        }
      }
    } catch (error) {
      console.error("Duplicate check failed:", error);
    } finally {
      setCheckingDuplicate(false);
    }
  }, [supabase]);

  // Debounced duplicate check on name/thesis change
  useEffect(() => {
    if (duplicateCheckTimeoutRef.current) {
      clearTimeout(duplicateCheckTimeoutRef.current);
    }

    if (name.length >= 3) {
      duplicateCheckTimeoutRef.current = setTimeout(() => {
        checkDuplicate(name, thesis);
      }, 500);
    } else {
      setDuplicateResult(null);
    }

    return () => {
      if (duplicateCheckTimeoutRef.current) {
        clearTimeout(duplicateCheckTimeoutRef.current);
      }
    };
  }, [name, thesis, checkDuplicate]);

  // Fetch workflows
  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: workflowsData } = await supabase
        .from("pipeline_workflows")
        .select("*")
        .order("is_default", { ascending: false });

      if (workflowsData && workflowsData.length > 0) {
        setWorkflows(workflowsData);

        // Set default workflow
        let defaultWorkflowId = workflowsData[0].id;
        if (workflowParam) {
          const matched = workflowsData.find((w) => w.slug === workflowParam);
          if (matched) defaultWorkflowId = matched.id;
        } else {
          const defaultWf = workflowsData.find((w) => w.is_default);
          if (defaultWf) defaultWorkflowId = defaultWf.id;
        }
        setWorkflowId(defaultWorkflowId);
      }

      setLoading(false);
    }

    fetchData();
  }, [supabase, router, workflowParam]);

  // Fetch stages when workflow changes
  useEffect(() => {
    if (!workflowId) return;

    async function fetchStages() {
      const { data: stagesData } = await supabase
        .from("pipeline_stages")
        .select("*")
        .eq("workflow_id", workflowId)
        .order("position", { ascending: true });

      if (stagesData && stagesData.length > 0) {
        setStages(stagesData);
        setStageId(stagesData[0].id);
      }
    }

    fetchStages();
  }, [workflowId, supabase]);

  const handleSubmit = async (e: React.FormEvent, force = false) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (!workflowId || !stageId) {
      setError("Workflow and stage are required");
      return;
    }

    // Check for duplicates if not forcing
    if (!force && duplicateResult?.is_duplicate && duplicateResult.confidence > 70) {
      setShowDuplicateModal(true);
      return;
    }

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const slug = generateSlug(name) + "-" + Date.now().toString(36);

      const { data, error: insertError } = await supabase
        .from("opportunities")
        .insert({
          slug,
          name: name.trim(),
          thesis: thesis.trim() || null,
          angle: angle.trim() || null,
          notes: notes.trim() || null,
          confidence,
          workflow_id: workflowId,
          stage_id: stageId,
          status: "active",
          created_by: user.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Log activity
      await supabase.from("opportunity_activity").insert({
        opportunity_id: data.id,
        user_id: user.id,
        action: "created",
        details: {
          name: name.trim(),
          workflow_id: workflowId,
          stage_id: stageId,
        },
      });

      const workflow = workflows.find((w) => w.id === workflowId);
      router.push(`/pipeline?workflow=${workflow?.slug || "bd"}`);
    } catch (err) {
      console.error("Error creating opportunity:", err);
      setError("Failed to create opportunity. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleForceCreate = (e: React.FormEvent) => {
    setShowDuplicateModal(false);
    handleSubmit(e, true);
  };

  const handleViewExisting = () => {
    if (matchedOpportunity) {
      router.push(`/pipeline/${matchedOpportunity.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFB] flex items-center justify-center">
        <Loading />
      </div>
    );
  }

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

      <main className="p-6 max-w-2xl mx-auto">
        {/* Back Link */}
        <Link
          href="/pipeline"
          className="font-mono text-xs uppercase tracking-[0.05em] text-[rgba(0,0,0,0.45)] hover:text-[#3B5FE6] mb-6 inline-block transition-colors"
        >
          ← Back to Pipeline
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-sm uppercase tracking-[0.12em]">
              New Opportunity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="font-mono text-xs uppercase tracking-[0.08em]"
                >
                  Name *
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Company Alpha Partnership"
                    required
                  />
                  {checkingDuplicate && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-[rgba(0,0,0,0.45)]">
                      Checking...
                    </span>
                  )}
                </div>
                {duplicateResult?.is_duplicate && duplicateResult.confidence > 50 && (
                  <p className="font-mono text-[10px] text-amber-600">
                    Potential duplicate detected ({duplicateResult.confidence}% match)
                  </p>
                )}
              </div>

              {/* Workflow & Stage Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-mono text-xs uppercase tracking-[0.08em]">
                    Workflow
                  </Label>
                  <Select value={workflowId} onValueChange={setWorkflowId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select workflow" />
                    </SelectTrigger>
                    <SelectContent>
                      {workflows.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-xs uppercase tracking-[0.08em]">
                    Stage
                  </Label>
                  <Select value={stageId} onValueChange={setStageId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Thesis */}
              <div className="space-y-2">
                <Label
                  htmlFor="thesis"
                  className="font-mono text-xs uppercase tracking-[0.08em]"
                >
                  Thesis
                </Label>
                <Textarea
                  id="thesis"
                  value={thesis}
                  onChange={(e) => setThesis(e.target.value)}
                  placeholder="Core value proposition — why does this matter for Ritual?"
                  rows={3}
                />
              </div>

              {/* Angle */}
              <div className="space-y-2">
                <Label
                  htmlFor="angle"
                  className="font-mono text-xs uppercase tracking-[0.08em]"
                >
                  Angle
                </Label>
                <Textarea
                  id="angle"
                  value={angle}
                  onChange={(e) => setAngle(e.target.value)}
                  placeholder="Outreach hook or timing rationale"
                  rows={2}
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label
                  htmlFor="notes"
                  className="font-mono text-xs uppercase tracking-[0.08em]"
                >
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional context, links, or observations"
                  rows={3}
                />
              </div>

              {/* Confidence */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-mono text-xs uppercase tracking-[0.08em]">
                    Confidence
                  </Label>
                  <span className="font-mono text-xs text-[#3B5FE6]">
                    {confidence}%
                  </span>
                </div>
                <ConfidenceBar value={confidence} showLabel={false} />
                <div className="flex gap-2">
                  {[20, 40, 60, 80, 100].map((val) => (
                    <Button
                      key={val}
                      type="button"
                      variant={confidence === val ? "default" : "outline"}
                      size="sm"
                      onClick={() => setConfidence(val)}
                      className="flex-1 text-[10px]"
                    >
                      {val}%
                    </Button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <p className="font-mono text-xs text-[#dc2626]">{error}</p>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[rgba(0,0,0,0.08)]">
                <Link href="/pipeline">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Opportunity"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      {/* Duplicate Warning Modal */}
      <Dialog open={showDuplicateModal} onOpenChange={setShowDuplicateModal}>
        <DialogContent className="sm:max-w-md bg-white border border-[rgba(0,0,0,0.08)]">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm uppercase tracking-[0.12em]">
              Potential Duplicate
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="font-serif text-sm text-[rgba(0,0,0,0.65)]">
              This opportunity appears to be similar to an existing one:
            </p>
            {matchedOpportunity && (
              <div className="p-4 bg-[#FBFBFB] border border-[rgba(0,0,0,0.08)]">
                <p className="font-mono text-xs uppercase tracking-[0.08em] text-[#3B5FE6]">
                  {matchedOpportunity.name}
                </p>
                {matchedOpportunity.thesis && (
                  <p className="font-serif text-xs text-[rgba(0,0,0,0.45)] mt-1 italic">
                    {matchedOpportunity.thesis}
                  </p>
                )}
              </div>
            )}
            {duplicateResult && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[rgba(0,0,0,0.45)] uppercase">
                    Match Confidence
                  </span>
                  <span className="font-mono text-xs text-[#3B5FE6]">
                    {duplicateResult.confidence}%
                  </span>
                </div>
                <p className="font-serif text-xs text-[rgba(0,0,0,0.45)] italic">
                  {duplicateResult.reasoning}
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="flex gap-2 pt-4 border-t border-dotted border-[rgba(59,95,230,0.3)]">
            <Button
              variant="outline"
              onClick={() => setShowDuplicateModal(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleViewExisting}
              className="text-xs"
            >
              View Existing
            </Button>
            <Button
              onClick={handleForceCreate}
              className="text-xs"
            >
              Create Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function NewOpportunityPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBFBFB] flex items-center justify-center">
          <Loading />
        </div>
      }
    >
      <NewOpportunityContent />
    </Suspense>
  );
}
