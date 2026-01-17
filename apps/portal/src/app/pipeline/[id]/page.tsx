"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { ConfidenceBar } from "@/components/pipeline/confidence-bar";
import { PipelineStage } from "@/components/pipeline/pipeline-column";
import { Workflow } from "@/components/pipeline/workflow-selector";
import { EntityLinker } from "@/components/pipeline/entity-linker";
import { LinkedEntityList } from "@/components/pipeline/linked-entity-list";
import { OwnerSelector } from "@/components/pipeline/owner-selector";
import { OwnerList } from "@/components/pipeline/owner-list";
import { EmailModal } from "@/components/pipeline/email-modal";
import { ChatFAB } from "@/components/pipeline/chat-fab";

interface Opportunity {
  id: string;
  slug: string;
  name: string;
  thesis?: string;
  angle?: string;
  notes?: string;
  confidence?: number;
  strategy?: string;
  email_draft?: { subject: string; body: string };
  stage_id: string;
  workflow_id: string;
  source_microsite_id?: string;
  status: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

interface Activity {
  id: string;
  action: string;
  details?: Record<string, unknown>;
  created_at: string;
  user_id?: string;
}

interface LinkedEntity {
  id: string;
  name: string;
  type: string;
  slug: string;
  relationship: "primary" | "related" | "competitor";
}

interface Owner {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
  assigned_at: string;
}

export default function OpportunityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const opportunityId = params.id as string;

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [linkedEntities, setLinkedEntities] = useState<LinkedEntity[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI generation states
  const [generatingStrategy, setGeneratingStrategy] = useState(false);
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showStrategy, setShowStrategy] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [thesis, setThesis] = useState("");
  const [angle, setAngle] = useState("");
  const [notes, setNotes] = useState("");
  const [confidence, setConfidence] = useState(60);
  const [stageId, setStageId] = useState("");

  const supabase = createClient();

  const fetchLinkedEntities = useCallback(async () => {
    const res = await fetch(`/api/opportunities/${opportunityId}/entities`);
    if (res.ok) {
      const data = await res.json();
      setLinkedEntities(data.entities || []);
    }
  }, [opportunityId]);

  const fetchOwners = useCallback(async () => {
    const res = await fetch(`/api/opportunities/${opportunityId}/owners`);
    if (res.ok) {
      const data = await res.json();
      setOwners(data.owners || []);
    }
  }, [opportunityId]);

  // Fetch opportunity data
  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch opportunity
      const { data: oppData, error: oppError } = await supabase
        .from("opportunities")
        .select("*")
        .eq("id", opportunityId)
        .single();

      if (oppError || !oppData) {
        setError("Opportunity not found");
        setLoading(false);
        return;
      }

      setOpportunity(oppData);
      setName(oppData.name);
      setThesis(oppData.thesis || "");
      setAngle(oppData.angle || "");
      setNotes(oppData.notes || "");
      setConfidence(oppData.confidence ?? 60);
      setStageId(oppData.stage_id);

      // Fetch workflow
      const { data: wfData } = await supabase
        .from("pipeline_workflows")
        .select("*")
        .eq("id", oppData.workflow_id)
        .single();

      if (wfData) {
        setWorkflow(wfData);
      }

      // Fetch stages
      const { data: stagesData } = await supabase
        .from("pipeline_stages")
        .select("*")
        .eq("workflow_id", oppData.workflow_id)
        .order("position", { ascending: true });

      if (stagesData) {
        setStages(stagesData);
      }

      // Fetch activity
      const { data: activityData } = await supabase
        .from("opportunity_activity")
        .select("*")
        .eq("opportunity_id", opportunityId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (activityData) {
        setActivity(activityData);
      }

      // Fetch linked entities and owners
      await Promise.all([fetchLinkedEntities(), fetchOwners()]);

      setLoading(false);
    }

