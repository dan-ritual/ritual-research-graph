"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { Loading } from "@/components/ui/loading";
import { Checkbox } from "@/components/ui/checkbox";

interface ExtractedEntity {
  canonicalName: string;
  aliases: string[];
  type: "company" | "protocol" | "person" | "concept" | "opportunity";
  url?: string;
  twitter?: string;
  category?: string;
  description: string;
  sentiment: "positive" | "neutral" | "negative";
  mentions: Array<{
    context: string;
    section: string;
  }>;
}

interface Job {
  id: string;
  status: string;
  config: {
    title: string;
    subtitle?: string;
  };
}

const TYPE_COLORS: Record<string, string> = {
  company: "bg-blue-100 text-blue-800",
  protocol: "bg-purple-100 text-purple-800",
  person: "bg-green-100 text-green-800",
  concept: "bg-amber-100 text-amber-800",
  opportunity: "bg-rose-100 text-rose-800",
};

const SENTIMENT_COLORS: Record<string, string> = {
  positive: "text-[#22c55e]",
  neutral: "text-[rgba(0,0,0,0.45)]",
  negative: "text-[#ef4444]",
};

export default function EntityReviewPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [entities, setEntities] = useState<ExtractedEntity[]>([]);
  const [approvedEntities, setApprovedEntities] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      // Fetch job details
      const { data: jobData, error: jobError } = await supabase
        .from("generation_jobs")
        .select("id, status, config")
        .eq("id", jobId)
        .single();

      if (jobError || !jobData) {
        setError("Job not found");
        setLoading(false);
        return;
      }

      setJob(jobData);

      // Check if job is in awaiting_entity_review status
      if (jobData.status !== "awaiting_entity_review") {
        setError(`Job is not awaiting review (status: ${jobData.status})`);
        setLoading(false);
        return;
      }

      // Fetch entity extraction artifact
      const { data: artifactData, error: artifactError } = await supabase
        .from("artifacts")
        .select("content, file_path")
        .eq("job_id", jobId)
        .eq("type", "entity_extraction")
        .single();

      if (artifactError || !artifactData) {
        setError("Entity extraction artifact not found");
        setLoading(false);
        return;
      }

      // Parse entities from artifact content or file
      try {
        let extractedEntities: ExtractedEntity[] = [];

        if (artifactData.content) {
          const parsed = JSON.parse(artifactData.content);
          extractedEntities = parsed.entities || parsed;
        } else if (artifactData.file_path) {
          // If content is null, we need to fetch from file path via API
          const response = await fetch(`/api/artifacts/${jobId}/entities`);
          if (response.ok) {
            const data = await response.json();
            extractedEntities = data.entities || [];
          }
        }

        setEntities(extractedEntities);
        // Default: approve all entities
        setApprovedEntities(new Set(extractedEntities.map((e) => e.canonicalName)));
      } catch (parseError) {
        setError("Failed to parse entity extraction data");
      }

      setLoading(false);
    }

    fetchData();
  }, [jobId, supabase]);

  const toggleEntity = (canonicalName: string) => {
    setApprovedEntities((prev) => {
      const next = new Set(prev);
      if (next.has(canonicalName)) {
        next.delete(canonicalName);
      } else {
        next.add(canonicalName);
      }
      return next;
    });
  };

  const selectAll = () => {
    setApprovedEntities(new Set(entities.map((e) => e.canonicalName)));
  };

  const deselectAll = () => {
    setApprovedEntities(new Set());
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      const approvedList = entities.filter((e) =>
        approvedEntities.has(e.canonicalName)
      );

      const response = await fetch(`/api/jobs/${jobId}/approve-entities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entities: approvedList }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to approve entities");
      }

      // Redirect to job status page
      router.push(`/jobs/${jobId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
      setSubmitting(false);
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

  const approvedCount = approvedEntities.size;
  const totalCount = entities.length;

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
            {job?.config?.title || "Untitled Research"}
          </p>
        </div>

        {/* Stats & Actions Bar */}
        <Card className="mb-6">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="font-mono text-sm">
                <span className="text-[#3B5FE6] font-semibold">{approvedCount}</span>
                <span className="text-[rgba(0,0,0,0.45)]"> / {totalCount} approved</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAll}>
                  Deselect All
                </Button>
              </div>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={submitting || approvedCount === 0}
            >
              {submitting ? "Submitting..." : `Approve ${approvedCount} Entities`}
            </Button>
          </CardContent>
        </Card>

        {/* Entity Grid */}
        <SectionHeader>Extracted Entities</SectionHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entities.map((entity) => (
            <EntityCard
              key={entity.canonicalName}
              entity={entity}
              isApproved={approvedEntities.has(entity.canonicalName)}
              onToggle={() => toggleEntity(entity.canonicalName)}
            />
          ))}
        </div>

        {entities.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="font-mono text-sm text-[rgba(0,0,0,0.45)] uppercase tracking-[0.05em]">
                No entities extracted
              </p>
            </CardContent>
          </Card>
        )}

        {/* Bottom Submit Bar */}
        {entities.length > 0 && (
          <div className="mt-8 flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={submitting || approvedCount === 0}
              size="lg"
            >
              {submitting
                ? "Submitting..."
                : `Continue with ${approvedCount} Entities →`}
            </Button>
          </div>
        )}
      </main>
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

function EntityCard({
  entity,
  isApproved,
  onToggle,
}: {
  entity: ExtractedEntity;
  isApproved: boolean;
  onToggle: () => void;
}) {
  const typeColor = TYPE_COLORS[entity.type] || TYPE_COLORS.concept;
  const sentimentColor = SENTIMENT_COLORS[entity.sentiment] || SENTIMENT_COLORS.neutral;

  return (
    <Card
      className={`cursor-pointer transition-all ${
        isApproved
          ? "border-[#3B5FE6]/30 bg-[#3B5FE6]/[0.02]"
          : "opacity-60 hover:opacity-80"
      }`}
      onClick={onToggle}
    >
      <CardContent className="p-4">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isApproved}
              onCheckedChange={onToggle}
              onClick={(e) => e.stopPropagation()}
            />
            <div>
              <h3 className="font-mono text-sm font-semibold uppercase tracking-[0.05em]">
                {entity.canonicalName}
              </h3>
              {entity.aliases.length > 0 && (
                <p className="font-mono text-xs text-[rgba(0,0,0,0.45)] mt-0.5">
                  aka: {entity.aliases.slice(0, 2).join(", ")}
                  {entity.aliases.length > 2 && ` +${entity.aliases.length - 2}`}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`${typeColor} border-0 font-mono text-[10px] uppercase`}
            >
              {entity.type}
            </Badge>
            <span className={`font-mono text-[10px] uppercase ${sentimentColor}`}>
              {entity.sentiment}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="font-serif text-sm text-[rgba(0,0,0,0.65)] line-clamp-2 mb-3">
          {entity.description}
        </p>

        {/* Metadata Row */}
        <div className="flex items-center gap-4 text-[10px] font-mono text-[rgba(0,0,0,0.45)]">
          {entity.category && <span>{entity.category}</span>}
          {entity.url && (
            <a
              href={entity.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#3B5FE6] transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              Website ↗
            </a>
          )}
          {entity.twitter && (
            <a
              href={`https://twitter.com/${entity.twitter.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#3B5FE6] transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              @{entity.twitter.replace("@", "")}
            </a>
          )}
          <span>{entity.mentions.length} mentions</span>
        </div>
      </CardContent>
    </Card>
  );
}
