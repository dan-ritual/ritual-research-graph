"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { Loading } from "@/components/ui/loading";
import { Progress } from "@/components/ui/progress";
import { EntityReviewCard } from "@/components/entities/entity-review-card";
import { EntityMergeModal } from "@/components/entities/entity-merge-modal";
import { CheckCircle2 } from "lucide-react";

interface PotentialDuplicate {
  entity_id: string;
  canonical_name: string;
  entity_type: string;
  similarity: number;
  match_type: string;
}

interface Entity {
  id: string;
  slug: string;
  canonical_name: string;
  type: string;
  metadata: Record<string, unknown> | null;
  review_status: string;
  potential_duplicates: PotentialDuplicate[];
  has_duplicates: boolean;
}

interface Job {
  id: string;
  title: string;
  status: string;
}

interface StatusCounts {
  pending: number;
  approved: number;
  rejected: number;
  merged: number;
}

export default function EntityReviewPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    pending: 0,
    approved: 0,
    rejected: 0,
    merged: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingEntityId, setProcessingEntityId] = useState<string | null>(null);

  // Merge modal state
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [mergeSource, setMergeSource] = useState<Entity | null>(null);
  const [mergeTarget, setMergeTarget] = useState<{
    id: string;
    canonical_name: string;
    type: string;
  } | null>(null);

  const fetchEntities = useCallback(async () => {
    const response = await fetch(`/api/jobs/${jobId}/entities`);
    if (!response.ok) {
      throw new Error("Failed to fetch entities");
    }
    const data = await response.json();
    setJob(data.job);
    setEntities(data.entities);
    setStatusCounts(data.statusCounts);
  }, [jobId]);

  useEffect(() => {
    async function loadData() {
      try {
        await fetchEntities();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [fetchEntities]);

  const handleApprove = async (entityId: string) => {
    setProcessingEntityId(entityId);
    try {
      const response = await fetch(`/api/jobs/${jobId}/entities/${entityId}/approve`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to approve entity");
      }
      await fetchEntities();
    } catch (err) {
      console.error("Approve failed:", err);
    } finally {
      setProcessingEntityId(null);
    }
  };

  const handleReject = async (entityId: string) => {
    setProcessingEntityId(entityId);
    try {
      const response = await fetch(`/api/jobs/${jobId}/entities/${entityId}/reject`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to reject entity");
      }
      await fetchEntities();
    } catch (err) {
      console.error("Reject failed:", err);
    } finally {
      setProcessingEntityId(null);
    }
  };

  const handleMergeClick = (sourceEntity: Entity, duplicateId: string) => {
    const duplicate = sourceEntity.potential_duplicates.find(
      (d) => d.entity_id === duplicateId
    );
    if (!duplicate) return;

    setMergeSource(sourceEntity);
    setMergeTarget({
      id: duplicate.entity_id,
      canonical_name: duplicate.canonical_name,
      type: duplicate.entity_type,
    });
    setMergeModalOpen(true);
  };

  const handleConfirmMerge = async (newCanonicalName: string) => {
    if (!mergeSource || !mergeTarget) return;

    setProcessingEntityId(mergeSource.id);
    try {
      const response = await fetch(`/api/jobs/${jobId}/entities/merge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceEntityId: mergeSource.id,
          targetEntityId: mergeTarget.id,
          newCanonicalName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to merge entities");
      }

      await fetchEntities();
      setMergeModalOpen(false);
    } catch (err) {
      console.error("Merge failed:", err);
      throw err;
    } finally {
      setProcessingEntityId(null);
    }
  };

  const handleContinue = async () => {
    // Call the approve-entities endpoint to continue the job
    try {
      const response = await fetch(`/api/jobs/${jobId}/approve-entities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entities: entities.filter((e) => e.review_status === "approved"),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to continue job");
      }

      router.push(`/jobs/${jobId}`);
    } catch (err) {
      console.error("Continue failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFB] flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FBFBFB]">
        <Header />
        <main className="p-6 max-w-5xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="font-mono text-sm text-[rgba(0,0,0,0.45)] uppercase tracking-[0.05em]">
                {error}
              </p>
              <Link href={`/jobs/${jobId}`}>
                <Button variant="outline" className="mt-4">
                  Back to Job
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const totalCount = entities.length;
  const reviewedCount = statusCounts.approved + statusCounts.rejected + statusCounts.merged;
  const progressPercent = totalCount > 0 ? Math.round((reviewedCount / totalCount) * 100) : 0;
  const allReviewed = statusCounts.pending === 0 && totalCount > 0;

  return (
    <div className="min-h-screen bg-[#FBFBFB]">
      <Header />

      <main className="p-6 max-w-5xl mx-auto">
        {/* Back Link */}
        <Link
          href={`/jobs/${jobId}`}
          className="font-mono text-xs uppercase tracking-[0.05em] text-[rgba(0,0,0,0.45)] hover:text-[#3B5FE6] mb-6 inline-block transition-colors"
        >
          ← Back to Job Status
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-semibold tracking-tight mb-2">
            Review Extracted Entities
          </h1>
          <p className="font-serif text-lg text-[rgba(0,0,0,0.65)] italic">
            {job?.title || "Untitled Research"}
          </p>
        </div>

        {/* Progress Card */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-mono text-sm">
                <span className="text-[#3B5FE6] font-semibold">{reviewedCount}</span>
                <span className="text-[rgba(0,0,0,0.45)]"> / {totalCount} reviewed</span>
              </div>
              <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.05em]">
                <span className="text-green-600">{statusCounts.approved} approved</span>
                <span className="text-red-600">{statusCounts.rejected} rejected</span>
                <span className="text-purple-600">{statusCounts.merged} merged</span>
                <span className="text-[rgba(0,0,0,0.45)]">{statusCounts.pending} pending</span>
              </div>
            </div>
            <Progress value={progressPercent} className="h-1" />
          </CardContent>
        </Card>

        {/* All Reviewed Banner */}
        {allReviewed && (
          <Card className="mb-6 border-[#22c55e]/20 bg-[#22c55e]/5">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#16a34a]" />
                <div>
                  <p className="font-mono text-sm uppercase tracking-[0.05em] text-[#16a34a]">
                    All Entities Reviewed
                  </p>
                  <p className="font-serif text-sm text-[#16a34a]/80 italic">
                    {statusCounts.approved} entities will be added to the knowledge graph
                  </p>
                </div>
              </div>
              <Button onClick={handleContinue}>
                Continue to Graph Integration →
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Entity List */}
        <SectionHeader>Extracted Entities</SectionHeader>
        <div className="space-y-3">
          {entities.map((entity) => (
            <EntityReviewCard
              key={entity.id}
              entity={entity}
              onApprove={() => handleApprove(entity.id)}
              onReject={() => handleReject(entity.id)}
              onMerge={(duplicateId) => handleMergeClick(entity, duplicateId)}
              isProcessing={processingEntityId === entity.id}
            />
          ))}
        </div>

        {entities.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="font-mono text-sm text-[rgba(0,0,0,0.45)] uppercase tracking-[0.05em]">
                No entities to review
              </p>
            </CardContent>
          </Card>
        )}

        {/* Bottom Action Bar */}
        {totalCount > 0 && !allReviewed && (
          <div className="mt-8 flex justify-end">
            <Button
              variant="outline"
              onClick={handleContinue}
              disabled={statusCounts.approved === 0}
            >
              Skip Remaining & Continue with {statusCounts.approved} →
            </Button>
          </div>
        )}
      </main>

      {/* Merge Modal */}
      <EntityMergeModal
        isOpen={mergeModalOpen}
        onClose={() => setMergeModalOpen(false)}
        sourceEntity={mergeSource ? {
          id: mergeSource.id,
          canonical_name: mergeSource.canonical_name,
          type: mergeSource.type,
        } : null}
        targetEntity={mergeTarget}
        onConfirmMerge={handleConfirmMerge}
      />
    </div>
  );
}

function Header() {
  return (
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
  );
}
