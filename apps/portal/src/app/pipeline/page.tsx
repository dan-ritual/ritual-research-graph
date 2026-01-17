"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { PipelineColumn, PipelineStage } from "@/components/pipeline/pipeline-column";
import { WorkflowSelector, Workflow } from "@/components/pipeline/workflow-selector";
import { Opportunity } from "@/components/pipeline/opportunity-card";
import { ChatFAB } from "@/components/pipeline/chat-fab";

function PipelineContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workflowParam = searchParams.get("workflow");

  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email: string; name?: string; avatar_url?: string } | null>(null);

  const supabase = createClient();

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      // Check auth
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push("/login");
        return;
      }

      // Fetch user profile
      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      setUser({
        email: authUser.email || "",
        name: profile?.name || authUser.user_metadata?.full_name,
        avatar_url: profile?.avatar_url || authUser.user_metadata?.avatar_url,
      });

      // Fetch workflows
      const { data: workflowsData } = await supabase
        .from("pipeline_workflows")
        .select("*")
        .order("is_default", { ascending: false });

      if (workflowsData && workflowsData.length > 0) {
        setWorkflows(workflowsData);

        // Determine selected workflow
        let selectedId = workflowsData[0].id;
        if (workflowParam) {
          const matchedWorkflow = workflowsData.find(w => w.slug === workflowParam);
          if (matchedWorkflow) {
            selectedId = matchedWorkflow.id;
          }
        } else {
          const defaultWorkflow = workflowsData.find(w => w.is_default);
          if (defaultWorkflow) {
            selectedId = defaultWorkflow.id;
          }
        }
        setSelectedWorkflowId(selectedId);
      }

      setLoading(false);
    }

    fetchData();
  }, [supabase, router, workflowParam]);

  // Fetch stages and opportunities when workflow changes
  useEffect(() => {
    if (!selectedWorkflowId) return;

    async function fetchStagesAndOpportunities() {
      // Fetch stages for selected workflow
      const { data: stagesData } = await supabase
        .from("pipeline_stages")
        .select("*")
        .eq("workflow_id", selectedWorkflowId)
        .order("position", { ascending: true });

      if (stagesData) {
        setStages(stagesData);
      }

      // Fetch opportunities for selected workflow
      const { data: opportunitiesData } = await supabase
        .from("opportunities")
        .select("*")
        .eq("workflow_id", selectedWorkflowId)
        .eq("status", "active")
        .order("updated_at", { ascending: false });

      if (opportunitiesData) {
        setOpportunities(opportunitiesData);
      }
    }

    fetchStagesAndOpportunities();
  }, [selectedWorkflowId, supabase]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!selectedWorkflowId) return;

    const channel = supabase
      .channel("opportunities-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "opportunities",
          filter: `workflow_id=eq.${selectedWorkflowId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setOpportunities((prev) => [payload.new as Opportunity, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setOpportunities((prev) =>
              prev.map((opp) =>
                opp.id === payload.new.id ? (payload.new as Opportunity) : opp
              )
            );
          } else if (payload.eventType === "DELETE") {
            setOpportunities((prev) =>
              prev.filter((opp) => opp.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedWorkflowId, supabase]);

  const handleWorkflowChange = useCallback((workflowId: string) => {
    setSelectedWorkflowId(workflowId);
    const workflow = workflows.find(w => w.id === workflowId);
    if (workflow) {
      router.push(`/pipeline?workflow=${workflow.slug}`);
    }
  }, [workflows, router]);

  const handleAdvanceStage = useCallback(async (opportunityId: string) => {
    const opportunity = opportunities.find((o) => o.id === opportunityId);
    if (!opportunity) return;

    const currentStageIndex = stages.findIndex((s) => s.id === opportunity.stage_id);
    if (currentStageIndex === -1 || currentStageIndex >= stages.length - 1) return;

    const nextStage = stages[currentStageIndex + 1];

    // Update opportunity stage
    const { error } = await supabase
      .from("opportunities")
      .update({ stage_id: nextStage.id })
      .eq("id", opportunityId);

    if (!error) {
      // Log activity
      const { data: { user: authUser } } = await supabase.auth.getUser();
      await supabase.from("opportunity_activity").insert({
        opportunity_id: opportunityId,
        user_id: authUser?.id,
        action: "stage_changed",
        details: {
          from_stage: stages[currentStageIndex].slug,
          to_stage: nextStage.slug,
        },
      });
    }
  }, [opportunities, stages, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <Loading />
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="border-b border-[rgba(0,0,0,0.08)] bg-white">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="font-display font-semibold text-lg text-[#3B5FE6] tracking-tight"
            >
              Ritual Research Graph
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className="font-mono text-xs uppercase tracking-[0.08em] text-[rgba(0,0,0,0.45)] hover:text-[#3B5FE6] transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/microsites"
                className="font-mono text-xs uppercase tracking-[0.08em] text-[rgba(0,0,0,0.45)] hover:text-[#3B5FE6] transition-colors"
              >
                Microsites
              </Link>
              <Link
                href="/entities"
                className="font-mono text-xs uppercase tracking-[0.08em] text-[rgba(0,0,0,0.45)] hover:text-[#3B5FE6] transition-colors"
              >
                Entities
              </Link>
              <Link
                href="/pipeline"
                className="font-mono text-xs uppercase tracking-[0.08em] text-[#3B5FE6] transition-colors"
              >
                Pipeline
              </Link>
            </nav>
          </div>
          {user && (
            <div className="h-8 w-8 bg-[#F5F5F5] flex items-center justify-center font-mono text-xs font-medium">
              {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </header>

      <main className="p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Pipeline
            </h1>
            <p className="font-serif text-sm text-[rgba(0,0,0,0.45)] mt-1 italic">
              Track opportunities through your workflow
            </p>
          </div>
          <div className="flex items-center gap-3">
            <WorkflowSelector
              workflows={workflows}
              selectedWorkflowId={selectedWorkflowId}
              onSelect={handleWorkflowChange}
            />
            <ChatFAB />
            <Link href="/pipeline/new">
              <Button>+ New Opportunity</Button>
            </Link>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="border border-[rgba(0,0,0,0.08)] bg-white overflow-hidden">
          <div className="flex overflow-x-auto min-h-[calc(100vh-220px)]">
            {stages.map((stage, index) => (
              <PipelineColumn
                key={stage.id}
                stage={stage}
                opportunities={opportunities.filter((o) => o.stage_id === stage.id)}
                onAdvanceStage={handleAdvanceStage}
                isLastStage={index === stages.length - 1}
              />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

export default function PipelinePage() {
  return <PipelineContent />;
}