    fetchData();
  }, [opportunityId, supabase, router, fetchLinkedEntities, fetchOwners]);

  // Subscribe to opportunity updates
  useEffect(() => {
    if (!opportunityId) return;

    const channel = supabase
      .channel(`opportunity-${opportunityId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "opportunities",
          filter: `id=eq.${opportunityId}`,
        },
        (payload) => {
          const updated = payload.new as Opportunity;
          setOpportunity(updated);
          setName(updated.name);
          setThesis(updated.thesis || "");
          setAngle(updated.angle || "");
          setNotes(updated.notes || "");
          setConfidence(updated.confidence ?? 60);
          setStageId(updated.stage_id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [opportunityId, supabase]);

  const handleSave = async () => {
    if (!opportunity) return;
    setSaving(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error: updateError } = await supabase
        .from("opportunities")
        .update({
          name: name.trim(),
          thesis: thesis.trim() || null,
          angle: angle.trim() || null,
          notes: notes.trim() || null,
          confidence,
          stage_id: stageId,
        })
        .eq("id", opportunity.id);

      if (updateError) throw updateError;

      // Log activity if stage changed
      if (stageId !== opportunity.stage_id) {
        const oldStage = stages.find((s) => s.id === opportunity.stage_id);
        const newStage = stages.find((s) => s.id === stageId);
        await supabase.from("opportunity_activity").insert({
          opportunity_id: opportunity.id,
          user_id: user?.id,
          action: "stage_changed",
          details: {
            from_stage: oldStage?.slug,
            to_stage: newStage?.slug,
          },
        });
      }

      // Log general edit
      await supabase.from("opportunity_activity").insert({
        opportunity_id: opportunity.id,
        user_id: user?.id,
        action: "edited",
        details: { fields: ["name", "thesis", "angle", "notes", "confidence"] },
      });

      router.push(`/pipeline?workflow=${workflow?.slug || "bd"}`);
    } catch (err) {
      console.error("Error saving opportunity:", err);
      setError("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!opportunity) return;
    if (!confirm("Are you sure you want to archive this opportunity?")) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error: updateError } = await supabase
        .from("opportunities")
        .update({
          status: "archived",
          archived_at: new Date().toISOString(),
          archived_by: user?.id,
        })
        .eq("id", opportunity.id);

      if (updateError) throw updateError;

      await supabase.from("opportunity_activity").insert({
        opportunity_id: opportunity.id,
        user_id: user?.id,
        action: "archived",
      });

      router.push(`/pipeline?workflow=${workflow?.slug || "bd"}`);
    } catch (err) {
      console.error("Error archiving opportunity:", err);
      setError("Failed to archive opportunity");
    }
  };

  const handleGenerateStrategy = async () => {
    if (!opportunity) return;
    setGeneratingStrategy(true);
    try {
      const res = await fetch(`/api/opportunities/${opportunity.id}/generate-strategy`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        setOpportunity((prev) => prev ? { ...prev, strategy: data.strategy } : null);
        setShowStrategy(true);
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to generate strategy");
      }
    } catch (err) {
      console.error("Error generating strategy:", err);
      setError("Failed to generate strategy");
    } finally {
      setGeneratingStrategy(false);
    }
  };

  const handleGenerateEmail = async () => {
    if (!opportunity) return;
    setGeneratingEmail(true);
    try {
      const res = await fetch(`/api/opportunities/${opportunity.id}/generate-email`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        setOpportunity((prev) => prev ? { ...prev, email_draft: data.emailDraft } : null);
        setShowEmailModal(true);
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to generate email");
      }
    } catch (err) {
      console.error("Error generating email:", err);
      setError("Failed to generate email");
    } finally {
      setGeneratingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <Loading />
      </div>
    );
  }

  if (error && !opportunity) {
    return (
      <>
        <header className="border-b border-[rgba(0,0,0,0.08)] bg-white">
          <div className="flex h-16 items-center justify-between px-6">
            <Link
              href="/"
              className="font-display font-semibold text-lg text-[#3B5FE6] tracking-tight"
            >
              Ritual Research Graph
            </Link>
            <ChatFAB />
          </div>
        </header>
        <main className="p-6 max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="font-mono text-sm text-[rgba(0,0,0,0.45)] uppercase tracking-[0.05em]">
                {error}
              </p>
              <Link href="/pipeline">
                <Button variant="outline" className="mt-4">
                  Back to Pipeline
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  const currentStage = stages.find((s) => s.id === stageId);

  return (
    <>
      {/* Header */}
      <header className="border-b border-[rgba(0,0,0,0.08)] bg-white">
        <div className="flex h-16 items-center justify-between px-6">
          <Link
            href="/"
            className="font-display font-semibold text-lg text-[#3B5FE6] tracking-tight"
          >
            Ritual Research Graph
          </Link>
          <ChatFAB />
        </div>
      </header>

      <main className="p-6 max-w-3xl mx-auto">
        {/* Back Link */}
        <Link
          href={`/pipeline?workflow=${workflow?.slug || "bd"}`}
          className="font-mono text-xs uppercase tracking-[0.05em] text-[rgba(0,0,0,0.45)] hover:text-[#3B5FE6] mb-6 inline-block transition-colors"
        >
          ← Back to Pipeline
        </Link>

        <div className="grid gap-6">
          {/* Main Edit Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-mono text-sm uppercase tracking-[0.12em]">
                Edit Opportunity
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleArchive}
                className="text-[#dc2626] hover:text-[#dc2626] hover:bg-[#dc2626]/10"
              >
                Archive
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label className="font-mono text-xs uppercase tracking-[0.08em]">
                  Name
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Opportunity name"
                />
              </div>

              {/* Stage Buttons */}
              <div className="space-y-2">
                <Label className="font-mono text-xs uppercase tracking-[0.08em]">
                  Stage
                </Label>
                <div className="flex flex-wrap gap-2">
                  {stages.map((stage) => (
                    <Button
                      key={stage.id}
                      type="button"
                      variant={stageId === stage.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStageId(stage.id)}
                      className="text-[10px]"
                    >
                      {stage.name}
                    </Button>
                  ))}
                </div>
                {currentStage?.description && (
                  <p className="font-serif text-xs text-[rgba(0,0,0,0.45)] italic mt-2">
                    {currentStage.description}
                  </p>
                )}
              </div>

              {/* Thesis */}
              <div className="space-y-2">
                <Label className="font-mono text-xs uppercase tracking-[0.08em]">
                  Thesis
                </Label>
                <Textarea
                  value={thesis}
                  onChange={(e) => setThesis(e.target.value)}
                  placeholder="Core value proposition"
                  rows={3}
                />
              </div>

              {/* Angle */}
              <div className="space-y-2">
                <Label className="font-mono text-xs uppercase tracking-[0.08em]">
                  Angle
                </Label>
                <Textarea
                  value={angle}
                  onChange={(e) => setAngle(e.target.value)}
                  placeholder="Outreach hook or timing rationale"
                  rows={2}
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label className="font-mono text-xs uppercase tracking-[0.08em]">
                  Notes
                </Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional context"
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
                <ConfidenceBar value={confidence} />
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

              {/* Error */}
              {error && (
                <p className="font-mono text-xs text-[#dc2626]">{error}</p>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[rgba(0,0,0,0.08)]">
                <Link href={`/pipeline?workflow=${workflow?.slug || "bd"}`}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Linked Entities */}
          <Card>
            <CardHeader>
              <CardTitle className="font-mono text-sm uppercase tracking-[0.12em]">
                Linked Entities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <LinkedEntityList
                opportunityId={opportunityId}
                entities={linkedEntities}
                onEntityRemoved={fetchLinkedEntities}
              />
              <div className="pt-4 border-t border-dotted border-[rgba(59,95,230,0.3)]">
                <EntityLinker
                  opportunityId={opportunityId}
                  onEntityLinked={fetchLinkedEntities}
                />
              </div>
            </CardContent>
          </Card>

          {/* Owners */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-mono text-sm uppercase tracking-[0.12em]">
                Owners
              </CardTitle>
              <OwnerSelector
                opportunityId={opportunityId}
                currentOwnerIds={owners.map((o) => o.id)}
                onOwnerAdded={fetchOwners}
              />
            </CardHeader>
            <CardContent>
              <OwnerList
                opportunityId={opportunityId}
                owners={owners}
                onOwnerRemoved={fetchOwners}
              />
            </CardContent>
          </Card>

          {/* AI Features */}
          <Card>
            <CardHeader>
              <CardTitle className="font-mono text-sm uppercase tracking-[0.12em]">
                AI Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleGenerateStrategy}
                  disabled={generatingStrategy}
                  className="flex-1"
                >
                  {generatingStrategy ? "GENERATING..." : "GENERATE STRATEGY"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleGenerateEmail}
                  disabled={generatingEmail}
                  className="flex-1"
                >
                  {generatingEmail ? "GENERATING..." : "GENERATE EMAIL"}
                </Button>
              </div>

              {/* Strategy Display */}
              {opportunity?.strategy && (
                <div className="pt-4 border-t border-dotted border-[rgba(59,95,230,0.3)]">
                  <button
                    onClick={() => setShowStrategy(!showStrategy)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <span className="font-mono text-xs uppercase tracking-[0.08em] text-[#3B5FE6]">
                      Strategy Document
                    </span>
                    <span className="font-mono text-xs">
                      {showStrategy ? "▼" : "▶"}
                    </span>
                  </button>
                  {showStrategy && (
                    <div className="mt-3 p-4 bg-[#FBFBFB] border border-[rgba(0,0,0,0.08)]">
                      <div className="font-serif text-sm whitespace-pre-wrap prose prose-sm max-w-none">
                        {opportunity.strategy}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card>
            <CardHeader>
              <CardTitle className="font-mono text-sm uppercase tracking-[0.12em]">
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[rgba(0,0,0,0.05)]">
                {activity.length > 0 ? (
                  activity.map((item) => (
                    <div key={item.id} className="px-6 py-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs uppercase tracking-[0.05em] text-[#3B5FE6]">
                          {item.action.replace(/_/g, " ")}
                        </span>
                        <span className="font-mono text-[10px] text-[rgba(0,0,0,0.45)]">
                          {new Date(item.created_at).toLocaleString()}
                        </span>
                      </div>
                      {item.details && (
                        <p className="font-serif text-xs text-[rgba(0,0,0,0.45)] mt-1">
                          {formatActivityDetails(item.action, item.details)}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center">
                    <p className="font-mono text-[10px] text-[rgba(0,0,0,0.35)] uppercase tracking-[0.05em]">
                      No activity yet
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <div className="text-center">
            <p className="font-mono text-[10px] text-[rgba(0,0,0,0.35)]">
              ID: {opportunity?.id?.slice(0, 8)}... | Created{" "}
              {opportunity?.created_at &&
                new Date(opportunity.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </main>

      <EmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        emailDraft={opportunity?.email_draft || null}
      />
    </>
  );
}

function formatActivityDetails(
  action: string,
  details: Record<string, unknown>
): string {
  switch (action) {
    case "stage_changed":
      return `${details.from_stage} → ${details.to_stage}`;
    case "edited":
      if (Array.isArray(details.fields)) {
        return `Updated: ${details.fields.join(", ")}`;
      }
      return "Details updated";
    case "created":
      return `Created: ${details.name}`;
    case "entity_linked":
      return `Linked: ${details.entity_name} (${details.relationship})`;
    case "entity_unlinked":
      return `Unlinked: ${details.entity_name}`;
    case "owner_added":
      return `Added owner: ${details.added_user_name}`;
    case "owner_removed":
      return `Removed owner: ${details.removed_user_name}`;
    case "strategy_generated":
      return `Generated ${details.length} characters`;
    case "email_generated":
      return `Subject: ${details.subject}`;
    default:
      return JSON.stringify(details);
  }
}
